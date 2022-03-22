import { v4 as uuidv4 } from "uuid";
import { Connection } from "@jsplumb/core";
import {
  Dictionary,
  flattenDeep,
  isPlainObject,
  keyBy,
  range,
  values
} from "lodash";
import {
  IFlatConnection,
  IClientNodeItem,
  IServiceNodeItem,
  IWorkflowLibraryItem,
  IWorkflowSection,
  IContainer,
  IResourceTemplate
} from "../../objects/designer";

interface IConf {
  prettyName: string;
  name:  string;
  description:  string;
  type: string;
  container?: IContainer;
  resource?: IResourceTemplate
}

interface IStepConf {
  prettyName: string;
  name:  string;
  template: string;
}

export function ensure<T>(argument: T | undefined | null, message: string = 'This value was promised to be there.'): T {
  if (argument === undefined || argument === null) {
    throw new TypeError(message);
  }

  return argument;
}

export const parseSingleNode = (
  configurationStr: string
): IServiceNodeItem => {
  let node: IServiceNodeItem = {} as IServiceNodeItem;
  let configurationObj: any = null;
  try {
    configurationObj = JSON.parse(configurationStr);
  } catch (err) {}

  if (isPlainObject(configurationObj)) {
    node = configurationObj;
  }

  return node;
}

export const formatName = (name: string): string => {
  let regExpr = /[^a-zA-Z0-9]/g;
  return name.replace(regExpr, "-").toLowerCase();
}

export const parseConfiguration = (
  configurationStr: string
): IServiceNodeItem[] => {
  let nodes: IServiceNodeItem[] = [];
  let configurationObj: any = null;

  try {
    configurationObj = JSON.parse(configurationStr);
  } catch (err) {}

  if (isPlainObject(configurationObj)) {
    nodes = flattenDeep(values(configurationObj));
  }

  nodes.forEach((node) => {
    if (!Array.isArray(node.inputs)) {
      node.inputs = [];
    }
  });

  return nodes;
}

export const flattenLibraries = (
  sections: IWorkflowSection[]
): IWorkflowLibraryItem[] => {
  return flattenDeep(sections.map((x) => x.Operations));
}

const getEndPointUuids = (
  key: string,
  type: "ip" | "op",
  _count: string | number
): string[] => {
  let count = parseInt(_count as string);

  return range(0, count).map((x) => {
    if (count === 1) {
      return `${type}_${key}`;
    } else if (count === 2) {
      return `${type}_${[true, false][x % 2]}_${key}`;
    } else {
      return `${type}_${x}_${key}`;
    }
  });
}

export const attachUUID = (key: string): string => {
  const v4 = new RegExp(/[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}/i);

  if (key.match(v4)) {
    return key;
  }

  return key + "-" + uuidv4();
}

export const getNodeItem = (
  nodeItem: IClientNodeItem
): IClientNodeItem => {
  return {
    ...nodeItem,
    configuration: {
      ...nodeItem.configuration,
      name: formatName(nodeItem.configuration.prettyName)
    }
  };
}

export const getClientNodeItem = (
  nodeItem: IServiceNodeItem,
  library: IWorkflowLibraryItem
): IClientNodeItem => {
  const uniqueKey = attachUUID(nodeItem.key);

  return {
    key: uniqueKey,
    type: nodeItem.type,
    position: nodeItem.position,
    inputs: getEndPointUuids(uniqueKey, "ip", library.NoInputs),
    configuration: {
      ...nodeItem.configuration,
      name: formatName(nodeItem.configuration.prettyName)
    },
    outputs: getEndPointUuids(uniqueKey, "op", library.NoOutputs)
  };
}

export const getConnections = (connections: Connection[]): Dictionary<IFlatConnection> => {
  let ret: Dictionary<IFlatConnection> = {};

  connections.forEach((x) => {
    ret[x.sourceId] = {
      'target': x.targetId
    }
  });

  return ret;
}

export const getClientNodesAndConnections = (
  nodeItems: IServiceNodeItem[],
  sections: IWorkflowSection[]
): [Dictionary<IClientNodeItem>, Array<[string, string]>] => {
  if (!Array.isArray(nodeItems) || !Array.isArray(sections)) {
    return [{}, []];
  }

  let connections: Array<[string, string]> = [];
  let libraries = flattenLibraries(sections);
  let clientItems = nodeItems.map((x) => {
    return getClientNodeItem(x, ensure(libraries.find((l) => l.Type === x.type)));
  });

  clientItems.forEach((x) => {
    let item = nodeItems.find((n) => n.key === x.key);
    if (item) {
      item.inputs.forEach((sourceUuid, index) => {
        let targetUuid = x.inputs[index] ? x.inputs[index] : x.inputs[0];
        connections.push([sourceUuid, targetUuid]);
      });
    }
  });

  return [keyBy(clientItems, (x) => x.key), connections];
}

export const getNodeKeyFromConnectionId = (uuid: string) => {
  let key = uuid.substr(uuid.lastIndexOf("_") + 1);
  return key;
}

export const initialValues = (): IConf => {
  return {
    prettyName: "Unnamed",
    name: "unnamed",
    description: "",
    type: "",
    container: {
      name: "",
      image: "",
      imagePullPolicy: ""
    },
    resource: {
      action: "",
      manifest: ""
    }
  }
}

export const stepInitialValues = (): IStepConf => {
  return {
    prettyName: "Unnamed",
    name: "unnamed",
    template: ""
  }
}

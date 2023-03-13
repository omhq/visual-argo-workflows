import { v4 as uuidv4 } from "uuid";
import { Connection } from "@jsplumb/core";
import toast from "react-hot-toast";
import {
  Dictionary,
  flattenDeep,
  isArray,
  isPlainObject,
  keyBy,
  range,
  values
} from "lodash";
import {
  INodeItem,
  INodeLibraryItem,
  INodeGroup,
  FlatConnection
} from "../types";
import { ReactElement } from "react";

export function ensure<T>(
  argument: T | undefined | null,
  message = "This value was promised to be there."
): T {
  if (argument === undefined || argument === null) {
    throw new TypeError(message);
  }

  return argument;
}

export const parseSingleNode = (configurationStr: string): INodeItem => {
  let node: INodeItem = {} as INodeItem;
  const configurationObj = JSON.parse(configurationStr);

  if (isPlainObject(configurationObj)) {
    node = configurationObj;
  }

  return node;
};

export const formatName = (name: string): string => {
  const regExpr = /[^a-zA-Z0-9]/g;
  return name.replace(regExpr, "-").toLowerCase();
};

export const parseConfiguration = (configurationStr: string): INodeItem[] => {
  let nodes: INodeItem[] = [];
  const configurationObj = JSON.parse(configurationStr);

  if (isPlainObject(configurationObj)) {
    nodes = flattenDeep(values(configurationObj));
  }

  if (isArray(configurationObj)) {
    nodes = configurationObj;
  }

  nodes.forEach((node) => {
    if (!Array.isArray(node.inputs)) {
      node.inputs = [];
    }
  });

  return nodes;
};

export const flattenLibraries = (
  sections: INodeGroup[]
): INodeLibraryItem[] => {
  return flattenDeep(sections.map((x) => x.nodeTypes));
};

const getEndPointUuids = (
  key: string,
  type: "ip" | "op",
  _count: string | number
): string[] => {
  const count = parseInt(_count as string);

  return range(0, count).map((x) => {
    if (count === 1) {
      return `${type}_${key}`;
    } else if (count === 2) {
      return `${type}_${[true, false][x % 2]}_${key}`;
    } else {
      return `${type}_${x}_${key}`;
    }
  });
};

export const attachUUID = (key: string): string => {
  const v4 = new RegExp(
    /[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}/i
  );

  if (key.match(v4)) {
    return key;
  }

  return key + "-" + uuidv4();
};

export const getClientNodeItem = (
  nodeItem: INodeItem,
  library: INodeLibraryItem
): INodeItem => {
  const uniqueKey = attachUUID(nodeItem.key);

  return {
    ...nodeItem,
    key: uniqueKey,
    inputs: getEndPointUuids(uniqueKey, "ip", library.noInputs),
    outputs: getEndPointUuids(uniqueKey, "op", library.noOutputs)
  };
};

export const getConnections = (connections: Connection[]): FlatConnection[] => {
  const ret: FlatConnection[] = [];

  connections.forEach((connection: Connection) => {
    const conn = {
      source: connection.sourceId,
      target: connection.targetId
    };
    ret.push(conn);
  });

  return ret;
};

export const getClientNodesAndConnections = (
  nodeItems: INodeItem[],
  sections: INodeGroup[]
): Dictionary<INodeItem> => {
  if (!Array.isArray(nodeItems) || !Array.isArray(sections)) {
    return {};
  }

  const libraries = flattenLibraries(sections);
  const clientItems = nodeItems.map((x) => {
    return getClientNodeItem(
      x,
      ensure(libraries.find((l) => l.type === x.type))
    );
  });

  return keyBy(clientItems, (x) => x.key);
};

export const getNodeKeyFromConnectionId = (uuid: string) => {
  const key = uuid.substr(uuid.lastIndexOf("_") + 1);
  return key;
};

export const toaster = (message: string | ReactElement, type: string) => {
  const toastConfig = {
    duration: 3000,
    position: "bottom-right",
    style: {},
    className:
      "text-sm rounded-md text-gray-600 bg-white dark:text-white dark:bg-gray-600"
  };

  if (type === "error") {
    toast.error(message, toastConfig as any);
  }

  if (type === "success") {
    toast.success(message, toastConfig as any);
  }
};

export const truncateStr = (str: string, length: number) => {
  if (str.length > length) {
    return str.slice(0, length) + "...";
  }

  return str;
};

export const getMatchingSetIndex = (
  setOfSets: [[string, string]],
  findSet: [string, string]
): number => {
  return setOfSets.findIndex((set) => set.toString() === findSet.toString());
};

export const classNames = (...classes: string[]) => {
  return classes.filter(Boolean).join(" ");
};

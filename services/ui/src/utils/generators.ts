import {
  ITemplateNodeItem,
  ITemplate,
  IWorkflow,
  INodeItem,
  FlatConnection
} from "../types";
import { Dictionary } from "lodash";

const getFirstNode = (
  nodes: Dictionary<INodeItem>,
  connections: FlatConnection[]
): ITemplateNodeItem => {
  const _nodes = { ...nodes };

  for (const nodeKey in _nodes) {
    const isTarget = connections.find((conn) => {
      if (nodeKey === conn.target) {
        return nodeKey;
      }
    });

    if (isTarget) {
      continue;
    }

    if (!isTarget) {
      return _nodes[nodeKey];
    }
  }

  return _nodes[0];
};

const generateStepTemplate = (node: ITemplateNodeItem): any => {
  return {
    name: node.nodeConfig.template.name || "Untitiled",
    template: node.nodeConfig.template.name || "Untitiled"
  };
};

const generateStepsTemplate = (
  firstNode: ITemplateNodeItem,
  nodes: Dictionary<ITemplateNodeItem>,
  connections: FlatConnection[]
): any => {
  const ret: any = {
    name: "",
    steps: []
  };

  let currentNodeId: string = firstNode.key;
  ret.name = `steps-from-${firstNode.nodeConfig.template.name}` || "Untitiled";

  while (currentNodeId) {
    const currentConnections: any = connections.filter((conn) => {
      if (conn.source === currentNodeId) {
        return conn;
      }
    });

    if (currentConnections) {
      console.log(currentConnections);
    }

    /*
    if (currentConnections) {
      for (const currentConnection of currentConnections) {
        const node: ITemplateNodeItem = nodes[currentConnection.source];
        const nextNode: ITemplateNodeItem = nodes[currentConnection.target];

        ret.steps.push({
          name: node.nodeConfig.template.name || "Untitiled",
          template: node.nodeConfig.template.name || "Untitiled"
        });

        ret.steps.push({
          name: nextNode.nodeConfig.template.name || "Untitiled",
          template: nextNode.nodeConfig.template.name || "Untitiled"
        });

        currentNodeId = currentConnection.target;
        continue;
      }
    }
    */

    currentNodeId = "";
  }

  return ret;
};

const stringify = (manifest: any): string => {
  return JSON.stringify(manifest);
};

const generateTemplateDefinitions = (
  graphNodes: Dictionary<ITemplateNodeItem>
): ITemplate[] | [] => {
  const ret: ITemplate[] = [];
  for (const [, value] of Object.entries(graphNodes)) {
    const node = value as ITemplateNodeItem;

    if (["TEMPLATE"].includes(node["type"])) {
      const template: ITemplate = {
        name: node.nodeConfig.template.name || "Untitled"
      };

      if (node.nodeConfig.metaData.type === "container") {
        if (node.nodeConfig.template.container) {
          template.container = {
            ...node.nodeConfig.template.container
          };
        }
      }

      if (node.nodeConfig.metaData.type === "script") {
        if (node.nodeConfig.template.script) {
          template.script = {
            ...node.nodeConfig.template.script
          };
        }
      }

      if (node.nodeConfig.metaData.type === "resource") {
        if (node.nodeConfig.template.resource) {
          template.resource = {
            action: node.nodeConfig.template.resource.action,
            manifest: stringify(node.nodeConfig.template.resource.manifest)
          };
        }
      }

      if (node.nodeConfig.metaData.type === "suspend") {
        if (node.nodeConfig.template.suspend) {
          template.suspend = {
            ...node.nodeConfig.template.suspend
          };
        }
      }

      ret.push(template);
    }
  }

  return ret;
};

const getTotalSteps = (
  start: string,
  connections: FlatConnection[]
): number => {
  const _connections = [...connections];
  let head: string | null = start;
  let count = 0;

  if (!_connections) {
    return 0;
  }

  while (head) {
    const connection: FlatConnection | undefined = _connections.find((conn) => {
      if (conn.source === head) {
        return conn;
      }
    });

    if (connection) {
      const index = _connections.indexOf(connection);
      _connections.splice(index);
      count++;
      head = connection.target;
    } else {
      head = null;
    }
  }

  return count;
};

export const generatePayload = (graphData: any): IWorkflow => {
  const nodes = graphData["nodes"];
  const connections = graphData["connections"];
  const base: IWorkflow = {
    apiVersion: "argoproj.io/v1alpha1",
    kind: "Workflow",
    metadata: {
      generateName: "workflow-name-"
    },
    spec: {
      entrypoint: "",
      templates: []
    }
  };

  generateTemplateDefinitions(nodes).forEach((x) => {
    base["spec"]["templates"].push(x);
  });

  const firstNode: ITemplateNodeItem = getFirstNode(nodes, connections);

  if (firstNode) {
    const totalSteps = getTotalSteps(firstNode.key, connections);

    if (totalSteps >= 1) {
      const stepsTemplate: ITemplate = generateStepsTemplate(
        firstNode,
        nodes,
        connections
      );

      base.spec.entrypoint = firstNode.nodeConfig.template.name || "Untitled";
      base.spec.templates.push(stepsTemplate);
    }

    if (firstNode.nodeConfig.template.name) {
      base.spec.entrypoint = firstNode.nodeConfig.template.name;
    }
  }

  return base;
};

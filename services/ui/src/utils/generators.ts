import {
  ITemplateNodeItem,
  IWorkflowStep,
  ITemplate,
  IWorkflow,
  INodeItem
} from "../types";
import { Dictionary } from "lodash";

interface IFlatConnection {
  target: string;
}

const getFirstNode = (
  graphNodes: Dictionary<INodeItem>,
  connections: any
): ITemplateNodeItem => {
  const nodes = { ...graphNodes };
  const workers = Object.keys(nodes).reduce((obj, key) => {
    if (nodes[key].type === "WORKER") {
      obj[key] = nodes[key];
    }
    return obj;
  }, {} as Dictionary<INodeItem>);

  if (connections.length) {
    connections.forEach((connection: any) => {
      delete workers[connection[1]];
    });
  }

  return Object.values(workers)[0];
};

const generateTemplateInvocator = (
  firstNode: ITemplateNodeItem,
  graphNodes: Dictionary<ITemplateNodeItem>,
  connections: Dictionary<IFlatConnection> | undefined
): ITemplate => {
  const ret: ITemplate = {
    name: "",
    steps: []
  };

  let currentNodeId: string = firstNode.key;
  ret.name = firstNode.nodeConfig.template.name || "Untitiled";

  while (currentNodeId.length) {
    if (!connections) {
      break;
    }

    const currentConnection: any = connections[currentNodeId];
    if (currentConnection) {
      const nextNode: ITemplateNodeItem =
        graphNodes[currentConnection["target"]];
      const nodeStepTemplate: IWorkflowStep = {
        name: nextNode.nodeConfig.template.name || "Untitiled",
        template: nextNode.nodeConfig.template.name || "Untitiled"
      };

      ret.steps?.push(nodeStepTemplate);
      currentNodeId = currentConnection["target"];
      continue;
    }

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

    if (["WORKER"].includes(node["type"])) {
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
  connections: Dictionary<IFlatConnection> | undefined
): number => {
  let head: string | null = start;
  let count = 0;

  if (!connections) {
    return 0;
  }

  while (head) {
    const connection: IFlatConnection = connections[head];
    if (connection) {
      count++;
      head = connection["target"];
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

    if (totalSteps >= 2) {
      const templateInvocator: ITemplate = generateTemplateInvocator(
        firstNode,
        nodes,
        connections
      );

      base.spec.entrypoint = firstNode.nodeConfig.template.name || "Untitled";
      base.spec.templates.push(templateInvocator);
    }

    if (firstNode.nodeConfig.template.name) {
      base.spec.entrypoint = firstNode.nodeConfig.template.name;
    }
  }

  return base;
};

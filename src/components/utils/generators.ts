import {
  IClientNodeItem,
  IWorkflowStep,
  ITemplate,
  IWorkflow
} from "../../objects/designer";
import { Dictionary, find } from "lodash";
import { ensure } from "./index";

interface IFlatConnection {
  target: string;
}

const getFirstNode = (graphNodes: Dictionary<IClientNodeItem>): IClientNodeItem | null => {
  return ensure(find(graphNodes, { type: "ENTRYPOINT" }));
}

const generateTemplateInvocator = (
  firstNode: IClientNodeItem,
  graphNodes: Dictionary<IClientNodeItem>,
  connections: Dictionary<IFlatConnection> | undefined): ITemplate => {
    const ret: ITemplate = {
      name: "",
      steps: []
    };

    let currentNodeId: string = firstNode.key;
    ret.name = firstNode.configuration.name;

    while (currentNodeId.length) {
      if (!connections) {
        break;
      }

      const currentConnection: any = connections[currentNodeId];
      if (currentConnection) {
        const nextNode: IClientNodeItem = graphNodes[currentConnection["target"]];
        const nodeStepTemplate: IWorkflowStep = {
          name: nextNode.configuration.name,
          template: nextNode.configuration.name
        };
  
        ret.steps!.push(nodeStepTemplate);
        currentNodeId = currentConnection["target"];
        continue;
      }
      
      currentNodeId = "";
    }
  
    return ret;
}

const getImageString = (container: any): string => {
  const imageVersion = container.imageVersion;

  if (imageVersion) {
    return `${container.image}:${container.imageVersion}`;
  }

  return container.image;
}

const generateManifest = (manifest: any): string => {
  return JSON.stringify(manifest);
}

const generateTemplateDefinitions = (
  graphNodes: Dictionary<IClientNodeItem>): ITemplate[] | [] => {
  let ret: ITemplate[] = [];
  for (const [, value] of Object.entries(graphNodes)) {
    const node = value as IClientNodeItem;

    if (!['ENTRYPOINT', 'ONEXIT', 'STEP'].includes(node["type"])) {
      const template: ITemplate = {
        name: node.configuration.name
      };

      if (node.configuration.type === "container") {
        if (node.configuration.container) {
          template.container = {
            name: node.configuration.container.name,
            image: getImageString(node.configuration.container),
            imagePullPolicy: node.configuration.container.imagePullPolicy
          };
        }
      }

      if (node.configuration.type === "resource") {
        if (node.configuration.resource) {
          template.resource = {
            action: node.configuration.resource.action,
            manifest: generateManifest(node.configuration.resource.manifest)
          };
        }
      }

      ret.push(template);
    }
  }

  return ret;
}

const getTotalSteps = (
  start: string,
  connections: Dictionary<IFlatConnection> | undefined): number => {
  let head: string | null = start;
  let count = 0;

  if (!connections) {
    return 0;
  }

  while (head) {
    const connection: IFlatConnection = connections[head];
    if (connection) {
      count++;
      head = connection['target'];
    } else {
      head = null;
    }
  }

  return count;
}

export const generateWorkflowTemplate = (graphData: any): IWorkflow => {
  const nodes = graphData["nodes"];
  const connections = graphData["connections"];
  const base: IWorkflow = {
    apiVersion: "argoproj.io/v1alpha1",
    kind: "Workflow",
    metadata: {
      generateName: "k8s-orchestrate-"
    },
    spec: {
      entrypoint: "",
      templates: []
    }
  };

  // set templates
  generateTemplateDefinitions(nodes).forEach((x) => {
    base["spec"]["templates"].push(x)
  });

  let firstNode: IClientNodeItem | null = (connections && Object.keys(connections).length) ? getFirstNode(nodes) : null;

  if (firstNode) {
    const totalSteps = getTotalSteps(firstNode.key, connections);

    if (totalSteps >= 2) {
      const templateInvocator: ITemplate = generateTemplateInvocator(firstNode, nodes, connections);
      base.spec.entrypoint = firstNode.configuration.name;
      base.spec.templates.push(templateInvocator);
    }

    if (totalSteps === 1) {
      base.spec.entrypoint = nodes[connections[firstNode.key]["target"]].configuration.name;
    }
  }

  return base;
}

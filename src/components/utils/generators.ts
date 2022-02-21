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

const getEntrypoint = (
  graphNodes: Dictionary<IClientNodeItem>,
  connections: Dictionary<IFlatConnection>): IClientNodeItem | null => {
  const start: IClientNodeItem = ensure(find(graphNodes, { type: "START" }));
  const startConnections = connections[start.key];
  let entrypointNode: IClientNodeItem;

  if (startConnections) {
    entrypointNode = graphNodes[startConnections["target"]];
  } else {
    return null;
  }

  return entrypointNode;
}

const generateTemplateInvocator = (
  entrypoint: IClientNodeItem,
  graphNodes: Dictionary<IClientNodeItem>,
  connections: Dictionary<IFlatConnection> | undefined): ITemplate => {
    const ret: ITemplate = {
      name: "",
      steps: []
    };

    let currentNodeId: string = entrypoint.key;
    ret.name = entrypoint.configuration.name;

    while (currentNodeId.length) {
      if (!connections) {
        break;
      }

      const currentConnection: any = connections[currentNodeId];
      const currentNode: IClientNodeItem = graphNodes[currentNodeId];
      const nodeStepTemplate: IWorkflowStep = {
        name: currentNode.configuration.name,
        template: currentNode.configuration.name
      };
      ret.steps!.push(nodeStepTemplate);

      if (currentConnection) {
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

    if (node["type"] !== "START") {
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
  let entrypoint: IClientNodeItem | null = null;

  entrypoint = (connections && Object.keys(connections).length) ? getEntrypoint(nodes, connections) : null;

  if (entrypoint) {
    const templateInvocator: ITemplate = generateTemplateInvocator(entrypoint, nodes, connections);
    base.spec.entrypoint = entrypoint.configuration.name;
    base["spec"]["templates"].push(templateInvocator);
  }

  // set templates
  generateTemplateDefinitions(nodes).forEach((x) => {
    base["spec"]["templates"].push(x)
  });
  return base;
}

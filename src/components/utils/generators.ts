import { IClientNodeItem } from "../../objects/designer";
import { Dictionary, find } from "lodash";
import { ensure } from "./index";

interface IFlatConnection {
  target: string;
}

interface IGenerateName {
  generateName: string;
}

interface IResource {
  action: string;
  successCondition: string;
  failureCondition: string;
  manifest: string;
}

interface IStep {
  name: string;
  template: string;
}

interface IStepTemplate {
  name: string;
  steps: Array<IStep>;
}

interface IArgument {
  name: string;
  value: string;
}

interface IOutput {
  name: string;
  valueFrom: object;
}

interface IContainerTemplate {
  name: string;
  inputs: {
    parameters: IArgument[];
  }
  resource: IResource;
  outputs: {
    parameters: IOutput[];
  }
}

interface ISpec {
  arguments: {
    parameters: IArgument[];
  }
  entrypoint: string;
  templates: Array<IStepTemplate | IContainerTemplate>;
}

interface IArgoTemplate {
  apiVersion: string;
  kind: string;
  metadata: IGenerateName;
  spec: ISpec;
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

const getWorkflowStepTemplates = (
  entrypoint: IClientNodeItem,
  graphNodes: Dictionary<IClientNodeItem>,
  connections: Dictionary<IFlatConnection> | undefined): IStepTemplate => {
    let ret: IStepTemplate = {
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
      const nodeStepTemplate: IStep = {
        name: currentNode.configuration.name,
        template: currentNode.configuration.name
      };
      ret.steps.push(nodeStepTemplate);

      if (currentConnection) {
        currentNodeId = currentConnection["target"];
        continue;
      }
      
      currentNodeId = "";
    }
  
    return ret;
}

const getWorkflowContainerTemplates = (
  graphNodes: Dictionary<IClientNodeItem>): IContainerTemplate[] | [] => {
  let ret: IContainerTemplate[] = [];
  for (const [, value] of Object.entries(graphNodes)) {
    const node = value as IClientNodeItem;

    if (node["type"] !== "START") {
      const nodeTemplate: IContainerTemplate = {
        name: node["configuration"]["name"],
        inputs: {
          parameters: []
        },
        resource: {
          action: node["configuration"]["action"],
          successCondition: node["configuration"]["successCondition"],
          failureCondition: node["configuration"]["failureCondition"],
          manifest: JSON.stringify(node["configuration"]["manifest"])
        },
        outputs: {
          parameters: []
        }
      };
      ret.push(nodeTemplate);
    }
  }

  return ret;
}

export const generateArgoTemplate = (graphData: any): IArgoTemplate => {
  const nodes = graphData["nodes"];
  const connections = graphData["connections"];
  let baseTemplate: IArgoTemplate = {
    apiVersion: "argoproj.io/v1alpha1",
    kind: "Workflow",
    metadata: {
      generateName: "k8s-orchestrate-"
    },
    spec: {
      arguments: {
        parameters: []
      },
      entrypoint: "",
      templates: []
    }
  };

  // set entrypoint
  let entrypoint: IClientNodeItem | null = null;
  entrypoint = (connections && Object.keys(connections).length) ? getEntrypoint(nodes, connections) : null;

  if (entrypoint) {
    // set step templates
    const steps: IStepTemplate = getWorkflowStepTemplates(entrypoint, nodes, connections);
    baseTemplate.spec.entrypoint = entrypoint.configuration.name;
    baseTemplate["spec"]["templates"].push(steps);
  }

  // set templates
  getWorkflowContainerTemplates(nodes).forEach((x) => {
    baseTemplate["spec"]["templates"].push(x)
  });
  return baseTemplate;
}

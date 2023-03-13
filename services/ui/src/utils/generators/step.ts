import {
  ITemplateNode,
  ITemplate,
  IWorkflow,
  INodeItem,
  FlatConnection
} from "../../types";
import { Dictionary } from "lodash";
import { NodeTypes } from "../../types/enums";
import { stringify } from "../utils";

const getEntryPointNode = (
  nodes: Dictionary<INodeItem>,
  connections: FlatConnection[]
): ITemplateNode | void => {
  const entryPointNodeConnection = connections.find((conn) => {
    if (conn.source.includes("entrypoint")) {
      return conn;
    }
  });

  if (entryPointNodeConnection) {
    const entryPointNode = nodes[entryPointNodeConnection.target];

    if (entryPointNode) {
      return entryPointNode;
    }
  }
};

const getTotalSteps = (
  start: string,
  connections: FlatConnection[]
): number => {
  let head: string | null = start;
  let count = 0;

  if (!connections) {
    return 0;
  }

  while (head) {
    const connection: FlatConnection | undefined = connections.find((conn) => {
      if (conn.source === head) {
        return conn;
      }
    });

    if (connection) {
      count++;
      head = connection.target;
    } else {
      head = null;
    }
  }

  return count;
};

const nodeStepObj = (node: INodeItem): any => {
  return {
    name: node.data.template.name || "Untitiled",
    template: node.data.template.name || "Untitiled",
    when: node.data.when || ""
  };
};

const getSteps = (
  firstNode: ITemplateNode,
  nodes: Record<string, INodeItem>,
  connections: FlatConnection[],
  groupNodes: Record<string, INodeItem>
): any => {
  let head: string | null = firstNode.key;
  const _connections = [...connections];
  const stepsPushed: string[] = [];
  const ret: any = [];

  while (head) {
    const connIndex: number = _connections.findIndex((conn) => {
      if (conn.source === head) {
        return conn;
      }
    });

    const connection = _connections[connIndex];

    if (connection) {
      connections.splice(connIndex, 1);
      const node: INodeItem = nodes[connection.source];
      const nextNode: INodeItem = nodes[connection.target];

      if (node.type === NodeTypes.TEMPLATE && !stepsPushed.includes(node.key)) {
        ret.push([nodeStepObj(node)]);
        stepsPushed.push(node.key);
      }

      if (nextNode.type === "TEMPLATE" && !stepsPushed.includes(nextNode.key)) {
        ret.push([nodeStepObj(nextNode)]);
        stepsPushed.push(nextNode.key);
      }

      if (
        nextNode.type === NodeTypes.GROUP &&
        !stepsPushed.includes(nextNode.key)
      ) {
        const groupedNodes = Object.assign(
          {},
          ...nextNode.data.group.nodeIds.map((x: string) => ({
            [x]: nodes[x]
          }))
        );

        const first = Object.keys(groupedNodes)[0];

        if (groupedNodes[first]) {
          ret.push(
            getSteps(groupedNodes[first], nodes, connections, groupedNodes)
          );
        }

        stepsPushed.push(nextNode.key);
      }

      head = connection.target;
      continue;
    } else {
      head = null;
    }
  }

  for (const [, node] of Object.entries(groupNodes)) {
    if (node.type == NodeTypes.TEMPLATE) {
      ret.push(nodeStepObj(node));
    }

    if (node.type == NodeTypes.GROUP) {
      const groupedNodes = Object.assign(
        {},
        ...node.data.group.nodeIds.map((x: string) => ({
          [x]: nodes[x]
        }))
      );

      const first = Object.keys(groupedNodes)[0];

      if (groupedNodes[first]) {
        ret.push(
          getSteps(groupedNodes[first], nodes, connections, groupedNodes)
        );
      }
    }
  }

  return ret;
};

const getTemplateNodes = (
  nodes: Record<string, INodeItem>
): Dictionary<ITemplateNode> => {
  return Object.keys(nodes).reduce((n: any, key) => {
    if (nodes[key].type === NodeTypes.TEMPLATE) {
      n[key] = nodes[key];
    }
    return n;
  }, {});
};

const getTemplate = (nodes: Dictionary<ITemplateNode>): ITemplate[] | [] => {
  const ret: ITemplate[] = [];
  for (const [, node] of Object.entries(nodes)) {
    const template: ITemplate = {
      name: node.data.template.name || "Untitled"
    };

    if (node.data.type === "container") {
      if (node.data.template.container) {
        template.container = {
          ...node.data.template.container
        };
      }
    }

    if (node.data.type === "script") {
      if (node.data.template.script) {
        template.script = {
          ...node.data.template.script
        };
      }
    }

    if (node.data.type === "resource") {
      if (node.data.template.resource) {
        template.resource = {
          action: node.data.template.resource.action,
          manifest: stringify(node.data.template.resource.manifest)
        };
      }
    }

    if (node.data.type === "suspend") {
      if (node.data.template.suspend) {
        template.suspend = {
          ...node.data.template.suspend
        };
      }
    }

    ret.push(template);
  }

  return ret;
};

const getBaseWorkflowTemplate = (): IWorkflow => {
  return {
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
};

const generateSteppedManifest = (graphData: any): IWorkflow => {
  const nodes = graphData["nodes"] as Record<string, INodeItem>;
  const connections = graphData["connections"];
  const entryPoint = getEntryPointNode(nodes, connections);
  const base = getBaseWorkflowTemplate();
  const templates = getTemplate(getTemplateNodes(nodes));

  templates.forEach((x) => {
    base["spec"]["templates"].push(x);
  });

  if (entryPoint) {
    const totalSteps = getTotalSteps(entryPoint.key, connections);
    base.spec.entrypoint = entryPoint.data.template.name || "Undefined";

    if (totalSteps >= 1) {
      const steps: any = getSteps(entryPoint, nodes, connections, {});
      const stepsTemplate: ITemplate = {
        name: `steps-from-${entryPoint.data.template.name}` || "Untitiled",
        steps: steps
      };

      base.spec.templates.push(stepsTemplate);
    }
  }

  return base;
};

export default generateSteppedManifest;

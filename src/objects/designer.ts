import { Dictionary } from "lodash";
import { NodeGroupType } from "./enums";


// https://argoproj.github.io/argo-workflows/fields/#workflowstep
export interface IWorkflowStep {
  name: string;
  template: string;
}

// https://argoproj.github.io/argo-workflows/fields/#objectmeta
export interface IObjectMeta {
  generateName: string;
}

// https://argoproj.github.io/argo-workflows/fields/#container
export interface IContainer {
  name: string;
  args?: string[];
  command?: string[];
  image: string;
  imagePullPolicy: string;
}

// https://argoproj.github.io/argo-workflows/fields/#resourcetemplate
export interface IResourceTemplate {
  action: string;
  flags?: string[];
  manifest: string;
  mergeStrategy?: string;
  setOwnerReference?: string;
  successCondition?: string;
  failureCondition?: string;
}

// https://argoproj.github.io/argo-workflows/fields/#template
export interface ITemplate {
  name: string;
  resource?: IResourceTemplate;
  container?: IContainer;
  steps?: IWorkflowStep[];
}

// https://argoproj.github.io/argo-workflows/fields/#workflowspec
export interface IWorkflowSpec {
  entrypoint: string;
  templates: ITemplate[];
}

// https://argoproj.github.io/argo-workflows/fields/#workflow
export interface IWorkflow {
  apiVersion: string;
  kind: string;
  metadata: IObjectMeta;
  spec: IWorkflowSpec;
}

export interface IWorkflowLibraryItem {
  Id: number;
  Name: string;
  Type: string;
  Description: string;
  NoInputs: number;
  NoOutputs: number;
  IsActive: boolean;
}

export interface IWorkflowSection {
  Id: number;
  Name: NodeGroupType;
  Description: string;
  Operations: IWorkflowLibraryItem[];
}

interface INodeItem {
  key: string;
  type: string;
  position: { left: number; top: number };
  inputs: string[];
}

export interface IFlatConnection {
  target: string;
}

export interface IBaseConfiguration extends ITemplate {
  prettyName: string;
  name: string;
  description: string;
  type: string;
}

export interface IClientNodeItem extends INodeItem {
  outputs: string[];
  configuration: IBaseConfiguration;
}

export interface IGraphData {
  nodes: IClientNodeItem[];
  connections: Dictionary<IFlatConnection>;
}

export interface IServiceNodeItem extends INodeItem {
  configuration: IBaseConfiguration;
}

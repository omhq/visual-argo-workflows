import { Dictionary } from "lodash";
import { NodeGroupType } from "./enums";


export interface IFlatConnection {
  target: string;
}

export interface IGraphData {
  nodes: IClientNodeItem[];
  connections: Dictionary<IFlatConnection>;
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

export interface INodeItemManifestContainersEnv {
  name: string;
  value: string;
}

interface INodeItem {
  key: string;
  type: string;
  position: { left: number; top: number };
  inputs: string[];
}

interface INodeItemManifestContainers {
  name: string;
  image: string;
  imagePullPolicy: string;
  env: INodeItemManifestContainersEnv[];
  command: string[];
  args: string[];
}

interface INodeItemManifest {
  apiVersion: string;
  kind: string;
  metadata: Record<string, string>;
  spec: {
    ttlSecondsAfterFinished: number;
    template: {
      metadata: Record<string, string>;
      spec: {
        containers: INodeItemManifestContainers[];
        restartPolicy: string;
      }
    }
  }
}

export interface IBaseConfiguration {
  prettyName: string;
  name: string;
  description: string;
  action:  string;
  successCondition: string;
  failureCondition: string;
  manifest: INodeItemManifest;
}

export interface IClientNodeItem extends INodeItem {
  outputs: string[];
  configuration: IBaseConfiguration;
}

export interface IServiceNodeItem extends INodeItem {
  configuration: IBaseConfiguration;
}

import { AnchorId } from "@jsplumb/common";
import { Dictionary } from "lodash";
import { FunctionComponent, ReactNode } from "react";
import { NodeGroupType } from "./enums";

export type CallbackFunction = (...args: any[]) => any;

export interface IClientNodePosition {
  key: string;
  position: {
    left: number;
    top: number;
  };
}

export interface INodeLibraryItem {
  id: number;
  name: string;
  type: string;
  noInputs: number;
  noOutputs: number;
  isActive: boolean;
}

export interface INodeGroup {
  id: number;
  name: NodeGroupType;
  nodeTypes: INodeLibraryItem[];
}

export interface INodeItem extends IClientNodePosition {
  type: string;
  nodeConfig: any;
  inputs: string[];
  outputs: string[];
}

export interface IFlatConnection {
  target: string;
}

export interface ITemplateNodeItem extends INodeItem {
  nodeConfig: {
    metaData: {
      type: string;
    };
    template: Partial<ITemplate>;
  }
}

export interface IGroupNodeItem extends INodeItem {
  nodeConfig: {
    order: any;
  }
}

export interface IGraphData {
  nodes: INodeItem[];
  connections: Dictionary<IFlatConnection>;
}

export interface IAnchor {
  id: string;
  position: AnchorId;
}

export interface ITabContext {
  value: string;
  onChange: (newValue: string) => void;
}

interface Steps<T> extends Array<T | Steps<T>> {}

type Step = {
  name: string;
  template: string;
};

type Task = {
  name: string;
  dependencies: string[];
  template: string;
};

export interface IEditTemplateForm {
  nodeConfig: {
    metaData: {
      type: string;
    };
    template: {
      name: string;
      container?: {
        name: string;
        image: string;
        command: string;
        args: string;
        imagePullPolicy: string;
      };
      resource?: {
        action: string;
        manifest: string;
      };
      script?: {
        name: string;
        image: string;
        command: string;
        args: string;
        imagePullPolicy: string;
        source: string;
      };
      suspend?: {
        duration: string;
      };
      steps?: Steps<Step>;
      dag?: {
        tasks: Task[]
      }
    };
  };
}

/* -- Argo Workflows -- */

// https://argoproj.github.io/argo-workflows/fields/#workflow
export interface IWorkflow {
  apiVersion: string;
  kind: string;
  metadata: IObjectMeta;
  spec: IWorkflowSpec;
}

// https://argoproj.github.io/argo-workflows/fields/#objectmeta
export interface IObjectMeta {
  generateName: string;
}

// https://argoproj.github.io/argo-workflows/fields/#workflowspec
export interface IWorkflowSpec {
  entrypoint: string;
  templates: ITemplate[];
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

// https://argoproj.github.io/argo-workflows/fields/#scripttemplate
export interface IScriptTemplate {
  name?: string;
  args?: string[];
  command?: string[];
  image: string;
  imagePullPolicy: string;
  source: string;
}

// https://argoproj.github.io/argo-workflows/fields/#suspendtemplate
export interface ISuspendTemplate {
  duration: string;
}

// https://argoproj.github.io/argo-workflows/fields/#template
export interface ITemplate {
  name: string;
  resource?: IResourceTemplate;
  container?: IContainer;
  script?: IScriptTemplate;
  suspend?: ISuspendTemplate;
  steps?: IWorkflowStep[];
}

// https://argoproj.github.io/argo-workflows/fields/#container
export interface IContainer {
  name?: string;
  args?: string[];
  command?: string[];
  image: string;
  imagePullPolicy: string;
}

// https://argoproj.github.io/argo-workflows/fields/#workflowstep
export interface IWorkflowStep {
  name: string;
  template: string;
}

/* -- SuperForm -- */

export interface ISuperFormContext {
  types: Record<string, FunctionComponent>;
  renderField: (field: IFormField) => ReactNode;
}

export interface IFormField {
  id: string;
  type:
    | "grid-row"
    | "grid-column"
    | "text"
    | "integer"
    | "toggle"
    | "accordion"
    | "records";
}

export interface IGridRowField<T extends IFormField> extends IFormField {
  type: "grid-row";
  fields: T[];
}

export interface IGridColumnField<T extends IFormField> extends IFormField {
  type: "grid-column";
  spans: number[];
  fields: T[];
}

export interface IValueField extends IFormField {
  name: string;
}

export interface ISingleRowField extends IValueField {
  help?: string;
}

export interface ITextField extends ISingleRowField {
  type: "text";
  label?: string;
  placeholder?: string;
  required?: boolean;
}

export interface IIntegerField extends ISingleRowField {
  type: "integer";
  label: string;
  required: boolean;
}

export interface IToggleField extends ISingleRowField {
  type: "toggle";
  label: string;
  options: {
    text: string;
    value: string;
  }[];
}

export interface IRecordsField<T extends IFormField> extends IValueField {
  type: "records";
  title: string;
  defaultOpen?: boolean;
  fields: (index: number) => T[];
  newValue: any;
}

export interface IAccordionField extends IFormField {
  type: "accordion";
  title: string;
}

export type TFinalFormField =
  | IGridColumnField<TFinalFormField>
  | IGridRowField<TFinalFormField>
  | ITextField
  | IIntegerField
  | IToggleField
  | IRecordsField<TFinalFormField>
  | IAccordionField;

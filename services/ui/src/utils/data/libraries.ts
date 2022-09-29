import { NodeGroupType } from "../../types/enums";
import { INodeGroup } from "../../types";

export const nodeLibraries: INodeGroup[] = [
  {
    id: 1,
    name: NodeGroupType.Dag,
    nodeTypes: [
      {
        id: 1,
        name: "dag",
        type: "DAG",
        noInputs: 1,
        noOutputs: 1,
        isActive: true
      },
      {
        id: 2,
        name: "task",
        type: "TASK",
        noInputs: 1,
        noOutputs: 1,
        isActive: true
      }
    ]
  },
  {
    id: 2,
    name: NodeGroupType.Steps,
    nodeTypes: [
      {
        id: 1,
        name: "steps",
        type: "STEPS",
        noInputs: 1,
        noOutputs: 1,
        isActive: true
      },
      {
        id: 2,
        name: "step",
        type: "STEP",
        noInputs: 1,
        noOutputs: 1,
        isActive: true
      }
    ]
  }
];

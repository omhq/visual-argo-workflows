import { NodeGroupType } from "../../types/enums";
import { INodeGroup } from "../../types";

export const nodeLibraries: INodeGroup[] = [
  {
    id: 1,
    name: NodeGroupType.Steps,
    nodeTypes: [
      {
        id: 1,
        name: "template",
        type: "TEMPLATE",
        noInputs: 1,
        noOutputs: 1,
        isActive: true
      },
      {
        id: 2,
        name: "group",
        type: "GROUP",
        noInputs: 1,
        noOutputs: 1,
        isActive: true
      }
    ]
  }
];

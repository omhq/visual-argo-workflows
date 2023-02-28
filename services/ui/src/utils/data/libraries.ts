import { NodeGroupType } from "../../types/enums";
import { INodeGroup } from "../../types";

export const nodeLibraries: INodeGroup[] = [
  {
    id: 1,
    name: NodeGroupType.Dag,
    nodeTypes: [
      {
        id: 1,
        name: "template",
        type: "TEMPLATE",
        noInputs: 1,
        noOutputs: 1,
        isActive: true
      }
    ]
  }
];

import { NodeGroupType } from "../objects/enums";
import { IWorkflowSection } from "../objects/designer";


export const workflowLibraries: IWorkflowSection[] = [
  {
    Id: 0,
    Name: NodeGroupType.Sources,
    Description: "Sources",
    Operations: [
      {
        Id: 1,
        Name: "Start",
        Type: "START",
        Description: "Start here",
        NoInputs: 0,
        NoOutputs: 1,
        IsActive: true
      },
    ]
  },
  {
    Id: 1,
    Name: NodeGroupType.Steps,
    Description: "Steps",
    Operations: [
      {
        Id: 1,
        Name: "Step",
        Type: "STEP",
        Description: "Step node",
        NoInputs: 1,
        NoOutputs: 1,
        IsActive: true
      }
    ]
  }
];

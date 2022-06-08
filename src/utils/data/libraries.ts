import { NodeGroupType } from "../../types/enums";
import { IWorkflowSection } from "../../types";


export const workflowLibraries: IWorkflowSection[] = [
  {
    Id: 0,
    Name: NodeGroupType.Sources,
    Description: "Sources",
    Operations: [
      {
        Id: 0,
        Name: "entrypoint",
        Type: "ENTRYPOINT",
        Description: "entrypoint",
        NoInputs: 0,
        NoOutputs: 1,
        IsActive: true
      },
      {
        Id: 1,
        Name: "onExit",
        Type: "ONEXIT",
        Description: "onExit",
        NoInputs: 0,
        NoOutputs: 1,
        IsActive: true
      }
    ]
  },
  {
    Id: 1,
    Name: NodeGroupType.Steps,
    Description: "Steps",
    Operations: [
      {
        Id: 1,
        Name: "step",
        Type: "STEP",
        Description: "Step node",
        NoInputs: 1,
        NoOutputs: 1,
        IsActive: true
      }
    ]
  },
  {
    Id: 1,
    Name: NodeGroupType.Templates,
    Description: "Templates",
    Operations: [
      {
        Id: 2,
        Name: "template",
        Type: "TEMPLATE",
        Description: "Template node",
        NoInputs: 1,
        NoOutputs: 1,
        IsActive: true
      }
    ]
  }
];

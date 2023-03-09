import type {
  IEditTemplateForm,
  IGroupNodeItem,
  ITemplateNodeItem
} from "../../../types";
import * as yup from "yup";
import { pruneArray, pruneObject, pruneString } from "../../../utils/forms";

export const resourceValidationSchema = yup.object({
  nodeConfig: yup.object({
    template: yup.object({
      resource: yup.object({
        action: yup
          .string()
          .max(256, "Action should be 256 characters or less")
          .required("Action is required"),
        manifest: yup.string().required("Manifest is required")
      })
    })
  })
});

export const containerValidationSchema = yup.object({
  nodeConfig: yup.object({
    template: yup.object({
      container: yup.object({
        image: yup
          .string()
          .max(256, "Image name and tag must be 256 characters or less")
          .required("Image name and tag is required")
      })
    })
  })
});

export const scriptValidationSchema = yup.object({
  nodeConfig: yup.object({
    template: yup.object({
      script: yup.object({
        image: yup
          .string()
          .max(256, "Image name and tag must be 256 characters or less")
          .required("Image name and tag is required")
      })
    })
  })
});

export const suspendValidationSchema = yup.object({
  nodeConfig: yup.object({
    template: yup.object({
      suspend: yup.object({
        duration: yup
          .string()
          .max(256, "Duration and tag must be 256 characters or less")
          .required("Duration is required")
      })
    })
  })
});

export const validationSchema = yup
  .object({
    nodeConfig: yup.object({
      template: yup.object({
        name: yup
          .string()
          .max(256, "Template name should be 256 characters or less")
          .required("Template name is required")
      })
    })
  })
  .when((values, schema) => {
    if (values.nodeConfig.metaData.type === "resource") {
      return schema.concat(resourceValidationSchema);
    }

    if (values.nodeConfig.metaData.type === "container") {
      return schema.concat(containerValidationSchema);
    }

    if (values.nodeConfig.metaData.type === "script") {
      return schema.concat(scriptValidationSchema);
    }

    if (values.nodeConfig.metaData.type === "suspend") {
      return schema.concat(suspendValidationSchema);
    }
  });

const initialValues: IEditTemplateForm = {
  nodeConfig: {
    metaData: {
      type: ""
    },
    template: {
      name: "Untitled",
      container: {
        name: "",
        image: "",
        command: "",
        args: "",
        imagePullPolicy: ""
      },
      resource: {
        action: "",
        manifest: ""
      },
      script: {
        name: "",
        image: "",
        command: "",
        args: "",
        imagePullPolicy: "",
        source: ""
      },
      suspend: {
        duration: ""
      }
    }
  }
};

export const getInitialValues = (node?: ITemplateNodeItem) => {
  if (!node) {
    return {
      ...initialValues
    };
  }

  const { nodeConfig } = node;

  return {
    nodeConfig: {
      metaData: {
        type: nodeConfig.metaData.type ?? ""
      },
      template: {
        name:
          nodeConfig.template.name ?? initialValues.nodeConfig.template.name,
        container: {
          name: nodeConfig.template.container
            ? nodeConfig.template.container.name ?? ""
            : "",
          image: nodeConfig.template.container
            ? nodeConfig.template.container.image ?? ""
            : "",
          command: nodeConfig.template.container
            ? nodeConfig.template.container.command
              ? nodeConfig.template.container.command.join(" ")
              : ""
            : "",
          args: nodeConfig.template.container
            ? nodeConfig.template.container.args
              ? nodeConfig.template.container.args.join(" ")
              : ""
            : "",
          imagePullPolicy: nodeConfig.template.container
            ? nodeConfig.template.container.imagePullPolicy ?? ""
            : ""
        },
        script: {
          name: nodeConfig.template.script
            ? nodeConfig.template.script.name ?? ""
            : "",
          image: nodeConfig.template.script
            ? nodeConfig.template.script.image ?? ""
            : "",
          command: nodeConfig.template.script
            ? nodeConfig.template.script.command
              ? nodeConfig.template.script.command.join(" ")
              : ""
            : "",
          args: nodeConfig.template.script
            ? nodeConfig.template.script.args
              ? nodeConfig.template.script.args.join(" ")
              : ""
            : "",
          imagePullPolicy: nodeConfig.template.script
            ? nodeConfig.template.script.imagePullPolicy ?? ""
            : "",
          source: nodeConfig.template.script
            ? nodeConfig.template.script.source ?? ""
            : ""
        },
        resource: {
          action: nodeConfig.template.resource
            ? nodeConfig.template.resource.action ?? ""
            : "",
          manifest: nodeConfig.template.resource
            ? nodeConfig.template.resource.manifest ?? ""
            : ""
        },
        suspend: {
          duration: nodeConfig.template.suspend
            ? nodeConfig.template.suspend.duration ?? ""
            : ""
        }
      }
    }
  };
};

export const getGroupNodeValues = (values: IGroupNodeItem): IGroupNodeItem => {
  const { nodeConfig } = values;

  const base: IGroupNodeItem = {
    key: values?.key ?? "group",
    position: values?.position ?? { left: 0, top: 0 },
    inputs: values?.inputs ?? ["op_source"],
    outputs: values?.outputs ?? [],
    type: "GROUP",
    nodeConfig: {
      metaData: {
        type: nodeConfig.metaData.type
      },
      group: {
        name: values?.nodeConfig?.group?.name ?? "group",
        nodeIds: values?.nodeConfig?.group?.nodeIds ?? []
      }
    }
  };

  return base;
};

export const getTemplateNodeFinalValues = (
  values: IEditTemplateForm,
  previous?: ITemplateNodeItem
): ITemplateNodeItem => {
  const { nodeConfig } = values;

  const base: ITemplateNodeItem = {
    key: previous?.key ?? "template",
    position: previous?.position ?? { left: 0, top: 0 },
    inputs: previous?.inputs ?? ["op_source"],
    outputs: previous?.outputs ?? [],
    type: "TEMPLATE",
    nodeConfig: {
      metaData: {
        type: nodeConfig.metaData.type
      },
      template: {
        name: nodeConfig.template.name
      }
    }
  };

  if (nodeConfig.template.container) {
    base.nodeConfig.template = {
      ...base.nodeConfig.template,
      container: pruneObject({
        name: pruneString(nodeConfig.template.container.name),
        image: nodeConfig.template.container.image,
        command: pruneArray(nodeConfig.template.container.command.split(" ")),
        args: pruneArray(nodeConfig.template.container.args.split(" ")),
        imagePullPolicy: pruneString(
          nodeConfig.template.container.imagePullPolicy
        )
      })
    };
  }

  if (nodeConfig.template.script) {
    base.nodeConfig.template = {
      ...base.nodeConfig.template,
      script: pruneObject({
        name: pruneString(nodeConfig.template.script.name),
        image: nodeConfig.template.script.image,
        command: pruneArray(nodeConfig.template.script.command.split(" ")),
        args: pruneArray(nodeConfig.template.script.args.split(" ")),
        imagePullPolicy: pruneString(
          nodeConfig.template.script.imagePullPolicy
        ),
        source: pruneString(nodeConfig.template.script.source)
      })
    };
  }

  if (nodeConfig.template.resource) {
    base.nodeConfig.template = {
      ...base.nodeConfig.template,
      resource: {
        action: nodeConfig.template.resource.action,
        manifest: nodeConfig.template.resource.manifest
      }
    };
  }

  if (nodeConfig.template.suspend) {
    base.nodeConfig.template = {
      ...base.nodeConfig.template,
      suspend: {
        duration: nodeConfig.template.suspend.duration
      }
    };
  }

  return base;
};

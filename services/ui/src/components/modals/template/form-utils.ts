import type {
  IEditTemplateForm,
  IGroupNode,
  ITemplateNode
} from "../../../types";
import * as yup from "yup";
import { pruneArray, pruneObject, pruneString } from "../../../utils/forms";

export const resourceValidationSchema = yup.object({
  data: yup.object({
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
  data: yup.object({
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
  data: yup.object({
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
  data: yup.object({
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
    data: yup.object({
      template: yup.object({
        name: yup
          .string()
          .max(256, "Template name should be 256 characters or less")
          .required("Template name is required")
      })
    })
  })
  .when((values, schema) => {
    if (values.data.type === "resource") {
      return schema.concat(resourceValidationSchema);
    }

    if (values.data.type === "container") {
      return schema.concat(containerValidationSchema);
    }

    if (values.data.type === "script") {
      return schema.concat(scriptValidationSchema);
    }

    if (values.data.type === "suspend") {
      return schema.concat(suspendValidationSchema);
    }
  });

const initialValues: IEditTemplateForm = {
  data: {
    type: "",
    when: "",
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

export const getInitialValues = (node?: ITemplateNode) => {
  if (!node) {
    return {
      ...initialValues
    };
  }

  const { data } = node;

  return {
    data: {
      type: data.type ?? "",
      when: data.when ?? "",
      template: {
        name: data.template.name ?? initialValues.data.template.name,
        container: {
          name: data.template.container
            ? data.template.container.name ?? ""
            : "",
          image: data.template.container
            ? data.template.container.image ?? ""
            : "",
          command: data.template.container
            ? data.template.container.command
              ? data.template.container.command.join(",")
              : ""
            : "",
          args: data.template.container
            ? data.template.container.args
              ? data.template.container.args.join(",")
              : ""
            : "",
          imagePullPolicy: data.template.container
            ? data.template.container.imagePullPolicy ?? ""
            : ""
        },
        script: {
          name: data.template.script ? data.template.script.name ?? "" : "",
          image: data.template.script ? data.template.script.image ?? "" : "",
          command: data.template.script
            ? data.template.script.command
              ? data.template.script.command.join(",")
              : ""
            : "",
          args: data.template.script
            ? data.template.script.args
              ? data.template.script.args.join(",")
              : ""
            : "",
          imagePullPolicy: data.template.script
            ? data.template.script.imagePullPolicy ?? ""
            : "",
          source: data.template.script ? data.template.script.source ?? "" : ""
        },
        resource: {
          action: data.template.resource
            ? data.template.resource.action ?? ""
            : "",
          manifest: data.template.resource
            ? data.template.resource.manifest ?? ""
            : ""
        },
        suspend: {
          duration: data.template.suspend
            ? data.template.suspend.duration ?? ""
            : ""
        }
      }
    }
  };
};

export const getGroupNodeValues = (values: IGroupNode): IGroupNode => {
  const base: IGroupNode = {
    key: values?.key ?? "group",
    position: values?.position ?? { left: 0, top: 0 },
    inputs: values?.inputs ?? ["op_source"],
    outputs: values?.outputs ?? [],
    type: "GROUP",
    configs: {
      name: values?.configs?.name ?? "Untitled"
    },
    data: {
      group: {
        name: values?.data?.group?.name ?? "group",
        nodeIds: values?.data?.group?.nodeIds ?? []
      }
    }
  };

  return base;
};

export const getTemplateNodeFinalValues = (
  values: IEditTemplateForm,
  previous?: ITemplateNode
): ITemplateNode => {
  const { data } = values;

  const base: ITemplateNode = {
    key: previous?.key ?? "template",
    position: previous?.position ?? { left: 0, top: 0 },
    inputs: previous?.inputs ?? ["op_source"],
    outputs: previous?.outputs ?? [],
    type: "TEMPLATE",
    configs: {
      name: data.template.name
    },
    data: {
      type: data.type,
      when: data.when,
      template: {
        name: data.template.name
      }
    }
  };

  if (data.template.container) {
    base.data.template = {
      ...base.data.template,
      container: pruneObject({
        name: pruneString(data.template.container.name),
        image: data.template.container.image,
        command: pruneArray(data.template.container.command.split(",")),
        args: pruneArray(data.template.container.args.split(",")),
        imagePullPolicy: pruneString(data.template.container.imagePullPolicy)
      })
    };
  }

  if (data.template.script) {
    base.data.template = {
      ...base.data.template,
      script: pruneObject({
        name: pruneString(data.template.script.name),
        image: data.template.script.image,
        command: pruneArray(data.template.script.command.split(",")),
        args: pruneArray(data.template.script.args.split(",")),
        imagePullPolicy: pruneString(data.template.script.imagePullPolicy),
        source: pruneString(data.template.script.source)
      })
    };
  }

  if (data.template.resource) {
    base.data.template = {
      ...base.data.template,
      resource: {
        action: data.template.resource.action,
        manifest: data.template.resource.manifest
      }
    };
  }

  if (data.template.suspend) {
    base.data.template = {
      ...base.data.template,
      suspend: {
        duration: data.template.suspend.duration
      }
    };
  }

  return base;
};

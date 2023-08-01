import { INodeItem } from "../../types";

const nodes: Record<string, INodeItem> = {
  "entrypoint-398705a7-5bbe-4f53-964a-7fb6b91dd000": {
    key: "entrypoint-398705a7-5bbe-4f53-964a-7fb6b91dd000",
    position: {
      top: 102,
      left: 110
    },
    outputs: ["op_entrypoint-398705a7-5bbe-4f53-964a-7fb6b91dd000"],
    type: "ENTRYPOINT",
    configs: {
      name: "entrypoint"
    },
    data: {},
    inputs: []
  },
  "onexit-e79638ef-a102-4378-ba5d-25a4f4129060": {
    key: "onexit-e79638ef-a102-4378-ba5d-25a4f4129060",
    position: {
      top: 180,
      left: 110
    },
    outputs: ["op_onexit-e79638ef-a102-4378-ba5d-25a4f4129060"],
    type: "ONEXIT",
    configs: {
      name: "onexit"
    },
    data: {},
    inputs: []
  },
  "template-6655e229-8af9-4046-ac3b-b99987b8ef47": {
    key: "template-6655e229-8af9-4046-ac3b-b99987b8ef47",
    position: {
      top: 127,
      left: 294
    },
    inputs: ["ip_template-6655e229-8af9-4046-ac3b-b99987b8ef47"],
    outputs: ["op_template-6655e229-8af9-4046-ac3b-b99987b8ef47"],
    type: "TEMPLATE",
    configs: {
      name: "1"
    },
    data: {
      type: "",
      when: "",
      template: {
        name: "1",
        container: {
          image: ""
        },
        script: {
          image: ""
        },
        resource: {
          action: "",
          manifest: ""
        },
        suspend: {
          duration: ""
        }
      }
    }
  },
  "template-ade474d5-ae31-4bd4-878c-0030227f8799": {
    key: "template-ade474d5-ae31-4bd4-878c-0030227f8799",
    position: {
      top: 20,
      left: 20
    },
    inputs: ["ip_template-ade474d5-ae31-4bd4-878c-0030227f8799"],
    outputs: ["op_template-ade474d5-ae31-4bd4-878c-0030227f8799"],
    type: "TEMPLATE",
    configs: {
      name: "2"
    },
    data: {
      type: "",
      when: "",
      template: {
        name: "2",
        container: {
          image: ""
        },
        script: {
          image: ""
        },
        resource: {
          action: "",
          manifest: ""
        },
        suspend: {
          duration: ""
        }
      }
    }
  },
  "template-0e05fa26-8ac2-4cc5-920f-3a601c7f7d16": {
    key: "template-0e05fa26-8ac2-4cc5-920f-3a601c7f7d16",
    position: {
      top: 100,
      left: 20
    },
    inputs: ["ip_template-0e05fa26-8ac2-4cc5-920f-3a601c7f7d16"],
    outputs: ["op_template-0e05fa26-8ac2-4cc5-920f-3a601c7f7d16"],
    type: "TEMPLATE",
    configs: {
      name: "3"
    },
    data: {
      type: "",
      when: "",
      template: {
        name: "3",
        container: {
          image: ""
        },
        script: {
          image: ""
        },
        resource: {
          action: "",
          manifest: ""
        },
        suspend: {
          duration: ""
        }
      }
    }
  },
  "template-b9e69a4f-b3ad-4a77-a023-4cf083e31ca0": {
    key: "template-b9e69a4f-b3ad-4a77-a023-4cf083e31ca0",
    position: {
      top: 20,
      left: 20
    },
    inputs: ["ip_template-b9e69a4f-b3ad-4a77-a023-4cf083e31ca0"],
    outputs: ["op_template-b9e69a4f-b3ad-4a77-a023-4cf083e31ca0"],
    type: "TEMPLATE",
    configs: {
      name: "4"
    },
    data: {
      type: "",
      when: "",
      template: {
        name: "4",
        container: {
          image: ""
        },
        script: {
          image: ""
        },
        resource: {
          action: "",
          manifest: ""
        },
        suspend: {
          duration: ""
        }
      }
    }
  },
  "template-dded7d54-1b4f-4e72-9893-82b11a992864": {
    key: "template-dded7d54-1b4f-4e72-9893-82b11a992864",
    position: {
      top: 100,
      left: 20
    },
    inputs: ["ip_template-dded7d54-1b4f-4e72-9893-82b11a992864"],
    outputs: ["op_template-dded7d54-1b4f-4e72-9893-82b11a992864"],
    type: "TEMPLATE",
    configs: {
      name: "5"
    },
    data: {
      type: "",
      when: "",
      template: {
        name: "5",
        container: {
          image: ""
        },
        script: {
          image: ""
        },
        resource: {
          action: "",
          manifest: ""
        },
        suspend: {
          duration: ""
        }
      }
    }
  },
  "group-42e2f7fc-dc30-4208-94a3-2f20505ec7ab": {
    key: "group-42e2f7fc-dc30-4208-94a3-2f20505ec7ab",
    position: {
      top: 248,
      left: 286
    },
    inputs: ["ip_group-42e2f7fc-dc30-4208-94a3-2f20505ec7ab"],
    outputs: ["op_group-42e2f7fc-dc30-4208-94a3-2f20505ec7ab"],
    type: "GROUP",
    configs: {
      name: "new group"
    },
    data: {
      group: {
        name: "new group",
        nodeIds: [
          "template-ade474d5-ae31-4bd4-878c-0030227f8799",
          "template-0e05fa26-8ac2-4cc5-920f-3a601c7f7d16"
        ]
      }
    }
  },
  "group-da190c7d-0a97-438c-9a25-f5b691ac403b": {
    key: "group-da190c7d-0a97-438c-9a25-f5b691ac403b",
    position: {
      top: 493,
      left: 291
    },
    inputs: ["ip_group-da190c7d-0a97-438c-9a25-f5b691ac403b"],
    outputs: ["op_group-da190c7d-0a97-438c-9a25-f5b691ac403b"],
    type: "GROUP",
    configs: {
      name: "new group"
    },
    data: {
      group: {
        name: "new group",
        nodeIds: []
      }
    }
  },
  "group-f731846e-020b-4d79-ab89-5d5f0a9f4769": {
    key: "group-f731846e-020b-4d79-ab89-5d5f0a9f4769",
    position: {
      top: 483,
      left: 274
    },
    inputs: ["ip_group-f731846e-020b-4d79-ab89-5d5f0a9f4769"],
    outputs: ["op_group-f731846e-020b-4d79-ab89-5d5f0a9f4769"],
    type: "GROUP",
    configs: {
      name: "new group"
    },
    data: {
      group: {
        name: "new group",
        nodeIds: [
          "template-b9e69a4f-b3ad-4a77-a023-4cf083e31ca0",
          "template-dded7d54-1b4f-4e72-9893-82b11a992864"
        ]
      }
    }
  }
};

export default nodes;

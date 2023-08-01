const entryPointNode: IEntryPointNode = {
    key: attachUUID("entrypoint"),
    position: { left: 60, top: 60 },
    outputs: ["op_source"],
    type: "ENTRYPOINT",
    configs: {
      name: "entrypoint"
    },
    inputs: [],
    data: undefined
  };

  const onExitNode: IOnExitNode = {
    key: attachUUID("onexit"),
    position: { left: 60, top: 120 },
    outputs: ["op_source"],
    type: "ONEXIT",
    configs: {
      name: "onexit"
    },
    inputs: [],
    data: undefined
  };

  const controlNodes = [entryPointNode, onExitNode];
  const preppedControlNodes = {} as any;

  for (const node of controlNodes) {
    const endpoint = prepEndpoint(node);
    preppedControlNodes[endpoint.key] = endpoint;
  }
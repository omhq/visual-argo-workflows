import * as React from "react";
import {
  Connection,
  Endpoint,
  AnchorId,
  BrowserJsPlumbInstance,
  newInstance
} from "@jsplumb/community";
import {
  defaultOptions,
  inputAnchors,
  outputAnchors,
  sourceEndpoint,
  targetEndpoint
} from "./options";
import { getConnections, ensure } from "./utils";
import { IClientNodeItem, IGraphData } from "../objects/designer";
import { Dictionary, isEqual } from "lodash";
import { IAnchor } from "../objects/index";


export const useJsPlumb = (
  nodes: Dictionary<IClientNodeItem>,
  connections: Array<[string, string]>,
  onGraphUpdate: Function
): [(containerElement: HTMLDivElement) => void,
  (zoom: number) => void,
  (node: IClientNodeItem) => void] => {
  const containerRef = React.useRef<HTMLDivElement>();
  const [instance, setInstance] = React.useState<BrowserJsPlumbInstance>(null as any);
  const stateRef = React.useRef<Dictionary<IClientNodeItem>>();
  stateRef.current = nodes;
  const containerCallbackRef = React.useCallback(
    (containerElement: HTMLDivElement) => { containerRef.current = containerElement; }, []
  );

  const addEndpoints = React.useCallback(
    (toId: string, sourceAnchors: IAnchor[], targetAnchors: IAnchor[], maxConnections: number) => {
    sourceAnchors.forEach((x) => {
      let endpoint = sourceEndpoint;
      endpoint.maxConnections = maxConnections;
      instance.addEndpoint(toId, endpoint, {
        anchor: x.position,
        uuid: x.id
      });
    });

    targetAnchors.forEach((x) => {
      let endpoint = targetEndpoint;
      endpoint.maxConnections = maxConnections;
      instance.addEndpoint(toId, endpoint, {
        anchor: x.position,
        uuid: x.id
      });
    });
  }, [instance]);

  const removeEndpoint = React.useCallback((node) => {
    const nodeConnections = instance.getConnections({ target: node.key });

    if (nodeConnections) {
      Object.values(nodeConnections).forEach((conn) => {
        instance.deleteConnection(conn);
      });
    };

    instance.removeAllEndpoints(node.key);
  }, [instance]);

  const getAnchors = (port: string[], anchorIds: AnchorId[]): IAnchor[] => {
    return port.map(
      (x, index): IAnchor => ({
        id: x,
        position: anchorIds[port.length === 1 ? 2 : index]
      })
    );
  }

  React.useEffect(() => {
    if (!instance) return;

    if (nodes) {
      Object.values(nodes).forEach((x) => {
        if (!instance.selectEndpoints({ element: x.key }).length) {
          // single connections only on start or step nodes
          const maxConnections = ['START', 'STEP'].includes(x.type) ? 1 : -1;

          addEndpoints(
            x.key,
            getAnchors(x.outputs, outputAnchors),
            getAnchors(x.inputs, inputAnchors),
            maxConnections
          );
        };
      });

      onGraphUpdate({
        'nodes': nodes,
        'connections': getConnections(instance.getAllConnections())
      });
    }
  }, [nodes, instance]);

  const onConnection = (instance: BrowserJsPlumbInstance, info: any) => {
    const connection: Connection = info.connection;
    const existingConnections = instance.select({ source: connection.sourceId, target: connection.targetId });
    const targetEndpint: Endpoint = ensure(connection.endpoints.find(e => e.isTarget));
    
    if (existingConnections.length > 1) {
      instance.deleteConnection(connection);
    }

    if (connection.sourceId === connection.targetId) {
      instance.deleteConnection(connection);
    }

    if (targetEndpint.connections.length > 1) {
      instance.deleteConnection(connection);
    }

    onGraphUpdate({
      'nodes': stateRef.current,
      'connections': getConnections(instance.getAllConnections())
    });
  }

  const onConnectionDetached = (instance: BrowserJsPlumbInstance) => {
    onGraphUpdate({
      'nodes': stateRef.current,
      'currentConnections': getConnections(instance.getAllConnections())
    });
  }

  React.useEffect(() => {
    if (!instance) return;

    let exisitngConnectionUuids = (instance.getConnections() as Connection[]).map(
      (x) => x.getUuids()
    );

    connections.forEach((x) => {
      let c = exisitngConnectionUuids.find((y) => isEqual(x, y));
      if (!c) {
        instance.connect({ uuids: x });
      }
    });
  }, [connections, nodes, instance]);

  const setZoom = React.useCallback(
    (zoom: number) => {
      if (instance) {
        instance.setZoom(zoom);
      }
    },
    [instance]
  );

  React.useEffect(() => {
    let jsPlumbInstance: BrowserJsPlumbInstance = newInstance({
      ...defaultOptions,
      container: containerRef.current
    });

    jsPlumbInstance.bind("connection", function(this: BrowserJsPlumbInstance, info: any) {
      onConnection(this, info);
    });
    jsPlumbInstance.bind("connectionDetached", function(this: BrowserJsPlumbInstance) {
      onConnectionDetached(this);
    });

    jsPlumbInstance.bind('drag:move', function(info: any) {
      const parentRect = jsPlumbInstance.getContainer().getBoundingClientRect()
      const childRect = info.el.getBoundingClientRect()
      if (childRect.right > parentRect.right) info.el.style.left = `${parentRect.width - childRect.width}px`
      if (childRect.left < parentRect.left) info.el.style.left = '0px'
      if (childRect.top < parentRect.top) info.el.style.top = '0px'
      if (childRect.bottom > parentRect.bottom) info.el.style.top = `${parentRect.height - childRect.height}px`
    })

    setInstance(jsPlumbInstance);

    return () => {
      jsPlumbInstance.destroy();
    };
  }, []);

  return [containerCallbackRef, setZoom, removeEndpoint];
}

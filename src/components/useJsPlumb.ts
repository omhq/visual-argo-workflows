import { useState, useEffect, useRef, useCallback } from "react";
import { Connection } from "@jsplumb/core";
import { AnchorId } from "@jsplumb/common";
import {
  BrowserJsPlumbInstance,
  newInstance
} from "@jsplumb/browser-ui";
import {
  defaultOptions,
  inputAnchors,
  outputAnchors,
  sourceEndpoint,
  targetEndpoint
} from "./options";
import { getConnections } from "./utils";
import { IClientNodeItem } from "../objects/designer";
import { Dictionary, isEqual } from "lodash";
import { IAnchor } from "../objects/index";


export const useJsPlumb = (
  nodes: Dictionary<IClientNodeItem>,
  connections: Array<[string, string]>,
  onGraphUpdate: Function
): [(containerElement: HTMLDivElement) => void,
  (zoom: number) => void,
  (node: IClientNodeItem) => void] => {
  const [instance, setInstance] = useState<BrowserJsPlumbInstance>(null as any);
  const containerRef = useRef<HTMLDivElement>();
  const stateRef = useRef<Dictionary<IClientNodeItem>>();
  stateRef.current = nodes;
  const containerCallbackRef = useCallback((containerElement: HTMLDivElement) => {
    containerRef.current = containerElement;
  }, []);

  const addEndpoints = useCallback((
    el: Element,
    sourceAnchors: IAnchor[],
    targetAnchors: IAnchor[],
    maxConnections: number
  ) => {
    sourceAnchors.forEach((x) => {
      let endpoint = sourceEndpoint;
      endpoint.maxConnections = maxConnections;

      instance.addEndpoint(el, endpoint, {
        anchor: x.position,
        uuid: x.id
      })
    });

    targetAnchors.forEach((x) => {
      let endpoint = targetEndpoint;
      endpoint.maxConnections = maxConnections;

      instance.addEndpoint(el, endpoint, {
        anchor: x.position,
        uuid: x.id
      });
    });
  }, [instance]);

  const removeEndpoint = useCallback((node) => {
    const nodeConnections = instance.getConnections({ target: node.key });

    if (nodeConnections) {
      Object.values(nodeConnections).forEach((conn) => {
        instance.deleteConnection(conn);
      });
    };

    instance.removeAllEndpoints(document.getElementById(node.key) as Element);
  }, [instance]);

  const getAnchors = (port: string[], anchorIds: AnchorId[]): IAnchor[] => {
    return port.map(
      (x, index): IAnchor => ({
        id: x,
        position: anchorIds[port.length === 1 ? 2 : index]
      })
    );
  };

  const onbeforeDropIntercept = (instance: BrowserJsPlumbInstance, connection: Connection) => {
    // prevent duplicate connections from the same source to target
    const existingConnections = instance.select({ source: connection.sourceId as any, target: connection.targetId as any });
    if (existingConnections.length > 0) {
      return false;
    }

    // prevent looping connections between a target and source
    const loopCheck = instance.select({ source: connection.targetId as any, target: connection.sourceId as any });
    if (loopCheck.length > 0) {
      return false;
    }

    // prevent a connection from a target to itself
    if (connection.sourceId === connection.targetId) {
      return false;
    }

    return true;
  }

  const onConnectionDetached = (instance: BrowserJsPlumbInstance) => {
    onGraphUpdate({
      'nodes': stateRef.current,
      'currentConnections': getConnections(instance.getConnections({}, true) as Connection[])
    });
  }

  const setZoom = useCallback((zoom: number) => {
    if (instance) {
      instance.setZoom(zoom);
    }
  }, [instance]);

  useEffect(() => {
    if (!instance) return;

    if (nodes) {
      Object.values(nodes).forEach((x) => {
        if (!instance.selectEndpoints({ element: x.key as any }).length) {
          const maxConnections = ['ENTRYPOINT', 'ONEXIT'].includes(x.type) ? 1 : -1;
          const el = document.getElementById(x.key) as Element;

          addEndpoints(
            el,
            getAnchors(x.outputs, outputAnchors),
            getAnchors(x.inputs, inputAnchors),
            maxConnections
          );
        };
      });

      onGraphUpdate({
        'nodes': nodes,
        'connections': getConnections(instance.getConnections({}, true) as Connection[])
      });
    }
  }, [nodes, instance, addEndpoints, onGraphUpdate]);

  useEffect(() => {
    if (!instance) return;

    let exisitngConnectionUuids = (instance.getConnections({}, true) as Connection[]).map(
      (x) => x.getUuids()
    );

    connections.forEach((x) => {
      let c = exisitngConnectionUuids.find((y) => isEqual(x, y));
      if (!c) {
        instance.connect({ uuids: x });
      }
    });
  }, [connections, nodes, instance]);

  useEffect(() => {
    let jsPlumbInstance: BrowserJsPlumbInstance = newInstance({
      ...defaultOptions,
      container: containerRef.current
    });

    jsPlumbInstance.bind("beforeDrop", function(connection: Connection) {
      return onbeforeDropIntercept(jsPlumbInstance, connection);
    });

    jsPlumbInstance.bind("connection", function(this: BrowserJsPlumbInstance, info: any) {
      onGraphUpdate({
        'nodes': stateRef.current,
        'connections': getConnections(this.getConnections({}, true) as Connection[])
      });
    });

    jsPlumbInstance.bind("connectionDetached", function(this: BrowserJsPlumbInstance) {
      onConnectionDetached(this);
    });

    jsPlumbInstance.bind("drag:move", function(info: any) {
      const parentRect = jsPlumbInstance.getContainer().getBoundingClientRect()
      const childRect = info.el.getBoundingClientRect()
      if (childRect.right > parentRect.right) info.el.style.left = `${parentRect.width - childRect.width}px`
      if (childRect.left < parentRect.left) info.el.style.left = '0px'
      if (childRect.top < parentRect.top) info.el.style.top = '0px'
      if (childRect.bottom > parentRect.bottom) info.el.style.top = `${parentRect.height - childRect.height}px`
    });

    setInstance(jsPlumbInstance);

    return () => {
      jsPlumbInstance.destroy();
    };
  }, []);

  return [containerCallbackRef, setZoom, removeEndpoint];
}

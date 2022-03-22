import { EndpointOptions } from "@jsplumb/core";
import { BezierConnector } from "@jsplumb/connector-bezier";
import { AnchorId, PaintStyle } from "@jsplumb/common";
import { BrowserJsPlumbDefaults } from "@jsplumb/browser-ui";


const connectorPaintStyle: PaintStyle = {
  strokeWidth: 2,
  stroke: "#61B7CF"
}

const connectorHoverStyle: PaintStyle = {
  strokeWidth: 3,
  stroke: "#216477"
}

const endpointHoverStyle: PaintStyle = {
  fill: "#216477",
  stroke: "#216477"
}

export const defaultOptions: BrowserJsPlumbDefaults = {
  dragOptions: {
    cursor: "move"
  }
}

export const sourceEndpoint: EndpointOptions = {
  endpoint: "Dot",
  paintStyle: {
    stroke: "#16A085",
    fill: "#16A085",
    strokeWidth: 1
  },
  source: true,
  connector: {
    type: BezierConnector.type,
    options:{
      curviness: 50
    }
  },
  connectorStyle: connectorPaintStyle,
  hoverPaintStyle: endpointHoverStyle,
  connectorHoverStyle: connectorHoverStyle,
  maxConnections: -1
}

export const targetEndpoint: EndpointOptions = {
  endpoint: "Dot",
  paintStyle: {
    fill: "#E74C3C"
  },
  hoverPaintStyle: endpointHoverStyle,
  maxConnections: -1,
  target: true
}

export const inputAnchors: AnchorId[] = ["TopLeft", "BottomLeft", "Left"];
export const outputAnchors: AnchorId[] = ["TopRight", "BottomRight", "Right"];

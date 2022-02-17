import {
  AnchorId,
  BrowserJsPlumbDefaults,
  EndpointOptions,
  PaintStyle
} from "@jsplumb/community";

export const defaultOptions: BrowserJsPlumbDefaults = {
  dragOptions: {
    containment: "parent",
    cursor: "move"
  },
  connectionOverlays: [
    [
      "Arrow",
      {
        location: 1,
        visible: true,
        width: 11,
        length: 11,
        id: "ARROW"
      }
    ]
  ]
}

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

export const sourceEndpoint: EndpointOptions = {
  endpoint: "Dot",
  paintStyle: {
    stroke: "#16A085",
    fill: "transparent",
    strokeWidth: 1
  },
  isSource: true,
  connector: [
    "Bezier",
    {
      curviness: 50
    }
  ],
  connectorStyle: connectorPaintStyle,
  hoverPaintStyle: endpointHoverStyle,
  connectorHoverStyle: connectorHoverStyle,
  dragOptions: {},
  maxConnections: -1
}

export const targetEndpoint: EndpointOptions = {
  endpoint: "Dot",
  paintStyle: {
    fill: "#E74C3C"
  },
  hoverPaintStyle: endpointHoverStyle,
  maxConnections: -1,
  dropOptions: { hoverClass: "hover", activeClass: "active" },
  isTarget: true
}

export const inputAnchors: AnchorId[] = ["TopLeft", "BottomLeft", "Left"];
export const outputAnchors: AnchorId[] = ["TopRight", "BottomRight", "Right"];

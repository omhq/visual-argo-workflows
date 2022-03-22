import { FC, useState, useCallback, useEffect, createRef } from "react";
import { Dictionary, values } from "lodash";
import { v4 as uuidv4 } from "uuid";
import { EditorView } from "@codemirror/view";
import { HighlightStyle, tags as t } from "@codemirror/highlight";
import { Extension } from "@codemirror/state";
import CodeMirror from "@uiw/react-codemirror";
import { StreamLanguage } from "@codemirror/stream-parser";
import { yaml } from "@codemirror/legacy-modes/mode/yaml";
import { json } from "@codemirror/lang-json";
import { PlayIcon, TemplateIcon, PencilIcon, BeakerIcon, LogoutIcon } from "@heroicons/react/outline";
import { nodeCreated, nodeDeleted, nodeUpdated } from "../reducers";
import Remove from "./Remove";
import ModalStepCreate from "./Modal/Step/Create";
import ModalStepEdit from "./Modal/Step/Edit";
import ModalCreate from "./Modal/Node/Create";
import ModalEdit from "./Modal/Node/Edit";
import { useClickOutside } from "./clickOutside";
import { IClientNodeItem, IGraphData } from "../objects/designer";
import { workflowLibraries } from "../data/libraries";
import { getClientNodeItem, flattenLibraries, ensure } from "./utils";
import { generateWorkflowTemplate } from "./utils/generators";
import { useJsPlumb } from "./useJsPlumb";


const CANVAS_ID: string = "canvas-container-" + uuidv4();

interface IWorkflowCanvasProps {
  dispatch: any;
  nodes: Dictionary<IClientNodeItem>;
  connections: Array<[string, string]>;
  translateY: number;
  translateX: number;
}

// Using https://github.com/one-dark/vscode-one-dark-theme/ as reference for the colors
const chalky = "#e5c07b",
  coral = "#e06c75",
  cyan = "#56b6c2",
  invalid = "#ffffff",
  ivory = "#abb2bf",
  stone = "#7d8799", // Brightened compared to original to increase contrast
  malibu = "#61afef",
  sage = "#98c379",
  whiskey = "#d19a66",
  violet = "#c678dd",
  darkBackground = "#1F2937",
  highlightBackground = "#2c313a",
  background = "#1F2937",
  tooltipBackground = "#1F2937",
  selection = "#3E4451",
  cursor = "#528bff";

// The editor theme styles for One Dark.
export const oneDarkTheme = EditorView.theme({
  "&": {
    color: ivory,
    backgroundColor: background
  },

  ".cm-content": {
    caretColor: cursor
  },

  ".cm-cursor, .cm-dropCursor": { borderLeftColor: cursor },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": { backgroundColor: selection },

  ".cm-panels": { backgroundColor: darkBackground, color: ivory },
  ".cm-panels.cm-panels-top": { borderBottom: "2px solid black" },
  ".cm-panels.cm-panels-bottom": { borderTop: "2px solid black" },

  ".cm-searchMatch": {
    backgroundColor: "#72a1ff59",
    outline: "1px solid #457dff"
  },
  ".cm-searchMatch.cm-searchMatch-selected": {
    backgroundColor: "#6199ff2f"
  },

  ".cm-activeLine": { backgroundColor: highlightBackground },
  ".cm-selectionMatch": { backgroundColor: "#aafe661a" },

  "&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket": {
    backgroundColor: "#bad0f847",
    outline: "1px solid #515a6b"
  },

  ".cm-gutters": {
    backgroundColor: background,
    color: stone,
    border: "none"
  },

  ".cm-activeLineGutter": {
    backgroundColor: highlightBackground
  },

  ".cm-foldPlaceholder": {
    backgroundColor: "transparent",
    border: "none",
    color: "#ddd"
  },

  ".cm-tooltip": {
    border: "none",
    backgroundColor: tooltipBackground
  },
  ".cm-tooltip .cm-tooltip-arrow:before": {
    borderTopColor: "transparent",
    borderBottomColor: "transparent"
  },
  ".cm-tooltip .cm-tooltip-arrow:after": {
    borderTopColor: tooltipBackground,
    borderBottomColor: tooltipBackground
  },
  ".cm-tooltip-autocomplete": {
    "& > ul > li[aria-selected]": {
      backgroundColor: highlightBackground,
      color: ivory
    }
  }
}, { dark: true });

// The highlighting style for code in the One Dark theme.
export const oneDarkHighlightStyle = HighlightStyle.define([
  {
    tag: t.keyword,
    color: violet
  },
  {
    tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName],
    color: coral
  },
  {
    tag: [t.function(t.variableName), t.labelName],
    color: malibu
  },
  {
    tag: [t.color, t.constant(t.name), t.standard(t.name)],
    color: whiskey
  },
  {
    tag: [t.definition(t.name), t.separator],
    color: ivory
  },
  {
    tag: [t.typeName, t.className, t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace],
    color: chalky
  },
  {
    tag: [t.operator, t.operatorKeyword, t.url, t.escape, t.regexp, t.link, t.special(t.string)],
    color: cyan
  },
  {
    tag: [t.meta, t.comment],
    color: stone
  },
  {
    tag: t.strong,
    fontWeight: "bold"
  },
  {
    tag: t.emphasis,
    fontStyle: "italic"
  },
  {
    tag: t.strikethrough,
    textDecoration: "line-through"
  },
  {
    tag: t.link,
    color: stone,
    textDecoration: "underline"
  },
  {
    tag: t.heading,
    fontWeight: "bold",
    color: coral
  },
  {
    tag: [t.atom, t.bool, t.special(t.variableName)],
    color: whiskey
  },
  {
    tag: [t.processingInstruction, t.string, t.inserted],
    color: sage
  },
  {
    tag: t.invalid,
    color: invalid
  },
]);

// Extension to enable the One Dark theme (both the editor theme and the highlight style).
export const oneDark: Extension = [oneDarkTheme, oneDarkHighlightStyle];
export const WorkflowCanvas: FC<IWorkflowCanvasProps> = (props) => {
  const { dispatch, nodes, connections } = props;
  const [scale, setScale] = useState(1);
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [instanceNodes, setInstanceNodes] = useState(nodes);
  const [copyText, setCopyText] = useState("Copy");
  const [selectedNode, setSelectedNode] = useState<IClientNodeItem | null>(null);
  const [showModalCreateStep, setShowModalCreateStep] = useState(false);
  const [showModalEditStep, setShowModalEditStep] = useState(false);
  const [showModalCreate, setShowModalCreate] = useState(false);
  const [showModalEdit, setShowModalEdit] = useState(false);
  const [containerCallbackRef, setZoom, removeEndpoint] = useJsPlumb(
    instanceNodes,
    connections,
    ((graphData: IGraphData) => onGraphUpdate(graphData))
  );
  const drop = createRef<HTMLDivElement>();

  useClickOutside(drop, () => {
    setShowModalCreateStep(false);
    setShowModalCreate(false);
  });

  const zoomIn = () => {
    setScale((scale) => scale + 0.1);
  }

  const zoomOut = () => {
    setScale((scale) => scale - 0.1);
  }

  const copy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopyText("Copied");

    setTimeout(() => {
      setCopyText("Copy");
    }, 300);
  }

  const onAddEndpoint = (values: any) => {
    let sections = flattenLibraries(workflowLibraries);
    let clientNodeItem = getClientNodeItem(values, ensure(sections.find((l) => l.Type === values.type)));
    clientNodeItem.position = { left: 60, top: 30 };
    dispatch(nodeCreated(clientNodeItem));
  }

  const onUpdateEndpoint = (nodeItem: IClientNodeItem) => {
    dispatch(nodeUpdated(nodeItem));
  }

  const onRemoveEndpoint = (key: string) => {
    const nodeToRemove = instanceNodes[key];
    removeEndpoint(nodeToRemove);
    dispatch(nodeDeleted(nodeToRemove));
  }

  const onGraphUpdate = useCallback((graphData: any) => {
    const generatedTemplate = generateWorkflowTemplate(graphData);
    setGeneratedCode(JSON.stringify(generatedTemplate, null, " "));
  }, []);

  useEffect(() => {
    setInstanceNodes(nodes);
  }, [nodes]);

  useEffect(() => {
    setZoom(scale);
  }, [scale, setZoom]);

  return (
    <>
      {showModalCreateStep
        ? <ModalStepCreate
          onHide={() => setShowModalCreateStep(false)}
          onAddEndpoint={(values: any) => onAddEndpoint(values)}
        />
        : null
      }

      {showModalEditStep
        ? <ModalStepEdit
          node={selectedNode}
          onHide={() => setShowModalEditStep(false)}
          onUpdateEndpoint={(values: any) => onUpdateEndpoint(values)}
        />
        : null
      }

      {showModalCreate
        ? <ModalCreate
          onHide={() => setShowModalCreate(false)}
          onAddEndpoint={(values: any) => onAddEndpoint(values)}
        />
        : null
      }

      {showModalEdit
        ? <ModalEdit
          node={selectedNode}
          onHide={() => setShowModalEdit(false)}
          onUpdateEndpoint={(nodeItem: IClientNodeItem) => onUpdateEndpoint(nodeItem)}
        />
        : null
      }

      {instanceNodes &&
        <>
          <div className="w-full overflow-hidden md:w-2/3 z-40">
            <div className="relative h-full">
              <div className="absolute top-0 right-0 z-40">
                <div className="flex space-x-2 p-2">
                  <button className="hidden btn-util" type="button" onClick={zoomOut} disabled={scale <= 0.5}>-</button>
                  <button className="hidden btn-util" type="button" onClick={zoomIn} disabled={scale >= 1}>+</button>
                  <button className="btn-util" type="button" onClick={() => setShowModalCreateStep(true)}>Add Step</button>
                  <button className="btn-util" type="button" onClick={() => setShowModalCreate(true)}>Add Template</button>
                </div>
              </div>

              <div
                id={CANVAS_ID}
                ref={containerCallbackRef}
                className="canvas h-96 md:h-full w-full"
              >
                {values(instanceNodes).map((x) => (
                  <div
                    key={x.key}
                    className={"node-item"}
                    id={x.key}
                    style={{ top: x.position.top, left: x.position.left }}
                  >
                    {x.type === "ENTRYPOINT" &&
                      <PlayIcon className="w-5 text-blue-400" />
                    }

                    {x.type === "ONEXIT" &&
                      <LogoutIcon className="w-5 text-blue-500" />
                    }

                    {x.type === "STEP" &&
                      <BeakerIcon className="w-4 text-blue-500" />
                    }

                    {x.type === "TEMPLATE" &&
                      <TemplateIcon className="w-4 text-blue-500" />
                    }

                    {!(x.key).startsWith("source") &&
                      <Remove id={x.key} onClose={onRemoveEndpoint} />
                    }

                    {(x.key).startsWith("step") &&
                      <button onClick={() => {
                        setSelectedNode(x);
                        setShowModalEditStep(true);
                      }} className="absolute -top-4 right-0">
                        <PencilIcon className="w-3.5 text-gray-500" />
                      </button>
                    }

                    {(x.key).startsWith("template") &&
                      <button onClick={() => {
                        setSelectedNode(x);
                        setShowModalEdit(true);
                      }} className="absolute -top-4 right-0">
                        <PencilIcon className="w-3.5 text-gray-500" />
                      </button>
                    }
                    <div className="node-label">{x.configuration.prettyName}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative code-column w-full md:w-1/3 bg-gray-800">
            <div className="absolute top-0 right-0 z-40">
              <div className="flex space-x-2 p-2">
                <button className="btn-util" type="button" onClick={copy}>{copyText}</button>
              </div>
            </div>

            <CodeMirror
              theme={[oneDarkTheme, oneDarkHighlightStyle]}
              minHeight="inherit"
              editable={false}
              value={generatedCode}
              extensions={([json(), StreamLanguage.define(yaml)])}
            />
          </div>
        </>
      }
    </>
  );
};

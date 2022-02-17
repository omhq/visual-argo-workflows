import { Dictionary, values } from "lodash";
import * as React from "react";
import { v4 as uuidv4 } from "uuid";
import CodeMirror from "@uiw/react-codemirror";
import { StreamLanguage } from "@codemirror/stream-parser";
import { yaml } from "@codemirror/legacy-modes/mode/yaml";
import { json } from "@codemirror/lang-json";
import { PlayIcon, CogIcon, PencilIcon } from "@heroicons/react/solid";
import { nodeCreated, nodeDeleted, nodeUpdated } from "../reducers";
import Remove from "./Remove";
import ModalCreate from "./Modal/Create";
import ModalEdit from "./Modal/Edit";
import { useClickOutside } from "./clickOutside";
import { IClientNodeItem, IGraphData } from "../objects/designer";
import { workflowLibraries } from "../data/libraries";
import { getClientNodeItem, flattenLibraries, ensure } from "./utils";
import { generateArgoTemplate } from "./utils/generators";
import { useJsPlumb } from "./useJsPlumb";


const CANVAS_ID: string = "canvas-container-" + uuidv4();

interface IWorkflowCanvasProps {
  dispatch: any;
  nodes: Dictionary<IClientNodeItem>;
  connections: Array<[string, string]>;
  translateY: number;
  translateX: number;
}

export const WorkflowCanvas: React.FC<IWorkflowCanvasProps> = (props) => {
  const { dispatch, nodes, connections, translateY, translateX } = props;
  const [scale, setScale] = React.useState(1);
  const [generatedCode, setGeneratedCode] = React.useState<string>("");
  const [instanceNodes, setInstanceNodes] = React.useState(nodes);
  const [copyText, setCopyText] = React.useState("Copy");
  const [selectedNode, setSelectedNode] = React.useState<IClientNodeItem | null>(null);
  const [showModalCreate, setShowModalCreate] = React.useState(false);
  const [showModalEdit, setShowModalEdit] = React.useState(false);
  const [containerCallbackRef, setZoom, removeEndpoint] = useJsPlumb(
    instanceNodes,
    connections,
    ((graphData: IGraphData) => onGraphUpdate(graphData))
  );
  const drop = React.createRef<HTMLDivElement>();

  useClickOutside(drop, () => setShowModalCreate(false));

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
    clientNodeItem.position = { left: 60, top: 20 };
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

  const onGraphUpdate = React.useCallback((graphData: any) => {
    const generatedTemplate = generateArgoTemplate(graphData);
    setGeneratedCode(JSON.stringify(generatedTemplate, null, " "));
  }, []);

  React.useEffect(() => {
    setInstanceNodes(nodes);
  }, [nodes]);

  React.useEffect(() => {
    setZoom(scale);
  }, [scale, setZoom]);

  return (
    <>
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
                  <button className="btn-util" type="button" onClick={() => setShowModalCreate(true)}>Add Worker</button>
                </div>
              </div>

              <div
                id={CANVAS_ID}
                ref={containerCallbackRef}
                className="canvas h-96 md:h-full w-full"
                style={{ transform: `translate(${translateY}px,${translateX}px) scale(${scale})`, transformOrigin:`0 -${translateX}px` }}
              >
                {values(instanceNodes).map((x) => (
                  <div
                    key={x.key}
                    className={"node-item"}
                    id={x.key}
                    style={{ top: x.position.top, left: x.position.left }}
                  >
                    {x.type === "START" && 
                      <PlayIcon className="w-6 text-green-600" />
                    }

                    {x.type === "STEP" && 
                      <CogIcon className="w-6 text-orange-500" />
                    }
                    {!(x.key).startsWith("source") &&
                      <>
                        <Remove id={x.key} onClose={onRemoveEndpoint} />

                        <button onClick={() => {
                          setSelectedNode(x);
                          setShowModalEdit(true);
                        }} className="absolute -top-4 right-0">
                          <PencilIcon className="w-3.5 text-gray-500" />
                        </button>
                      </>
                    }
                    <div className="node-label">{x.configuration.prettyName}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative code-column w-full h-full md:w-1/3">
            <div className="absolute top-0 right-0 z-40">
              <div className="flex space-x-2 p-2">
                <button className="btn-util" type="button" onClick={copy}>{copyText}</button>
              </div>
            </div>

            <CodeMirror
              theme="dark"
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

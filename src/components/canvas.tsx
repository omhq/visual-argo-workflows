import { FC, useState, useCallback, useEffect, createRef } from "react";
import { Dictionary, values } from "lodash";
import { v4 as uuidv4 } from "uuid";
import YAML from "yaml";
import { PlayIcon, TemplateIcon, PencilIcon, BeakerIcon, LogoutIcon } from "@heroicons/react/outline";
import { nodeCreated, nodeDeleted, nodeUpdated } from "../reducers";
import Remove from "./Remove";
import ModalStepCreate from "./Modal/Step/Create";
import ModalStepEdit from "./Modal/Step/Edit";
import ModalCreate from "./Modal/Node/Create";
import ModalEdit from "./Modal/Node/Edit";
import { useClickOutside } from "../utils/clickOutside";
import { IClientNodeItem, IGraphData } from "../types";
import { workflowLibraries } from "../utils/data/libraries";
import { getClientNodeItem, flattenLibraries, ensure } from "../utils";
import { generateWorkflowTemplate } from "../utils/generators";
import { useJsPlumb } from "./useJsPlumb";
import CodeEditor from "../components/CodeEditor";


const CANVAS_ID: string = "canvas-container-" + uuidv4();

interface IWorkflowCanvasProps {
  dispatch: any;
  nodes: Dictionary<IClientNodeItem>;
  connections: Array<[string, string]>;
  translateY: number;
  translateX: number;
}

export const WorkflowCanvas: FC<IWorkflowCanvasProps> = (props) => {
  const { dispatch, nodes, connections } = props;
  const [language, setLanguage] = useState("yaml");
  const [scale, setScale] = useState(1);
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [formattedCode, setFormattedCode] = useState<string>("");
  const [instanceNodes, setInstanceNodes] = useState(nodes);
  const [copyText, setCopyText] = useState("Copy");
  const [selectedNode, setSelectedNode] = useState<IClientNodeItem | null>(null);
  const [showModalCreateStep, setShowModalCreateStep] = useState(false);
  const [showModalEditStep, setShowModalEditStep] = useState(false);
  const [showModalCreate, setShowModalCreate] = useState(false);
  const [showModalEdit, setShowModalEdit] = useState(false);
  const [hovering, setHovering] = useState(false);
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
    navigator.clipboard.writeText(formattedCode);
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
    if (!generatedCode) {
      return
    }

    if (language === "json") {
      setFormattedCode(generatedCode);
    }

    if (language === "yaml") {
      setFormattedCode(YAML.stringify(JSON.parse(generatedCode)));
    }
  }, [language, generatedCode])

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

          <div
            className="relative code-column w-full md:w-1/3 bg-gray-800"
            onMouseOver={() => setHovering(true)}
            onMouseOut={() => setHovering(false)}
          >
            <div className={`absolute top-1 right-1 z-10 flex justify-end p-1 space-x-2 ${hovering ? `show` : `hidden`}`}>
              <button className={`btn-util ${language === "json" ? `btn-util-selected` : ``}`} onClick={() => setLanguage('json')}>json</button>
              <button className={`btn-util ${language === "yaml" ? `btn-util-selected` : ``}`} onClick={() => setLanguage('yaml')}>yaml</button>
              <button className="btn-util" type="button" onClick={copy}>{copyText}</button>
            </div>
            <CodeEditor
              data={formattedCode}
              language={language}
              onChange={(e: any) => {
                //formik.setFieldValue("code", e, false);

              }}
              disabled={true}
              lineWrapping={false}
            />
          </div>
        </>
      }
    </>
  );
};

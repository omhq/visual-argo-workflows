import * as React from "react";
import { useState, useRef } from "react";
import { Dictionary, omit } from "lodash";
import Button from "@mui/material/Button";
import { PlusIcon } from "@heroicons/react/20/solid";
import {
  ITemplateNodeItem,
  INodeItem,
  IClientNodePosition,
  IGroupNodeItem
} from "../../types";
import eventBus from "../../events/eventBus";
import useWindowDimensions from "../../hooks/useWindowDimensions";
import { nodeLibraries } from "../../utils/data/libraries";
import {
  getClientNodeItem,
  flattenLibraries,
  ensure,
  getMatchingSetIndex
} from "../../utils";
import { Canvas } from "../Canvas";
import ModalConfirmDelete from "../modals/ConfirmDelete";
import CreateTemplateModal from "../modals/template/Create";
import ModalTemplateEdit from "../modals/template/Edit";
import { useTitle } from "../../hooks";
import CodeBox from "./CodeBox";
import Header from "./Header";
import Templates from "../Templates";

type Anchor = "top" | "left" | "bottom" | "right";

export default function Project() {
  const { height } = useWindowDimensions();
  const stateNodesRef = useRef<Dictionary<INodeItem>>();
  const stateConnectionsRef = useRef<[[string, string]] | []>();
  const [showModalCreateTemplate, setShowModalCreateTemplate] = useState(false);
  const [drawerState, setDrawerState] = React.useState({
    top: false,
    left: false,
    bottom: false,
    right: false
  });
  const [templateToEdit, setTemplateToEdit] =
    useState<ITemplateNodeItem | null>(null);
  const [nodeToDelete, setNodeToDelete] = useState<INodeItem | null>(null);
  const [nodes, setNodes] = useState<Record<string, INodeItem>>({});
  const [connections, setConnections] = useState<[[string, string]] | []>([]);
  const [canvasPosition, setCanvasPosition] = useState({
    top: 0,
    left: 0,
    scale: 1
  });

  const toggleDrawer = (anchor: Anchor, open: boolean) => {
    console.log(anchor, open);
    return (event: React.KeyboardEvent | React.MouseEvent) => {
      console.log(event);
      if (
        event.type === "keydown" &&
        ((event as React.KeyboardEvent).key === "Tab" ||
          (event as React.KeyboardEvent).key === "Shift")
      ) {
        return;
      }

      setDrawerState({ ...drawerState, [anchor]: open });
    };
  };

  useTitle(["New workflow", ""].join(" | "));

  stateNodesRef.current = nodes;
  stateConnectionsRef.current = connections;

  const onNodeUpdate = (positionData: IClientNodePosition) => {
    if (stateNodesRef.current) {
      const node = {
        ...stateNodesRef.current[positionData.key],
        ...positionData
      };
      setNodes({ ...stateNodesRef.current, [positionData.key]: node });
    }
  };

  const onGraphUpdate = (graphData: any) => {
    const data = { ...graphData };
    eventBus.dispatch("FETCH_CODE", {
      message: data
    });
  };

  const onCanvasUpdate = (updatedCanvasPosition: any) => {
    setCanvasPosition({ ...canvasPosition, ...updatedCanvasPosition });
  };

  const onAddEndpoint = (values: any) => {
    console.log(values);
    const sections = flattenLibraries(nodeLibraries);
    const clientNodeItem = getClientNodeItem(
      values,
      ensure(sections.find((l) => l.type === values.type))
    );
    clientNodeItem.position = {
      left: 60 - canvasPosition.left,
      top: 30 - canvasPosition.top
    };
    setNodes({ ...nodes, [clientNodeItem.key]: clientNodeItem });

    console.log(nodes);

    if (clientNodeItem.type === "WORKER") {
      setTemplateToEdit(clientNodeItem as ITemplateNodeItem);
    }

    setShowModalCreateTemplate(false);
  };

  const addControl = (type: string) => {
    if (type === "group") {
      const base: IGroupNodeItem = {
        key: "group",
        position: { left: 0, top: 0 },
        inputs: ["op_source"],
        outputs: [],
        type: "GROUP",
        nodeConfig: {
          order: 1
        }
      };

      onAddEndpoint(base);
    }
  };

  const onUpdateEndpoint = (nodeItem: ITemplateNodeItem) => {
    setNodes({ ...nodes, [nodeItem.key]: nodeItem });
  };

  const onConnectionDetached = (data: any) => {
    if (
      !stateConnectionsRef.current ||
      stateConnectionsRef.current.length <= 0
    ) {
      return;
    }

    const _connections: [[string, string]] = [
      ...stateConnectionsRef.current
    ] as any;
    const existingIndex = getMatchingSetIndex(_connections, data);

    if (existingIndex !== -1) {
      _connections.splice(existingIndex, 1);
      setConnections(_connections);
      stateConnectionsRef.current = _connections;
    }
  };

  const onConnectionAttached = (data: any) => {
    if (stateConnectionsRef.current && stateConnectionsRef.current.length > 0) {
      const _connections: [[string, string]] = [
        ...stateConnectionsRef.current
      ] as any;
      const existingIndex = getMatchingSetIndex(_connections, data);
      if (existingIndex === -1) {
        _connections.push(data);
      }
      setConnections(_connections);
    } else {
      setConnections([data]);
    }
  };

  const onRemoveEndpoint = (node: INodeItem) => {
    setNodes({ ...omit(nodes, node.key) });
    eventBus.dispatch("NODE_DELETED", { message: { node: node } });
  };

  return (
    <div className="relative">
      {showModalCreateTemplate ? (
        <CreateTemplateModal
          onHide={() => setShowModalCreateTemplate(false)}
          onAddEndpoint={(values: any) => onAddEndpoint(values)}
        />
      ) : null}

      {templateToEdit ? (
        <ModalTemplateEdit
          node={templateToEdit}
          onHide={() => setTemplateToEdit(null)}
          onUpdateEndpoint={(values: any) => onUpdateEndpoint(values)}
        />
      ) : null}

      {nodeToDelete ? (
        <ModalConfirmDelete
          onHide={() => setNodeToDelete(null)}
          onConfirm={() => {
            onRemoveEndpoint(nodeToDelete);
            setNodeToDelete(null);
          }}
        />
      ) : null}

      <div className="md:pl-16 flex flex-col flex-1">
        <Header />

        <div className="flex flex-grow relative">
          <div
            className="w-full overflow-hidden md:w-2/3 z-40"
            style={{ height: height - 64 }}
          >
            <div className="relative h-full">
              <div className="absolute top-0 right-0 z-40">
                <div className="flex space-x-2 p-2">
                  <button
                    className="flex space-x-1 btn-util"
                    type="button"
                    onClick={() => setShowModalCreateTemplate(true)}
                  >
                    <PlusIcon className="w-4" />
                    <span>Task</span>
                  </button>

                  <button
                    className="flex space-x-1 btn-util"
                    type="button"
                    onClick={() => setShowModalCreateTemplate(true)}
                  >
                    <PlusIcon className="w-4" />
                    <span>Step</span>
                  </button>

                  <Button
                    className="flex space-x-1 btn-util"
                    onClick={toggleDrawer("right", true)}
                  >
                    templates
                  </Button>
                  <button
                    className="flex space-x-1 btn-util"
                    type="button"
                    onClick={() => toggleDrawer("right", true)}
                  >
                    <span>Templates</span>
                  </button>
                </div>
              </div>

              <Canvas
                nodes={nodes}
                connections={connections}
                canvasPosition={canvasPosition}
                onNodeUpdate={(node: IClientNodePosition) => onNodeUpdate(node)}
                onGraphUpdate={(graphData: any) => onGraphUpdate(graphData)}
                onCanvasUpdate={(canvasData: any) => onCanvasUpdate(canvasData)}
                onConnectionAttached={(connectionData: any) =>
                  onConnectionAttached(connectionData)
                }
                onConnectionDetached={(connectionData: any) =>
                  onConnectionDetached(connectionData)
                }
                setTemplateToEdit={(node: ITemplateNodeItem) =>
                  setTemplateToEdit(node)
                }
                setNodeToDelete={(node: ITemplateNodeItem) =>
                  setNodeToDelete(node)
                }
              />
            </div>
          </div>

          <div className="group code-column w-1/2 md:w-1/3 absolute top-0 right-0 sm:relative z-40 md:z-30">
            <CodeBox />
          </div>
        </div>
      </div>

      <Templates />
    </div>
  );
}

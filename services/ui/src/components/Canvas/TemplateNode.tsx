import { useEffect, useState } from "react";
import { truncateStr } from "../../utils";
import { ITemplateNodeItem, CallbackFunction } from "../../types";
import eventBus from "../../events/eventBus";
import { Popover } from "./Popover";
import NodeIcon from "./NodeIcon";

interface INodeProps {
  node: ITemplateNodeItem;
  setTemplateToEdit: CallbackFunction;
  setNodeToDelete: CallableFunction;
  onNodeSelect: CallableFunction;
  selectedNodes: string[];
}

export default function TemplateNode(props: INodeProps) {
  const {
    node,
    setTemplateToEdit,
    setNodeToDelete,
    onNodeSelect,
    selectedNodes
  } = props;
  const [nodeDragging, setNodeDragging] = useState<string | null>();
  const [nodeHovering, setNodeHovering] = useState<string | null>();

  const selectNodeHanlder = (detail: any) => {
    const { event, message } = detail;

    if (event.shiftKey) {
      if (selectedNodes.includes(message.id)) {
        console.log("includes");
        onNodeSelect(selectedNodes.filter((item) => item !== message.id));
      } else {
        console.log("not includes");
        onNodeSelect([...selectedNodes, message.id]);
      }
    } else {
      console.log(
        selectedNodes,
        selectedNodes.includes(message.id),
        message.id
      );
      if (selectedNodes.includes(message.id)) {
        console.log("includes");
        onNodeSelect([]);
      } else {
        console.log("not includes");
        onNodeSelect([message.id]);
      }
      console.log("without shift");
    }
  };

  useEffect(() => {
    eventBus.on("EVENT_DRAG_START", (data: any) => {
      setNodeDragging(data.detail.message.id);
    });

    eventBus.on("EVENT_DRAG_STOP", () => {
      setNodeDragging(null);
    });

    eventBus.on("EVENT_ELEMENT_CLICK", (data: any) => {
      selectNodeHanlder(data.detail);
    });

    return () => {
      eventBus.remove("EVENT_DRAG_START", () => undefined);
      eventBus.remove("EVENT_DRAG_STOP", () => undefined);
      eventBus.remove("EVENT_ELEMENT_CLICK", () => undefined);
    };
  }, []);

  return (
    <div
      key={node.key}
      className={"node-item cursor-pointer shadow flex flex-col group"}
      id={node.key}
      style={{ top: node.position.top, left: node.position.left }}
      onMouseEnter={() => setNodeHovering(node.key)}
      onMouseLeave={() => {
        if (nodeHovering === node.key) {
          setNodeHovering(null);
        }
      }}
    >
      {nodeHovering === node.key && nodeDragging !== node.key && (
        <Popover
          onEditClick={() => {
            setTemplateToEdit(node);
          }}
          onDeleteClick={() => {
            setNodeToDelete(node);
          }}
        ></Popover>
      )}
      <div className="relative node-label w-full py-2 px-4">
        <>
          {node.nodeConfig.template.name && (
            <div className="text-sm font-semibold overflow-x-hidden">
              {truncateStr(node.nodeConfig.template.name, 12)}
            </div>
          )}

          <NodeIcon nodeType={node.type} />
        </>
      </div>
    </div>
  );
}

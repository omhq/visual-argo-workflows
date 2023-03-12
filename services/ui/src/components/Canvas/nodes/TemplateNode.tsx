import { FunctionComponent, ReactElement, useEffect, useState } from "react";
import { truncateStr } from "../../../utils";
import { ITemplateNode, CallbackFunction } from "../../../types";
import eventBus from "../../../events/eventBus";
import { Popover } from "../Popover";
import NodeIcon from "../NodeIcon";

interface ITemplateNodeProps {
  node: ITemplateNode;
  setTemplateToEdit: CallbackFunction;
  setNodeToDelete: CallableFunction;
  selected: boolean;
}

const TemplateNode: FunctionComponent<ITemplateNodeProps> = (
  props: ITemplateNodeProps
): ReactElement => {
  const { node, setTemplateToEdit, setNodeToDelete, selected } = props;
  const [nodeDragging, setNodeDragging] = useState<string | null>();
  const [nodeHovering, setNodeHovering] = useState<string | null>();

  useEffect(() => {
    let mounted = true;

    eventBus.on("EVENT_DRAG_START", (data: any) => {
      if (mounted) {
        setNodeDragging(data.detail.message.id);
      }
    });

    eventBus.on("EVENT_DRAG_STOP", () => {
      if (mounted) {
        setNodeDragging(null);
      }
    });

    return () => {
      mounted = false;

      eventBus.remove("EVENT_DRAG_START", () => undefined);
      eventBus.remove("EVENT_DRAG_STOP", () => undefined);
    };
  }, []);

  return (
    <div
      key={node.key}
      className={"node-item cursor-pointer shadow flex flex-col group"}
      id={node.key}
      style={{
        top: node.position.top,
        left: node.position.left,
        borderStyle: selected ? "dashed" : "none",
        borderWidth: 1,
        borderColor: "#1d4ed8"
      }}
      onMouseEnter={() => setNodeHovering(node.key)}
      onMouseLeave={() => {
        if (nodeHovering === node.key) {
          setNodeHovering(null);
        }
      }}
    >
      {nodeHovering === node.key && nodeDragging !== node.key && (
        <Popover
          onEdit={() => {
            setTemplateToEdit(node);
          }}
          onDelete={() => {
            setNodeToDelete(node);
          }}
        ></Popover>
      )}
      <div className="relative node-label w-full py-2 px-4">
        <>
          {node.data.template.name && (
            <div className="text-sm font-semibold overflow-x-hidden">
              {truncateStr(node.data.template.name, 12)}
            </div>
          )}

          <NodeIcon nodeType={node.type} />
        </>
      </div>
    </div>
  );
};

export default TemplateNode;

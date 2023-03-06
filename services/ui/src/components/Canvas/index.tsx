import { useState, useEffect, ReactElement, FunctionComponent } from "react";
import { Dictionary, values } from "lodash";
import { v4 as uuidv4 } from "uuid";
import eventBus from "../../events/eventBus";
import { CallbackFunction, ITemplateNodeItem, INodeItem } from "../../types";
import TemplateNode from "./TemplateNode";
import { IJsPlumb } from "./useJsPlumb";

const CANVAS_ID: string = "canvas-container-" + uuidv4();

export interface ICanvasProps {
  nodes: Dictionary<INodeItem>;
  canvasPosition: any;
  onCanvasUpdate: CallbackFunction;
  onCanvasClick: CallbackFunction;

  setTemplateToEdit: CallbackFunction;
  setNodeToDelete: CallbackFunction;
  selectedNodes: Record<string, any>;

  jsPlumb: IJsPlumb;
}

export const Canvas: FunctionComponent<ICanvasProps> = (
  props: ICanvasProps
): ReactElement => {
  const {
    nodes,
    canvasPosition,
    onCanvasUpdate,
    onCanvasClick,
    setTemplateToEdit,
    setNodeToDelete,
    selectedNodes,
    jsPlumb
  } = props;

  const [dragging, setDragging] = useState(false);
  const [scale, setScale] = useState(1);
  const [_scale, _setScale] = useState(1);
  const [_left, _setLeft] = useState(0);
  const [_top, _setTop] = useState(0);
  const [_initX, _setInitX] = useState(0);
  const [_initY, _setInitY] = useState(0);

  const translateWidth =
    (document.documentElement.clientWidth * (1 - _scale)) / 2;
  const translateHeight =
    ((document.documentElement.clientHeight - 64) * (1 - _scale)) / 2;

  const onCanvasMousewheel = (e: any) => {
    if (e.deltaY < 0) {
      _setScale(_scale + _scale * 0.25);
      setScale(_scale + _scale * 0.25);
    }

    if (e.deltaY > 0) {
      _setScale(_scale - _scale * 0.25);
      setScale(_scale - _scale * 0.25);
    }
  };

  const onCanvasMouseMove = (e: any) => {
    if (!dragging) {
      return;
    }

    if (e.pageX && e.pageY) {
      const styles = {
        left: _left + e.pageX - _initX + "px",
        top: _top + e.pageY - _initY + "px"
      };
      jsPlumb.setStyle(styles);
    }
  };

  const onCanvasMouseUpLeave = (e: any) => {
    if (dragging) {
      if (e.pageX && e.pageY) {
        const left = _left + e.pageX - _initX;
        const top = _top + e.pageY - _initY;

        _setLeft(left);
        _setTop(top);
        setDragging(false);
        onCanvasUpdate({
          left: left,
          top: top
        });
      }
    }
  };

  const onCanvasMouseDown = (e: any) => {
    if (e.pageX && e.pageY) {
      _setInitX(e.pageX);
      _setInitY(e.pageY);
      setDragging(true);
    }
  };

  useEffect(() => {
    jsPlumb.setZoom(_scale);
  }, [_scale]);

  useEffect(() => {
    onCanvasUpdate({
      scale: scale
    });
  }, [scale]);

  useEffect(() => {
    const styles = {
      left: _left + "px",
      top: _top + "px"
    };

    jsPlumb.setStyle(styles);
  }, [_left, _top, jsPlumb.setStyle]);

  useEffect(() => {
    _setTop(canvasPosition.top);
    _setLeft(canvasPosition.left);
    _setScale(canvasPosition.scale);
  }, [canvasPosition]);

  useEffect(() => {
    eventBus.on("NODE_DELETED", (data: any) => {
      jsPlumb.removeEndpoint(data.detail.message.node);
    });

    return () => {
      eventBus.remove("NODE_DELETED", () => undefined);
    };
  }, []);

  return (
    <>
      {nodes && (
        <div
          key={CANVAS_ID}
          className="jsplumb-box"
          onWheel={onCanvasMousewheel}
          onMouseMove={onCanvasMouseMove}
          onMouseDown={onCanvasMouseDown}
          onMouseUp={onCanvasMouseUpLeave}
          onMouseLeave={onCanvasMouseUpLeave}
          onContextMenu={(event) => {
            event.stopPropagation();
            event.preventDefault();
          }}
        >
          <div
            id={CANVAS_ID}
            ref={jsPlumb.containerCallbackRef}
            onClick={(ev: any) => {
              if (ev.target.id && ev.target.id === CANVAS_ID) {
                onCanvasClick();
              }
            }}
            className="canvas"
            style={{
              transformOrigin: "0px 0px 0px",
              transform: `translate(${translateWidth}px, ${translateHeight}px) scale(${_scale})`
            }}
          >
            {values(nodes).map((x) => {
              if (x.type === "TEMPLATE") {
                x = x as ITemplateNodeItem;
                return (
                  <TemplateNode
                    key={x.key}
                    node={x}
                    setTemplateToEdit={setTemplateToEdit}
                    setNodeToDelete={setNodeToDelete}
                    selected={x.key in selectedNodes}
                  />
                );
              }
            })}
          </div>
        </div>
      )}
    </>
  );
};

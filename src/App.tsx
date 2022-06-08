import { useReducer, useEffect, useState } from "react";
import { reducer, initialState, nodes, connections } from "./reducers";
import { WorkflowCanvas } from "./components/canvas";
import { getClientNodesAndConnections, parseConfiguration } from "./utils";
import { StartConfigString } from "./utils/data/startConfig";
import { workflowLibraries } from "./utils/data/libraries";
import { getNodesPositions } from "./utils/position";
import "./App.css";


export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [translateY, setTranslateY] = useState<number>(0);
  const [translateX, setTranslateX] = useState<number>(0);

  const setViewHeight = () => {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };

  useEffect(() => {
    window.addEventListener("resize", () => {
      setViewHeight();
    });

    setViewHeight();
  }, []);

  useEffect(() => {
    let serviceNodeItems = parseConfiguration(StartConfigString);
    let [serviceNodeItemsWithPosition, getTranslateY, getTranslateX] = getNodesPositions(
      serviceNodeItems
    );

    let [clientNodeItems, clientConnectionItems] = getClientNodesAndConnections(
      serviceNodeItemsWithPosition,
      workflowLibraries
    );

    setTranslateY(getTranslateY);
    setTranslateX(getTranslateX);
    dispatch(nodes(clientNodeItems));
    dispatch(connections(clientConnectionItems));
  }, []);

  return (
    <div className="flex flex-grow relative flex-col min-h-screen md:flex-row">
      <WorkflowCanvas
        dispatch={dispatch}
        nodes={state.nodes}
        connections={state.connections}
        translateY={translateY}
        translateX={translateX}
      />
    </div>
  );
}

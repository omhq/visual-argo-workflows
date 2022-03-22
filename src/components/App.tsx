import { useReducer, useEffect } from "react";
import { reducer, initialState, nodes, connections } from "../reducers";
import { WorkflowCanvas } from "./canvas";
import { getClientNodesAndConnections, parseConfiguration } from "./utils/index";
import { StartConfigString } from "../data/startConfig";
import { getNodesPositions } from "./utils/position";
import { workflowLibraries } from "../data/libraries";
import "./App.css";


export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  let serviceNodeItems = parseConfiguration(StartConfigString);
  let [serviceNodeItemsWithPosition, translateY, translateX] = getNodesPositions(
    serviceNodeItems
  );

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
    let [clientNodeItems, clientConnectionItems] = getClientNodesAndConnections(
      serviceNodeItemsWithPosition,
      workflowLibraries
    );
    dispatch(nodes(clientNodeItems))
    dispatch(connections(clientConnectionItems))
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

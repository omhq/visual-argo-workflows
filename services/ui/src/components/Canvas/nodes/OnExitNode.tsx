import { styled } from "@mui/material";
import { FunctionComponent, ReactElement } from "react";
import { IOnExitNode } from "../../../types";

const Root = styled("div")`
  width: fit-content;
  height: fit-content;
  position: absolute;

  min-width: 50px;
  min-height: 50px;
  width: fit-content;
  height: fit-content;
  background: #9f63c408;
  border-color: #9f63c4;
  border-style: dotted;
  border-width: 1px;
  border-radius: 100%;
`;

const StyledLabel = styled("div")`
  font-weight: 700;
`;

interface IOnExitNodeProps {
  onexit: IOnExitNode;
}

const OnExitNode: FunctionComponent<IOnExitNodeProps> = (
  props: IOnExitNodeProps
): ReactElement => {
  const { onexit } = props;

  return (
    <Root
      className={"node-item cursor-pointer shadow flex flex-col group"}
      id={onexit.key}
      style={{
        top: onexit.position.top,
        left: onexit.position.left
      }}
    >
      <StyledLabel className="flex flex-col items-center h-full my-auto text-gray-600 text-xs">
        <div>onExit</div>
      </StyledLabel>
    </Root>
  );
};

export default OnExitNode;

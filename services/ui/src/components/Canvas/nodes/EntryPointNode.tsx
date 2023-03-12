import { styled } from "@mui/material";
import { FunctionComponent, ReactElement } from "react";
import { IEntryPointNode } from "../../../types";

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

interface IEntryPointNodeProps {
  entrypoint: IEntryPointNode;
}

const EntryPointNode: FunctionComponent<IEntryPointNodeProps> = (
  props: IEntryPointNodeProps
): ReactElement => {
  const { entrypoint } = props;

  return (
    <Root
      className={"node-item cursor-pointer shadow flex flex-col group"}
      id={entrypoint.key}
    >
      <StyledLabel className="flex flex-col items-center h-full my-auto text-gray-600">
        <div>E</div>
      </StyledLabel>
    </Root>
  );
};

export default EntryPointNode;

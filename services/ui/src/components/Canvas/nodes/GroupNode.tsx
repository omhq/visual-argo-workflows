import { styled } from "@mui/material";
import { FunctionComponent, ReactElement } from "react";
import { IGroupNode } from "../../../types";

const Root = styled("div")`
  width: fit-content;
  height: fit-content;
  position: absolute;

  min-width: 200px;
  min-height: 200px;
  width: fit-content;
  height: fit-content;
  background: #9f63c408;
  /* opacity: 0.2; */
  border-color: #9f63c4;
  border-style: dotted;
  border-width: 1px;
`;

interface IGroupNodeProps {
  group: IGroupNode;
}

const GroupNode: FunctionComponent<IGroupNodeProps> = (
  props: IGroupNodeProps
): ReactElement => {
  const { group } = props;

  return <Root id={group.key}></Root>;
};

export default GroupNode;

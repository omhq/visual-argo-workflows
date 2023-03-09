import { styled } from "@mui/material";
import { FunctionComponent, ReactElement } from "react";
import { IGroupNodeItem } from "../../types";

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

export interface IGroupProps {
  group: IGroupNodeItem;
}

export const Group: FunctionComponent<IGroupProps> = (
  props: IGroupProps
): ReactElement => {
  const { group } = props;

  return <Root id={group.key}></Root>;
};

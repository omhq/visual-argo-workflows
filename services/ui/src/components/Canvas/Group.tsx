import { styled } from "@mui/material";
import { FunctionComponent, ReactElement, ReactNode } from "react";
import { useHover } from "../../hooks";
import { IGroup } from "../../types";
import { GroupPopover } from "./GroupPopover";

const Root = styled("div")`
  width: fit-content;
  height: fit-content;
  position: absolute;
`;

const Label = styled("span")`
  font-size: 12px;
  font-weight: 500;
`;

const NodeContainer = styled("div")`
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
  group: IGroup;
  children?: ReactNode;
}

export const Group: FunctionComponent<IGroupProps> = (
  props: IGroupProps
): ReactElement => {
  const { group, children } = props;

  return (
    <Root id={group.id}>
      <Label>{group.id}</Label>
      <NodeContainer>{children}</NodeContainer>
    </Root>
  );
};

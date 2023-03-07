import { styled } from "@mui/material";
import { FunctionComponent, ReactElement, ReactNode } from "react";
import { IGroup } from "../../types";

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

const Label = styled("span")`
  font-size: 12px;
  font-weight: 500;
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
      {children}
    </Root>
  );
};

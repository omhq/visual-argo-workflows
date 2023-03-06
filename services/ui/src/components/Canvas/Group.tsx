import { styled } from "@mui/material";
import { FunctionComponent, ReactElement } from "react";
import { useHover } from "../../hooks";
import { IGroup } from "../../types";
import { GroupPopover } from "./GroupPopover";

const Root = styled("div")`
  width: fit-content;
  height: fit-content;
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
}

export const Group: FunctionComponent<IGroupProps> = (
  props: IGroupProps
): ReactElement => {
  const { group } = props;

  const [ref, hover] = useHover<HTMLDivElement>();

  return (
    <Root ref={ref as any}>
      {hover && (
        <GroupPopover onEdit={() => undefined} onDelete={() => undefined} />
      )}
      <Label>{group.id}</Label>
      <NodeContainer id={group.id} />
    </Root>
  );
};

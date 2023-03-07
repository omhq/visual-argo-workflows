import { TrashIcon, PencilIcon } from "@heroicons/react/24/solid";
import { FunctionComponent, ReactElement } from "react";

export interface IPopoverProps {
  onEdit: () => void;
  onDelete: () => void;
}

export const Popover: FunctionComponent<IPopoverProps> = (
  props: IPopoverProps
): ReactElement => {
  const { onEdit: onEditClick, onDelete: onDeleteClick } = props;

  return (
    <div className="relative flex flex-col items-center">
      <div className="flex absolute -bottom-2 flex flex-col items-center p-2">
        <span className="relative z-10 p-2.5 text-xs leading-none text-white whitespace-no-wrap bg-gray-700 shadow-lg rounded-md">
          <div className="flex space-x-2.5">
            <TrashIcon
              onClick={onDeleteClick}
              className="w-3 h-3 text-red-400"
            />
            <PencilIcon onClick={onEditClick} className="w-3 h-3" />
          </div>
        </span>
        <div className="w-3 h-3 -mt-2.5 rotate-45 bg-gray-600" />
      </div>
    </div>
  );
};

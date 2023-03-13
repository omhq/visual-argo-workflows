import { Square2StackIcon, Cog6ToothIcon } from "@heroicons/react/24/solid";

type NodeIconProps = {
  nodeType: string;
};

const NodeIcon = ({ nodeType }: NodeIconProps) => {
  switch (nodeType) {
    case "WORKER":
      return (
        <Cog6ToothIcon className="w-3 h-3 text-gray-500 absolute top-2 right-2" />
      );
    default:
      return (
        <Square2StackIcon className="w-3 h-3 text-gray-600 absolute top-2 right-2" />
      );
  }
};

export default NodeIcon;

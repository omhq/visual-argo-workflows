import { useFormikContext } from "formik";
import { useState } from "react";
import { IEditTemplateForm } from "../../../types";
import { classNames } from "../../../utils/styles";

interface ITabsProps {
  setOpenTab: any;
}

const Tabs = (props: ITabsProps) => {
  const formik = useFormikContext<IEditTemplateForm>();
  const [currentOpenTab, setCurrentOpenTab] = useState("General");
  const { setOpenTab } = props;

  const tabs = [
    { name: "General", href: "#", current: true, hidden: false },
    {
      name: "Container",
      href: "#",
      current: false,
      hidden: formik.values.data.type === "container" ? false : true
    },
    {
      name: "Script",
      href: "#",
      current: false,
      hidden: formik.values.data.type === "script" ? false : true
    },
    {
      name: "Resource",
      href: "#",
      current: false,
      hidden: formik.values.data.type === "resource" ? false : true
    },
    {
      name: "Suspend",
      href: "#",
      current: false,
      hidden: formik.values.data.type === "suspend" ? false : true
    }
  ];

  return (
    <>
      <div className="sm:hidden">
        <label htmlFor="tabs" className="sr-only">
          Select a tab
        </label>
        <select
          id="tabs"
          name="tabs"
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          defaultValue={tabs.find((tab) => tab.current)?.name}
        >
          {tabs.map((tab) => (
            <option key={tab.name}>{tab.name}</option>
          ))}
        </select>
      </div>

      <div className="hidden sm:block">
        <div className="border-b border-gray-200 px-8">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <a
                key={tab.name}
                href={tab.href}
                className={classNames(
                  tab.name === currentOpenTab
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
                  "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm",
                  tab.hidden ? "hidden" : ""
                )}
                aria-current={tab.current ? "page" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentOpenTab(tab.name);
                  setOpenTab(tab.name);
                }}
              >
                {tab.name}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Tabs;

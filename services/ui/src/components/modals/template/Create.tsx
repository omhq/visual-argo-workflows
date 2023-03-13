import { useCallback, useMemo, useState } from "react";
import { Formik } from "formik";
import { XMarkIcon } from "@heroicons/react/24/outline";
import General from "./General";
import Container from "./Container";
import Script from "./Script";
import Resource from "./Resource";
import Suspend from "./Suspend";
import {
  getInitialValues,
  validationSchema,
  getTemplateNodeFinalValues
} from "./form-utils";
import Tabs from "./Tabs";
import { reportErrorsAndSubmit } from "../../../utils/forms";

interface IModalProps {
  onHide: any;
  onAddEndpoint: any;
}

const ModalCreate = (props: IModalProps) => {
  const { onHide, onAddEndpoint } = props;
  const [openTab, setOpenTab] = useState("General");
  const initialValues = useMemo(() => getInitialValues(), [getInitialValues]);

  const handleCreate = useCallback(
    (values: any, formik: any) => {
      onAddEndpoint(getTemplateNodeFinalValues(values), values, formik);
    },
    [getTemplateNodeFinalValues, onAddEndpoint]
  );

  return (
    <>
      <div className="fixed z-50 inset-0 overflow-y-auto">
        <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 outline-none focus:outline-none">
          <div
            onClick={onHide}
            className="opacity-25 fixed inset-0 z-40 bg-black"
          ></div>
          <div className="relative w-auto my-6 mx-auto max-w-5xl z-50">
            <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
              <Formik
                initialValues={initialValues}
                enableReinitialize={true}
                onSubmit={handleCreate}
                validationSchema={validationSchema}
              >
                {(formik) => (
                  <>
                    <div className="flex items-center justify-between px-4 py-3 border-b border-solid border-blueGray-200 rounded-t">
                      <h3 className="text-sm font-semibold">New template</h3>
                      <button
                        className="p-1 ml-auto text-black float-right outline-none focus:outline-none"
                        onClick={onHide}
                      >
                        <span className="block outline-none focus:outline-none">
                          <XMarkIcon className="w-4" />
                        </span>
                      </button>
                    </div>

                    <div>
                      <Tabs setOpenTab={setOpenTab} />

                      <div className="relative px-4 py-3 flex-auto">
                        {openTab === "General" && <General />}
                        {openTab === "Container" && <Container />}
                        {openTab === "Script" && <Script />}
                        {openTab === "Resource" && <Resource />}
                        {openTab === "Suspend" && <Suspend />}
                      </div>
                    </div>

                    <div className="flex items-center justify-end px-4 py-3 border-t border-solid border-blueGray-200 rounded-b">
                      <button
                        className="btn-util"
                        type="button"
                        onClick={reportErrorsAndSubmit(formik)}
                      >
                        Add
                      </button>
                    </div>
                  </>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModalCreate;

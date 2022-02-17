import React from "react";
import { useFormik } from "formik";
import { XIcon } from "@heroicons/react/outline";
import { formatName } from "../utils";
import Form from "./Form";
import { initialValues } from "./utils"
import { IClientNodeItem } from "../../objects/designer";


interface IModalProps {
  node: IClientNodeItem | null;
  onHide: any;
  onUpdateEndpoint: any;
}

const ModalEdit = (props: IModalProps) => {
  const { node, onHide, onUpdateEndpoint } = props;
  const [selectedNode, setSelectedNode] = React.useState<IClientNodeItem | null>(null);
  const formik = useFormik({
    initialValues: {
      ...initialValues()
    },
    onSubmit: ((values, { setSubmitting }) => {

    })
  });

  React.useEffect(() => {
    if (node) {
      setSelectedNode(node);
    }
  }, [node]);

  React.useEffect(() => {
    formik.resetForm();

    if (selectedNode) {
      formik.initialValues.configuration.prettyName = selectedNode.configuration.prettyName;
      formik.initialValues.configuration.name = selectedNode.configuration.name;
      formik.initialValues.configuration.description = selectedNode.configuration.description;
      formik.initialValues.configuration.action = selectedNode.configuration.action;
      formik.initialValues.configuration.successCondition = selectedNode.configuration.successCondition;
      formik.initialValues.configuration.failureCondition = selectedNode.configuration.failureCondition;
      formik.initialValues.configuration.manifest = selectedNode.configuration.manifest;
    }
  }, [selectedNode]);

  React.useEffect(() => {
    return () => {
      formik.resetForm();
    }
  }, []);

  return (
    <>
      <div className="fixed z-50 inset-0 overflow-y-auto">
        <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
          <div className="relative w-auto my-6 mx-auto max-w-5xl">
            <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
              <div className="flex items-center justify-between px-4 py-3 border-b border-solid border-blueGray-200 rounded-t">
                <h3 className="text-sm font-semibold">Update worker</h3>
                <button
                  className="p-1 ml-auto text-black float-right outline-none focus:outline-none"
                  onClick={() => onHide()}
                >
                  <span className="block outline-none focus:outline-none">
                    <XIcon className="w-4" />
                  </span>
                </button>
              </div>

              <Form formik={formik} />

              <div className="flex items-center justify-end px-4 py-3 border-t border-solid border-blueGray-200 rounded-b">
                <button
                  className="btn-util"
                  type="button"
                  onClick={() => {
                    let updated = {...selectedNode};
                    formik.values.configuration.name = formatName(formik.values.configuration.prettyName);
                    updated.configuration = formik.values.configuration;
                    onUpdateEndpoint(updated)
                  }}
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
      </div>
    </>
  );
}

export default ModalEdit

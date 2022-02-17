import React from "react";
import { useFormik } from "formik";
import { XIcon } from "@heroicons/react/outline";
import Form from "./Form";
import { initialValues } from "./utils";


interface IModalProps {
  onHide: any;
  onAddEndpoint: Function;
}

const ModalCreate = (props: IModalProps) => {
  const { onHide, onAddEndpoint } = props;
  const formik = useFormik({
    initialValues: {
      ...initialValues(),
      key: "step",
      type: "STEP",
      inputs: ["op_source"],
      outputs: [],
      config: {}
    },
    onSubmit: ((values, { setSubmitting }) => {
      
    })
  });

  return (
    <>
      <div className="fixed z-50 inset-0 overflow-y-auto">
        <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
          <div className="relative w-auto my-6 mx-auto max-w-5xl">
            <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
              <div className="flex items-center justify-between px-4 py-3 border-b border-solid border-blueGray-200 rounded-t">
                <h3 className="text-sm font-semibold">Add worker</h3>
                <button
                  className="p-1 ml-auto text-black float-right outline-none focus:outline-none"
                  onClick={onHide}
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
                  onClick={() => [
                    onAddEndpoint(formik.values),
                    formik.resetForm()
                  ]}
                >
                  Add
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

export default ModalCreate

import React from "react";


const Form = (props: any) => {
  const { formik } = props;

  return (
    <div className="relative px-4 py-3 flex-auto">
      <form onSubmit={formik.handleSubmit}>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <label htmlFor="prettyName" className="block text-xs font-medium text-gray-700">Name</label>
            <div className="mt-1">
              <input
                id="prettyName"
                name="configuration.prettyName"
                type="text"
                autoComplete="none"
                className="input-util"
                onChange={formik.handleChange}
                value={formik.values.configuration.prettyName}
              />
            </div>
          </div>
        </div>

        <div className="mt-2">
          <label htmlFor="about" className="block text-xs font-medium text-gray-700">Description</label>
          <div className="mt-1">
            <textarea
              id="description"
              name="configuration.description"
              onChange={formik.handleChange}
              value={formik.values.configuration.description}
              rows={3}
              className="input-util"
              placeholder=""
            ></textarea>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-2">
          <div className="col-span-2">
            <label htmlFor="action" className="block text-xs font-medium text-gray-700">Action</label>
            <div className="mt-1">
              <input
                id="action"
                name="configuration.action"
                type="text"
                autoComplete="none"
                className="input-util"
                onChange={formik.handleChange}
                value={formik.values.configuration.action || ""}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 my-6">
          <div className="col-span-3 text-sm">Containers</div>
          {formik.values.configuration.manifest.spec.template.spec.containers.map((container: any, index: any) => (
            <div className="col-span-2" key={`${index}`}>
              <label htmlFor={`${index}-name`} className="block text-xs font-medium text-gray-700">Name</label>
              <div key={`${index}-name`}>
                <input
                  type="text"
                  className="input-util"
                  name={`configuration.manifest.spec.template.spec.containers[${index}].name`}
                  value={formik.values.configuration.manifest.spec.template.spec.containers[index].name || ""}
                  onChange={formik.handleChange}
                />
              </div>

              <label htmlFor={`${index}-image`} className="block text-xs font-medium text-gray-700 mt-2">Image</label>
              <div key={`${index}-image`}>
                <input
                  type="text"
                  className="input-util"
                  name={`configuration.manifest.spec.template.spec.containers.${index}.image`}
                  value={formik.values.configuration.manifest.spec.template.spec.containers[index].image || ""}
                  onChange={formik.handleChange}
                />
              </div>

              <label htmlFor={`${index}-pull-policy`} className="block text-xs font-medium text-gray-700 mt-2">Pull policy</label>
              <div key={`${index}-pull-policy`}>
                <input
                  type="text"
                  className="input-util"
                  name={`configuration.manifest.spec.template.spec.containers.${index}.imagePullPolicy`}
                  value={formik.values.configuration.manifest.spec.template.spec.containers[index].imagePullPolicy || ""}
                  onChange={formik.handleChange}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 mt-2">
          <div className="col-span-2">
            <label htmlFor="restartPolicy" className="block text-xs font-medium text-gray-700">Restart policy</label>
            <div className="mt-1">
              <input
                id="restartPolicy"
                name="configuration.manifest.spec.template.spec.restartPolicy"
                type="text"
                autoComplete="none"
                className="input-util"
                onChange={formik.handleChange}
                value={formik.values.configuration.manifest.spec.template.spec.restartPolicy || ""}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-2">
          <div className="col-span-2">
            <label htmlFor="successCondition" className="block text-xs font-medium text-gray-700">Success condition</label>
            <div className="mt-1">
              <input
                id="successCondition"
                name="configuration.successCondition"
                type="text"
                autoComplete="none"
                className="input-util"
                onChange={formik.handleChange}
                value={formik.values.configuration.successCondition || ""}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-2">
          <div className="col-span-2">
            <label htmlFor="failureCondition" className="block text-xs font-medium text-gray-700">Failure condition</label>
            <div className="mt-1">
              <input
                id="failureCondition"
                name="configuration.failureCondition"
                type="text"
                autoComplete="none"
                className="input-util"
                onChange={formik.handleChange}
                value={formik.values.configuration.failureCondition || ""}
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
export default Form;
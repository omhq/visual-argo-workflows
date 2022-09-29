import { styled } from "@mui/material";
import { useFormikContext } from "formik";
import { IEditTemplateForm } from "../../../types";
import TextField from "../../global/FormElements/TextField";

const Root = styled("div")`
  display: flex;
  flex-direction: column;
  row-gap: ${({ theme }) => theme.spacing(1)};
  @media (max-width: 640px) {
    row-gap: 0;
  }
`;

const Resource = () => {
  const formik = useFormikContext<IEditTemplateForm>();

  return (
    <Root>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-3">
          <TextField
            id={"nodeConfig.template.resource.action"}
            name={"nodeConfig.template.resource.action"}
            placeholder={"eg. create, update, or delete"}
            label={"Resource action"}
            required={true}
          />
        </div>

        <div className="col-span-3">
          <label
            htmlFor={`resource-manifest`}
            className="block text-xs font-medium text-gray-700 mt-2"
          >
            Manifest
          </label>
          <textarea
            id="resource-manifest"
            rows={2}
            className="input-util"
            placeholder=""
            name={`nodeConfig.template.resource.manifest`}
            value={formik.values.nodeConfig.template.resource?.manifest}
            onChange={formik.handleChange}
          ></textarea>
        </div>
      </div>
    </Root>
  );
};

export default Resource;

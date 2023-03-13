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

const General = () => {
  const formik = useFormikContext<IEditTemplateForm>();

  return (
    <Root>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-3">
          <TextField
            id={"data.template.name"}
            name={"data.template.name"}
            placeholder={"template name"}
            label={"Name"}
            required={true}
          />
        </div>

        <div className="col-span-3">
          <label
            htmlFor="templateType"
            className="block text-xs font-medium text-gray-700"
          >
            Type
          </label>
          <div className="mt-1">
            <select
              id={"data.type"}
              name={"data.type"}
              className="input-util mb-2 sm:mb-0"
              value={formik.values.data.type}
              onChange={formik.handleChange}
            >
              <option value="">Select type</option>
              <option value="container">Container</option>
              <option value="script">Script</option>
              <option value="resource">Resource</option>
              <option value="suspend">Suspend</option>
            </select>
          </div>
        </div>

        <div className="col-span-3">
          <TextField
            id={"data.when"}
            name={"data.when"}
            placeholder={"when"}
            label={"When"}
            required={false}
          />
        </div>
      </div>
    </Root>
  );
};

export default General;

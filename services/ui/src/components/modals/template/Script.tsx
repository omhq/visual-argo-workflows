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

const Script = () => {
  const formik = useFormikContext<IEditTemplateForm>();

  return (
    <Root>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-3">
          <TextField
            id={"data.template.script.name"}
            name={"data.template.script.name"}
            placeholder={""}
            label={"Name of the container specified as a DNS_LABEL"}
            required={false}
          />
        </div>

        <div className="col-span-3">
          <TextField
            id={"data.template.script.image"}
            name={"data.template.script.image"}
            placeholder={"docker/whalesay"}
            label={"Image"}
            required={true}
          />
        </div>

        <div className="col-span-3">
          <TextField
            id={"data.template.script.command"}
            name={"data.template.script.command"}
            placeholder={"cowsay"}
            label={"Command"}
            required={false}
          />
        </div>

        <div className="col-span-3">
          <TextField
            id={"data.template.script.args"}
            name={"data.template.script.args"}
            placeholder={"hello world"}
            label={"Args"}
            required={false}
          />
        </div>

        <div className="col-span-3">
          <TextField
            id={"data.template.script.imagePullPolicy"}
            name={"data.template.script.imagePullPolicy"}
            placeholder={"Always, Never, IfNotPresent"}
            label={"Image pull policy"}
            required={false}
          />
        </div>

        <div className="col-span-3">
          <label
            htmlFor={`script-source`}
            className="block text-xs font-medium text-gray-700 mt-2"
          >
            Source
          </label>
          <textarea
            id="script-source"
            rows={2}
            className="input-util"
            placeholder=""
            name={`data.template.script.source`}
            value={formik.values.data.template.script?.source}
            onChange={formik.handleChange}
          ></textarea>
        </div>
      </div>
    </Root>
  );
};

export default Script;

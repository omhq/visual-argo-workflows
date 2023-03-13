import { styled } from "@mui/material";
import TextField from "../../global/FormElements/TextField";

const Root = styled("div")`
  display: flex;
  flex-direction: column;
  row-gap: ${({ theme }) => theme.spacing(1)};
  @media (max-width: 640px) {
    row-gap: 0;
  }
`;

const Container = () => {
  return (
    <Root>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-3">
          <TextField
            id={"data.template.container.name"}
            name={"data.template.container.name"}
            placeholder={""}
            label={"Name of the container specified as a DNS_LABEL"}
            required={false}
          />
        </div>

        <div className="col-span-3">
          <TextField
            id={"data.template.container.image"}
            name={"data.template.container.image"}
            placeholder={"docker/whalesay"}
            label={"Image"}
            required={true}
          />
        </div>

        <div className="col-span-3">
          <TextField
            id={"data.template.container.command"}
            name={"data.template.container.command"}
            placeholder={"cowsay"}
            label={"Command"}
            required={false}
          />
        </div>

        <div className="col-span-3">
          <TextField
            id={"data.template.container.args"}
            name={"data.template.container.args"}
            placeholder={"hello world"}
            label={"Args"}
            required={false}
          />
        </div>

        <div className="col-span-3">
          <TextField
            id={"data.template.container.imagePullPolicy"}
            name={"data.template.container.imagePullPolicy"}
            placeholder={"Always, Never, IfNotPresent"}
            label={"Image pull policy"}
            required={false}
          />
        </div>
      </div>
    </Root>
  );
};

export default Container;

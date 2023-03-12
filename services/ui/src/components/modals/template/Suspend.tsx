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

const Suspend = () => {
  return (
    <Root>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-3">
          <TextField
            id={"data.template.suspend.duration"}
            name={"data.template.suspend.duration"}
            placeholder={"20s"}
            label={"Duration"}
            required={true}
          />
        </div>
      </div>
    </Root>
  );
};

export default Suspend;

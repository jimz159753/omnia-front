import { Variant } from "@/components/constants";
import { InputField } from "@/components/ui/InputField";
import { Button, Typography } from "@mui/material";
import { StyledBoxButtonContainer, StyledBoxContainer, StyledBoxInputContainer } from "./Users.styles";

const UserForm = () => {
  return (
    <StyledBoxContainer>
      <Typography variant="h4" gutterBottom>
        User Form
      </Typography>
      <StyledBoxInputContainer>
        <InputField label="Name" fullWidth />
        <InputField label="Cellphone" fullWidth />
        <InputField label="Email" fullWidth />
        <InputField label="Staff" fullWidth />
      </StyledBoxInputContainer>
      <StyledBoxButtonContainer>
        <Button
            variant={Variant.outlined}
            color="secondary"
            sx={{ width: "100%" }}
            onClick={() => alert("Form reset!")}
        >
            Reset
        </Button>
        <Button
            variant={Variant.contained}
            color="primary"
            sx={{ width: "100%" }}
            onClick={() => alert("Form submitted!")}
        >
            Create
        </Button>
      </StyledBoxButtonContainer>
    </StyledBoxContainer>
  );
};

export default UserForm;

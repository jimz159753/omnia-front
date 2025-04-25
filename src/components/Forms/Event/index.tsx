import { paymentMethods, Variant } from "@/constants";
import { InputField } from "@/components/ui/InputField";
import {
  Button,
  MenuItem,
  Typography,
} from "@mui/material";
import {
  StyledBoxButtonContainer,
  StyledBoxInputContainer,
  StyledFormControl,
} from "./Event.styles";


const EventForm = () => {
  return (
    <StyledFormControl>
      <Typography variant="h4" gutterBottom>
        Event Form
      </Typography>
      <StyledBoxInputContainer>
        <InputField label="Name" fullWidth />
        <InputField label="Phone" fullWidth />
        <InputField label="Email" fullWidth />
        <InputField label="Staff" fullWidth />
        <InputField
          label="Payment Method"
          select
          // value={age}
          // onChange={handleChange}
        >
          {paymentMethods.map((method) => (
            <MenuItem key={method.id} value={method.id}>
              {method.name}
            </MenuItem>
          ))}
        </InputField>
        <InputField label="Amount" type="number" fullWidth />
      </StyledBoxInputContainer>
      <StyledBoxButtonContainer>
        <Button
          variant={Variant.outlined}
          sx={{ width: "100%" }}
          onClick={() => alert("Form reset!")}
        >
          Reset
        </Button>
        <Button
          variant={Variant.contained}
          sx={{ width: "100%" }}
          onClick={() => alert("Form submitted!")}
        >
          Create
        </Button>
      </StyledBoxButtonContainer>
    </StyledFormControl>
  )
}

export default EventForm;
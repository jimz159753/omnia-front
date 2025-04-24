import { paymentMethods, Variant } from "@/components/constants";
import { InputField } from "@/components/ui/InputField";
import { Box, Button, MenuItem, Typography } from "@mui/material";
import {
  StyledBoxButtonContainer,
  StyledBoxInputContainer,
  StyledFormControl,
} from "./User.styles";

const UserForm = () => {

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget as HTMLFormElement);
    const values = Object.fromEntries(data.entries());
    console.log("data", values);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <StyledFormControl>
        <Typography variant="h4" gutterBottom>
          User Form
        </Typography>
        <StyledBoxInputContainer>
          <InputField
            name="name"
            label="Name"
            fullWidth
            required
          />
          <InputField
            name="phone"
            label="Phone"
            fullWidth
            required
          />
          <InputField
            name="email"
            label="Email"
            fullWidth
            required
          />
          <InputField
            name="staff"
            label="Staff"
            fullWidth
            required
          />
          <InputField
            label="Payment Method"
            select
            name="paymentMethod"
            required
          >
            {paymentMethods.map((method) => (
              <MenuItem key={method.id} value={method.name}>
                {method.name}
              </MenuItem>
            ))}
          </InputField>
          <InputField
            name="amount"
            label="Amount"
            type="number"
            fullWidth
          />
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
            type="submit"
            sx={{ width: "100%" }}
          >
            Create
          </Button>
        </StyledBoxButtonContainer>
      </StyledFormControl>
    </Box>
  );
};

export default UserForm;

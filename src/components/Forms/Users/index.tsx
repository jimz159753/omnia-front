import { IClientForm, paymentMethods, Variant } from "@/components/constants";
import { InputField } from "@/components/ui/InputField";
import { Box, Button, MenuItem, Typography } from "@mui/material";
import {
  StyledBoxButtonContainer,
  StyledBoxInputContainer,
  StyledFormControl,
} from "./User.styles";

interface UserFormProps {
  handleAddClient: (client: IClientForm) => void;
  form?: IClientForm;
  setForm?: React.Dispatch<React.SetStateAction<IClientForm>>;
}

const UserForm = ({ handleAddClient, form, setForm }: UserFormProps) => {
  const { name, phone, email, staff, paymentMethod, amount } = form || {};

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget as HTMLFormElement);
    const values = Object.fromEntries(data.entries());
    handleAddClient(values as unknown as IClientForm);
    const clearValues = {
      name: "",
      phone: "",
      email: "",
      staff: "",
      paymentMethod: "",
      amount: 0,
    };
    if (setForm) {
      setForm(clearValues as unknown as IClientForm);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (setForm) {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <StyledFormControl>
        <Typography variant="h4" gutterBottom>
          User Form
        </Typography>
        <StyledBoxInputContainer>
          <InputField
            value={name}
            onChange={handleChange}
            name="name"
            label="Name"
            fullWidth
            required
          />
          <InputField
            value={phone}
            onChange={handleChange}
            name="phone"
            label="Phone"
            fullWidth
            required
          />
          <InputField
            value={email}
            onChange={handleChange}
            name="email"
            label="Email"
            fullWidth
            required
          />
          <InputField
            value={staff}
            onChange={handleChange}
            name="staff"
            label="Staff"
            fullWidth
            required
          />
          <InputField
            value={paymentMethod}
            onChange={handleChange}
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
            value={amount}
            onChange={handleChange}
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

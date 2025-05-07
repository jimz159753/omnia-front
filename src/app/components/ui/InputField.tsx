import { TextField } from "@mui/material";
import React from "react";
import { Variant } from "../../constants";

interface InputFieldProps {
  label: string;
  fullWidth?: boolean;
  defaultValue?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  variant?: Variant;
  id?: string;
  required?: boolean;
  sx?: object;
  children?: React.ReactNode;
  select?: boolean;
  name?: string;
  value?: string | number;
}

export const InputField = ({
  label,
  fullWidth = false,
  defaultValue,
  onChange,
  placeholder,
  type,
  id,
  required = false,
  sx,
  children,
  select = false,
  name,
  value,
}: InputFieldProps) => {
  return (
    <TextField
      value={value}
      name={name}
      id={id}
      type={type}
      label={label}
      defaultValue={defaultValue}
      placeholder={placeholder}
      onChange={onChange}
      fullWidth={fullWidth}
      required={required}
      sx={sx}
      select={select}
    >
      {children}
    </TextField>
  );
};

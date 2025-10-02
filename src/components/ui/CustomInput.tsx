import React from "react";

interface CustomInputProps {
  label: string;
  type?: string;
  name?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
  helperText?: string;
}

export const CustomInput: React.FC<CustomInputProps> = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder,
  id,
  helperText,
}) => {
  return (
    <div className="custom-input-container">
      <label htmlFor={id || name} className="custom-input-label">
        {label}
        {required && <span className="required-asterisk">*</span>}
      </label>
      <input
        id={id || name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        className="custom-input"
      />
      {helperText && (
        <span className="custom-input-helper-text">{helperText}</span>
      )}
    </div>
  );
};

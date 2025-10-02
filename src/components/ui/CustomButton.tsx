import React from "react";

interface CustomButtonProps {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  children,
  type = "button",
  disabled = false,
  onClick,
  className = "",
  style,
}) => {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`custom-button ${className}`}
      style={style}
    >
      {children}
    </button>
  );
};

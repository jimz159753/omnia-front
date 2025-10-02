import React from "react";

interface CustomTypographyProps {
  children: React.ReactNode;
  variant?:
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "body1"
    | "body2"
    | "caption";
  className?: string;
  style?: React.CSSProperties;
  sx?: React.CSSProperties;
}

export const CustomTypography: React.FC<CustomTypographyProps> = ({
  children,
  variant = "body1",
  className = "",
  style,
  sx,
}) => {
  const combinedStyle = { ...style, ...sx };
  const combinedClassName =
    `custom-typography custom-typography-${variant} ${className}`.trim();

  return (
    <span className={combinedClassName} style={combinedStyle}>
      {children}
    </span>
  );
};

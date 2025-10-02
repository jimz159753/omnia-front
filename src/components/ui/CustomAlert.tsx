import React from "react";

interface CustomAlertProps {
  children: React.ReactNode;
  severity?: "error" | "warning" | "info" | "success";
  className?: string;
  style?: React.CSSProperties;
}

export const CustomAlert: React.FC<CustomAlertProps> = ({
  children,
  severity = "info",
  className = "",
  style,
}) => {
  return (
    <div
      className={`custom-alert custom-alert-${severity} ${className}`}
      style={style}
      role="alert"
    >
      {children}
    </div>
  );
};

import React from "react";

interface CustomLoadingSpinnerProps {
  size?: number;
  color?: string;
  className?: string;
}

export const CustomLoadingSpinner: React.FC<CustomLoadingSpinnerProps> = ({
  size = 40,
  color = "#1976d2",
  className = "",
}) => {
  return (
    <div
      className={`custom-loading-spinner ${className}`}
      style={{ width: size, height: size }}
    >
      <div
        className="spinner-ring"
        style={{
          width: size,
          height: size,
          borderColor: `${color} transparent transparent transparent`,
        }}
      />
    </div>
  );
};

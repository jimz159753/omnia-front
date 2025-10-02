import React from "react";

interface CustomGridProps {
  children: React.ReactNode;
  container?: boolean;
  item?: boolean;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const CustomGrid: React.FC<CustomGridProps> = ({
  children,
  container = false,
  item = false,
  size,
  className = "",
  style,
}) => {
  const baseClass = "custom-grid";
  const containerClass = container ? "custom-grid-container" : "";
  const itemClass = item ? "custom-grid-item" : "";
  const sizeClass = size ? `custom-grid-size-${size}` : "";

  const combinedClassName = [
    baseClass,
    containerClass,
    itemClass,
    sizeClass,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={combinedClassName} style={style}>
      {children}
    </div>
  );
};

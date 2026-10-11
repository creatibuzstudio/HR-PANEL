import React from "react";

const IconButton = ({
  className,
  icon: Icon,
  type = "button",
  onClick,
  ...props
}) => {
  if (type === "button")
    return (
      <button
        className={`h-10 w-10 rounded-full center bg-bg50 dark:hover:bg-white/10 hover:bg-gray-100 tr ${className}`}
        onClick={onClick}
        {...props}
      >
        <Icon className="h-4" />
      </button>
    );
  else
    return (
      <div
        className={`h-10 w-10 rounded-full center bg-bg50 dark:hover:bg-white/10 hover:bg-gray-100 tr ${className}`}
      >
        <Icon className="h-4" />
      </div>
    );
};

export default IconButton;

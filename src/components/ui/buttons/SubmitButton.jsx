import React from "react";
import AtomLoader from "../loader/AtomLoader";

const SubmitButton = ({
  type = "submit",
  children,
  isLoading,
  disabled,
  className,
  ...props
}) => {
  const isDisabled = disabled || isLoading;
  return (
    <button
      {...props}
      type={type}
      disabled={isDisabled}
      className={`bg-black py-3 rounded-[6px] text-white font-medium ${className} ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {isLoading && <AtomLoader />}
      {children}
    </button>
  );
};

export default SubmitButton;

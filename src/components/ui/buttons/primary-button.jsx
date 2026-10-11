import React from "react";

import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const PrimaryButton = ({
  children,
  className,
  variant = "default",
  size = "default",
  onPrimary = false,
  isLoading = false,
  disabled = false,
  ...props
}) => {
  return (
    <button
      className={cn(
        buttonVariants({
          variant,
          size,
          onPrimary,
          className,
        }),
        disabled && "opacity-50 cursor-not-allowed", // Add this line
      )}
      {...props}
      disabled={isLoading || disabled}
    >
      {isLoading ? "Loading..." : children}
    </button>
  );
};

export default PrimaryButton;

const buttonVariants = cva("border font-medium rounded-full select-none tr", {
  variants: {
    variant: {
      default:
        "border-secondary text-white dark:text-black dark:hover:text-white bg-secondary hover:bg-primary hover:border-primary",
      secondary:
        "border-secondary text-secondary bg-transparent hover:bg-primary hover:border-primary hover:text-white",
      primary:
        "border-primary text-white bg-primary hover:bg-red-600 hover:border-red-600",
      accent:
        "bg-white text-primary hover:bg-primary hover:border-primary dark:border-none hover:text-white dark:hover:text-primary",
      rubix: "bg-red-500/20 text-primary hover:bg-primary hover:text-white",
      outline:
        "border-primary text-primary bg-transparent hover:bg-red-500/10 tr",
    },
    size: {
      default: "py-3 px-4",
      xs: "py-2 px-3 text-xs",
      sm: "py-2.5 px-5 text-sm",
    },
    onPrimary: {
      true: "hover:bg-secondary",
      false: "",
    },
  },

  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

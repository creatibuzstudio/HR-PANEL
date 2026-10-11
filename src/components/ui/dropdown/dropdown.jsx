import { svgArrowDown, svgArrowDownWhite } from "@/assets/icons/svgIcons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import React from "react";

const sizeClasses = {
  sm: "text-sm py-2 pl-3 pr-2 rounded-sm",
  md: "text-sm py-3 pl-4 pr-2.5 rounded-[6px]",
  lg: "text-base py-4 pl-5 pr-3 rounded-md",
};

const Dropdown = ({
  name = "options",
  options = [],
  value, // string, like 'CTO'
  onChange,
  setSelectedOption,
  primary = false,
  className = "",
  LabelName,
  required = false,
  placeholder = "Select an option",
  error,
  size = "md",
  disabled = false, // ✅ new prop
}) => {
  // Find the selected label from the options list using the value
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="flex flex-col gap-1">
      {LabelName && (
        <label className="text-black dark:text-white text-sm pb-1">
          {LabelName} {required && <span className="text-black">*</span>}
        </label>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger
          className="outline-none w-full"
          onClick={(e) => e.stopPropagation()}
          disabled={disabled}
        >
          <div
            className={`${sizeClasses[size]} border flex justify-between items-center w-full
              ${
                primary
                  ? "border-white/75 text-white"
                  : "border-black/15 dark:border-white/20 text-black dark:text-white/75"
              }
              ${value ? "" : "text-gray-400 dark:text-gray-500"}
              ${className}
              ${error ? "border-red-500" : ""}
            `}
          >
            <span className="truncate text-gray-400">
              {selectedOption?.label || placeholder}
            </span>
            <span className="hidden dark:block ml-2">{svgArrowDownWhite}</span>
            <span className="dark:hidden ml-2">
              {primary ? svgArrowDownWhite : svgArrowDown}
            </span>
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-60 overflow-y-auto scroll-horizon">
          {options.length === 0 && (
            <DropdownMenuItem disabled className="text-gray-500">
              No options available
            </DropdownMenuItem>
          )}
          {options?.map((option, index) => (
            <DropdownMenuItem
              className={option?.icon && "gap-1.5"}
              key={index}
              onSelect={() => {
                onChange?.(option.value);
                setSelectedOption?.(option);
              }}
            >
              <span className="scale-[0.85]">{option?.icon}</span>
              {option?.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default Dropdown;

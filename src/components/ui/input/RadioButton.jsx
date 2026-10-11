import React from "react";

const RadioButton = ({
  name, // Name for the radio group (all radios in a group must have the same name)
  id, // Unique ID for this specific radio input
  label, // Text label for this radio option
  value, // The value of this specific radio input
  selectedValue, // The value of the currently selected radio in the group (from parent state)
  onChange, // Function to call when this radio is selected
  disabled = false,
  ...props
}) => {
  const isChecked = selectedValue === value;

  return (
    <div className="flex items-center w-fit relative">
      <input
        type="radio"
        name={name}
        id={id}
        value={value}
        checked={isChecked}
        onChange={() => onChange(value)} // Call onChange with this radio's value
        disabled={disabled}
        className={`
          peer cursor-pointer h-[18px]   w-[18px] rounded-full border
          appearance-none inline-block relative flex-shrink-0
          ${
            disabled
              ? "dark:border-white/20 border-black/40 bg-gray-100 dark:bg-gray-700"
              : "border-primary bg-white dark:bg-gray-800"
          }
          // Custom checkmark (inner circle) styling
          checked:bg-primary   checked:border-primary 
          after:content-[''] after:block after:w-[10px] after:h-[10px] after:rounded-full
          after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2
          after:bg-white after:opacity-0 peer-checked:after:opacity-100 after:transition-opacity after:duration-200
        `}
        {...props}
      />
      <label
        htmlFor={id}
        className={`ml-3 text-sm text-nowrap  cursor-pointer select-none
          ${disabled ? "text-gray-500 dark:text-gray-400" : "text-black dark:text-white/75"}
        `}
      >
        {label}
      </label>
      {/* No SVG checkmark needed for radio buttons, as the 'after' pseudo-element creates the dot */}
    </div>
  );
};

export default RadioButton;

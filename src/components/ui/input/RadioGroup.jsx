import React from "react";
import RadioButton from "./RadioButton";

const RadioGroup = ({
  label,
  name,
  options,
  selectedValue,
  onChange,
  direction = "row",
  error, // ✅ Add error prop
  ...props
}) => {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <p className="text-black dark:text-white text-sm mb-2">{label}</p>
      )}
      <div
        className={`flex ${direction === "row" ? "flex-row gap-6" : "flex-col gap-3"}`}
      >
        {options.map((option, index) => (
          <RadioButton
            key={option.value || index}
            name={name}
            id={`${name}-${option.value}`}
            label={option.label}
            value={option.value}
            selectedValue={selectedValue}
            onChange={onChange}
            {...props}
          />
        ))}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default RadioGroup;

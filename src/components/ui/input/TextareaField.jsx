import React from "react";

const TextareaField = ({
  placeholder,
  label,
  className,
  register,
  name,
  defaultValue,
  disabled = false,
  error,
  required,
  rows = 3,
}) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="text-black font-[500px] dark:text-white/50 text-[14px] ml-1">
          {label} {required && <span className="text-black">*</span>}
        </label>
      )}
      <textarea
        defaultValue={defaultValue}
        disabled={disabled}
        rows={rows}
        placeholder={placeholder}
        {...register(name)}
        className={`border-[1px] border-[#E4E4E7] dark:border-white/10 py-2.5 px-4 rounded-[6px] bg-white w-full outline-none focus:border-green-300/50 dark:focus:border-primary dark:text-white/90 resize-vertical min-h-[80px] ${
          disabled && "bg-gray-400"
        } ${error ? "border-red-500" : ""}`}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default TextareaField;

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const TextField = ({
  type = "text",
  placeholder,
  label,
  className,
  register,
  name,
  defaultValue,
  disabled = false,
  icon,
  error, // <--- ADDED PROP: This prop will receive the error message
  required,
  validation,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className={`flex flex-col gap-1 sm:gap-2 ${className}`}>
      {label && (
        <label className="text-black font-[500px] dark:text-white/50 text-xs sm:text-sm ml-1">
          {label} {required && <span className="text-black">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          defaultValue={defaultValue}
          disabled={disabled === true}
          type={isPassword ? (showPassword ? "text" : "password") : type}
          placeholder={placeholder}
          {...register(name, validation)}
          className={`border-[1px] border-[#E4E4E7] dark:border-white/10 py-2 sm:py-2.5 pr-8 sm:pr-10 bg-white w-full outline-none focus:border-green-300/50 text-sm sm:text-base rounded-md ${
            disabled === true && "bg-gray-400"
          } dark:focus:border-primary dark:text-white/90 ${
            icon ? "pl-10 sm:pl-11" : "pl-3 sm:pl-4"
          } password-input ${error ? "border-red-500" : ""}`}
          {...props}
        />
        {icon && (
          <span className="absolute top-1/2 -translate-y-1/2 left-3 sm:left-4">
            {icon}
          </span>
        )}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-1/2 right-2 sm:right-3 -translate-y-1/2 text-black/50 dark:text-white/50"
          >
            {showPassword ? (
              <EyeOff size={18} className="sm:w-5 sm:h-5" />
            ) : (
              <Eye size={18} className="sm:w-5 sm:h-5" />
            )}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs sm:text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default TextField;

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import moment from "moment";
import { Controller } from "react-hook-form";

const PrimaryField = ({
  placeholder,
  name,
  control,
  register,
  label,
  className,
  error,
  type,
  ...props
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-1 sm:gap-2">
      {label && (
        <label className="text-black font-[500px] dark:text-white/50 text-xs sm:text-sm ml-1">
          {label}
        </label>
      )}

      {type === "date" ? (
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal py-3 sm:py-[22px] text-sm sm:text-base rounded-md ${
                    !field.value ? "text-muted-foreground" : ""
                  } ${error ? "border-red-500" : "border-gray-300"} ${className}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  {field.value
                    ? moment(field.value).format("DD-MM-YYYY")
                    : placeholder || "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  captionLayout="dropdown"
                  selected={field.value ? new Date(field.value) : null}
                  onSelect={(selectedDate) => {
                    field.onChange(
                      selectedDate ? moment(selectedDate).toDate() : null,
                    );
                    setOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          )}
        />
      ) : (
        <input
          placeholder={placeholder}
          name={name}
          type={type}
          className={`py-2 sm:py-2.5 px-3 sm:px-4 text-gray-500 mt-1 sm:mt-2 bg-white/30 w-full outline-none border text-sm sm:text-base rounded-md ${
            error ? "border-red-500" : "border-gray-300"
          } ${className}`}
          {...register(name)}
          {...props}
        />
      )}

      {error && (
        <p className="text-red-500 text-xs sm:text-sm mt-1 ml-1">{error}</p>
      )}
    </div>
  );
};

export default PrimaryField;

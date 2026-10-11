import { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, X } from "lucide-react";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command.jsx";

export default function MultiSelectDropdown({
  options = [],
  value = [],
  onChange,
  LabelName,
  placeholder = "Select options",
  size = "md",
  error,
}) {
  const [open, setOpen] = useState(false);

  const toggleOption = (optionValue) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const removeOption = (optionValue) => {
    onChange(value.filter((v) => v !== optionValue));
  };

  const removeAll = () => {
    onChange([]);
  };

  const selectedOptions = options.filter((opt) => value.includes(opt.value));

  const sizeClasses = {
    sm: "text-sm py-2 px-3",
    md: "text-sm py-3 px-4",
    lg: "text-base py-4 px-5",
  };

  const chipsSizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-0.5",
    lg: "text-base px-4 py-0.5",
  };

  return (
    <div className="flex flex-col gap-1 h-fit">
      {LabelName && (
        <Label className="text-black dark:text-white">{LabelName}</Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`justify-start flex-wrap gap-1 h-fit w-full ${sizeClasses[size]} ${
              error ? "border-red-500" : ""
            }`}
          >
            <div className="flex flex-wrap gap-1 items-center max-w-full">
              {selectedOptions.length === 0 && (
                <span className="text-gray-400">{placeholder}</span>
              )}
              {selectedOptions.map((opt) => (
                <span
                  key={opt.value}
                  className={`bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded flex items-center gap-1 ${chipsSizeClasses[size]}`}
                >
                  {opt.label}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeOption(opt.value);
                    }}
                  />
                </span>
              ))}
              {selectedOptions.length > 2 && (
                <X
                  className="w-4 h-4 cursor-pointer text-red-500 ml-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeAll();
                  }}
                  title="Remove All"
                />
              )}
            </div>
            <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput
              className="focus:outline-0 focus:outline-none focus:ring-0 focus:ring-offset-0"
              placeholder="Search..."
            />
            <CommandList>
              <CommandEmpty>No options found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const isSelected = value.includes(option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      onSelect={() => toggleOption(option.value)}
                      className="flex items-center justify-between"
                    >
                      <span>{option.label}</span>
                      {isSelected && <Check className="w-4 h-4" />}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

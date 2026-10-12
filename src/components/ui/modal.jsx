import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import PrimaryButton from "@/components/ui/buttons/primary-button";
import IconButton from "@/components/ui/buttons/icon-button";
import { X } from "lucide-react";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "default",
  showCloseButton = true,
  className = "",
  contentClassName = "",
  maxHeight = "max-h-[85vh]",
  ...props
}) => {
  const sizeClasses = {
    sm: "max-w-md",
    default: "max-w-xl",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-[90vw]",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className={`${sizeClasses[size]} ${maxHeight} flex flex-col ${className} bg-white dark:bg-[#1e1d1f] p-6 overflow-hidden`}
        {...props}
      >
        {title && (
          <DialogHeader className="flex-shrink-0 pb-3 border-b dark:border-gray-800">
            <DialogTitle className="text-left text-lg font-semibold">{title}</DialogTitle>
          </DialogHeader>
        )}

        <div className={`flex-1 overflow-y-auto py-3 px-1 pr-2 ${contentClassName}`}>
          {children}
        </div>

        {footer && (
          <DialogFooter className="flex-shrink-0 pt-3 border-t dark:border-gray-800">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default Modal;

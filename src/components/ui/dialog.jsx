import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef(
  ({ className, children, onInteractOutside, ...props }, ref) => {
    // Check if TinyMCE dialog is open
    const isTinyMCEDialogOpen = () => {
      const dialogWrap = document.querySelector(".tox-dialog-wrap");
      if (dialogWrap) {
        const style = window.getComputedStyle(dialogWrap);
        if (
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          style.opacity !== "0"
        ) {
          return true;
        }
      }

      const menus = document.querySelectorAll(".tox-menu, .tox-collection");
      for (let menu of menus) {
        const style = window.getComputedStyle(menu);
        if (
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          style.opacity !== "0"
        ) {
          return true;
        }
      }

      return false;
    };

    const handleInteractOutside = (event) => {
      // Check if TinyMCE dialog is open
      if (isTinyMCEDialogOpen()) {
        // Check if the click/interaction is inside TinyMCE dialog
        const target = event.target;
        const isInsideTinyMCE = (element) => {
          if (!element) return false;
          let el = element;
          while (el && el !== document.body) {
            if (
              el.classList?.contains("tox-dialog") ||
              el.classList?.contains("tox-dialog-wrap") ||
              el.classList?.contains("tox-menu") ||
              el.classList?.contains("tox-collection") ||
              el.classList?.contains("tox-pop") ||
              el.classList?.contains("tox-dialog__body") ||
              el.classList?.contains("tox-dialog__footer") ||
              el.classList?.contains("tox-dialog__header")
            ) {
              return true;
            }
            el = el.parentElement;
          }
          return false;
        };

        // If click is inside TinyMCE dialog, don't prevent default
        // Let TinyMCE handle its own events
        if (isInsideTinyMCE(target)) {
          // Click is inside TinyMCE dialog, allow TinyMCE to handle it
          // Don't prevent default - let TinyMCE dialog work normally
          return;
        }

        // Click is outside TinyMCE dialog but TinyMCE dialog is open
        // Prevent closing the main modal
        event.preventDefault();
        return;
      }

      // Call custom handler if provided
      if (onInteractOutside) {
        onInteractOutside(event);
      }
    };

    return (
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          ref={ref}
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background dark:bg-[#1e1d1f] p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-xl",
            className,
          )}
          onInteractOutside={handleInteractOutside}
          {...props}
        >
          {children}
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-md opacity-70 transition-opacity hover:opacity-100  disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground dark:text-white">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPortal>
    );
  },
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className,
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className,
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-black dark:text-white text-lg text-center -mb-2",
      className,
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogPrimitive,
};

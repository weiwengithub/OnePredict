"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface SheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

const Sheet: React.FC<SheetProps> = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange?.(false)}
      />
      {children}
    </div>
  );
};

const SheetTrigger = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement> & { asChild?: boolean }
>(({ className, children, asChild, ...props }, ref) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      ref,
      className: cn(children.props.className, className),
    } as React.HTMLAttributes<HTMLElement>);
  }

  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      className={cn(className)}
      {...props}
    >
      {children}
    </button>
  );
});
SheetTrigger.displayName = "SheetTrigger";

const SheetContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    side?: "top" | "right" | "bottom" | "left";
  }
>(({ side = "right", className, children, ...props }, ref) => {
  const sideClasses = {
    top: "top-0 left-0 right-0 translate-y-0",
    right: "top-0 right-0 bottom-0 translate-x-0",
    bottom: "bottom-0 left-0 right-0 translate-y-0",
    left: "top-0 left-0 bottom-0 translate-x-0",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "fixed z-50 bg-white shadow-lg transition-transform duration-300",
        sideClasses[side],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
SheetContent.displayName = "SheetContent";

const SheetHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}
    {...props}
  />
));
SheetHeader.displayName = "SheetHeader";

const SheetTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
));
SheetTitle.displayName = "SheetTitle";

export { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle };

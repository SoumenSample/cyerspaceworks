import React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md border border-cyan-500/30 bg-black/60 px-3 py-2 text-sm text-cyan-100 placeholder:text-cyan-100/40 focus:border-cyan-400 focus:outline-none",
        className
      )}
      {...props}
    />
  );
});

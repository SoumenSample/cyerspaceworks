import React from "react";
import { cn } from "@/lib/utils";

export function Button({ className, variant = "default", type = "button", ...props }) {
  const variants = {
    default:
      "bg-cyan-400 text-black hover:bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.28)]",
    outline:
      "border border-cyan-500/50 bg-transparent text-cyan-100 hover:bg-cyan-500/10",
    ghost: "bg-transparent text-cyan-100 hover:bg-cyan-500/10",
    destructive: "bg-red-500 text-white hover:bg-red-600",
  };

  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

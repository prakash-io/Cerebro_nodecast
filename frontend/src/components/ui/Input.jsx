import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

export const Input = forwardRef(({ className, type, neon = 'red', ...props }, ref) => {
  const neonClasses = {
    red: "focus-visible:border-[#ff0033] focus-visible:shadow-[0_0_15px_rgba(255,0,51,0.5)]",
    blue: "focus-visible:border-[#00ffcc] focus-visible:shadow-[0_0_15px_rgba(0,255,204,0.5)]",
    green: "focus-visible:border-[#00ff00] focus-visible:shadow-[0_0_15px_rgba(0,255,0,0.5)]"
  };

  return (
    <input
      type={type}
      className={cn(
        "flex h-12 w-full border-2 border-white/20 bg-black/50 px-4 py-2 text-sm font-vt323 tracking-wider text-white shadow-sm transition-all duration-300",
        "placeholder:text-white/40",
        "focus-visible:outline-none focus-visible:ring-0 focus-visible:bg-black/80",
        "disabled:cursor-not-allowed disabled:opacity-50",
        neonClasses[neon],
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = "Input";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import Magnetic from '../../animations/Magnetic';

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className, 
  magnetic = true,
  ...props 
}) {
  const baseStyles = "relative inline-flex min-w-[220px] items-center justify-center rounded-md font-orbitron uppercase tracking-[0.18em] transition-[transform,box-shadow,color,background-color,border-color] duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-50 group overflow-hidden";
  
  const variants = {
    primary: "border border-[#ff0033] bg-black/70 text-[#ff0033] hover:-translate-y-[1px] hover:bg-[#ff0033] hover:text-black shadow-[0_0_10px_rgba(255,0,51,0.28)] hover:shadow-[0_0_18px_rgba(255,0,51,0.45)]",
    secondary: "border border-[#00ff66] bg-black/70 text-[#00ff66] hover:-translate-y-[1px] hover:bg-[#00ff66] hover:text-black shadow-[0_0_10px_rgba(0,255,102,0.22)] hover:shadow-[0_0_18px_rgba(0,255,102,0.4)]",
    ghost: "border border-white/12 bg-black/35 text-white/76 hover:-translate-y-[1px] hover:border-white/28 hover:bg-white/8 hover:text-white"
  };

  const sizes = {
    sm: "h-11 px-5 text-[11px]",
    md: "h-12 px-6 text-[12px]",
    lg: "h-14 px-8 text-[13px]"
  };

  const ButtonContent = (
    <motion.button 
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2 whitespace-nowrap text-center leading-none">{children}</span>
      {/* Glitch hover effect overlay */}
      <div className="absolute inset-0 bg-current opacity-0 group-hover:opacity-20 transition-opacity mix-blend-screen" />
    </motion.button>
  );

  if (magnetic) {
    return (
      <Magnetic elasticity={0.2}>
        {ButtonContent}
      </Magnetic>
    );
  }

  return ButtonContent;
}

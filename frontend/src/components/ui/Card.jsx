import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export function Card({ className, children, glow = "red", hoverGlow = false, ...props }) {
  const glowColors = {
    red: "border-[#ff0033]/30 shadow-[0_0_15px_rgba(255,0,51,0.15)]",
    blue: "border-[#00ffcc]/30 shadow-[0_0_15px_rgba(0,255,204,0.15)]",
    green: "border-[#00ff00]/30 shadow-[0_0_15px_rgba(0,255,0,0.15)]",
    none: "border-white/10"
  };

  const hoverColors = {
    red: "hover:border-[#ff0033] hover:shadow-[0_0_30px_rgba(255,0,51,0.4)]",
    blue: "hover:border-[#00ffcc] hover:shadow-[0_0_30px_rgba(0,255,204,0.4)]",
    green: "hover:border-[#00ff00] hover:shadow-[0_0_30px_rgba(0,255,0,0.4)]",
    none: ""
  };

  return (
    <motion.div
      className={cn(
        "relative bg-black/80 backdrop-blur-md border border-t-[3px] p-6 transition-all duration-300 overflow-hidden",
        glowColors[glow],
        hoverGlow ? hoverColors[glow] : "",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      {...props}
    >
      {/* Decorative corners */}
      <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l ${glowColors[glow].split(' ')[0]}`}></div>
      <div className={`absolute top-0 right-0 w-2 h-2 border-t border-r ${glowColors[glow].split(' ')[0]}`}></div>
      <div className={`absolute bottom-0 left-0 w-2 h-2 border-b border-l ${glowColors[glow].split(' ')[0]}`}></div>
      <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r ${glowColors[glow].split(' ')[0]}`}></div>
      
      {/* Optional subtle scanline over the card */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100%_4px] opacity-20" />
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={cn("flex flex-col space-y-1.5 mb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3 className={cn("font-press-start text-lg leading-none tracking-tight text-[#ff0033]", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }) {
  return (
    <p className={cn("text-sm text-white/60 font-orbitron", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={cn("font-vt323 text-lg leading-relaxed text-white/90", className)} {...props}>
      {children}
    </div>
  );
}

import React from 'react';
import { motion } from 'framer-motion';

export default function AnalogGauge({ value, min = 0, max = 100, label = "GAUGE", unit = "%", color = "#ff0033" }) {
  // Calculate rotation angle (e.g. from -90 to +90 degrees)
  const clampedValue = Math.min(Math.max(value, min), max);
  const percentage = (clampedValue - min) / (max - min);
  const angle = -90 + (percentage * 180);

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-black/80 border-2 border-current shadow-[0_0_15px_rgba(255,0,51,0.3)] w-48 h-48 rounded-full relative" style={{ color }}>
      
      {/* Gauge Background Scale */}
      <div className="absolute inset-2 rounded-full border border-dashed border-current opacity-30 pointer-events-none"></div>
      
      {/* Needle */}
      <div className="absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2 pointer-events-none origin-center">
        <motion.div 
          className="absolute bottom-1/2 left-1/2 w-1 h-16 origin-bottom -translate-x-1/2 rounded-full shadow-[0_0_8px_currentcolor]"
          style={{ backgroundColor: color }}
          initial={{ rotate: -90 }}
          animate={{ rotate: angle }}
          transition={{ type: "spring", stiffness: 60, damping: 15 }}
        />
        {/* Needle Base */}
        <div className="absolute top-1/2 left-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black border-2" style={{ borderColor: color }}></div>
      </div>

      {/* Label & Value */}
      <div className="absolute bottom-6 flex flex-col items-center pointer-events-none">
        <span className="font-vt323 text-3xl font-bold tracking-widest">{Math.round(value)}{unit}</span>
        <span className="font-press-start text-[10px] mt-1 opacity-80">{label}</span>
      </div>
    </div>
  );
}

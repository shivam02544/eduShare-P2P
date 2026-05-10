"use client";
import React from "react";
import { GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Standardized EduShare Logo component
 * @param {Object} props
 * @param {string} [props.className] - Container className
 * @param {boolean} [props.showText=true] - Whether to show the "EduShare" text
 * @param {boolean} [props.showSubtext=false] - Whether to show the "Peer Learning" subtext
 * @param {'sm' | 'md' | 'lg' | 'xl'} [props.size='md'] - Size of the logo
 * @param {boolean} [props.animated=true] - Whether to include hover animation
 */
export default function Logo({ 
  className = "", 
  showText = true, 
  showSubtext = false, 
  size = "md",
  animated = true 
}) {
  const sizes = {
    sm: { icon: "w-4 h-4", box: "w-7 h-7", text: "text-base", subtext: "text-[8px]" },
    md: { icon: "w-5 h-5", box: "w-10 h-10", text: "text-lg", subtext: "text-[10px]" },
    lg: { icon: "w-6 h-6", box: "w-12 h-12", text: "text-xl", subtext: "text-[11px]" },
    xl: { icon: "w-7 h-7", box: "w-14 h-14", text: "text-2xl", subtext: "text-[12px]" }
  };

  const currentSize = sizes[size] || sizes.md;

  const springConfig = { mass: 1, tension: 120, friction: 20 };

  const LogoIcon = (
    <motion.div 
      whileHover={animated ? { scale: 1.05 } : {}}
      transition={springConfig}
      className={`${currentSize.box} rounded-xl flex items-center justify-center shadow-lg bg-accent text-white shrink-0`}
      aria-hidden="true"
    >
      <GraduationCap className={currentSize.icon} />
    </motion.div>
  );

  if (!showText) return LogoIcon;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {LogoIcon}
      <div className="flex flex-col">
        <span className={`font-bold ${currentSize.text} tracking-tight text-text-1 leading-none`}>
          EduShare
        </span>
        {showSubtext && (
          <span className={`font-semibold text-accent uppercase tracking-wider mt-1 ${currentSize.subtext}`}>
            Peer Learning
          </span>
        )}
      </div>
    </div>
  );
}

"use client";

import { useRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { microInteractions } from "@/lib/animations";
import { useAppStore } from "@/store/useAppStore";
import gsap from "gsap";

interface GlassButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  pill?: boolean;
}

export function GlassButton({ 
  className, 
  variant = "secondary", 
  pill = true, 
  children, 
  onMouseEnter,
  ...props 
}: GlassButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const reducedMotion = useAppStore((state) => state.reducedMotion);

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!reducedMotion && btnRef.current) {
      // Light sweep animation
      const isLight = document.documentElement.classList.contains('light-mode');
      const sweep = document.createElement("div");
      sweep.className = "absolute inset-0 z-0 pointer-events-none opacity-50";
      sweep.style.background = isLight 
        ? "linear-gradient(120deg, transparent, rgba(0,0,0,0.15), transparent)"
        : "linear-gradient(120deg, transparent, rgba(255,255,255,0.4), transparent)";
      sweep.style.width = "200%";
      sweep.style.transform = "translateX(-100%) skewX(-15deg)";
      
      btnRef.current.appendChild(sweep);
      
      gsap.to(sweep, {
        x: "100%",
        duration: 0.6,
        ease: "power2.out",
        onComplete: () => {
          if (btnRef.current?.contains(sweep)) {
            btnRef.current.removeChild(sweep);
          }
        }
      });
    }
    
    onMouseEnter?.(e);
  };

  const variantStyles = {
    primary: "bg-gradient-accent text-white border-transparent",
    secondary: "glass-panel text-[var(--text-primary)] hover:bg-[var(--glass-hover)]",
    danger: "bg-[rgba(239,68,68,0.1)] text-red-400 border-[rgba(239,68,68,0.2)] hover:bg-[rgba(239,68,68,0.2)]",
    ghost: "bg-transparent border-transparent hover:bg-[var(--glass-hover)]",
  };

  return (
    <motion.button
      ref={btnRef}
      className={cn(
        "relative flex items-center justify-center font-medium overflow-hidden transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-white/20",
        pill ? "rounded-full px-6 py-2.5" : "rounded-xl px-4 py-2",
        variantStyles[variant],
        className
      )}
      whileHover={!reducedMotion ? microInteractions.hover : undefined}
      whileTap={!reducedMotion ? microInteractions.tap : undefined}
      onMouseEnter={handleMouseEnter}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">{children as React.ReactNode}</span>
    </motion.button>
  );
}

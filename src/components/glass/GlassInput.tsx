"use client";

import { useState, useRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "ref"> {
  label: string;
  icon?: React.ReactNode;
}

export function GlassInput({ className, label, icon, value, onChange, ...props }: GlassInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const hasValue = value !== undefined ? String(value).length > 0 : (inputRef.current?.value.length || 0) > 0;

  return (
    <div className={cn("relative w-full", className)}>
      <motion.div
        className={cn(
          "glass-panel flex items-center px-4 h-[56px] transition-all duration-300",
          isFocused ? "border-[rgba(255,255,255,0.4)] shadow-[0_0_15px_rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.08)]" : ""
        )}
      >
        {icon && (
          <span className={cn("mr-3 transition-colors duration-300", isFocused ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]")}>
            {icon}
          </span>
        )}
        <div className="relative flex-1 h-full flex flex-col justify-center">
          <motion.label
            initial={false}
            animate={{
              y: isFocused || hasValue ? -10 : 0,
              scale: isFocused || hasValue ? 0.75 : 1,
              color: isFocused ? "var(--text-primary)" : "var(--text-muted)"
            }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute left-0 origin-top-left pointer-events-none"
          >
            {label}
          </motion.label>
          <input
            ref={inputRef}
            className="w-full bg-transparent outline-none text-[var(--text-primary)] pt-4 pb-1"
            onFocus={() => setIsFocused(true)}
            onBlur={(e) => {
              setIsFocused(false);
              // Small hack to ensure hasValue triggers re-render if it changed internally
              if (onChange) onChange(e as any);
            }}
            value={value}
            onChange={onChange}
            {...props}
          />
        </div>
      </motion.div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme");
    if (stored === "light") {
      setIsLight(true);
      document.documentElement.classList.add("light-mode");
    }
  }, []);

  const toggleTheme = () => {
    const newIsLight = !isLight;
    setIsLight(newIsLight);
    if (newIsLight) {
      document.documentElement.classList.add("light-mode");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.remove("light-mode");
      localStorage.setItem("theme", "dark");
    }
  };

  if (!mounted) return (
     <div className="fixed top-6 right-6 z-[100] w-[4.25rem] h-9 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] shadow-xl"></div>
  );

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "fixed top-6 right-6 z-[100] flex items-center w-[4.25rem] h-9 rounded-full cursor-pointer overflow-hidden transition-all duration-500 border backdrop-blur-xl",
        isLight 
          ? "bg-[rgba(255,255,255,0.6)] border-[rgba(255,255,255,0.6)] shadow-[inset_0_1px_4px_rgba(255,255,255,0.5),0_4px_15px_rgba(0,0,0,0.05)]" 
          : "bg-[rgba(10,11,16,0.6)] border-[rgba(255,255,255,0.15)] shadow-[inset_0_1px_4px_rgba(255,255,255,0.1),0_4px_15px_rgba(0,0,0,0.3)]"
      )}
      aria-label="Toggle Theme"
    >
      <div className="absolute inset-0 flex justify-between items-center px-2.5">
        <span className={cn("text-sm transition-all duration-300", isLight ? "opacity-30 scale-90" : "opacity-100 scale-100 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]")}>🌙</span>
        <span className={cn("text-sm transition-all duration-300", isLight ? "opacity-100 scale-100 drop-shadow-[0_0_8px_rgba(255,200,0,0.5)]" : "opacity-30 scale-90")}>☀️</span>
      </div>
      
      <motion.div
        className={cn(
          "absolute flex items-center justify-center w-7 h-7 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.2)] z-10 border",
          isLight ? "bg-white border-yellow-100" : "bg-[#1A1B23] border-indigo-500/30"
        )}
        initial={false}
        animate={{
          left: isLight ? "calc(100% - 2rem)" : "0.25rem",
          rotate: isLight ? 360 : 0
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <span className="text-xs">
          {isLight ? "☀️" : "🌙"}
        </span>
      </motion.div>
    </button>
  );
}

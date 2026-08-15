"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hexagon } from "lucide-react";
import Image from "next/image";

export function InitialLoader() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsMounted(true), 0);
    // Prevent scrolling while loading
    document.body.style.overflow = "hidden";

    const duration = 2500; // 2.5 seconds loading
    const interval = 30; // Update every 30ms
    const step = 100 / (duration / interval);

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev + step >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setLoading(false);
            document.body.style.overflow = "";
          }, 400); // short delay at 100% before fading out
          return 100;
        }
        return prev + step;
      });
    }, interval);

    return () => {
      clearInterval(timer);
      document.body.style.overflow = "";
    };
  }, []);

  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#05060A]"
        >
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

          {/* Logo / Icon */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative mb-12"
          >
            <div className="absolute inset-0 bg-cyan-400 blur-2xl opacity-30 animate-pulse rounded-full" />
            <Image src="/logo.png" alt="Vitreon Logo" width={80} height={80} className="relative z-10 object-contain drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
          </motion.div>

          {/* Primary Text */}
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-white tracking-[0.3em] text-sm md:text-base font-medium mb-8"
          >
            INITIALIZING SECURE LINK
          </motion.h2>

          {/* Loading Bar Container */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="w-full max-w-md h-[4px] bg-white/10 rounded-full overflow-hidden mb-4 shadow-[0_0_15px_rgba(0,255,255,0.1)] relative"
          >
            {/* The actual progress bar */}
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 shadow-[0_0_15px_rgba(0,255,255,0.8)] transition-all duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </motion.div>

          {/* Progress % and Subtext */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col items-center gap-6"
          >
            <span className="text-cyan-400 font-mono text-sm tracking-wider shadow-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]">
              {Math.floor(progress)}%
            </span>
            <span className="text-white/30 text-xs tracking-[0.2em] uppercase">
              Scanning Cyberdeck Protocols...
            </span>
          </motion.div>
          
          {/* Scanline overlay for that retro/terminal feel */}
          <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,1)_50%)] bg-[length:100%_4px]" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

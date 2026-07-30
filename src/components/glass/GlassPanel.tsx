"use client";

import { useRef, useEffect } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

interface GlassPanelProps extends HTMLMotionProps<"div"> {
  strong?: boolean;
  interactive?: boolean;
}

export function GlassPanel({ className, strong = false, interactive = false, children, ...props }: GlassPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useAppStore((state) => state.reducedMotion);

  useEffect(() => {
    if (reducedMotion || !interactive || !panelRef.current) return;

    const el = panelRef.current;
    
    // QuickTo for smooth tracking
    const xTo = gsap.quickTo(el, "--mouse-x", { duration: 0.4, ease: "power3" });
    const yTo = gsap.quickTo(el, "--mouse-y", { duration: 0.4, ease: "power3" });

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      xTo(x);
      yTo(y);
    };

    el.addEventListener("mousemove", handleMouseMove);
    return () => el.removeEventListener("mousemove", handleMouseMove);
  }, [reducedMotion, interactive]);

  return (
    <motion.div
      ref={panelRef}
      className={cn(
        "glass-panel",
        strong && "glass-panel-strong",
        interactive && "hover:glass-panel-strong transition-colors duration-300",
        className
      )}
      style={interactive ? {
        // We inject the CSS variables for the dynamic highlight on hover if interactive
        background: `radial-gradient(800px circle at var(--mouse-x, 0) var(--mouse-y, 0), rgba(255,255,255,0.06), transparent 40%), var(--glass-bg${strong ? '-strong' : ''})`
      } : {}}
      {...props}
    >
      {children}
    </motion.div>
  );
}

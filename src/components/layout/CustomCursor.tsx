"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run on non-touch devices
    if (window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    if (!dotRef.current || !ringRef.current) return;

    // Fast GSAP setters for maximum performance (60/120fps) without React re-renders
    const xToDot = gsap.quickTo(dotRef.current, "x", { duration: 0.1, ease: "power3" });
    const yToDot = gsap.quickTo(dotRef.current, "y", { duration: 0.1, ease: "power3" });
    
    // The ring follows slightly slower for a sleek trailing effect
    const xToRing = gsap.quickTo(ringRef.current, "x", { duration: 0.3, ease: "power3" });
    const yToRing = gsap.quickTo(ringRef.current, "y", { duration: 0.3, ease: "power3" });

    const handleMouseMove = (e: MouseEvent) => {
      // Offset by half width/height to center the cursor
      xToDot(e.clientX - 4); 
      yToDot(e.clientY - 4);
      
      xToRing(e.clientX - 16);
      yToRing(e.clientY - 16);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isHoverable = 
        target.tagName.toLowerCase() === "button" ||
        target.tagName.toLowerCase() === "a" ||
        target.closest("button") ||
        target.closest("a") ||
        target.closest("[role='button']");

      if (isHoverable) {
        gsap.to(ringRef.current, { scale: 1.5, opacity: 0.5, duration: 0.2, backgroundColor: "rgba(255,255,255,0.1)" });
        gsap.to(dotRef.current, { scale: 0, duration: 0.2 });
      } else {
        gsap.to(ringRef.current, { scale: 1, opacity: 1, duration: 0.2, backgroundColor: "transparent" });
        gsap.to(dotRef.current, { scale: 1, duration: 0.2 });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);

    // Fade in on first move
    gsap.to([dotRef.current, ringRef.current], { opacity: 1, duration: 0.5, delay: 0.1 });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  return (
    <div className="hidden md:block">
      {/* Outer trailing ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[99999] border border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.2)] mix-blend-difference opacity-0 backdrop-blur-[2px]"
      />
      {/* Inner fast dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 rounded-full pointer-events-none z-[99999] bg-white mix-blend-difference opacity-0"
      />
    </div>
  );
}

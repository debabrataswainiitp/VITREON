"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useAppStore } from "@/store/useAppStore";

export function BackgroundOrbs() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useAppStore((state) => state.reducedMotion);

  useEffect(() => {
    if (reducedMotion || !containerRef.current) return;

    const orbs = containerRef.current.children;
    const ctx = gsap.context(() => {
      gsap.to(orbs[0], {
        x: "20vw",
        y: "20vh",
        duration: 25,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      gsap.to(orbs[1], {
        x: "-30vw",
        y: "10vh",
        duration: 35,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      gsap.to(orbs[2], {
        x: "15vw",
        y: "-25vh",
        duration: 28,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    }, containerRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 overflow-hidden pointer-events-none z-0 mix-blend-screen"
      style={{ opacity: 'var(--orb-opacity)' }}
    >
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[var(--color-orb-violet)] blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[var(--color-orb-cyan)] blur-[140px]" />
      <div className="absolute top-[40%] left-[30%] w-[45vw] h-[45vw] rounded-full bg-[var(--color-orb-pink)] blur-[100px]" />
    </div>
  );
}

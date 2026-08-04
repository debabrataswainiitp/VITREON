"use client";

import { useEffect, useRef } from "react";
import { GlassButton } from "../glass/GlassButton";
import Link from "next/link";
import gsap from "gsap";
import { cn } from "@/lib/utils";

export function LandingHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtextRef = useRef<HTMLParagraphElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Set initial states to prevent FOUC and prepare for "infinity left" roll
      gsap.set([tagRef.current, headlineRef.current, subtextRef.current], {
        x: "-150vw", // Start way offscreen to the left
        opacity: 0,
        skewX: 30, // Adds a dynamic "rolling/speed" effect
      });

      tl.to(tagRef.current, {
        x: 0,
        opacity: 1,
        skewX: 0,
        duration: 1.2,
        ease: "power4.out"
      })
      .to(headlineRef.current, {
        x: 0,
        opacity: 1,
        skewX: 0,
        duration: 1.4,
        ease: "power4.out"
      }, "-=1.0") // Overlap
      .to(subtextRef.current, {
        x: 0,
        opacity: 1,
        skewX: 0,
        duration: 1.2,
        ease: "power4.out"
      }, "-=1.1");

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative min-h-[95vh] flex flex-col items-center justify-center pt-20 px-6 text-center overflow-hidden">
      
      {/* Background radial glow specifically for hero */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto z-10 flex flex-col items-center">
        
        {/* Animated tag */}
        <div
          ref={tagRef}
          className="px-5 py-2 rounded-full border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.03)] backdrop-blur-xl mb-10 inline-flex items-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.05)] dark:border-[rgba(255,255,255,0.2)] dark:bg-[rgba(255,255,255,0.03)]"
          style={{ borderColor: "var(--glass-border)", background: "var(--glass-bg)" }}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
          <span className="text-sm font-semibold tracking-widest uppercase text-[var(--text-primary)]">Vitreon Next-Gen Beta</span>
        </div>

        {/* Headline */}
        <h1 
          ref={headlineRef}
          className="font-heading text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-[var(--text-primary)] mb-8 leading-[1.1]"
        >
          Intelligence,
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400">
            Orchestrated.
          </span>
        </h1>

        <p
          ref={subtextRef}
          className="text-xl md:text-2xl text-[var(--text-muted)] max-w-3xl mb-14 font-medium leading-relaxed"
        >
          Experience a revolutionary multi-agent AI framework seamlessly woven into a living liquid glass interface. Stop typing, start conducting.
        </p>

      </div>

    </section>
  );
}

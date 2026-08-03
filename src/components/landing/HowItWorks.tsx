"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GlassPanel } from "../glass/GlassPanel";
import { useAppStore } from "@/store/useAppStore";

const steps = [
  { num: "01", title: "Query", desc: "You provide a prompt. Prism analyzes the intent and breaks it down." },
  { num: "02", title: "Delegation", desc: "The task is dynamically routed to the best specialist agent for the job." },
  { num: "03", title: "Synthesis", desc: "Results are seamlessly blended into a single, cohesive response." },
];

export function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const reducedMotion = useAppStore((state) => state.reducedMotion);

  useEffect(() => {
    if (reducedMotion || !containerRef.current || !lineRef.current) return;

    gsap.registerPlugin(ScrollTrigger);
    
    // Animate the connecting line
    const pathLength = lineRef.current.getTotalLength();
    gsap.set(lineRef.current, { 
      strokeDasharray: pathLength, 
      strokeDashoffset: pathLength 
    });

    const ctx = gsap.context(() => {
      // Line drawing animation
      gsap.to(lineRef.current, {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top center",
          end: "bottom center",
          scrub: 1, // smooth scrubbing
        }
      });

      // Step cards staggered reveal
      gsap.fromTo(".step-card", 
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.2,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 60%",
          }
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section id="how-it-works" className="py-24 px-6 relative z-10" ref={containerRef}>
      <div className="max-w-7xl mx-auto">
        <h2 className="font-heading text-3xl md:text-5xl font-bold mb-16 text-center text-[var(--text-primary)]">
          How it flows
        </h2>

        <div className="relative">
          {/* Desktop SVG Connecting Line */}
          <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-px -translate-y-1/2 z-0 overflow-visible">
            <svg width="100%" height="100" className="absolute top-1/2 -translate-y-1/2 overflow-visible">
              <path 
                ref={lineRef}
                d="M 0 50 Q 25% 100, 50% 50 T 100% 50" 
                fill="none" 
                stroke="rgba(255,255,255,0.2)" 
                strokeWidth="2" 
                suppressHydrationWarning
              />
            </svg>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative z-10">
            {steps.map((step, i) => (
              <GlassPanel key={i} className="step-card p-8 flex flex-col items-start relative">
                <div className="text-sm font-bold text-[#4FD8E8] mb-4 tracking-widest">
                  {step.num}
                </div>
                <h3 className="font-heading text-xl font-bold text-[var(--text-primary)] mb-3">
                  {step.title}
                </h3>
                <p className="text-[var(--text-muted)] leading-relaxed">
                  {step.desc}
                </p>
              </GlassPanel>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

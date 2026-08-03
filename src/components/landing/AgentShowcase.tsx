"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { GlassPanel } from "../glass/GlassPanel";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAppStore } from "@/store/useAppStore";

const agents = [
  { id: "prism", name: "Prism", role: "Orchestrator — Routes requests, synthesizes answers", color: "from-violet-500 to-white" },
  { id: "lucent", name: "Lucent", role: "Research & Knowledge — Web lookup, summarization", color: "from-cyan-400 to-blue-500" },
  { id: "refract", name: "Refract", role: "Code & Technical — Writing/debugging code", color: "from-emerald-400 to-cyan-500" },
  { id: "spectrum", name: "Spectrum", role: "Creative — Writing, ideation, design copy", color: "from-pink-500 to-violet-500" },
  { id: "facet", name: "Facet", role: "Data & Analysis — Structured data, charts", color: "from-amber-400 to-violet-500" },
  { id: "echo", name: "Echo", role: "Memory — Recalls context, manages history", color: "from-blue-300 to-slate-400" },
];

function AgentCard({ agent, index }: { agent: typeof agents[0], index: number }) {
  return (
    <div className="agent-card-item opacity-0 translate-y-8 h-full">
      <motion.div
        whileHover={{ y: -10, scale: 1.03 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="h-full group relative"
      >
        {/* Outer Glow that appears on hover */}
        <div className={`absolute -inset-0.5 rounded-[24px] bg-gradient-to-br ${agent.color} opacity-0 group-hover:opacity-30 blur-md transition-opacity duration-500`} />
        
        <GlassPanel interactive className="p-6 flex flex-col h-full h-[220px] relative z-10 overflow-hidden">
          {/* Inner ambient glow on hover */}
          <div className={`absolute inset-0 bg-gradient-to-br ${agent.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
          
          <div className="mb-4 relative z-10">
            <div className="relative w-12 h-12 flex items-center justify-center">
              {/* Orb */}
              <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${agent.color} opacity-40 blur-md group-hover:opacity-80 group-hover:scale-110 transition-all duration-500`} />
              <div className={`relative w-8 h-8 rounded-full bg-gradient-to-br ${agent.color} group-hover:scale-110 transition-transform duration-500`} />
            </div>
          </div>
          
          <div className="relative z-10">
            <h3 className="font-heading font-semibold text-xl text-[var(--text-primary)] mb-2 group-hover:text-white transition-colors duration-300">
              {agent.name}
            </h3>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed group-hover:text-white/80 transition-colors duration-300">
              {agent.role}
            </p>
          </div>
        </GlassPanel>
      </motion.div>
    </div>
  );
}

export function AgentShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useAppStore((state) => state.reducedMotion);

  useEffect(() => {
    if (reducedMotion) {
      gsap.set(".agent-card-item", { opacity: 1, y: 0 });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    
    const ctx = gsap.context(() => {
      gsap.to(".agent-card-item", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        },
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out"
      });
    }, containerRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section id="agents" className="py-24 px-6 relative z-10" ref={containerRef}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 text-center md:text-left">
          <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4 text-[var(--text-primary)]">The Network</h2>
          <p className="text-[var(--text-muted)] text-lg max-w-xl mx-auto md:mx-0">
            A cohesive team of specialized agents, seamlessly orchestrating complex tasks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 perspective-1000">
          {agents.map((agent, index) => (
            <AgentCard key={agent.id} agent={agent} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

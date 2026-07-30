"use client";

import { useRef, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
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
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const reducedMotion = useAppStore((state) => state.reducedMotion);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["6deg", "-6deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-6deg", "6deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{
        rotateX: reducedMotion ? 0 : rotateX,
        rotateY: reducedMotion ? 0 : rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="agent-card-item opacity-0 translate-y-8 h-full"
    >
      <GlassPanel interactive className="p-6 flex flex-col h-full h-[220px]">
        <div 
          className="mb-4"
          style={{ transform: reducedMotion ? 'none' : 'translateZ(30px)' }}
        >
          <div className="relative w-12 h-12 flex items-center justify-center">
            {/* Glowing Orb */}
            <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${agent.color} opacity-40 blur-md`} />
            <div className={`relative w-8 h-8 rounded-full bg-gradient-to-br ${agent.color}`} />
          </div>
        </div>
        <div style={{ transform: reducedMotion ? 'none' : 'translateZ(20px)' }}>
          <h3 className="font-heading font-semibold text-xl text-[var(--text-primary)] mb-2">{agent.name}</h3>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">{agent.role}</p>
        </div>
      </GlassPanel>
    </motion.div>
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

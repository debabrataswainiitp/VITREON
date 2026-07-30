"use client";

import { motion } from "framer-motion";
import { useAppStore, AgentId } from "@/store/useAppStore";
import { cn } from "@/lib/utils";

export const agentsData: Record<AgentId, { name: string; color: string; desc: string }> = {
  prism: { name: "Prism", color: "from-violet-500 to-white", desc: "Orchestrator routes requests to the right specialist" },
  lucent: { name: "Lucent", color: "from-cyan-400 to-blue-500", desc: "Research & knowledge agent — web/document lookup, summarization" },
  refract: { name: "Refract", color: "from-emerald-400 to-cyan-500", desc: "Code & technical agent — writing/debugging code, dev tasks" },
  spectrum: { name: "Spectrum", color: "from-pink-500 to-violet-500", desc: "Creative & content agent — writing, ideation, design copy" },
  facet: { name: "Facet", color: "from-amber-400 to-violet-500", desc: "Data & analysis agent — structured data, charts, reasoning" },
  echo: { name: "Echo", color: "from-blue-300 to-slate-400", desc: "Memory/conversation agent — recalls context, manages chat history" },
};

export function AgentRail() {
  const { activeAgent, setActiveAgent } = useAppStore();

  return (
    <div className="w-full flex items-center p-2 rounded-2xl bg-[rgba(20,21,26,0.8)] backdrop-blur-xl border border-[rgba(255,255,255,0.05)] shadow-xl overflow-x-auto hide-scrollbar gap-1">
      {(Object.keys(agentsData) as AgentId[]).map((id) => {
        const agent = agentsData[id];
        const isActive = activeAgent === id;
        
        return (
          <button
            key={id}
            onClick={() => setActiveAgent(id)}
            className={cn(
              "relative flex items-center gap-2 px-3 py-1.5 rounded-xl transition-colors duration-300 flex-shrink-0 outline-none",
              isActive ? "text-white" : "text-[var(--text-muted)] hover:text-white hover:bg-[rgba(255,255,255,0.05)]"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="active-agent-highlight"
                className="absolute inset-0 rounded-xl bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.15)] z-0"
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              />
            )}
            
            <div className="relative w-6 h-6 flex items-center justify-center z-10 flex-shrink-0">
              <div className={cn("absolute inset-0 rounded-full blur-sm opacity-0 transition-opacity duration-300", isActive && "opacity-60", `bg-gradient-to-br ${agent.color}`)} />
              <div className={cn("relative w-4 h-4 rounded-full bg-gradient-to-br transition-transform duration-300", isActive && "scale-110", agent.color)} />
            </div>
            
            <div className="z-10 flex flex-col items-start overflow-hidden">
              <span className="font-medium text-xs truncate leading-tight">{agent.name}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

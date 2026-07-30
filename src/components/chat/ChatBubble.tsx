"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { agentsData } from "./AgentRail";
import { AgentId } from "@/store/useAppStore";
import { easings } from "@/lib/animations";

export interface Message {
  id: string;
  role: "user" | "agent";
  content: string;
  agentId?: AgentId;
}

export function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.8, rotateX: -40, filter: "blur(8px)", transformPerspective: 600 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0, filter: "blur(0px)" }}
      transition={{ type: "spring", stiffness: 220, damping: 20, mass: 0.8 }}
      className={cn(
        "flex w-full mb-6",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div className={cn(
        "flex max-w-[85%] md:max-w-[75%] gap-4",
        isUser ? "flex-row-reverse" : "flex-row"
      )}>
        
        {/* Avatar */}
        {!isUser && message.agentId && (
          <div className="relative w-8 h-8 flex-shrink-0 mt-1">
            <div className={cn("absolute inset-0 rounded-full opacity-40 blur-sm", `bg-gradient-to-br ${agentsData[message.agentId].color}`)} />
            <div className={cn("relative w-full h-full rounded-full border border-[rgba(255,255,255,0.2)]", `bg-gradient-to-br ${agentsData[message.agentId].color}`)} />
          </div>
        )}

        {/* Bubble */}
        <div className={cn(
          "glass-panel p-4 text-[15px] leading-relaxed shadow-md",
          isUser 
            ? "bg-[rgba(255,255,255,0.15)] rounded-2xl rounded-tr-sm" 
            : "bg-[rgba(255,255,255,0.05)] rounded-2xl rounded-tl-sm"
        )}>
          {/* Agent Label if multi-agent handoff context could be needed */}
          {!isUser && message.agentId && (
            <div className="text-xs font-semibold mb-1 opacity-60">
              {agentsData[message.agentId].name}
            </div>
          )}
          
          <div className="whitespace-pre-wrap">{message.content}</div>
        </div>
      </div>
    </motion.div>
  );
}

export function AgentThinking({ agentId }: { agentId: AgentId }) {
  const agentColor = agentsData[agentId].color;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex w-full mb-6 justify-start"
    >
      <div className="flex gap-4">
        <div className="relative w-8 h-8 flex-shrink-0 mt-1">
          <div className={cn("absolute inset-0 rounded-full opacity-40 blur-sm", `bg-gradient-to-br ${agentColor}`)} />
          <div className={cn("relative w-full h-full rounded-full border border-[rgba(255,255,255,0.2)]", `bg-gradient-to-br ${agentColor}`)} />
        </div>
        
        <div className="glass-panel py-3 px-5 rounded-2xl rounded-tl-sm flex items-center gap-1.5 h-[42px]">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.2
              }}
              className="w-1.5 h-1.5 rounded-full bg-white"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { agentsData } from "./AgentRail";
import { AgentId } from "@/store/useAppStore";
import { easings } from "@/lib/animations";
import { UIMessage as AIMessage } from "ai";
import { AlertTriangle, RotateCcw, X } from "lucide-react";

export interface CustomMessage extends AIMessage {
  agentId?: AgentId;
}

/** Strip markdown formatting symbols so chat text renders clean */
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')   // **bold** → bold
    .replace(/\*([^*]+)\*/g, '$1')        // *italic* → italic
    .replace(/^#{1,6}\s+/gm, '')          // # headings → plain text
    .replace(/`{3}[\s\S]*?`{3}/g, (m) => // ```code blocks``` → keep inner text
      m.replace(/^`{3}.*\n?/m, '').replace(/\n?`{3}$/m, ''))
    .replace(/`([^`]+)`/g, '$1')          // `inline code` → plain text
    .replace(/^[-*+]\s+/gm, '• ')         // - list items → bullet
    .replace(/^\d+\.\s+/gm, '')           // 1. numbered lists → plain
    .trim();
}

export function ChatBubble({ message }: { message: CustomMessage }) {
  const isUser = message.role === "user";

  // Extract raw text from parts or content
  const rawText = message.parts && message.parts.length > 0
    ? message.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('\n')
    : (message as any).content || '';

  // Only strip markdown for assistant messages
  const displayText = isUser ? rawText : stripMarkdown(rawText);

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
          
          <div className="whitespace-pre-wrap">
            {displayText}
          </div>
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

export function ErrorBubble({
  message,
  onRetry,
  onDismiss,
}: {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="flex w-full mb-6 justify-start"
    >
      <div className="flex gap-4 max-w-[85%] md:max-w-[75%]">
        {/* Error Icon */}
        <div className="relative w-8 h-8 flex-shrink-0 mt-1">
          <div className="absolute inset-0 rounded-full opacity-40 blur-sm bg-gradient-to-br from-red-500 to-orange-500" />
          <div className="relative w-full h-full rounded-full border border-red-500/30 bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
        </div>

        {/* Error Content */}
        <div className="glass-panel p-4 rounded-2xl rounded-tl-sm border border-red-500/15 bg-[rgba(239,68,68,0.06)]">
          <p className="text-[14px] text-red-200/90 leading-relaxed mb-3">
            {message}
          </p>
          <div className="flex items-center gap-2">
            {onRetry && (
              <button
                onClick={onRetry}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.14)] border border-[rgba(255,255,255,0.1)] text-[13px] font-medium text-white/80 hover:text-white transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Retry
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.06)] text-[13px] font-medium text-[var(--text-muted)] hover:text-white/70 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}


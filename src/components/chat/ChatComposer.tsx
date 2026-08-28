"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Plus, Mic, ChevronDown, AudioLines, FileText, Link as LinkIcon, X } from "lucide-react";
import { useAppStore, AgentId } from "@/store/useAppStore";
import { agentsData } from "./AgentRail";
import gsap from "gsap";
import { cn } from "@/lib/utils";

export const AI_MODELS = [
  { id: 'openrouter/auto', name: 'Auto (Best Free)' },
  { id: 'nvidia/llama-3.1-nemotron-70b-instruct:free', name: 'Nemotron Lightning' },
  { id: 'google/gemma-2-9b-it:free', name: 'Gemma 4' },
  { id: 'liquid/lfm-40b:free', name: 'Liquid LFM' }
];

export function ChatComposer({ onSend }: { onSend: (msg: string) => void }) {
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isPlusOpen, setIsPlusOpen] = useState(false);
  const [attachments, setAttachments] = useState<{id: string, type: 'file' | 'link', name: string}[]>([]);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const plusDropdownRef = useRef<HTMLDivElement>(null);
  
  const { activeAgent } = useAppStore();
  const agentColor = agentsData[activeAgent].color;

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current && !isVoiceMode) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input, isVoiceMode]);

  // Click outside for Plus menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (plusDropdownRef.current && !plusDropdownRef.current.contains(e.target as Node)) {
        setIsPlusOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = () => {
    if (!input.trim() && attachments.length === 0) return;
    
    // Ripple animation
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.className = "absolute rounded-full bg-white/40 pointer-events-none";
      ripple.style.width = ripple.style.height = `${Math.max(rect.width, rect.height)}px`;
      ripple.style.left = `50%`;
      ripple.style.top = `50%`;
      ripple.style.transform = `translate(-50%, -50%) scale(0)`;
      btnRef.current.appendChild(ripple);
      
      gsap.to(ripple, {
        scale: 2,
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
        onComplete: () => ripple.remove()
      });

      const icon = btnRef.current.querySelector("svg");
      if (icon) {
        gsap.timeline()
          .to(icon, { y: -20, opacity: 0, duration: 0.2, ease: "power2.in" })
          .set(icon, { y: 20 })
          .to(icon, { y: 0, opacity: 1, duration: 0.3, ease: "back.out(1.5)" });
      }
    }

    let finalMsg = input;
    if (attachments.length > 0) {
      finalMsg += ` [Attached: ${attachments.map(a => a.name).join(', ')}]`;
    }

    onSend(finalMsg);
    setInput("");
    setAttachments([]);
    setIsVoiceMode(false);
  };

  // Recording handlers
  const handleRecordStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsRecording(true);
  };

  const handleRecordEnd = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsRecording(false);
    // Simulate transcription
    setInput((prev) => prev + (prev.length > 0 ? " " : "") + "This is a transcribed voice message.");
  };

  const addAttachment = (type: 'file' | 'link') => {
    setAttachments([...attachments, { 
      id: Date.now().toString(), 
      type, 
      name: type === 'file' ? 'document_v2.pdf' : 'figma.com/design' 
    }]);
    setIsPlusOpen(false);
  };

  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter(a => a.id !== id));
  };

  const canSubmit = input.trim().length > 0 || attachments.length > 0;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-6 relative z-20">
      <motion.div 
        className={cn(
          "relative flex flex-col transition-colors duration-300 rounded-3xl border border-[rgba(255,255,255,0.05)]",
          (isFocused || input.length > 0 || isVoiceMode) ? "bg-[rgba(15,16,21,0.95)] backdrop-blur-xl" : "bg-[rgba(20,21,26,0.85)] backdrop-blur-xl shadow-xl"
        )}
        animate={{
          boxShadow: (isFocused || isRecording)
            ? `0 0 0 1px rgba(255,255,255,0.1), 0 12px 40px rgba(0,0,0,0.5)` 
            : `0 0 0 1px transparent, 0 8px 32px rgba(0,0,0,0.3)`
        }}
        transition={{ duration: 0.2 }}
      >
        <AnimatePresence>
          {(isFocused || isVoiceMode) && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              className={`absolute inset-[-1px] rounded-3xl bg-gradient-to-r ${agentColor} z-[-1] blur-[4px] opacity-30`} 
            />
          )}
        </AnimatePresence>

        {/* Attachments Area */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 pt-4 pb-1">
            {attachments.map((att) => (
              <div key={att.id} className="flex items-center gap-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg px-2.5 py-1.5 group">
                {att.type === 'file' ? <FileText className="w-3.5 h-3.5 text-emerald-400" /> : <LinkIcon className="w-3.5 h-3.5 text-blue-400" />}
                <span className="text-xs text-[var(--text-primary)] max-w-[150px] truncate">{att.name}</span>
                <button onClick={() => removeAttachment(att.id)} className="text-[var(--text-muted)] hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {isVoiceMode ? (
          <div className="w-full flex flex-col items-center justify-center py-12 px-5">
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="flex items-center gap-1 h-12"
            >
              {[1,2,3,4,5,6,7].map((i) => (
                <motion.div 
                  key={i}
                  animate={{ height: ["20%", "100%", "20%"] }}
                  transition={{ repeat: Infinity, duration: 0.8 + (i * 0.1), ease: "easeInOut", delay: i * 0.1 }}
                  className={`w-1.5 rounded-full bg-gradient-to-t ${agentColor}`}
                />
              ))}
            </motion.div>
            <p className="mt-6 text-sm text-[var(--text-muted)] font-medium">Listening to your voice...</p>
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Message Vitreon..."
            className="w-full bg-transparent text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none resize-none pt-4 pb-2 px-5 max-h-[200px] overflow-y-auto"
            rows={1}
          />
        )}

        {/* Bottom Tool Row */}
        <div className="flex items-center justify-between px-3 pb-3 pt-1">
          <div className="flex items-center gap-2 relative" ref={plusDropdownRef}>
            <button 
              onClick={() => setIsPlusOpen(!isPlusOpen)}
              className={cn("p-2 transition-colors rounded-full outline-none", isPlusOpen ? "bg-[rgba(255,255,255,0.1)] text-white" : "text-[var(--text-muted)] hover:text-white hover:bg-[rgba(255,255,255,0.05)]")}
            >
              <Plus className={cn("w-5 h-5 transition-transform duration-300", isPlusOpen && "rotate-45")} />
            </button>

            <AnimatePresence>
              {isPlusOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-full left-0 mb-2 w-48 rounded-2xl bg-[rgba(25,26,35,0.95)] backdrop-blur-2xl border border-[rgba(255,255,255,0.1)] shadow-2xl overflow-hidden z-50 flex flex-col p-1.5"
                >
                  <button onClick={() => addAttachment('file')} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[rgba(255,255,255,0.05)] transition-colors outline-none text-left w-full group">
                    <FileText className="w-4 h-4 text-[var(--text-muted)] group-hover:text-white" />
                    <span className="text-sm font-medium text-[var(--text-primary)]">Upload File</span>
                  </button>
                  <button onClick={() => addAttachment('link')} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[rgba(255,255,255,0.05)] transition-colors outline-none text-left w-full group">
                    <LinkIcon className="w-4 h-4 text-[var(--text-muted)] group-hover:text-white" />
                    <span className="text-sm font-medium text-[var(--text-primary)]">Add Link</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <AgentDropdown />
            <ModelDropdown />
          </div>

          <div className="flex items-center gap-1">
            <button 
              onMouseDown={handleRecordStart}
              onMouseUp={handleRecordEnd}
              onMouseLeave={() => isRecording && handleRecordEnd({ preventDefault: () => {} } as any)}
              onTouchStart={handleRecordStart}
              onTouchEnd={handleRecordEnd}
              className={cn(
                "p-2 transition-all duration-300 rounded-full select-none touch-none", 
                isRecording ? "bg-red-500/20 text-red-400 scale-110 shadow-[0_0_15px_rgba(239,68,68,0.5)]" : "text-[var(--text-muted)] hover:text-white hover:bg-[rgba(255,255,255,0.05)]"
              )}
            >
              <Mic className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsVoiceMode(!isVoiceMode)}
              className={cn(
                "p-2 transition-colors rounded-full mr-1",
                isVoiceMode ? "text-white bg-[rgba(255,255,255,0.1)]" : "text-[var(--text-muted)] hover:text-white hover:bg-[rgba(255,255,255,0.05)]"
              )}
            >
              <AudioLines className="w-5 h-5" />
            </button>

            <button
              ref={btnRef}
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={cn(
                "relative w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 overflow-hidden",
                canSubmit
                  ? `bg-[rgba(255,255,255,0.1)] text-white hover:bg-white hover:text-black` 
                  : "bg-[rgba(255,255,255,0.05)] text-[var(--text-muted)] cursor-not-allowed"
              )}
            >
              <ArrowUp className="w-4 h-4 relative z-10" />
            </button>
          </div>
        </div>

      </motion.div>
      <div className="text-center mt-3">
        <span className="text-[11px] text-[var(--text-muted)]">AI can make mistakes. Consider verifying important information.</span>
      </div>
    </div>
  );
}

function AgentDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { activeAgent, setActiveAgent } = useAppStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentAgent = agentsData[activeAgent];

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] transition-colors border border-[rgba(255,255,255,0.05)] outline-none"
      >
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-[var(--text-muted)] font-medium">Agent:</span>
          <span className="text-[13px] font-semibold text-white">{currentAgent.name}</span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full left-0 mb-2 w-64 rounded-2xl bg-[rgba(25,26,35,0.95)] backdrop-blur-2xl border border-[rgba(255,255,255,0.1)] shadow-2xl overflow-hidden z-50 flex flex-col p-1.5"
          >
            {(Object.keys(agentsData) as AgentId[]).map((id) => {
              const agent = agentsData[id];
              const isActive = id === activeAgent;
              return (
                <button
                  key={id}
                  onClick={() => { setActiveAgent(id); setIsOpen(false); }}
                  className={cn(
                    "flex flex-col items-start px-3 py-2.5 rounded-xl transition-colors outline-none text-left w-full",
                    isActive ? "bg-[rgba(255,255,255,0.1)]" : "hover:bg-[rgba(255,255,255,0.05)]"
                  )}
                >
                  <div className="flex items-center justify-between w-full mb-0.5">
                    <span className={cn("text-sm font-semibold", isActive ? "text-white" : "text-[var(--text-primary)]")}>
                      {agent.name}
                    </span>
                    {isActive && (
                      <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${agent.color}`} />
                    )}
                  </div>
                  <span className="text-xs text-[var(--text-muted)] opacity-80 leading-tight">
                    {agent.desc}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ModelDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { activeModel, setActiveModel } = useAppStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentModel = AI_MODELS.find(m => m.id === activeModel) || AI_MODELS[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] transition-colors border border-[rgba(255,255,255,0.05)] outline-none"
      >
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-[var(--text-muted)] font-medium">Model:</span>
          <span className="text-[13px] font-semibold text-white">{currentModel.name}</span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full left-0 mb-2 w-64 rounded-2xl bg-[rgba(25,26,35,0.95)] backdrop-blur-2xl border border-[rgba(255,255,255,0.1)] shadow-2xl overflow-hidden z-50 flex flex-col p-1.5"
          >
            {AI_MODELS.map((model) => {
              const isActive = model.id === activeModel;
              return (
                <button
                  key={model.id}
                  onClick={() => { setActiveModel(model.id); setIsOpen(false); }}
                  className={cn(
                    "flex flex-col items-start px-3 py-2.5 rounded-xl transition-colors outline-none text-left w-full",
                    isActive ? "bg-[rgba(255,255,255,0.1)]" : "hover:bg-[rgba(255,255,255,0.05)]"
                  )}
                >
                  <div className="flex items-center justify-between w-full mb-0.5">
                    <span className={cn("text-sm font-semibold", isActive ? "text-white" : "text-[var(--text-primary)]")}>
                      {model.name}
                    </span>
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    )}
                  </div>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

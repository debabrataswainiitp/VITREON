"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore, AgentId } from "@/store/useAppStore";
import { AgentRail, agentsData } from "@/components/chat/AgentRail";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { ChatBubble, AgentThinking, Message } from "@/components/chat/ChatBubble";
import { Hexagon, Menu, UserCircle, MessageSquarePlus, Clock, MessageSquare, PanelLeftClose, PanelLeft } from "lucide-react";
import { easings } from "@/lib/animations";
import { cn } from "@/lib/utils";
import Link from "next/link";

const suggestedPrompts = [
  "Synthesize the latest research on solid-state batteries.",
  "Debug this React memory leak.",
  "Write a creative brief for a neo-noir film.",
  "Analyze our Q3 user growth metrics.",
];

export default function HomePage() {
  const { activeAgent, setActiveAgent } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [mobileRailOpen, setMobileRailOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const handleSend = (text: string) => {
    // Add user message
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setIsThinking(true);

    // Mock response & handoff logic
    setTimeout(() => {
      let responseAgentId = activeAgent;
      let responseText = "I have analyzed your request and prepared this response.";

      // Mock handoff if they ask about code and current agent isn't refract
      if (text.toLowerCase().includes("code") || text.toLowerCase().includes("debug")) {
        if (activeAgent !== "refract") {
          setActiveAgent("refract");
          responseAgentId = "refract";
          responseText = "Refract here. Let's look at that code issue together.";
        }
      }

      setIsThinking(false);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "agent",
        content: responseText,
        agentId: responseAgentId
      }]);
    }, 1500 + Math.random() * 1000); // 1.5s - 2.5s simulated delay
  };

  const agent = agentsData[activeAgent];

  return (
    <div className="h-screen w-full flex overflow-hidden relative z-10">
      
      {/* Desktop Chat History Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 256, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="hidden md:flex flex-col border-r border-[rgba(255,255,255,0.1)] bg-[rgba(10,11,16,0.5)] backdrop-blur-md pt-20 pb-6 px-4 overflow-hidden flex-shrink-0"
          >
            <div className="flex items-center gap-2 mb-6 w-full">
              <button 
                onClick={() => setMessages([])} 
                className="flex-1 p-3 rounded-xl bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] text-[var(--text-primary)] transition-colors flex items-center justify-center gap-2 text-sm font-medium whitespace-nowrap"
              >
                <MessageSquarePlus className="w-4 h-4" />
                New Chat
              </button>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-3 rounded-xl bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] text-[var(--text-muted)] hover:text-white transition-colors flex-shrink-0"
                title="Hide Sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>
            
            <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-4 px-2 flex items-center gap-2 whitespace-nowrap">
              <Clock className="w-3.5 h-3.5" /> Recent
            </div>
            
            <div className="flex-1 overflow-y-auto flex flex-col gap-1 hide-scrollbar -mx-2 px-2 w-[240px]">
              {["React Performance", "Q3 Strategy", "Data Analysis", "Sci-Fi Story"].map((title, i) => (
                <button key={i} className="text-left w-full p-2.5 rounded-lg text-sm text-[var(--text-muted)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors flex items-center gap-3 truncate">
                  <MessageSquare className="w-4 h-4 opacity-50 flex-shrink-0" />
                  <span className="truncate">{title}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileRailOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileRailOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 z-50 md:hidden w-64 shadow-2xl"
            >
              {/* Mobile Chat History Sidebar */}
              <div className="w-full h-full flex flex-col bg-[rgba(10,11,16,0.9)] backdrop-blur-xl pt-20 pb-6 px-4">
                <button 
                  onClick={() => { setMessages([]); setMobileRailOpen(false); }} 
                  className="w-full mb-6 p-3 rounded-xl bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] text-[var(--text-primary)] transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <MessageSquarePlus className="w-4 h-4" />
                  New Chat
                </button>
                <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-4 px-2 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" /> Recent
                </div>
                <div className="flex-1 overflow-y-auto flex flex-col gap-1 hide-scrollbar -mx-2 px-2">
                  {["React Performance", "Q3 Strategy", "Data Analysis", "Sci-Fi Story"].map((title, i) => (
                    <button key={i} className="text-left w-full p-2.5 rounded-lg text-sm text-[var(--text-muted)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors flex items-center gap-3 truncate">
                      <MessageSquare className="w-4 h-4 opacity-50 flex-shrink-0" />
                      <span className="truncate">{title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-[rgba(10,11,16,0.2)]">
        
        {/* Top Bar */}
        <header className="h-16 border-b border-[rgba(255,255,255,0.05)] bg-[rgba(10,11,16,0.3)] backdrop-blur-md flex items-center justify-between px-4 md:px-6 flex-shrink-0 relative z-20 transition-all">
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="hidden md:flex p-2 -ml-2 text-[var(--text-muted)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] rounded-lg transition-colors"
                title="Open Sidebar"
              >
                <PanelLeft className="w-5 h-5" />
              </button>
            )}
            <button 
              className="md:hidden p-2 -ml-2 text-[var(--text-muted)] hover:text-white"
              onClick={() => setMobileRailOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 group mr-2">
              <div className="relative">
                <Hexagon className="w-7 h-7 text-[var(--text-primary)] animate-[spin_20s_linear_infinite]" />
                <div className="absolute inset-0 bg-gradient-accent blur-md opacity-20 transition-opacity duration-500" />
              </div>
              <span className="font-heading font-bold text-lg tracking-tight hidden sm:block">Vitreon</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="relative w-6 h-6 flex items-center justify-center">
                <div className={cn("absolute inset-0 rounded-full blur-sm opacity-50", `bg-gradient-to-br ${agent.color}`)} />
                <div className={cn("relative w-4 h-4 rounded-full", `bg-gradient-to-br ${agent.color}`)} />
              </div>
              <span className="font-semibold text-sm hidden sm:block">{agent.name}</span>
            </div>
            <Link href="/profile" className="p-1 hover:bg-[rgba(255,255,255,0.1)] rounded-full transition-colors">
              <UserCircle className="w-7 h-7 text-[var(--text-muted)]" />
            </Link>
          </div>
        </header>

        {/* Chat Feed */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 pb-0 flex flex-col">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full pb-10">
              <div className="relative mb-8 group cursor-default">
                <Hexagon className="w-16 h-16 text-[var(--text-muted)] animate-[spin_20s_linear_infinite]" />
                <div className="absolute inset-0 bg-gradient-accent blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
              </div>
              <h2 className="text-2xl font-heading font-semibold mb-2">How can we help today?</h2>
              <p className="text-[var(--text-muted)] mb-10 text-center">Prism will route your request to the most capable agent.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {suggestedPrompts.map((prompt, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 20, scale: 0.95, rotateX: -30, filter: "blur(4px)", transformPerspective: 500 }}
                    animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0, filter: "blur(0px)" }}
                    transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 + i * 0.1 }}
                    onClick={() => handleSend(prompt)}
                    className="glass-panel p-4 text-sm text-left hover:bg-[rgba(255,255,255,0.1)] transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    {prompt}
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <div className="w-full max-w-4xl mx-auto flex flex-col pb-6">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <ChatBubble key={msg.id} message={msg} />
                ))}
                {isThinking && (
                  <AgentThinking key="thinking" agentId={activeAgent} />
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Unified Composer */}
        <div className="flex-shrink-0 bg-gradient-to-t from-[var(--bg-base)] to-transparent pt-4 flex flex-col items-center pb-2">
          <ChatComposer onSend={handleSend} />
        </div>
        
      </div>
    </div>
  );
}

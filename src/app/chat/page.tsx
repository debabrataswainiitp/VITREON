"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore, AgentId } from "@/store/useAppStore";
import { AgentRail, agentsData } from "@/components/chat/AgentRail";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { ChatBubble, AgentThinking, CustomMessage } from "@/components/chat/ChatBubble";
import { Hexagon, Menu, UserCircle, MessageSquarePlus, Clock, MessageSquare, PanelLeftClose, PanelLeft, Trash2 } from "lucide-react";
import { easings } from "@/lib/animations";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
const suggestedPrompts = [
  "Synthesize the latest research on solid-state batteries.",
  "Debug this React memory leak.",
  "Write a creative brief for a neo-noir film.",
  "Analyze our Q3 user growth metrics.",
];

export default function HomePage() {
  const { activeAgent, setActiveAgent, activeModel } = useAppStore();
  const [mobileRailOpen, setMobileRailOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const [chats, setChats] = useState<any[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const fetchChats = async () => {
    try {
      const res = await fetch('/api/chats');
      if (res.ok) {
        const data = await res.json();
        setChats(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const loadChat = async (chatId: string) => {
    try {
      const res = await fetch(`/api/chats/${chatId}`);
      if (res.ok) {
        const data = await res.json();
        setActiveChatId(chatId);
        const formattedMessages = data.messages.map((m: any) => ({
          id: m.id,
          role: m.role,
          parts: [{ type: 'text', text: m.content }]
        }));
        setMessages(formattedMessages);
        if (window.innerWidth < 768) setMobileRailOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/chats/${chatId}`, { method: 'DELETE' });
      if (res.ok) {
        setChats(prev => prev.filter(c => c.id !== chatId));
        if (activeChatId === chatId) {
          setActiveChatId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const createNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
    if (window.innerWidth < 768) setMobileRailOpen(false);
  };

  const { messages, sendMessage: append, setMessages, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: {
        agent: activeAgent,
        chatId: activeChatId,
        model: activeModel
      }
    })
  });

  useEffect(() => {
    if (status === 'ready') {
      fetch('/api/chats').then(res => res.json()).then(data => {
        if (data && data.length > 0) {
          setChats(data);
          if (!activeChatId && messages.length > 0) {
            setActiveChatId(data[0].id);
          }
        }
      });
    }
  }, [status]);

  const isThinking = status === 'submitted' || status === 'streaming';

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const handleSend = (text: string) => {
    append(
      { text },
      { body: { agent: activeAgent, chatId: activeChatId, model: activeModel } }
    );
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
            <div className="w-full h-full flex flex-col">
              <button 
                onClick={createNewChat} 
                className="w-full mb-6 p-3 rounded-xl bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] text-[var(--text-primary)] transition-colors flex items-center justify-center gap-2 text-sm font-medium"
              >
                <MessageSquarePlus className="w-4 h-4" />
                New Chat
              </button>
              <div className="flex justify-between items-center mb-4 px-2">
                <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" /> Recent
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="text-[var(--text-muted)] hover:text-white transition-colors">
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto flex flex-col gap-1 hide-scrollbar -mx-2 px-2 w-[240px]">
                {chats.length === 0 ? (
                  <div className="text-[var(--text-muted)] text-sm px-2 mt-4 italic opacity-50">No recent chats</div>
                ) : (
                  chats.map((chat) => (
                    <div 
                      key={chat.id}
                      onClick={() => loadChat(chat.id)}
                      className={cn(
                        "group relative w-full text-left p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between",
                        activeChatId === chat.id ? "bg-[rgba(255,255,255,0.1)] text-white" : "hover:bg-[rgba(255,255,255,0.05)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      )}
                    >
                      <div className="truncate text-sm font-medium pr-6">{chat.title || 'New Chat'}</div>
                      <button 
                        onClick={(e) => deleteChat(e, chat.id)}
                        className="absolute right-2 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-[rgba(255,255,255,0.1)] rounded-md transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  ))
                )}
              </div>
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
                  onClick={createNewChat} 
                  className="w-full mb-6 p-3 rounded-xl bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] text-[var(--text-primary)] transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <MessageSquarePlus className="w-4 h-4" />
                  New Chat
                </button>
                <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-4 px-2 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" /> Recent
                </div>
                <div className="flex-1 overflow-y-auto flex flex-col gap-1 hide-scrollbar -mx-2 px-2">
                  {chats.length === 0 ? (
                    <div className="text-[var(--text-muted)] text-sm px-2 mt-4 italic opacity-50">No recent chats</div>
                  ) : (
                    chats.map((chat) => (
                      <div 
                        key={chat.id}
                        onClick={() => loadChat(chat.id)}
                        className={cn(
                          "group relative w-full text-left p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between",
                          activeChatId === chat.id ? "bg-[rgba(255,255,255,0.1)] text-white" : "hover:bg-[rgba(255,255,255,0.05)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                        )}
                      >
                        <div className="truncate text-sm font-medium pr-6">{chat.title || 'New Chat'}</div>
                        <button 
                          onClick={(e) => deleteChat(e, chat.id)}
                          className="absolute right-2 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-[rgba(255,255,255,0.1)] rounded-md transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </div>
                    ))
                  )}
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
            <div className="flex items-center group mr-2">
              <div className="relative h-8 flex items-center">
                <img src="/logo-banner.png" alt="Vitreon AI" className="h-full w-auto object-contain" />
              </div>
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
              <div className="relative mb-8 group cursor-default flex justify-center">
                <img src="/logo.png" alt="Vitreon Logo" className="w-16 h-16 object-contain opacity-60 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
                <div className="absolute inset-0 bg-gradient-accent blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000 pointer-events-none" />
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
                  <ChatBubble key={msg.id} message={msg as CustomMessage} />
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

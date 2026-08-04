"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { GlassInput } from "@/components/glass/GlassInput";
import { Search, Pin, Trash2, Edit2, Clock, Hexagon, ArrowLeft } from "lucide-react";
import { agentsData } from "@/components/chat/AgentRail";
import { AgentId } from "@/store/useAppStore";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ChatHistoryItem = {
  id: string;
  title: string;
  snippet: string;
  agentIds: AgentId[];
  timestamp: Date;
  pinned: boolean;
};

// Mock data
const initialHistory: ChatHistoryItem[] = [
  { id: "1", title: "React Performance Optimization", snippet: "How can I reduce unnecessary re-renders in my large lists?", agentIds: ["refract", "prism"], timestamp: new Date(), pinned: true },
  { id: "2", title: "Q3 Marketing Strategy", snippet: "Let's brainstorm campaign angles for the new product launch.", agentIds: ["spectrum"], timestamp: new Date(Date.now() - 3600000 * 2), pinned: false },
  { id: "3", title: "User Data Analysis", snippet: "Can you chart this CSV data to find the drop-off point?", agentIds: ["facet", "prism"], timestamp: new Date(Date.now() - 86400000), pinned: false },
  { id: "4", title: "Sci-Fi Short Story", snippet: "The neon glow reflected off the wet pavement as...", agentIds: ["spectrum"], timestamp: new Date(Date.now() - 86400000 * 3), pinned: false },
  { id: "5", title: "Database Architecture", snippet: "PostgreSQL vs MongoDB for a chat application.", agentIds: ["refract", "lucent"], timestamp: new Date(Date.now() - 86400000 * 10), pinned: false },
];

export default function HistoryPage() {
  const [history, setHistory] = useState(initialHistory);
  const [search, setSearch] = useState("");

  const filteredHistory = history.filter(item => 
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.snippet.toLowerCase().includes(search.toLowerCase())
  );

  const togglePin = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setHistory(prev => {
      const idx = prev.findIndex(item => item.id === id);
      if (idx === -1) return prev;
      const newHistory = [...prev];
      newHistory[idx] = { ...newHistory[idx], pinned: !newHistory[idx].pinned };
      return newHistory;
    });
  };

  const deleteChat = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  // Grouping logic (simplified)
  const pinned = filteredHistory.filter(h => h.pinned);
  const unpinned = filteredHistory.filter(h => !h.pinned);

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col items-center pt-24 px-6 relative z-10">
      <div className="w-full max-w-4xl flex flex-col">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <Link href="/home" className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-white mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Chat</span>
            </Link>
            <h1 className="font-heading text-4xl font-bold">Chat History</h1>
          </div>
          <div className="w-full md:w-72">
            <GlassInput 
              label="Search conversations..." 
              icon={<Search className="w-4 h-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* History List */}
        <div className="flex flex-col gap-10 pb-20">
          
          {/* Pinned Section */}
          <AnimatePresence>
            {pinned.length > 0 && (
              <motion.div layout className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm font-semibold uppercase tracking-wider mb-2">
                  <Pin className="w-4 h-4" /> Pinned
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AnimatePresence>
                    {pinned.map(item => (
                      <HistoryCard key={item.id} item={item} onTogglePin={togglePin} onDelete={deleteChat} />
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Recent Section */}
          <AnimatePresence>
            {unpinned.length > 0 && (
              <motion.div layout className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm font-semibold uppercase tracking-wider mb-2">
                  <Clock className="w-4 h-4" /> Recent
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AnimatePresence>
                    {unpinned.map(item => (
                      <HistoryCard key={item.id} item={item} onTogglePin={togglePin} onDelete={deleteChat} />
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {filteredHistory.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 text-[var(--text-muted)] flex flex-col items-center">
              <img src="/logo.png" alt="No History" className="w-12 h-12 mb-4 opacity-30 grayscale" />
              <p>No conversations found.</p>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}

function HistoryCard({ item, onTogglePin, onDelete }: { item: ChatHistoryItem, onTogglePin: Function, onDelete: Function }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ layout: { type: "spring", stiffness: 300, damping: 30 } }}
    >
      <Link href="/home">
        <GlassPanel interactive className="p-5 flex flex-col group h-[160px]">
          
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold text-[var(--text-primary)] truncate pr-4">{item.title}</h3>
            
            {/* Hover Actions */}
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button 
                onClick={(e) => onTogglePin(item.id, e)} 
                className={cn("p-1.5 rounded-md hover:bg-[rgba(255,255,255,0.1)] transition-colors", item.pinned ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]")}
              >
                <Pin className="w-4 h-4" />
              </button>
              <button 
                onClick={(e) => onDelete(item.id, e)} 
                className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-red-400 hover:bg-[rgba(239,68,68,0.1)] transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <p className="text-sm text-[var(--text-muted)] line-clamp-2 mb-auto">
            {item.snippet}
          </p>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-[rgba(255,255,255,0.05)]">
            <div className="flex -space-x-2">
              {item.agentIds.map((id, i) => (
                <div key={id} className="relative w-6 h-6 rounded-full border border-[var(--bg-base)] z-10" style={{ zIndex: 10 - i }}>
                  <div className={cn("absolute inset-0 rounded-full", `bg-gradient-to-br ${agentsData[id].color}`)} />
                </div>
              ))}
            </div>
            <span className="text-xs text-[var(--text-muted)]">
              {item.timestamp.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </GlassPanel>
      </Link>
    </motion.div>
  );
}

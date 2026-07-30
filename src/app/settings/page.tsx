"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { GlassButton } from "@/components/glass/GlassButton";
import { useAppStore } from "@/store/useAppStore";
import { agentsData } from "@/components/chat/AgentRail";
import { Sun, Moon, Bell, Shield, Download, CheckCircle2, GripVertical, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { easings } from "@/lib/animations";
import gsap from "gsap";

const tabs = ["Appearance", "Agents", "Billing", "Notifications", "Privacy"];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col items-center pt-24 px-6 relative z-10 pb-24">
      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <Link href="/home" className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Chat</span>
          </Link>
          <h1 className="font-heading text-3xl font-bold mb-8">Settings</h1>
          
          <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto hide-scrollbar pb-4 md:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "relative px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left flex-shrink-0 outline-none",
                  activeTab === tab ? "text-[var(--text-primary)]" : "text-[var(--text-muted)] hover:text-white hover:bg-[rgba(255,255,255,0.05)]"
                )}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="settings-active-tab"
                    className="absolute inset-0 bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] rounded-xl z-0"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.3, ease: easings.expoOut }}
            >
              {activeTab === "Appearance" && <AppearanceTab onSave={() => showToast("Appearance updated")} />}
              {activeTab === "Agents" && <AgentsTab onSave={() => showToast("Agent preferences saved")} />}
              {activeTab === "Billing" && <BillingTab />}
              {(activeTab === "Notifications" || activeTab === "Privacy") && (
                <GlassPanel className="p-8 text-center text-[var(--text-muted)]">
                  Setting placeholders for {activeTab}.
                </GlassPanel>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-50 glass-panel-strong px-4 py-3 rounded-xl flex items-center gap-3 border border-[rgba(255,255,255,0.2)] shadow-2xl"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-400/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-components for Tabs

function AppearanceTab({ onSave }: { onSave: () => void }) {
  const { theme, setTheme, reducedMotion, setReducedMotion } = useAppStore();

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    
    // Animate color variables
    const isLight = newTheme === 'light';
    if (isLight) {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
    onSave();
  };

  const toggleMotion = () => {
    setReducedMotion(!reducedMotion);
    onSave();
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-heading text-2xl font-bold mb-2">Appearance</h2>
      
      <GlassPanel className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-1">Theme</h3>
            <p className="text-sm text-[var(--text-muted)]">Switch between dark and light modes.</p>
          </div>
          <button 
            onClick={toggleTheme}
            className="relative w-16 h-8 rounded-full bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] p-1 flex items-center outline-none"
          >
            <motion.div 
              layout
              className="w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center text-black"
              animate={{ x: theme === 'dark' ? 0 : 32 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              {theme === 'dark' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
            </motion.div>
          </button>
        </div>
      </GlassPanel>

      <GlassPanel className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-1">Reduced Motion</h3>
            <p className="text-sm text-[var(--text-muted)]">Disable 3D hover effects, drifting background, and complex animations.</p>
          </div>
          <button 
            onClick={toggleMotion}
            className={cn("relative w-14 h-7 rounded-full p-1 flex items-center transition-colors outline-none", reducedMotion ? "bg-emerald-500/50" : "bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)]")}
          >
            <motion.div 
              layout
              className="w-5 h-5 rounded-full bg-white shadow-md"
              animate={{ x: reducedMotion ? 28 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
        </div>
      </GlassPanel>
    </div>
  );
}

function AgentsTab({ onSave }: { onSave: () => void }) {
  const [agents, setAgents] = useState(Object.keys(agentsData).map(k => ({ id: k, ...agentsData[k as keyof typeof agentsData] })));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-heading text-2xl font-bold">Agent Rail</h2>
        <GlassButton variant="primary" onClick={onSave} className="py-1.5 px-4 text-sm">Save Order</GlassButton>
      </div>
      <p className="text-[var(--text-muted)] text-sm -mt-4 mb-4">Drag to reorder how agents appear in your rail.</p>

      <Reorder.Group axis="y" values={agents} onReorder={setAgents} className="flex flex-col gap-3">
        {agents.map((agent) => (
          <Reorder.Item key={agent.id} value={agent} className="outline-none">
            <GlassPanel interactive className="p-4 flex items-center gap-4 cursor-grab active:cursor-grabbing">
              <GripVertical className="w-5 h-5 text-[var(--text-muted)] opacity-50" />
              <div className="relative w-8 h-8 flex items-center justify-center flex-shrink-0">
                <div className={cn("absolute inset-0 rounded-full blur-md opacity-40", `bg-gradient-to-br ${agent.color}`)} />
                <div className={cn("relative w-6 h-6 rounded-full", `bg-gradient-to-br ${agent.color}`)} />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-[var(--text-primary)]">{agent.name}</span>
                <span className="text-xs text-[var(--text-muted)]">{agent.desc}</span>
              </div>
            </GlassPanel>
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  );
}

function BillingTab() {
  const history = [
    { id: "inv_1", date: "Oct 24, 2023", amount: 1499, status: "Paid" },
    { id: "inv_2", date: "Sep 24, 2023", amount: 1499, status: "Paid" },
    { id: "inv_3", date: "Aug 24, 2023", amount: 299, status: "Refunded" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <h2 className="font-heading text-2xl font-bold">Billing & Plans</h2>

      <GlassPanel className="p-8 relative overflow-hidden">
        {/* Accent glow for current plan */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-accent opacity-10 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="text-[var(--text-muted)] text-sm uppercase tracking-wider mb-2">Current Plan</div>
            <h3 className="font-heading text-3xl font-bold mb-2 flex items-center gap-3">
              Pro <span className="text-sm font-medium px-2 py-0.5 rounded bg-[rgba(255,255,255,0.1)] text-[var(--text-primary)] align-middle">Monthly</span>
            </h3>
            <p className="text-[var(--text-muted)]">₹1,499/mo • Renews Nov 24, 2023</p>
          </div>
          <Link href="/pricing">
            <GlassButton variant="primary">Manage Plan</GlassButton>
          </Link>
        </div>
      </GlassPanel>

      <div>
        <h3 className="font-semibold text-[var(--text-primary)] mb-4">Payment History</h3>
        <div className="flex flex-col gap-3">
          {history.map((inv) => (
            <GlassPanel key={inv.id} className="p-4 flex items-center justify-between hover:bg-[rgba(255,255,255,0.08)] transition-colors">
              <div className="flex items-center gap-4 md:gap-8">
                <div className="text-sm text-[var(--text-primary)] font-medium w-24">{inv.date}</div>
                <div className="text-sm text-[var(--text-muted)]">₹{inv.amount.toLocaleString()}</div>
                <div className={cn(
                  "text-xs px-2 py-1 rounded-md font-medium",
                  inv.status === "Paid" ? "bg-emerald-500/10 text-emerald-400" : "bg-[rgba(255,255,255,0.1)] text-[var(--text-muted)]"
                )}>
                  {inv.status}
                </div>
              </div>
              <button className="p-2 text-[var(--text-muted)] hover:text-white hover:bg-[rgba(255,255,255,0.1)] rounded-md transition-colors">
                <Download className="w-4 h-4" />
              </button>
            </GlassPanel>
          ))}
        </div>
      </div>
    </div>
  );
}

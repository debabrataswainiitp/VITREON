import Link from "next/link";
import { StarryBackground } from "@/components/layout/StarryBackground";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { GlassButton } from "@/components/glass/GlassButton";
import { MessageSquarePlus, Home, Zap, Bot, History } from "lucide-react";

export default function DashboardPage() {
  const stats = [
    { title: "Total Chats", value: "24", icon: <MessageSquarePlus className="w-5 h-5" />, color: "text-[var(--color-orb-cyan)]" },
    { title: "Tokens Used", value: "14.2k", icon: <Zap className="w-5 h-5" />, color: "text-[var(--color-orb-pink)]" },
    { title: "Active Agents", value: "3", icon: <Bot className="w-5 h-5" />, color: "text-[var(--color-orb-purple)]" },
  ];

  const recentChats = [
    { title: "React Performance Optimization", date: "Today", agent: "Prism" },
    { title: "Database Schema Design", date: "Yesterday", agent: "Architect" },
    { title: "Authentication Flow Debugging", date: "Aug 1", agent: "Security" },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 relative flex flex-col">
      <StarryBackground />
      
      <main className="flex-1 relative z-10 w-full max-w-6xl mx-auto px-4 lg:px-8 pt-4">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-[var(--text-primary)] mb-2">
              Dashboard
            </h1>
            <p className="text-[var(--text-muted)] text-lg">
              Manage your workspace, usage, and recent activity.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/">
              <GlassButton className="flex items-center gap-2 text-[var(--text-primary)]">
                <Home className="w-4 h-4" />
                <span>Return to Home</span>
              </GlassButton>
            </Link>
            <Link href="/home">
              <GlassButton variant="primary" className="flex items-center gap-2">
                <MessageSquarePlus className="w-4 h-4" />
                <span>New Chat</span>
              </GlassButton>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, i) => (
            <GlassPanel key={i} className="p-6 rounded-2xl flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[var(--text-muted)] font-medium">{stat.title}</h3>
                <div className={`p-2 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
              <p className="text-3xl font-heading font-bold text-[var(--text-primary)]">
                {stat.value}
              </p>
            </GlassPanel>
          ))}
        </div>

        {/* Recent Activity Section */}
        <div>
          <h2 className="text-2xl font-heading font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-2">
            <History className="w-6 h-6 text-[var(--text-muted)]" />
            Recent Activity
          </h2>
          
          <div className="flex flex-col gap-4">
            {recentChats.map((chat, i) => (
              <GlassPanel key={i} className="p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:bg-[rgba(255,255,255,0.08)] cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-[var(--text-primary)]">
                    <MessageSquarePlus className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div>
                    <h4 className="text-[var(--text-primary)] font-medium text-lg group-hover:text-[var(--color-orb-cyan)] transition-colors">
                      {chat.title}
                    </h4>
                    <p className="text-[var(--text-muted)] text-sm">
                      Agent: <span className="text-[var(--text-primary)] opacity-80">{chat.agent}</span>
                    </p>
                  </div>
                </div>
                <div className="text-[var(--text-muted)] text-sm font-medium">
                  {chat.date}
                </div>
              </GlassPanel>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}

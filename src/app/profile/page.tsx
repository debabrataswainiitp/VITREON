"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassInput } from "@/components/glass/GlassInput";
import { User, Mail, LogOut, Trash2, ArrowLeft, Hexagon } from "lucide-react";
import Link from "next/link";
import gsap from "gsap";
import { useAppStore } from "@/store/useAppStore";
import { agentsData } from "@/components/chat/AgentRail";
import { useUser, useClerk } from "@clerk/nextjs";
import { easings } from "@/lib/animations";

export default function ProfilePage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const reducedMotion = useAppStore(s => s.reducedMotion);
  
  // Stats refs for counting up
  const chatsRef = useRef<HTMLDivElement>(null);
  const daysRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (reducedMotion) return;

    // Count up animation
    const ctx = gsap.context(() => {
      if (chatsRef.current) {
        gsap.to(chatsRef.current, {
          innerHTML: 342,
          duration: 2,
          snap: { innerHTML: 1 },
          ease: "power2.out"
        });
      }
      if (daysRef.current) {
        gsap.to(daysRef.current, {
          innerHTML: 45,
          duration: 1.5,
          snap: { innerHTML: 1 },
          ease: "power2.out"
        });
      }
      
      // Timeline draw animation
      if (timelineRef.current) {
        const length = timelineRef.current.getTotalLength();
        gsap.set(timelineRef.current, { strokeDasharray: length, strokeDashoffset: length });
        gsap.to(timelineRef.current, {
          strokeDashoffset: 0,
          duration: 1.5,
          delay: 0.5,
          ease: "power2.out"
        });
      }
    });

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col items-center pt-24 px-6 relative z-10 pb-24">
      <div className="w-full max-w-3xl flex flex-col">
        
        <Link href="/" className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Chat</span>
        </Link>

        {/* Profile Header */}
        <GlassPanel className="p-8 mb-8 overflow-visible">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-full p-1 relative z-10 bg-[var(--bg-base)]">
                {/* Rotating gradient border */}
                <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,#7C5CFC,#4FD8E8,#FF6FA5,#7C5CFC)] animate-[spin_4s_linear_infinite]" />
                <div className="absolute inset-1 rounded-full bg-[var(--bg-base)] flex items-center justify-center overflow-hidden">
                  <User className="w-12 h-12 text-[var(--text-muted)]" />
                </div>
              </div>
              
              {isEditing && (
                <div className="absolute inset-1 z-20 rounded-full bg-black/60 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                  <span className="text-xs font-semibold text-white">Upload</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left flex flex-col justify-center w-full">
              <AnimatePresence mode="wait">
                {!isEditing ? (
                  <motion.div 
                    key="view"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex flex-col"
                  >
                    <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)] mb-1">{user?.fullName || "Guest"}</h1>
                    <p className="text-[var(--text-muted)] mb-4">{user?.primaryEmailAddress?.emailAddress || "guest@example.com"}</p>
                    <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-[var(--text-muted)] mb-6">
                      <Hexagon className="w-4 h-4 text-emerald-400" />
                      <span>Member • Since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'recently'}</span>
                    </div>
                    <div>
                      <GlassButton onClick={() => setIsEditing(true)}>Edit Profile</GlassButton>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form 
                    key="edit"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col gap-4 w-full"
                    onSubmit={(e) => { e.preventDefault(); setIsEditing(false); }}
                  >
                    <GlassInput label="Full Name" defaultValue={user?.fullName || ""} icon={<User className="w-4 h-4" />} />
                    <GlassInput label="Email" defaultValue={user?.primaryEmailAddress?.emailAddress || ""} type="email" icon={<Mail className="w-4 h-4" />} />
                    <div className="flex gap-3 mt-2">
                      <GlassButton variant="primary" type="submit">Save Changes</GlassButton>
                      <GlassButton variant="ghost" type="button" onClick={() => setIsEditing(false)}>Cancel</GlassButton>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </GlassPanel>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <GlassPanel className="p-6 text-center">
            <div className="text-[var(--text-muted)] text-sm uppercase tracking-wider mb-2">Total Chats</div>
            <div ref={chatsRef} className="font-heading text-4xl font-bold text-[#7C5CFC]">
              0
            </div>
          </GlassPanel>
          <GlassPanel className="p-6 text-center flex flex-col items-center">
            <div className="text-[var(--text-muted)] text-sm uppercase tracking-wider mb-2">Favorite Agent</div>
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${agentsData.refract.color}`} />
              <span className="font-heading text-xl font-bold text-[var(--text-primary)]">Refract</span>
            </div>
          </GlassPanel>
          <GlassPanel className="p-6 text-center">
            <div className="text-[var(--text-muted)] text-sm uppercase tracking-wider mb-2">Days Active</div>
            <div ref={daysRef} className="font-heading text-4xl font-bold text-[var(--text-primary)]">
              0
            </div>
          </GlassPanel>
        </div>

        {/* Activity Timeline */}
        <div className="mb-16">
          <h2 className="font-heading text-2xl font-bold mb-8">Recent Activity</h2>
          
          <div className="relative pl-6">
            <svg className="absolute left-[11px] top-2 bottom-0 w-1 h-full overflow-visible z-0">
              <path 
                ref={timelineRef}
                d="M 0 0 L 0 300" 
                stroke="rgba(255,255,255,0.15)" 
                strokeWidth="2" 
                fill="none" 
              />
            </svg>
            
            <div className="flex flex-col gap-8 relative z-10">
              {[
                { title: "Chat with Refract & Prism", time: "2 hours ago", desc: "React Performance Optimization" },
                { title: "Subscription Renewed", time: "2 days ago", desc: "Pro Plan - Monthly" },
                { title: "Chat with Spectrum", time: "4 days ago", desc: "Q3 Marketing Strategy" }
              ].map((act, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[30px] top-1.5 w-3 h-3 rounded-full bg-[rgba(255,255,255,0.2)] border-2 border-[var(--bg-base)]" />
                  <h4 className="font-semibold text-[var(--text-primary)]">{act.title}</h4>
                  <p className="text-sm text-[var(--text-muted)] mb-1">{act.desc}</p>
                  <span className="text-xs text-[var(--text-muted)] opacity-60">{act.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="border-t border-[rgba(255,255,255,0.05)] pt-12">
          <h2 className="font-heading text-xl font-bold mb-4 text-red-400">Danger Zone</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <GlassButton variant="ghost" onClick={() => signOut()} className="text-[var(--text-muted)] hover:text-white">
              <LogOut className="w-4 h-4 mr-2" /> Log Out
            </GlassButton>
            <GlassButton variant="danger" onClick={() => setShowDeleteModal(true)}>
              <Trash2 className="w-4 h-4 mr-2" /> Delete Account
            </GlassButton>
          </div>
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ ease: easings.expoOut }}
              className="w-full max-w-sm"
            >
              <GlassPanel className="p-6">
                <h3 className="font-heading text-xl font-bold text-white mb-2">Delete Account?</h3>
                <p className="text-sm text-[var(--text-muted)] mb-6">
                  This action cannot be undone. All your chats, custom instructions, and preferences will be permanently erased.
                </p>
                <div className="flex gap-3 justify-end">
                  <GlassButton variant="ghost" onClick={() => setShowDeleteModal(false)}>Cancel</GlassButton>
                  <GlassButton variant="danger" onClick={() => setShowDeleteModal(false)}>Yes, delete it</GlassButton>
                </div>
              </GlassPanel>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

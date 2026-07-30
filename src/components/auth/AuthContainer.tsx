"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { GlassPanel } from "../glass/GlassPanel";
import { GlassInput } from "../glass/GlassInput";
import { Hexagon, Check, Mail, Lock, User } from "lucide-react";
import { easings } from "@/lib/animations";
import gsap from "gsap";

export function AuthContainer({ initialMode = "login" }: { initialMode?: "login" | "signup" }) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const submitBtnRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  const handleToggle = (newMode: "login" | "signup") => {
    setMode(newMode);
    window.history.replaceState(null, "", `/${newMode}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    
    setIsLoading(true);
    
    // Simulate auth loading animation
    if (submitBtnRef.current) {
      const btn = submitBtnRef.current;
      const originalWidth = btn.offsetWidth;
      
      const tl = gsap.timeline();
      
      // Morph to circle spinner
      tl.to(btn, {
        width: 56, // Match height roughly
        color: "transparent",
        duration: 0.4,
        ease: "power2.inOut",
      })
      .to(btn, {
        rotation: 360,
        duration: 1,
        ease: "linear",
        repeat: 1,
      })
      .to(btn, {
        rotation: 0,
        duration: 0,
      })
      .to(btn, {
        width: originalWidth,
        color: "white",
        duration: 0.4,
        ease: "power2.inOut",
        onStart: () => setIsSuccess(true)
      })
      .add(() => {
        setTimeout(() => router.push("/home"), 400);
      }, "+=0.2");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative z-10">
      
      {/* Absolute Logo at top */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <Hexagon className="w-10 h-10 text-[var(--text-primary)]" />
        <span className="font-heading font-bold tracking-widest text-sm text-[var(--text-muted)]">VITREON</span>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.5, ease: easings.expoOut }}
        className="w-full max-w-[420px]"
      >
        <GlassPanel className="p-8">
          
          {/* Tabs */}
          <div className="flex relative mb-8 border-b border-[rgba(255,255,255,0.1)] pb-2">
            <button 
              onClick={() => handleToggle("login")}
              className={`flex-1 text-center font-medium py-2 transition-colors duration-300 ${mode === "login" ? "text-[var(--text-primary)]" : "text-[var(--text-muted)] hover:text-white"}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => handleToggle("signup")}
              className={`flex-1 text-center font-medium py-2 transition-colors duration-300 ${mode === "signup" ? "text-[var(--text-primary)]" : "text-[var(--text-muted)] hover:text-white"}`}
            >
              Sign Up
            </button>
            <motion.div
              layoutId="auth-tab-indicator"
              className="absolute bottom-0 left-0 h-[2px] w-1/2 bg-gradient-accent"
              initial={false}
              animate={{ x: mode === "login" ? "0%" : "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {mode === "signup" && (
              <motion.div
                initial={{ opacity: 0, height: 0, overflow: "hidden" }}
                animate={{ opacity: 1, height: "auto", overflow: "visible" }}
                exit={{ opacity: 0, height: 0, overflow: "hidden" }}
              >
                <GlassInput label="Full Name" icon={<User className="w-5 h-5" />} required />
              </motion.div>
            )}
            
            <GlassInput label="Email Address" type="email" icon={<Mail className="w-5 h-5" />} required />
            <GlassInput label="Password" type="password" icon={<Lock className="w-5 h-5" />} required />
            
            {mode === "login" && (
              <div className="flex justify-end -mt-2 mb-2">
                <a href="#" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">Forgot password?</a>
              </div>
            )}

            <button
              ref={submitBtnRef}
              type="submit"
              className="relative w-full h-[56px] rounded-xl font-medium flex items-center justify-center overflow-hidden bg-gradient-accent text-white shadow-lg transition-all mx-auto mt-2 outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              {!isLoading && !isSuccess && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {mode === "login" ? "Sign In" : "Create Account"}
                </motion.span>
              )}
              {isLoading && !isSuccess && (
                <div className="absolute inset-0 border-2 border-white/20 border-t-white rounded-full animate-spin m-2 pointer-events-none opacity-0" 
                     ref={el => { if (el) gsap.to(el, { opacity: 1, delay: 0.3 }) }} 
                />
              )}
              {isSuccess && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute flex items-center justify-center text-white">
                  <Check className="w-6 h-6" />
                </motion.div>
              )}
            </button>

            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-[rgba(255,255,255,0.1)]"></div>
              <span className="flex-shrink-0 mx-4 text-xs text-[var(--text-muted)] uppercase tracking-wider">Or continue with</span>
              <div className="flex-grow border-t border-[rgba(255,255,255,0.1)]"></div>
            </div>

            <div className="flex gap-4">
              <button type="button" className="flex-1 h-[48px] rounded-xl flex items-center justify-center gap-2 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] text-[var(--text-primary)] transition-colors text-sm font-medium">
                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              <button type="button" className="flex-1 h-[48px] rounded-xl flex items-center justify-center gap-2 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] text-[var(--text-primary)] transition-colors text-sm font-medium">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </button>
            </div>
          </form>
        </GlassPanel>
      </motion.div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { GlassButton } from "../glass/GlassButton";
import { Menu, X } from "lucide-react";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";



export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("");
  const { isSignedIn } = useAuth();

  // Sync activeTab with pathname on mount (for /pricing)
  useEffect(() => {
    if (pathname === "/pricing" && activeTab !== "/pricing") {
      setTimeout(() => setActiveTab("/pricing"), 0);
    }
  }, [pathname, activeTab]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (pathname === "/chat" || pathname === "/pricing") {
    return null;
  }

  const baseNavLinks = [
    { label: "Agents", href: "/#agents" },
    { label: "How it works", href: "/#how-it-works" },
    { label: "Pricing", href: "/pricing" },
  ];

  const navLinks = isSignedIn 
    ? [...baseNavLinks, { label: "Chat", href: "/chat" }]
    : baseNavLinks;

  return (
    <>
      <motion.header
        className={cn(
          "fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-500 border",
          scrolled 
            ? "top-0 w-full max-w-full rounded-none md:rounded-b-3xl backdrop-blur-md py-3" 
            : "top-6 w-[calc(100%-3rem)] max-w-4xl rounded-full backdrop-blur-md py-2"
        )}
        style={{
          background: "var(--glass-nav)",
          borderColor: "var(--glass-border)",
          boxShadow: "var(--glass-shadow)"
        }}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link 
            href="/" 
            className="flex items-center group -ml-2 md:-ml-4"
            onMouseEnter={() => document.documentElement.style.setProperty('--logo-hover', '1')}
            onMouseLeave={() => document.documentElement.style.setProperty('--logo-hover', '0')}
          >
            <div className="relative h-12 sm:h-14 flex items-center py-1 overflow-visible">
              <motion.img 
                src="/logo.png" 
                alt="Vitreon AI" 
                className="h-full w-auto object-contain" 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 1.4, ease: "easeInOut" }}
              />
              <div className="absolute inset-0 bg-gradient-accent blur-md opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none" />
            </div>
            
            <AnimatePresence>
              {scrolled && (
                <motion.span
                  initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                  animate={{ opacity: 1, width: "auto", marginLeft: 12 }}
                  exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="font-heading font-bold text-xl tracking-wider text-[var(--text-primary)] overflow-hidden whitespace-nowrap"
                >
                  VITREON
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-2 relative">
              {navLinks.map((link) => {
                const isActive = activeTab === link.href;
                return (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    onClick={() => setActiveTab(link.href)}
                    className="relative px-4 py-1.5 text-sm font-medium transition-colors z-10"
                  >
                    <span className={cn("relative z-10 transition-colors duration-300", isActive ? "text-[var(--text-primary)] font-semibold" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]")}>
                      {link.label}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="navbar-active-pill"
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: "var(--text-primary)",
                          opacity: 0.1
                        }}
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
            <div className="flex items-center gap-4">
              {!isSignedIn ? (
                <>
                  <SignInButton mode="modal">
                    <button className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">Sign In</button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <GlassButton variant="primary" className="py-1.5 px-4 text-sm cursor-pointer">Get Started</GlassButton>
                  </SignUpButton>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <CreditsDisplay />
                  <UserButton />
                </div>
              )}
            </div>
          </nav>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden p-2 text-[var(--text-primary)]"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu suppressHydrationWarning className="w-6 h-6" />
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="fixed inset-0 z-[100] bg-[rgba(10,11,16,0.8)] flex flex-col px-6 py-8"
          >
            <div className="flex justify-end">
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.1)] rounded-full transition-colors"
              >
                <X suppressHydrationWarning className="w-6 h-6" />
              </button>
            </div>
            
            <nav className="flex flex-col gap-6 mt-12">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                >
                  <Link 
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-3xl font-heading font-semibold text-[var(--text-primary)]"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-8 flex flex-col gap-4"
              >
                {!isSignedIn ? (
                  <>
                    <SignInButton mode="modal">
                      <GlassButton className="w-full justify-center cursor-pointer" onClick={() => setMobileMenuOpen(false)}>Sign In</GlassButton>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <GlassButton variant="primary" className="w-full justify-center cursor-pointer" onClick={() => setMobileMenuOpen(false)}>Get Started</GlassButton>
                    </SignUpButton>
                  </>
                ) : (
                  <div className="flex items-center justify-center p-4 bg-[rgba(255,255,255,0.05)] rounded-2xl border border-[rgba(255,255,255,0.1)]">
                    <UserButton />
                    <span className="ml-3 text-[var(--text-primary)] font-medium">Your Account</span>
                  </div>
                )}
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ProgressRing({ percentage, text, colorClass = "text-emerald-500" }: { percentage: number, text: string, colorClass?: string }) {
  const radius = 22;
  const stroke = 4;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex items-center gap-2">
      <span className="text-[13px] font-bold text-[var(--text-primary)]">{text}</span>
      <div className="relative flex items-center justify-center" style={{ width: radius * 2, height: radius * 2 }}>
        <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg] absolute">
          <circle
            stroke="rgba(255,255,255,0.15)"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset, transition: "stroke-dashoffset 0.5s ease-in-out" }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className={colorClass}
          />
        </svg>
      </div>
    </div>
  );
}

function CreditsDisplay() {
  const [data, setData] = useState<{ credits: number, subscriptionCredits: number, plan: string | null } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
    const fetchCredits = () => {
      fetch(`/api/user/credits?t=${Date.now()}`)
        .then(res => res.json())
        .then(setData)
        .catch(console.error);
    };

    fetchCredits();

    window.addEventListener("focus", fetchCredits);
    return () => window.removeEventListener("focus", fetchCredits);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) return <div className="w-24 h-9 animate-pulse bg-white/5 rounded-full" />;
  if (!data) return <div className="w-24 h-9 animate-pulse bg-white/5 rounded-full" />;

  const totalCredits = data.credits + data.subscriptionCredits;

  const maxSub = data.plan?.toLowerCase() === "starter" ? 300 : data.plan?.toLowerCase() === "pro" ? 2000 : Math.max(data.subscriptionCredits, 1);
  const subPercentage = data.subscriptionCredits >= 999000 ? 100 : Math.min(100, Math.round((data.subscriptionCredits / maxSub) * 100));
  const subPercentageText = data.subscriptionCredits >= 999000 ? "∞" : `${subPercentage}%`;

  // Use localStorage to track the "high water mark" of instant credits for an accurate progress ring
  const storedMax = typeof window !== 'undefined' ? parseInt(localStorage.getItem('maxInstantCredits') || '0') : 0;
  const maxInstant = Math.max(storedMax, data.credits, 100);
  
  if (typeof window !== 'undefined' && data.credits > storedMax) {
    localStorage.setItem('maxInstantCredits', data.credits.toString());
  }

  const instantPercentage = data.credits === 0 ? 0 : Math.min(100, Math.round((data.credits / maxInstant) * 100));
  const instantPercentageText = `${instantPercentage}%`;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-1.5 min-h-[38px] rounded-full bg-gradient-to-r from-[rgba(99,102,241,0.15)] to-[rgba(6,182,212,0.15)] border border-[rgba(99,102,241,0.3)] shadow-[0_0_15px_rgba(99,102,241,0.1)] hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:border-[rgba(99,102,241,0.5)] outline-none transition-all duration-300"
      >
        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]" />
        
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          {data.plan && (
            <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-400 mr-1 opacity-90">
              {data.plan}
            </span>
          )}
          <span className="text-[15px] font-bold text-[var(--text-primary)] tracking-wide">
            {totalCredits >= 999000 ? "∞" : totalCredits.toLocaleString()}
          </span>
          <span className="text-[var(--text-muted)] font-medium text-xs uppercase tracking-wider">
            credits
          </span>
          {/* Yellow Coin SVG */}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400 shrink-0 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)] ml-1">
            <circle cx="8" cy="8" r="6"/>
            <path d="M18.09 10.37A6 6 0 1 1 10.34 18"/>
            <path d="M7 6h1v4"/>
            <path d="m16.71 13.88.7.71-2.82 2.82"/>
          </svg>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-72 rounded-2xl bg-[rgba(25,26,35,0.95)] backdrop-blur-2xl border border-[rgba(255,255,255,0.1)] shadow-2xl overflow-hidden z-50 flex flex-col p-4"
          >
            <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-4">Credit Balance</div>
            
            <div className="flex justify-between items-center mb-4">
              <div className="flex flex-col">
                <span className="text-sm text-[var(--text-primary)] font-medium mb-1">Subscription</span>
                <span className="text-xs text-[var(--text-muted)]">Remaining: {data.subscriptionCredits >= 999000 ? "∞" : data.subscriptionCredits.toLocaleString()}</span>
              </div>
              <ProgressRing percentage={subPercentage} text={subPercentageText} colorClass="text-emerald-500" />
            </div>
            
            <div className="flex justify-between items-center pb-4 border-b border-[rgba(255,255,255,0.1)] mb-4">
              <div className="flex flex-col">
                <span className="text-sm text-[var(--text-primary)] font-medium mb-1">Instant Packs</span>
                <span className="text-xs text-[var(--text-muted)]">Remaining: {data.credits.toLocaleString()}</span>
              </div>
              <ProgressRing percentage={instantPercentage} text={instantPercentageText} colorClass="text-cyan-500" />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--text-muted)]">Total Available</span>
              <span className="text-sm font-bold text-white">{totalCredits >= 999000 ? "∞" : totalCredits.toLocaleString()}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

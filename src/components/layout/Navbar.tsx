"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { GlassButton } from "../glass/GlassButton";
import { Hexagon, Menu, X } from "lucide-react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("");

  // Sync activeTab with pathname on mount (for /pricing)
  useEffect(() => {
    if (pathname === "/pricing") setActiveTab("/pricing");
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Agents", href: "/#agents" },
    { label: "How it works", href: "/#how-it-works" },
    { label: "Pricing", href: "/pricing" },
  ];

  return (
    <>
      <motion.header
        className={cn(
          "fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-500 overflow-hidden",
          scrolled 
            ? "top-0 w-full max-w-full rounded-none md:rounded-b-3xl bg-[rgba(10,11,16,0.6)] backdrop-blur-xl border-b border-[rgba(255,255,255,0.1)] py-3 shadow-[0_10px_40px_rgba(0,0,0,0.3)]" 
            : "top-6 w-[calc(100%-3rem)] max-w-4xl rounded-full bg-[rgba(255,255,255,0.05)] backdrop-blur-md border border-[rgba(255,255,255,0.1)] py-2 shadow-2xl"
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Hexagon className="w-8 h-8 text-[var(--text-primary)] transition-transform duration-500 group-hover:rotate-90" />
              <div className="absolute inset-0 bg-gradient-accent blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
            </div>
            <span className="font-heading font-bold text-xl tracking-tight">Vitreon</span>
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
                    <span className={cn("relative z-10 transition-colors duration-300", isActive ? "text-black font-semibold" : "text-[var(--text-muted)] hover:text-white")}>
                      {link.label}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="navbar-active-pill"
                        className="absolute inset-0 bg-white/90 backdrop-blur-md rounded-full shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <span className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">Sign In</span>
              </Link>
              <Link href="/signup">
                <GlassButton variant="primary" className="py-1.5 px-4 text-sm">Get Started</GlassButton>
              </Link>
            </div>
          </nav>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden p-2 text-[var(--text-primary)]"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
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
                <X className="w-6 h-6" />
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
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <GlassButton className="w-full justify-center">Sign In</GlassButton>
                </Link>
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <GlassButton variant="primary" className="w-full justify-center">Get Started</GlassButton>
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

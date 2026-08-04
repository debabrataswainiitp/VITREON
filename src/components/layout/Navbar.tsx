"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { GlassButton } from "../glass/GlassButton";
import { Hexagon, Menu, X } from "lucide-react";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";



export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("");
  const { isSignedIn } = useAuth();

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
          "fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-500 overflow-hidden border",
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
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
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
                  <SignInButton mode="modal" asChild>
                    <button className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">Sign In</button>
                  </SignInButton>
                  <SignUpButton mode="modal" asChild>
                    <GlassButton variant="primary" className="py-1.5 px-4 text-sm cursor-pointer">Get Started</GlassButton>
                  </SignUpButton>
                </>
              ) : (
                <UserButton />
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
                    <SignInButton mode="modal" asChild>
                      <GlassButton className="w-full justify-center cursor-pointer" onClick={() => setMobileMenuOpen(false)}>Sign In</GlassButton>
                    </SignInButton>
                    <SignUpButton mode="modal" asChild>
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

import Link from "next/link";
import { Hexagon } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-[var(--glass-border)] bg-[rgba(10,11,16,0.3)] backdrop-blur-md pt-16 pb-8 px-6 mt-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Hexagon className="w-6 h-6 text-white" />
            <span className="font-heading font-bold text-lg tracking-tight">Vitreon</span>
          </Link>
          <p className="text-[var(--text-muted)] text-sm max-w-xs">
            Clarity, orchestrated. The liquid glass multi-agent platform.
          </p>
        </div>
        
        <div className="flex gap-8 text-sm">
          <div className="flex flex-col gap-3">
            <span className="font-semibold text-[var(--text-primary)]">Product</span>
            <Link href="/#agents" className="text-[var(--text-muted)] hover:text-white transition-colors">Agents</Link>
            <Link href="/pricing" className="text-[var(--text-muted)] hover:text-white transition-colors">Pricing</Link>
          </div>
          <div className="flex flex-col gap-3">
            <span className="font-semibold text-[var(--text-primary)]">Legal</span>
            <Link href="#" className="text-[var(--text-muted)] hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="text-[var(--text-muted)] hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-[rgba(255,255,255,0.05)] text-center text-xs text-[var(--text-muted)]">
        © {new Date().getFullYear()} Vitreon Inc. All rights reserved.
      </div>
    </footer>
  );
}

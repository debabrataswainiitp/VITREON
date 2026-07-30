"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { GlassButton } from "@/components/glass/GlassButton";
import { Check, ChevronDown, Sparkles, Zap, Flame, ArrowLeft } from "lucide-react";
import Script from "next/script";
import { easings } from "@/lib/animations";
import { cn } from "@/lib/utils";
import Link from "next/link";
import gsap from "gsap";
import { useRouter } from "next/navigation";

type PricingMode = "subscription" | "credits";
type BillingCycle = "monthly" | "yearly";

const subPlans = [
  { id: "starter", name: "Starter", monthly: 499, yearly: 4999, desc: "2 agents (Prism + 1 specialist), 300 messages/mo, standard response speed" },
  { id: "pro", name: "Pro", monthly: 1499, yearly: 14999, popular: true, desc: "All 6 agents, 2,000 messages/mo, priority response speed, chat export" },
  { id: "team", name: "Team", monthly: 3999, yearly: 39999, desc: "All 6 agents, unlimited messages, 5 seats, shared workspace, priority support" },
];

const creditPacks = [
  { id: "spark", name: "Spark", amount: 200, price: 299, icon: Sparkles, desc: "~1 credit per message, varies by agent." },
  { id: "surge", name: "Surge", amount: 1000, price: 1299, popular: true, icon: Zap, desc: "~1 credit per message, varies by agent." },
  { id: "flood", name: "Flood", amount: 5000, price: 5499, icon: Flame, desc: "~1 credit per message, varies by agent." },
];

const faqs = [
  { q: "Do credits expire?", a: "No, instant credits never expire and will remain in your account until you use them. They stack perfectly with active subscriptions." },
  { q: "Can I get a GST invoice?", a: "Yes, you can enter your GST details during checkout to receive a compliant tax invoice." },
  { q: "What payment methods are supported?", a: "We support UPI, all major credit/debit cards, Netbanking, and popular wallets via our Razorpay integration." },
];

export default function PricingPage() {
  const [mode, setMode] = useState<PricingMode>("subscription");
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const router = useRouter();

  const handleCheckout = async (itemId: string, itemType: "sub" | "pack", amount: number) => {
    setLoadingId(itemId);
    
    try {
      const isSub = itemType === "sub";
      const endpoint = isSub ? "/api/razorpay/create-subscription" : "/api/razorpay/create-order";
      
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isSub ? { planId: itemId, cycle } : { packId: itemId, amount })
      });
      
      const data = await res.json();
      
      // If we are in mock mode from our backend
      if (data.mock) {
        setTimeout(() => {
          setSuccessId(itemId);
          setTimeout(() => router.push("/home"), 1000);
        }, 1500);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_dummy",
        amount: data.amount,
        currency: "INR",
        name: "Vitreon",
        description: isSub ? `${itemId} Subscription` : `${itemId} Credits`,
        order_id: !isSub ? data.id : undefined,
        subscription_id: isSub ? data.id : undefined,
        handler: async function (response: any) {
          const verifyRes = await fetch(isSub ? "/api/razorpay/verify-subscription" : "/api/razorpay/verify-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response)
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            setSuccessId(itemId);
            setTimeout(() => router.push("/home"), 1000);
          } else {
            alert("Payment verification failed");
            setLoadingId(null);
          }
        },
        prefill: {
          name: "Alex Chen",
          email: "alex@example.com",
        },
        theme: { color: "#7C5CFC" },
        modal: {
          ondismiss: function() {
            setLoadingId(null);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        alert(response.error.description);
        setLoadingId(null);
      });
      rzp.open();

    } catch (err) {
      console.error(err);
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen pt-24 px-6 pb-24 relative z-10">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
      <div className="max-w-5xl mx-auto flex flex-col items-center">
        
        <div className="w-full mb-12 flex items-center justify-center relative">
          <Link href="/" className="absolute left-0 inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="text-center">
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">Pricing that scales</h1>
            <p className="text-[var(--text-muted)] text-lg">Choose the perfect plan for your clarity.</p>
          </div>
        </div>

        {/* Mode Switcher */}
        <GlassPanel className="p-1 mb-10 flex w-full max-w-sm rounded-2xl relative">
          <button 
            onClick={() => setMode("subscription")}
            className={cn("flex-1 py-3 text-sm font-semibold transition-colors z-10", mode === "subscription" ? "text-white" : "text-[var(--text-muted)] hover:text-white")}
          >
            Subscription
          </button>
          <button 
            onClick={() => setMode("credits")}
            className={cn("flex-1 py-3 text-sm font-semibold transition-colors z-10", mode === "credits" ? "text-white" : "text-[var(--text-muted)] hover:text-white")}
          >
            Instant Credits
          </button>
          <motion.div 
            layoutId="pricing-mode"
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] rounded-xl z-0"
            animate={{ left: mode === "subscription" ? "4px" : "calc(50%)" }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        </GlassPanel>

        {/* Content Area */}
        <div className="w-full min-h-[500px]">
          <AnimatePresence mode="wait">
            
            {/* Subscription Mode */}
            {mode === "subscription" && (
              <motion.div 
                key="sub"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center w-full"
              >
                {/* Billing Cycle Toggle */}
                <div className="flex items-center gap-3 mb-10 relative">
                  <span className={cn("text-sm transition-colors", cycle === "monthly" ? "text-white" : "text-[var(--text-muted)]")}>Monthly</span>
                  <button 
                    onClick={() => setCycle(c => c === "monthly" ? "yearly" : "monthly")}
                    className="w-12 h-6 rounded-full bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] relative p-1 flex items-center transition-colors"
                  >
                    <motion.div 
                      layout
                      className="w-4 h-4 rounded-full bg-white shadow-sm"
                      animate={{ x: cycle === "monthly" ? 0 : 22 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </button>
                  <span className={cn("text-sm transition-colors", cycle === "yearly" ? "text-white" : "text-[var(--text-muted)]")}>Yearly</span>
                  
                  <AnimatePresence>
                    {cycle === "yearly" && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute -right-24 top-1/2 -translate-y-1/2 px-2 py-1 rounded-md bg-gradient-accent text-[10px] font-bold text-white tracking-wider uppercase whitespace-nowrap"
                      >
                        Save ~17%
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Sub Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full items-center">
                  {subPlans.map(plan => (
                    <GlassPanel 
                      key={plan.id}
                      strong={plan.popular}
                      className={cn(
                        "flex flex-col p-8 transition-transform duration-300 hover:scale-[1.02]",
                        plan.popular ? "md:scale-105 border-gradient-accent h-[480px]" : "h-[440px]"
                      )}
                    >
                      {plan.popular && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-gradient-accent text-white text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-b-lg">
                          Most Popular
                        </div>
                      )}
                      
                      <h3 className="font-heading text-2xl font-bold mb-2 mt-4">{plan.name}</h3>
                      <div className="mb-6 h-16 flex items-end gap-1">
                        <span className="text-4xl font-bold">₹{(cycle === "monthly" ? plan.monthly : plan.yearly).toLocaleString('en-IN')}</span>
                        <span className="text-[var(--text-muted)] mb-1">/{cycle === "monthly" ? "mo" : "yr"}</span>
                      </div>
                      
                      <p className="text-sm text-[var(--text-muted)] mb-auto leading-relaxed border-t border-[rgba(255,255,255,0.05)] pt-6">
                        {plan.desc}
                      </p>
                      
                      <GlassButton 
                        variant={plan.popular ? "primary" : "secondary"}
                        className="w-full mt-8"
                        onClick={() => handleCheckout(plan.id, "sub", cycle === "monthly" ? plan.monthly : plan.yearly)}
                        disabled={loadingId !== null}
                      >
                        {loadingId === plan.id ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : successId === plan.id ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          "Start " + plan.name
                        )}
                      </GlassButton>
                    </GlassPanel>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Credits Mode */}
            {mode === "credits" && (
              <motion.div 
                key="credits"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center w-full"
              >
                <div className="h-10 mb-10" /> {/* Spacer to align visually with sub mode */}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full items-center">
                  {creditPacks.map(pack => (
                    <GlassPanel 
                      key={pack.id}
                      strong={pack.popular}
                      className={cn(
                        "flex flex-col p-8 transition-transform duration-300 hover:scale-[1.02]",
                        pack.popular ? "md:scale-105 border-gradient-accent h-[420px]" : "h-[400px]"
                      )}
                    >
                      {pack.popular && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-gradient-accent text-white text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-b-lg">
                          Best Value
                        </div>
                      )}
                      
                      <div className="w-12 h-12 rounded-full bg-[rgba(255,255,255,0.1)] flex items-center justify-center mb-6 mt-4">
                        <pack.icon className="w-6 h-6 text-white" />
                      </div>
                      
                      <h3 className="font-heading text-2xl font-bold mb-1">{pack.name}</h3>
                      <div className="text-xl font-semibold text-[var(--text-muted)] mb-4">{pack.amount.toLocaleString()} credits</div>
                      
                      <div className="text-3xl font-bold mb-6">₹{pack.price.toLocaleString('en-IN')}</div>
                      
                      <p className="text-xs text-[var(--text-muted)] mb-auto">
                        {pack.desc}
                      </p>
                      
                      <GlassButton 
                        variant={pack.popular ? "primary" : "secondary"}
                        className="w-full mt-6"
                        onClick={() => handleCheckout(pack.id, "pack", pack.price)}
                        disabled={loadingId !== null}
                      >
                        {loadingId === pack.id ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : successId === pack.id ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          "Buy " + pack.name
                        )}
                      </GlassButton>
                    </GlassPanel>
                  ))}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* FAQ */}
        <div className="w-full max-w-3xl mt-24">
          <h2 className="font-heading text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          <div className="flex flex-col gap-4">
            {faqs.map((faq, i) => (
              <FAQItem key={i} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <GlassPanel interactive className="p-1">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-5 flex items-center justify-between outline-none"
      >
        <span className="font-semibold">{question}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-5 pt-0 text-[var(--text-muted)] text-sm leading-relaxed border-t border-[rgba(255,255,255,0.05)] mt-1">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassPanel>
  );
}

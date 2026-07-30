import { Navbar } from "@/components/layout/Navbar";
import { LandingHero } from "@/components/landing/LandingHero";
import { AgentShowcase } from "@/components/landing/AgentShowcase";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col relative z-10">
        <LandingHero />
        <AgentShowcase />
        <HowItWorks />
      </main>
      <Footer />
    </>
  );
}

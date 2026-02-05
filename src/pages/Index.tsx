import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/landing/sections/HeroSection";
import { KillerFeaturesSection } from "@/components/landing/sections/KillerFeaturesSection";
import { ChatToPlanSection } from "@/components/landing/sections/ChatToPlanSection";
import { WalletSection } from "@/components/landing/sections/WalletSection";
import { BentoGridSection } from "@/components/landing/sections/BentoGridSection";
import { AIShowcase } from "@/components/landing/AIShowcase";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <BentoGridSection />
      <KillerFeaturesSection />
      <ChatToPlanSection />
      <WalletSection />
      <AIShowcase />
      <HowItWorks />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;

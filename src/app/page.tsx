import { CTASection } from "@/components/landing/CTASection";
import { DemoSection } from "@/components/landing/DemoSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { LogosSection } from "@/components/landing/LogosSection";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { TemplatesSection } from "@/components/landing/TemplatesSection";
import { UseCasesSection } from "@/components/landing/UseCasesSection";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6f3ee]">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,_rgba(24,24,27,0.03)_1px,_transparent_1px),linear-gradient(to_bottom,_rgba(24,24,27,0.03)_1px,_transparent_1px)] bg-[size:72px_72px] opacity-[0.4]" />
      <Header />
      <main>
        <Hero />
        <LogosSection />
        <ProblemSection />
        <HowItWorksSection />
        <FeaturesSection />
        <TemplatesSection />
        <DemoSection />
        <UseCasesSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

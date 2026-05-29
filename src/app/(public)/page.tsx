"use client";

import { Header } from "@/sections/Header";
import { Hero } from "@/sections/Hero";
import { BentoGrid } from "@/sections/BentoGrid";
import { FeatureShowcase } from "@/sections/FeatureShowcase";
import { Integrations } from "@/sections/Integrations";
import { Pricing } from "@/sections/Pricing";
import { Faq } from "@/sections/Faq";
import { Footer } from "@/sections/Footer";
import { ScrollReveal } from "../../../components/Animations";

export default function LandingPage() {
  return (
    <div className="mx-auto min-h-screen w-full max-w-[1920px]">
      <Header />
      <main className="relative flex flex-col items-center justify-center">
        <Hero />

        {/* Bento Grid surgindo */}
        <ScrollReveal delay={0.2}>
          <BentoGrid />
        </ScrollReveal>

        {/* Showcase surgindo da direita */}
        <ScrollReveal delay={0.1} direction="right">
          <FeatureShowcase />
        </ScrollReveal>

        <ScrollReveal delay={0.1}> 
          <Integrations />
        </ScrollReveal>

        {/* Pricing surgindo */}
        <ScrollReveal>
          <Pricing />
        </ScrollReveal>

        {/* FAQ surgindo */}
        <ScrollReveal delay={0.2}>
          <Faq />
        </ScrollReveal>

        <Footer />
      </main>
    </div>
  );
}

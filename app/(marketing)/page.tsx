import { Suspense } from "react"
import { HeroSection } from "@/components/features/landing/hero-section"
import { LogoCloud } from "@/components/features/landing/logo-cloud"
import { Features } from "@/components/features/landing/features-grid"
import { Testimonials } from "@/components/features/landing/testimonials"
import { Pricing } from "@/components/features/landing/pricing"
import { FAQs } from "@/components/features/landing/faqs"
import { Component as Footer } from "@/components/features/landing/footer"
import { GLSLHills } from "@/components/features/landing/hero-background"
import { HeroHeader } from "@/components/features/landing/header"

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#050505] text-white overflow-hidden">
      {/* Background WebGL motion hills */}
      <div className="absolute inset-x-0 top-0 z-0 h-[100vh] w-full pointer-events-none opacity-80">
        <GLSLHills width="100%" height="100%" />
        <div aria-hidden className="absolute inset-0 size-full bg-gradient-to-b from-transparent via-[#050505]/40 to-[#050505]" />
      </div>

      <div className="relative z-10">
        <HeroHeader />
        <Suspense>
          <HeroSection />
        </Suspense>
        <LogoCloud />
        <Features />
        <Testimonials />
        <Pricing />
        <FAQs />
        <Footer />
      </div>
    </div>
  )
}

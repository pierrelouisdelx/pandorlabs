'use client'

import { Lock, Shield, Zap } from 'lucide-react'
import Link from 'next/link'

interface FinalCTASectionProps {
  accentColor: string
  accentGlow: string
}

export function FinalCTASection({
  accentColor,
  accentGlow,
}: FinalCTASectionProps) {
  return (
    <section className="section section-divided">
      {/* Ambient accent glow — fades out inside the section, so no seam. */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[600px] w-[1200px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-[150px]"
        style={{ backgroundColor: accentColor }}
      />

      <div className="relative z-10 container mx-auto max-w-5xl px-6 text-center md:px-8">
        <h2 className="mb-6 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
          Ready to Get Started?
        </h2>
        <p className="text-gray mx-auto mb-12 max-w-3xl text-lg md:text-xl">
          Talk to us about your sources and volume. We&apos;ll return a sample
          dataset from your target sites before you commit to anything.
        </p>

        <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
          <Link
            href="/contact"
            className="text-primary rounded-full px-12 py-5 text-lg font-semibold transition-all duration-300 hover:-translate-y-0.5"
            style={{
              backgroundColor: accentColor,
              boxShadow: `0 0 60px ${accentGlow}`,
            }}
          >
            Request a Sample Dataset
          </Link>

          <Link
            href="/contact"
            className="rounded-full border border-white/20 px-12 py-5 text-lg font-semibold transition-all duration-300 hover:border-white/40 hover:bg-white/5"
          >
            Schedule a Demo
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="text-gray mt-16 flex flex-wrap items-center justify-center gap-8">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <span>SOC 2 Type II</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            <span>GDPR &amp; CCPA compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            <span>99.9% uptime SLA</span>
          </div>
        </div>
      </div>
    </section>
  )
}

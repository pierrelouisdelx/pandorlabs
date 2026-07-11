'use client';

import { Lock, Shield, Zap } from 'lucide-react';

interface FinalCTASectionProps {
  accentColor: string;
  accentGlow: string;
}

export function FinalCTASection({
  accentColor,
  accentGlow,
}: FinalCTASectionProps) {
  return (
    <section className="relative overflow-hidden py-32">
      {/* Dramatic Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-transparent to-[#0A0A0A]" />
        <div
          className="absolute top-1/2 left-1/2 h-[600px] w-[1200px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-[150px]"
          style={{ backgroundColor: accentColor }}
        />
      </div>

      <div className="relative z-10 container mx-auto max-w-5xl px-6 text-center md:px-8">
        <h2 className="mb-8 text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
          Ready to Get Started?
        </h2>
        <p className="mx-auto mb-12 max-w-3xl text-xl text-white/70 md:text-2xl">
          Join thousands of developers building with our API. Start your free
          trial today, no credit card required.
        </p>

        <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
          <button
            className="rounded-xl px-12 py-5 text-lg font-semibold shadow-2xl transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: accentColor,
              boxShadow: `0 0 60px ${accentGlow}`,
            }}
          >
            Start Free Trial
          </button>

          <button className="rounded-xl border border-white/20 px-12 py-5 text-lg font-semibold transition-all duration-300 hover:bg-white/5">
            Schedule Demo
          </button>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-white/40">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <span>SOC 2 Compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            <span>GDPR Ready</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            <span>99.9% SLA</span>
          </div>
        </div>
      </div>
    </section>
  );
}

'use client'

import { type ReactNode } from 'react'

import { type LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

interface ProductHeroProps {
  product:
    | 'realEstate'
    | 'leadGen'
    | 'shopping'
    | 'crypto'
    | 'aiDatasets'
    | 'socialMedia'
  headline: string
  subheadline: string
  valueProps: string[]
  primaryCTA: string
  secondaryCTA: string
  trustIndicators: Array<{
    Icon: LucideIcon
    text: string
  }>
  visualElement: ReactNode
  accentColor: string
  accentGlow: string
  accentGradient: string
}

export function ProductHero({
  headline,
  subheadline,
  valueProps,
  primaryCTA,
  secondaryCTA,
  trustIndicators,
  visualElement,
  accentColor,
  accentGlow,
}: ProductHeroProps) {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 bg-[#0A0A0A]">
        <div className="absolute inset-0 animate-[pulse_8s_ease-in-out_infinite] bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
        <div
          className="absolute top-1/4 left-1/2 h-[800px] w-[800px] -translate-x-1/2 animate-[pulse_4s_ease-in-out_infinite] rounded-full blur-[120px]"
          style={{ backgroundColor: accentGlow }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-32 md:px-8 lg:px-12">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left: Text Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
              <div
                className="h-2 w-2 animate-pulse rounded-full"
                style={{ backgroundColor: accentColor }}
              />
              <span className="text-sm text-white/70">Live API Access</span>
            </div>

            <h1 className="text-6xl font-bold tracking-tight md:text-7xl lg:text-8xl">
              {headline}
            </h1>

            <p className="text-xl leading-relaxed text-white/70 md:text-2xl">
              {subheadline}
            </p>

            {/* Value Props */}
            <ul className="space-y-3">
              {valueProps.map((prop, index) => (
                <li key={index} className="flex items-start gap-3">
                  <svg
                    className="mt-1 h-5 w-5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                    style={{ color: accentColor }}
                  >
                    <path
                      d="M5 13l4 4L19 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-white/80">{prop}</span>
                </li>
              ))}
            </ul>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <button
                className={cn(
                  'rounded-lg px-8 py-4 text-lg font-semibold',
                  'transition-all duration-300',
                  'hover:scale-105 hover:shadow-2xl',
                )}
                style={{
                  backgroundColor: accentColor,
                  boxShadow: `0 0 40px ${accentGlow}`,
                }}
              >
                {primaryCTA}
              </button>

              <button
                className={cn(
                  'rounded-lg border border-white/20 px-8 py-4 text-lg font-semibold',
                  'transition-all duration-300 hover:border-white/40 hover:bg-white/5',
                )}
              >
                {secondaryCTA}
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-8 border-t border-white/10 pt-8">
              {trustIndicators.map((indicator, index) => (
                <div key={index} className="flex items-center gap-2">
                  <indicator.Icon
                    className="h-5 w-5"
                    style={{ color: accentColor }}
                  />
                  <span className="text-white/60">{indicator.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Visual Element */}
          <div className="relative">{visualElement}</div>
        </div>
      </div>
    </section>
  )
}

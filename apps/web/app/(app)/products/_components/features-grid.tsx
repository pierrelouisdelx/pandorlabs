'use client'

import { useState } from 'react'

import { type LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

interface Feature {
  Icon: LucideIcon
  title: string
  description: string
  metrics?: string
}

interface FeaturesGridProps {
  title: string
  subtitle: string
  features: Feature[]
  accentColor: string
  accentGlow: string
}

export function FeaturesGrid({
  title,
  subtitle,
  features,
  accentColor,
  accentGlow,
}: FeaturesGridProps) {
  return (
    <section className="relative overflow-hidden py-32">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0F0F0F] to-transparent" />

      <div className="relative z-10 container mx-auto px-6 md:px-8 lg:px-12">
        {/* Section Header */}
        <div className="mx-auto mb-20 max-w-3xl text-center">
          <h2 className="mb-6 text-5xl font-bold tracking-tight md:text-6xl">
            {title}
          </h2>
          <p className="text-xl text-white/60">{subtitle}</p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              feature={feature}
              accentColor={accentColor}
              accentGlow={accentGlow}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureCard({
  feature,
  accentColor,
  accentGlow,
}: {
  feature: Feature
  accentColor: string
  accentGlow: string
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={cn(
        'group relative rounded-2xl p-8',
        'border border-white/10 bg-gradient-to-b from-white/5 to-transparent',
        'transition-all duration-500 hover:scale-105 hover:border-white/20',
      )}
      style={{
        boxShadow: isHovered
          ? `0 0 60px ${accentGlow}`
          : `0 0 0 0 ${accentGlow}`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Icon */}
      <div
        className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg"
        style={{ backgroundColor: accentGlow }}
      >
        <feature.Icon className="h-6 w-6" style={{ color: accentColor }} />
      </div>

      {/* Content */}
      <h3 className="mb-3 text-2xl font-semibold tracking-tight">
        {feature.title}
      </h3>
      <p className="mb-4 leading-relaxed text-white/60">
        {feature.description}
      </p>

      {/* Optional Metric */}
      {feature.metrics && (
        <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            style={{ color: accentColor }}
          >
            <path
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-sm font-medium">{feature.metrics}</span>
        </div>
      )}

      {/* Hover Glow Effect */}
      <div
        className={cn(
          'pointer-events-none absolute inset-0 -z-10 rounded-2xl blur-xl',
          'opacity-0 transition-opacity duration-500 group-hover:opacity-100',
        )}
        style={{ backgroundColor: accentGlow }}
      />
    </div>
  )
}

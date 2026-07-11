'use client'

import { useState } from 'react'

import { ChevronDown } from 'lucide-react'

import { cn } from '@/lib/utils'

interface FAQ {
  question: string
  answer: string
}

interface FAQSectionProps {
  faqs: FAQ[]
  accentColor: string
}

export function FAQSection({ faqs, accentColor }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="relative py-32">
      <div className="container mx-auto max-w-4xl px-6 md:px-8">
        <div className="mb-20 text-center">
          <h2 className="mb-6 text-5xl font-bold tracking-tight md:text-6xl">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-white/60">
            Everything you need to know about our API
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-xl border border-white/10 transition-all duration-300 hover:border-white/20"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full items-center justify-between gap-4 bg-white/5 p-6 text-left transition-colors hover:bg-white/[0.07]"
              >
                <span className="text-lg font-semibold">{faq.question}</span>
                <ChevronDown
                  className={cn(
                    'h-5 w-5 flex-shrink-0 transition-transform duration-300',
                    openIndex === index && 'rotate-180',
                  )}
                  style={{ color: accentColor }}
                />
              </button>

              <div
                className={cn(
                  'overflow-hidden transition-all duration-300',
                  openIndex === index ? 'max-h-96' : 'max-h-0',
                )}
              >
                <div className="p-6 pt-0 leading-relaxed text-white/70">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Still have questions CTA */}
        <div className="mt-16 rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-8 text-center">
          <p className="mb-4 text-lg text-white/70">Still have questions?</p>
          <button className="rounded-lg border border-white/20 px-8 py-3 font-semibold transition-all duration-300 hover:bg-white/5">
            Contact Support
          </button>
        </div>
      </div>
    </section>
  )
}

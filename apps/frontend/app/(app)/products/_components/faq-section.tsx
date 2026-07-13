'use client'

import { useState } from 'react'

import { ChevronDown } from 'lucide-react'
import Link from 'next/link'

import { cn } from '@/lib/utils'
import { generateFAQSchema, stringifyJsonLd } from '@/lib/schema-generator'

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
    <section className="section section-divided">
      {/* FAQPage schema, generated from the same questions rendered below. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: stringifyJsonLd(generateFAQSchema(faqs)),
        }}
      />
      <div className="container mx-auto max-w-4xl px-6 md:px-8">
        <div className="mb-12 text-center">
          <p className="eyebrow">questions</p>
          <h2 className="mb-4 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
            Frequently Asked Questions
          </h2>
          <p className="text-gray">
            Everything you need to know before you send us your first request.
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
        <div className="panel mt-16 p-8 text-center">
          <p className="text-gray mb-4 text-lg">Still have questions?</p>
          <Link
            href="/contact"
            className="inline-flex rounded-full border border-white/20 px-8 py-3 font-semibold transition-all duration-300 hover:border-white/40 hover:bg-white/5"
          >
            Talk to an engineer
          </Link>
        </div>
      </div>
    </section>
  )
}

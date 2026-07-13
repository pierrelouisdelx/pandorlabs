'use client'

import { useState, FormEvent } from 'react'
import { Input } from '@/components/ui/input'
import { buttonVariants } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import DemoRequestModal from './demo-request-modal'

interface ExampleQuery {
  text: string
  icon: string
}

/**
 * Phrased the way buyers actually describe the job — each maps to a product
 * page, so the copy doubles as internal keyword coverage.
 */
const exampleQueries: ExampleQuery[] = [
  {
    text: 'Track competitor prices on Amazon every day',
    icon: '🛒',
  },
  {
    text: 'Scrape every property listing in Miami with price history',
    icon: '🏠',
  },
  {
    text: 'Find decision-makers at SaaS companies hiring in Berlin',
    icon: '🎯',
  },
  {
    text: 'Monitor brand mentions across social media in real time',
    icon: '📣',
  },
  {
    text: 'Pull crypto prices from every major exchange',
    icon: '📈',
  },
  {
    text: 'Build a training dataset from public product reviews',
    icon: '🧠',
  },
]

export default function HeroSearchInput() {
  const [query, setQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (query.trim()) {
      setIsModalOpen(true)
    }
  }

  const handleExampleClick = (exampleText: string) => {
    setQuery(exampleText)
    // Auto-submit after setting the query
    setTimeout(() => {
      const form = document.getElementById(
        'hero-search-form',
      ) as HTMLFormElement
      if (form) {
        form.requestSubmit()
      }
    }, 100)
  }

  return (
    <>
      <form
        id="hero-search-form"
        onSubmit={handleSubmit}
        className="mx-auto mb-6 max-w-2xl"
      >
        <div className="flex flex-col gap-3 md:flex-row">
          <Input
            type="text"
            placeholder="Describe the data you need, in plain english…"
            className="flex-1"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className={buttonVariants()}>
            Get this data
          </button>
        </div>
      </form>

      {/* Example Queries */}
      <div className="mt-8 hidden space-y-4 md:block">
        <div className="flex items-center justify-center gap-2 text-sm text-white/70">
          <Sparkles className="text-green-light/80 h-4 w-4" />
          <span className="font-medium">Try an example:</span>
        </div>
        <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-center gap-3">
          {exampleQueries.map((example, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(example.text)}
              className="group hover:border-green-light/60 hover:shadow-green-light/20 relative overflow-hidden rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-medium text-gray-200 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/10 hover:text-white"
            >
              <span className="relative z-10 mr-2 text-base">
                {example.icon}
              </span>
              <span className="relative z-10">{example.text}</span>
              <div className="via-green-light/20 absolute inset-0 bg-gradient-to-r from-green-100/0 to-green-100/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </button>
          ))}
        </div>
      </div>

      <DemoRequestModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        query={query}
      />
    </>
  )
}

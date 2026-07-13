'use client'

import { useEffect, useState, FormEvent } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { buttonVariants } from '@/components/ui/button'
import {
  Mail,
  Building2,
  User,
  Search,
  Clock,
  ShieldCheck,
  Loader2,
} from 'lucide-react'
import { joinWaitlist } from '@/app/actions/waitlist'
import { toast } from 'sonner'

interface DemoRequestModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** What the visitor typed in the hero. Seeds the request so they don't retype it. */
  query?: string
}

export default function DemoRequestModal({
  open,
  onOpenChange,
  query,
}: DemoRequestModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Carry the hero query into the request rather than dropping it on the floor.
  useEffect(() => {
    if (open && query) {
      setFormData((prev) => ({ ...prev, message: prev.message || query }))
    }
  }, [open, query])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await joinWaitlist(formData)

      if (result.success) {
        toast.success(result.message, {
          description:
            'A solutions engineer will reply within one business day.',
        })
        setFormData({ name: '', email: '', company: '', message: '' })
        onOpenChange(false)
      } else if (result.isDuplicate) {
        toast.info(result.message, {
          description: "You're already on the list — we'll be in touch soon.",
        })
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Error submitting waitlist request:', error)
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface max-h-[90vh] overflow-y-auto border border-white/10 p-0 shadow-2xl sm:max-w-lg">
        {/* Header */}
        <div className="relative overflow-hidden border-b border-white/10 px-6 pt-6 pb-5">
          <div className="from-green-light/10 pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br to-transparent" />
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="text-2xl font-semibold text-white">
              Request your data
            </DialogTitle>
            <DialogDescription className="text-gray">
              Tell us what you need and we&apos;ll come back with a sample
              dataset extracted from your real target sites — before you commit
              to anything.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
          {/* Their request, echoed back */}
          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium text-white">
              What data do you need?
            </label>
            <div className="relative">
              <Search className="text-green-light absolute top-4 left-4 size-5" />
              <textarea
                id="message"
                placeholder="e.g. every property listing in Miami, with price history, refreshed daily"
                rows={3}
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                className="border-gray/20 placeholder:text-gray focus:border-green-light/50 hover:border-gray/30 flex w-full resize-none rounded-2xl border bg-white/5 px-6 py-3.5 pl-12 text-base text-white transition-all duration-300 focus-visible:outline-hidden"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-white">
                Full name <span className="text-green-light">*</span>
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Jane Doe"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                iconLeft={<User className="size-5" />}
                className="bg-white/5 text-white"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="company"
                className="text-sm font-medium text-white"
              >
                Company <span className="text-green-light">*</span>
              </label>
              <Input
                id="company"
                type="text"
                placeholder="Acme Inc."
                required
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                iconLeft={<Building2 className="size-5" />}
                className="bg-white/5 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-white">
              Work email <span className="text-green-light">*</span>
            </label>
            <Input
              id="email"
              type="email"
              placeholder="jane@acme.com"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              iconLeft={<Mail className="size-5" />}
              className="bg-white/5 text-white"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={buttonVariants({
              size: 'lg',
              className:
                'w-full disabled:cursor-not-allowed disabled:opacity-60',
            })}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Sending your request…
              </>
            ) : (
              'Request my sample dataset'
            )}
          </button>

          {/* Reassurance, where the friction actually is */}
          <div className="text-gray flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" />
              Reply within one business day
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-3.5" />
              No credit card, no sales spam
            </span>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

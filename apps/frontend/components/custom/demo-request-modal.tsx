'use client'

import { useState, FormEvent } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { buttonVariants } from '@/components/ui/button'
import { Mail, Building2, User, MessageSquare } from 'lucide-react'
import { joinWaitlist } from '@/app/actions/waitlist'
import { toast } from 'sonner'

interface DemoRequestModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function DemoRequestModal({
  open,
  onOpenChange,
}: DemoRequestModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await joinWaitlist(formData)

      if (result.success) {
        // Success - show success toast and close modal
        toast.success(result.message, {
          description: "We're excited to have you on board!",
        })
        setFormData({ name: '', email: '', company: '', message: '' })
        onOpenChange(false)
      } else {
        // Error - show error toast
        if (result.isDuplicate) {
          toast.info(result.message, {
            description: "We'll be in touch soon!",
          })
        } else {
          toast.error(result.message)
        }
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
      <DialogContent className="via-primary/95 max-w-md border border-white/20 bg-gradient-to-br from-gray-900/95 to-gray-900/95 p-6 shadow-2xl backdrop-blur-xl sm:max-w-lg">
        <DialogHeader className="space-y-3">
          <DialogTitle className="from-green-light to-green-light bg-gradient-to-r via-green-100 bg-clip-text text-2xl font-bold text-transparent">
            Join the waitlist
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Fill out the form below and we will get in touch with you when we
            launch.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-white">
              Full Name <span className="text-red-400">*</span>
            </label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
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
            <label htmlFor="email" className="text-sm font-medium text-white">
              Work Email <span className="text-red-400">*</span>
            </label>
            <Input
              id="email"
              type="email"
              placeholder="john@company.com"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              iconLeft={<Mail className="size-5" />}
              className="bg-white/5 text-white"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="company" className="text-sm font-medium text-white">
              Company Name <span className="text-red-400">*</span>
            </label>
            <Input
              id="company"
              type="text"
              placeholder="Acme Corporation"
              required
              value={formData.company}
              onChange={(e) =>
                setFormData({ ...formData, company: e.target.value })
              }
              iconLeft={<Building2 className="size-5" />}
              className="bg-white/5 text-white"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium text-white">
              Tell us about your needs (Optional)
            </label>
            <div className="relative">
              <textarea
                id="message"
                placeholder="I'm interested in extracting data from..."
                rows={4}
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                className="border-gray/20 placeholder:text-gray focus:border-green-light/50 focus:shadow-green-light/10 hover:border-gray/30 flex w-full rounded-2xl border bg-white/5 px-6 py-3.5 pl-12 text-base text-white backdrop-blur-md transition-all duration-300 focus:shadow-lg focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
              />
              <MessageSquare className="absolute top-4 left-4 size-5 text-white" />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-white transition-all duration-300 hover:border-white/30 hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={buttonVariants({
                className:
                  'flex-1 disabled:cursor-not-allowed disabled:opacity-50',
              })}
            >
              {isSubmitting ? 'Submitting...' : 'Join the waitlist'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

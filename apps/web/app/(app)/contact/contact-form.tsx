'use client'

import { Send } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { submitContactForm, type ContactResponse } from '@/app/actions/contact'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const EMPTY = { name: '', email: '', phone: '', message: '' }

export default function ContactForm() {
  const [values, setValues] = useState(EMPTY)
  const [fieldErrors, setFieldErrors] = useState<
    NonNullable<ContactResponse['fieldErrors']>
  >({})
  const [pending, setPending] = useState(false)

  function update(field: keyof typeof EMPTY, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => ({ ...current, [field]: undefined }))
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setFieldErrors({})

    try {
      const result = await submitContactForm(values)

      if (!result.success) {
        setFieldErrors(result.fieldErrors ?? {})
        toast.error(result.message)
        return
      }

      toast.success(result.message)
      setValues(EMPTY)
    } catch {
      toast.error('Something went wrong. Please try again later.')
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 lg:space-y-8" noValidate>
      <Field error={fieldErrors.name}>
        <Input
          type="text"
          name="name"
          autoComplete="name"
          placeholder="Name"
          value={values.name}
          onChange={(event) => update('name', event.target.value)}
        />
      </Field>

      <Field error={fieldErrors.email}>
        <Input
          type="email"
          name="email"
          autoComplete="email"
          placeholder="Email"
          value={values.email}
          onChange={(event) => update('email', event.target.value)}
        />
      </Field>

      <Field error={fieldErrors.phone}>
        <Input
          type="tel"
          name="phone"
          autoComplete="tel"
          placeholder="Phone (optional)"
          value={values.phone}
          onChange={(event) => update('phone', event.target.value)}
        />
      </Field>

      <Field error={fieldErrors.message}>
        <Textarea
          name="message"
          placeholder="Message"
          rows={5}
          value={values.message}
          onChange={(event) => update('message', event.target.value)}
        />
      </Field>

      <div className="text-right">
        <Button
          type="submit"
          disabled={pending}
          className="hover:[&_svg]:-rotate-45"
        >
          {pending ? 'Sending…' : 'Send Message'}
          <Send className="size-4 shrink-0 duration-300" />
        </Button>
      </div>
    </form>
  )
}

function Field({
  error,
  children,
}: {
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      {children}
      {error && <p className="px-6 text-sm text-[#ff6b6b]">{error}</p>}
    </div>
  )
}

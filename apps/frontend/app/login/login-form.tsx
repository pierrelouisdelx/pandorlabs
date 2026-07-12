'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { signIn } from '@/lib/auth-client'

/** `next` is only set when the proxy bounced the visitor off a specific page. */
export default function LoginForm({ next }: { next?: string }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setPending(true)

    const { data, error: signInError } = await signIn.email({ email, password })

    if (signInError) {
      // Better Auth returns the same error for unknown email and bad password,
      // which is what we want — no account enumeration.
      setError(signInError.message ?? 'Invalid email or password.')
      setPending(false)
      return
    }

    // Where "home" is depends on the role: sending a plain user to /admin would
    // bounce them straight back here with ?error=forbidden.
    const home = data?.user.role === 'admin' ? '/admin/emails' : '/dashboard'

    // The session cookie is set; refresh so the server re-reads it, then go.
    router.replace(next ?? home)
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm text-white/80">
          Email
        </label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@pandorlabs.com"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm text-white/80">
          Password
        </label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••••••"
        />
      </div>

      {error && <p className="text-sm text-[#ff6b6b]">{error}</p>}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  )
}

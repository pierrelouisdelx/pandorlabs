'use client'

import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import { changePassword, updateProfile } from '@/app/actions/account'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export function ProfileForm({
  initialName,
  email,
}: {
  initialName: string
  email: string
}) {
  const router = useRouter()
  const [name, setName] = useState(initialName)
  const [pending, setPending] = useState(false)

  const dirty = name.trim() !== initialName

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-5"
          onSubmit={async (event) => {
            event.preventDefault()
            setPending(true)
            const result = await updateProfile(name)
            setPending(false)

            if (!result.success) {
              toast.error(result.message)
              return
            }
            toast.success(result.message)
            // The sidebar renders the name from the session — pull it again.
            router.refresh()
          }}
        >
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Name
            </label>
            <Input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={pending}
              autoComplete="name"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input id="email" value={email} disabled readOnly />
            <p className="text-gray text-xs">
              Email changes need verification, which isn&apos;t wired up yet —
              contact an admin to change it.
            </p>
          </div>

          <Button type="submit" disabled={pending || !dirty}>
            {pending && <Loader2 className="size-4 animate-spin" />}
            {pending ? 'Saving…' : 'Save changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [pending, setPending] = useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-5"
          onSubmit={async (event) => {
            event.preventDefault()
            setPending(true)
            const result = await changePassword(currentPassword, newPassword)
            setPending(false)

            if (!result.success) {
              toast.error(result.message)
              return
            }
            toast.success(`${result.message} Other sessions were signed out.`)
            setCurrentPassword('')
            setNewPassword('')
          }}
        >
          <div className="space-y-2">
            <label htmlFor="currentPassword" className="text-sm font-medium">
              Current password
            </label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              disabled={pending}
              autoComplete="current-password"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="newPassword" className="text-sm font-medium">
              New password
            </label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              disabled={pending}
              autoComplete="new-password"
              minLength={8}
              required
            />
            <p className="text-gray text-xs">At least 8 characters.</p>
          </div>

          <Button
            type="submit"
            disabled={pending || !currentPassword || !newPassword}
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            {pending ? 'Updating…' : 'Change password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

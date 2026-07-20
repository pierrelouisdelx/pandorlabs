'use client'

import type { UserRole } from '@pandorlabs/db'
import {
  KeyRound,
  Loader2,
  ShieldCheck,
  ShieldOff,
  Trash2,
  UserPlus,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import {
  createUser,
  deleteUser,
  resetUserPassword,
  setUserRole,
} from '@/app/actions/users'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

type UserRow = {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: Date
  activeSessions: number
}

type Props = {
  users: UserRow[]
  currentUserId: string
  adminCount: number
}

export default function UsersView({ users, currentUserId, adminCount }: Props) {
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)
  const [resetTarget, setResetTarget] = useState<UserRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null)
  const [rolePendingId, setRolePendingId] = useState<string | null>(null)

  async function onToggleRole(target: UserRow) {
    const nextRole: UserRole = target.role === 'admin' ? 'user' : 'admin'
    setRolePendingId(target.id)
    const result = await setUserRole(target.id, nextRole)
    setRolePendingId(null)

    if (!result.success) {
      toast.error(result.message)
      return
    }
    toast.success(result.message)
    router.refresh()
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <UserPlus className="size-4" />
          New user
        </Button>
      </div>

      <ul className="space-y-3">
        {users.map((row) => {
          const isSelf = row.id === currentUserId
          // Demoting or deleting the last admin would lock everyone out.
          const isLastAdmin = row.role === 'admin' && adminCount <= 1

          return (
            <li
              key={row.id}
              className="border-gray/20 flex flex-wrap items-center gap-4 rounded-2xl border bg-white/5 p-5 backdrop-blur-md"
            >
              <div className="min-w-0 grow">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate font-medium">{row.name}</h2>
                  <Badge variant={row.role === 'admin' ? 'success' : 'muted'}>
                    {row.role}
                  </Badge>
                  {isSelf && <Badge variant="default">You</Badge>}
                  {row.activeSessions > 0 && (
                    <Badge variant="running">
                      {row.activeSessions} active
                    </Badge>
                  )}
                </div>
                <p className="text-gray mt-1 truncate text-sm">
                  {row.email} · joined {formatDate(row.createdAt)}
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onToggleRole(row)}
                  disabled={
                    rolePendingId === row.id || isSelf || isLastAdmin
                  }
                  title={
                    isSelf
                      ? 'You cannot change your own role'
                      : isLastAdmin
                        ? 'Cannot demote the last admin'
                        : undefined
                  }
                >
                  {rolePendingId === row.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : row.role === 'admin' ? (
                    <ShieldOff className="size-4" />
                  ) : (
                    <ShieldCheck className="size-4" />
                  )}
                  {row.role === 'admin' ? 'Make user' : 'Make admin'}
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setResetTarget(row)}
                >
                  <KeyRound className="size-4" />
                  Reset password
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  className="text-red-400 hover:text-red-300"
                  onClick={() => setDeleteTarget(row)}
                  disabled={isSelf || isLastAdmin}
                  title={
                    isSelf
                      ? 'You cannot delete your own account'
                      : isLastAdmin
                        ? 'Cannot delete the last admin'
                        : undefined
                  }
                >
                  <Trash2 className="size-4" />
                  Delete
                </Button>
              </div>
            </li>
          )
        })}
      </ul>

      <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} />

      <ResetPasswordDialog
        target={resetTarget}
        onOpenChange={(open) => !open && setResetTarget(null)}
      />

      <DeleteUserDialog
        target={deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      />
    </>
  )
}

function CreateUserDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('user')
  const [pending, setPending] = useState(false)

  function reset() {
    setName('')
    setEmail('')
    setPassword('')
    setRole('user')
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset()
        onOpenChange(next)
      }}
    >
      <DialogContent className="border-gray/20 bg-primary max-w-md rounded-2xl border p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">New user</DialogTitle>
          <DialogDescription className="text-gray text-sm">
            Public sign-up is disabled, so accounts are created here. The user
            can change their password later from their account page.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault()
            setPending(true)
            const result = await createUser({ name, email, password, role })
            setPending(false)

            if (!result.success) {
              toast.error(result.message)
              return
            }
            toast.success(result.message)
            reset()
            onOpenChange(false)
            router.refresh()
          }}
        >
          <div className="space-y-2">
            <label htmlFor="new-name" className="text-sm text-white/80">
              Name
            </label>
            <Input
              id="new-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={pending}
              autoComplete="off"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="new-email" className="text-sm text-white/80">
              Email
            </label>
            <Input
              id="new-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={pending}
              autoComplete="off"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="new-password" className="text-sm text-white/80">
              Temporary password
            </label>
            <Input
              id="new-password"
              type="text"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={pending}
              autoComplete="off"
              minLength={8}
              required
            />
            <p className="text-gray text-xs">At least 8 characters.</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="new-role" className="text-sm text-white/80">
              Role
            </label>
            <select
              id="new-role"
              className="border-gray/20 focus:border-green-light/50 w-full rounded-full border bg-white/5 px-6 py-3 text-base text-white backdrop-blur-md transition focus-visible:outline-hidden"
              value={role}
              onChange={(event) => setRole(event.target.value as UserRole)}
              disabled={pending}
            >
              <option value="user" className="bg-primary text-white">
                user
              </option>
              <option value="admin" className="bg-primary text-white">
                admin
              </option>
            </select>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              {pending ? 'Creating…' : 'Create user'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ResetPasswordDialog({
  target,
  onOpenChange,
}: {
  target: UserRow | null
  onOpenChange: (open: boolean) => void
}) {
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)

  return (
    <Dialog
      open={target !== null}
      onOpenChange={(open) => {
        if (!open) setPassword('')
        onOpenChange(open)
      }}
    >
      <DialogContent className="border-gray/20 bg-primary max-w-md rounded-2xl border p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Reset password
          </DialogTitle>
          <DialogDescription className="text-gray text-sm">
            Set a new password for {target?.email}. Their active sessions are
            signed out immediately.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault()
            if (!target) return
            setPending(true)
            const result = await resetUserPassword(target.id, password)
            setPending(false)

            if (!result.success) {
              toast.error(result.message)
              return
            }
            toast.success(result.message)
            setPassword('')
            onOpenChange(false)
          }}
        >
          <div className="space-y-2">
            <label htmlFor="reset-password" className="text-sm text-white/80">
              New password
            </label>
            <Input
              id="reset-password"
              type="text"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={pending}
              autoComplete="off"
              minLength={8}
              required
            />
            <p className="text-gray text-xs">At least 8 characters.</p>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending || password.length < 8}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              {pending ? 'Resetting…' : 'Reset password'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DeleteUserDialog({
  target,
  onOpenChange,
}: {
  target: UserRow | null
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  return (
    <Dialog open={target !== null} onOpenChange={onOpenChange}>
      <DialogContent className="border-gray/20 bg-primary max-w-md rounded-2xl border p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Delete user
          </DialogTitle>
          <DialogDescription className="text-gray text-sm">
            Permanently delete {target?.email}? This removes their account,
            sign-in credentials, and sessions. This cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-red-500 text-white hover:bg-red-500/90"
            disabled={pending}
            onClick={async () => {
              if (!target) return
              setPending(true)
              const result = await deleteUser(target.id)
              setPending(false)

              if (!result.success) {
                toast.error(result.message)
                return
              }
              toast.success(result.message)
              onOpenChange(false)
              router.refresh()
            }}
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            {pending ? 'Deleting…' : 'Delete user'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(
    new Date(date),
  )
}

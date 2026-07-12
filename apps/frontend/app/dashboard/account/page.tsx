import SignOutButton from '@/components/layouts/sign-out-button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { requireUser } from '@/lib/session'

import { PasswordForm, ProfileForm } from './account-forms'

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const session = await requireUser()

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Account</h1>
        <p className="text-gray mt-1 text-sm">
          Your details and how you sign in.
        </p>
      </div>

      <div className="grid max-w-3xl gap-6">
        <ProfileForm
          initialName={session.user.name}
          email={session.user.email}
        />

        <PasswordForm />

        <Card>
          <CardHeader>
            <CardTitle>Session</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm">
              <p className="text-gray">
                Signed in as{' '}
                <span className="text-white">{session.user.email}</span>
              </p>
              <Badge variant="muted" className="mt-2">
                {session.user.role}
              </Badge>
            </div>
            <SignOutButton />
          </CardContent>
        </Card>
      </div>
    </>
  )
}

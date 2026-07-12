'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button, type ButtonProps } from '@/components/ui/button'
import { signOut } from '@/lib/auth-client'

type Props = {
  variant?: ButtonProps['variant']
  size?: ButtonProps['size']
  className?: string
}

export default function SignOutButton({
  variant = 'secondary',
  size = 'sm',
  className,
}: Props) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      disabled={pending}
      onClick={async () => {
        setPending(true)
        await signOut()
        // `refresh` drops the RSC cache — without it the signed-in shell can be
        // served from cache to the next visitor of this tab.
        router.replace('/login')
        router.refresh()
      }}
    >
      <LogOut className="size-4" />
      {pending ? 'Signing out…' : 'Sign out'}
    </Button>
  )
}

'use client'

import {
  LayoutDashboard,
  Mail,
  Menu,
  Play,
  Settings,
  Users,
  Waypoints,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import Logo from '@/components/layouts/logo'
import SignOutButton from '@/components/layouts/sign-out-button'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

// The everyday nav, shown to every signed-in user.
const NAV = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/scrapers', label: 'Scrapers', icon: Waypoints },
  { href: '/dashboard/runs', label: 'Runs', icon: Play },
  { href: '/dashboard/account', label: 'Account', icon: Settings },
] as const

// Admin-only entries, rendered under their own "Admin" heading so it is clear
// which links are elevated. Only shown when the signed-in user is an admin.
const ADMIN_NAV = [
  { href: '/dashboard/users', label: 'Users', icon: Users },
  { href: '/dashboard/emails', label: 'Emails', icon: Mail },
] as const

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard }

type Props = {
  user: { name: string; email: string }
  isAdmin: boolean
}

export default function Sidebar({ user, isAdmin }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile: the nav collapses into a sheet behind a top bar. */}
      <header className="border-gray/20 sticky top-0 z-30 flex items-center gap-4 border-b bg-white/5 px-4 py-3 backdrop-blur-md lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <SidebarBody
              user={user}
              isAdmin={isAdmin}
              onNavigate={() => setOpen(false)}
            />
          </SheetContent>
        </Sheet>
        <Logo />
      </header>

      {/* Desktop: a column that stays put while the main pane scrolls. */}
      <aside className="border-gray/20 sticky top-0 hidden h-screen w-64 shrink-0 border-r bg-white/5 backdrop-blur-md lg:block">
        <SidebarBody user={user} isAdmin={isAdmin} />
      </aside>
    </>
  )
}

function SidebarBody({
  user,
  isAdmin,
  onNavigate,
}: Props & { onNavigate?: () => void }) {
  const pathname = usePathname()

  const renderItem = ({ href, label, icon: Icon }: NavItem) => {
    // `/dashboard` would otherwise match every child route.
    const active =
      href === '/dashboard' ? pathname === href : pathname.startsWith(href)

    return (
      <Link
        key={href}
        href={href}
        onClick={onNavigate}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'flex items-center gap-3 rounded-full px-4 py-2.5 text-sm transition-colors',
          active
            ? 'bg-green-light/10 text-green-light'
            : 'text-white/70 hover:bg-white/10 hover:text-white',
        )}
      >
        <Icon className="size-4 shrink-0" />
        {label}
      </Link>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-gray/20 border-b px-6 py-5">
        <Logo />
      </div>

      <div className="px-4 pt-4">
        <Button asChild size="sm" className="w-full">
          <Link href="/dashboard/scrapers?launch=1" onClick={onNavigate}>
            <Play className="size-4" />
            New scrape
          </Link>
        </Button>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {NAV.map(renderItem)}

        {isAdmin && (
          <div className="border-gray/20 mt-4 space-y-1 border-t pt-4">
            <p className="text-gray px-4 pb-1 text-xs font-medium tracking-[2px] uppercase">
              Admin
            </p>
            {ADMIN_NAV.map(renderItem)}
          </div>
        )}
      </nav>

      <div className="border-gray/20 space-y-3 border-t p-4">
        <div className="px-2">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="text-gray truncate text-xs">{user.email}</p>
        </div>
        <SignOutButton className="w-full" />
      </div>
    </div>
  )
}

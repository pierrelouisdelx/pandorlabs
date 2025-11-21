'use client'

import { MenuIcon } from 'lucide-react'
import NavLinks from '@/components/layouts/nav-links'
import { buttonVariants } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Logo from './logo'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)

  const pathName = usePathname()
  useEffect(() => {
    setIsOpen(false)
  }, [pathName])

  return (
    <header className="sticky top-5 z-50 container flex items-center justify-center">
      <div className="grid w-full grid-cols-2 items-center gap-5 rounded-full bg-white/10 px-5 py-2 shadow-[0_0_10px_0_rgba(255,255,255,0.1)] backdrop-blur-lg lg:grid-cols-[auto_1fr_auto]">
        <Logo />
        <div className="hidden justify-center lg:flex">
          <NavLinks className="flex" />
        </div>
        <div className="flex justify-end gap-3.5">
          <Link
            href="/contact-us"
            className={`${buttonVariants()} rounded-full max-lg:!hidden`}
          >
            Book a demo
          </Link>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <button type="button" className="lg:hidden">
                <span className="sr-only">Menu</span>
                <MenuIcon className="size-8 text-white" />
              </button>
            </SheetTrigger>
            <SheetContent className="p-6">
              <SheetTitle hidden />
              <SheetDescription hidden />
              <NavLinks />
              <Link
                href="/contact-us"
                className={`${buttonVariants()} mt-6 w-full rounded-full`}
              >
                Book a demo
              </Link>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

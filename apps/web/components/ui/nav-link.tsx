'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

interface IProp {
    className?: string
    href: string
    active?: string
    target?: string
    targetPath?: string
    rel?: string
    children: React.ReactNode
    onClick?: () => void
}
export default function NavLink({
    className,
    href,
    active,
    target,
    rel,
    children,
    targetPath,
}: IProp) {
    const pathName = usePathname()
    const [isScrolled, setIsScrolled] = useState(false)
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true)
            } else {
                setIsScrolled(false)
            }
        }
        window.addEventListener('scroll', handleScroll)
        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [])

    return (
        <Link
            href={href}
            target={target}
            rel={rel}
            className={cn(
                {
                    active:
                        active ||
                        (!active && pathName === href) ||
                        (targetPath && pathName.startsWith(targetPath)),
                    scrolled: isScrolled,
                },
                'nav-link',
                className,
            )}
        >
            {children}
        </Link>
    )
}

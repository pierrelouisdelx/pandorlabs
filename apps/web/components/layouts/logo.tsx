import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoProps {
    simple?: boolean
    size?: number
    className?: string
}

export default function Logo({
    size = 40,
    simple = false,
    className,
}: LogoProps) {
    return (
        <Link href="/" className={cn('flex items-center gap-2', className)}>
            <Image src="/images/logo.svg" alt="logo" width={40} height={40} />
            {!simple && (
                <span className="text-2xl font-bold text-white">
                    PandorLabs
                </span>
            )}
        </Link>
    )
}

import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface TrustBadgeProps {
    icon: LucideIcon
    text: string
    className?: string
}

const TrustBadge = ({ icon: Icon, text, className }: TrustBadgeProps) => {
    return (
        <div
            className={cn(
                'group inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-green-light/50 hover:bg-white/10 hover:shadow-xl hover:shadow-green-light/20 hover:-translate-y-0.5',
                className,
            )}
        >
            <Icon className="h-4 w-4 text-green-light transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
            <span className="text-sm font-medium text-gray transition-colors duration-300 group-hover:text-white">{text}</span>
        </div>
    )
}

export default TrustBadge

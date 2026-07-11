import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface UseCaseCardProps {
    icon: LucideIcon
    title: string
    description: string
    className?: string
}

const UseCaseCard = ({
    icon: Icon,
    title,
    description,
    className,
}: UseCaseCardProps) => {
    return (
        <div
            className={cn(
                'group rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm transition-all duration-500 hover:border-green-light/50 hover:bg-white/10 hover:shadow-2xl hover:shadow-green-light/20 hover:-translate-y-1',
                className,
            )}
        >
            {/* Icon */}
            <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-green-light/10 transition-all duration-300 group-hover:bg-green-light/20 group-hover:scale-110 group-hover:rotate-3">
                <Icon className="h-7 w-7 text-green-light transition-transform duration-300 group-hover:scale-110" />
            </div>

            {/* Title */}
            <h3 className="mb-3 text-lg font-semibold text-white transition-colors duration-300 group-hover:text-green-light">
                {title}
            </h3>

            {/* Description */}
            <p className="leading-relaxed text-sm text-gray transition-colors duration-300 group-hover:text-gray/90">{description}</p>
        </div>
    )
}

export default UseCaseCard

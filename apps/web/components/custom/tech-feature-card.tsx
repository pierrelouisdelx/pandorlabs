import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface TechFeatureCardProps {
    icon: LucideIcon
    title: string
    description: string
    className?: string
}

const TechFeatureCard = ({
    icon: Icon,
    title,
    description,
    className,
}: TechFeatureCardProps) => {
    return (
        <div className={cn('group text-center', className)}>
            {/* Icon */}
            <div className="mb-6 flex justify-center">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-green-light/10 transition-all duration-500 group-hover:bg-green-light/20 group-hover:shadow-2xl group-hover:shadow-green-light/30 group-hover:scale-110 group-hover:rotate-6">
                    <Icon className="h-10 w-10 text-green-light transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6" />
                </div>
            </div>

            {/* Title */}
            <h3 className="mb-4 text-xl font-semibold text-white transition-all duration-300 group-hover:text-green-light group-hover:scale-105">
                {title}
            </h3>

            {/* Description */}
            <p className="leading-relaxed text-gray transition-colors duration-300 group-hover:text-gray/90">{description}</p>
        </div>
    )
}

export default TechFeatureCard

import { cn } from '@/lib/utils'

interface ProcessStepProps {
    number: string
    title: string
    description: string
    className?: string
}

const ProcessStep = ({
    number,
    title,
    description,
    className,
}: ProcessStepProps) => {
    return (
        <div className={cn('group relative', className)}>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all duration-500 hover:border-green-light/50 hover:bg-white/10 hover:shadow-2xl hover:shadow-green-light/20 hover:-translate-y-2">
                {/* Step Number */}
                <div className="mb-6 inline-flex items-center justify-center rounded-full border-2 border-green-light/30 bg-green-light/10 px-5 py-2.5 transition-all duration-300 group-hover:border-green-light/60 group-hover:bg-green-light/20 group-hover:scale-110">
                    <span className="bg-linear-to-l from-green-100 to-green-light bg-clip-text text-xl font-bold text-transparent">
                        {number}
                    </span>
                </div>

                {/* Title */}
                <h3 className="mb-4 text-xl font-semibold text-white transition-colors duration-300 group-hover:text-green-light lg:text-2xl">
                    {title}
                </h3>

                {/* Description */}
                <p className="leading-relaxed text-gray transition-colors duration-300 group-hover:text-gray/90">{description}</p>
            </div>
        </div>
    )
}

export default ProcessStep

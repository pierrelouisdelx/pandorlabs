import { cn } from '@/lib/utils'

const SectionHeading = ({
    title,
    description,
    className,
    titleClassName,
    descriptionClassName,
}: {
    tag?: string
    title: React.ReactNode
    description?: string
    className?: string
    tagClassName?: string
    titleClassName?: string
    descriptionClassName?: string
}) => {
    return (
        <div className={cn('mb-10 text-center lg:mb-14', className)}>
            <h2
                className={cn(
                    'mb-3 text-[26px]/8 font-semibold [&_span]:text-transparent sm:text-3xl lg:mb-5 lg:text-5xl/[60px] [&_span]:bg-linear-to-l [&_span]:from-green-100 [&_span]:to-green-light [&_span]:bg-clip-text',
                    titleClassName,
                )}
            >
                {title}
            </h2>
            <p
                className={cn(
                    'mx-auto w-full max-w-xl text-gray',
                    descriptionClassName,
                )}
            >
                {description}
            </p>
        </div>
    )
}

export default SectionHeading

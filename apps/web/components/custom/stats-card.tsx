import { cn } from '@/lib/utils'

interface StatsCardProps {
    value: string
    label: string
    className?: string
}

const StatsCard = ({ value, label, className }: StatsCardProps) => {
    return (
        <div
            className={cn(
                'group rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all duration-500 hover:border-green-light/50 hover:bg-white/10 hover:shadow-2xl hover:shadow-green-light/20 hover:-translate-y-1',
                className,
            )}
        >
            <div className="text-center">
                <div className="mb-3 bg-linear-to-l from-green-100 to-green-light bg-clip-text text-5xl font-bold text-transparent transition-all duration-300 group-hover:scale-110 lg:text-6xl">
                    {value}
                </div>
                <div className="text-sm font-medium uppercase tracking-wider text-gray transition-colors duration-300 group-hover:text-white">{label}</div>
            </div>
        </div>
    )
}

export default StatsCard

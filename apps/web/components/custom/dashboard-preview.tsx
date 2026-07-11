import { cn } from '@/lib/utils'
import { Activity, CheckCircle2, Clock, Zap } from 'lucide-react'

interface DashboardMetric {
    label: string
    value: string
    icon: React.ComponentType<{ className?: string }>
}

interface DashboardPreviewProps {
    className?: string
}

const DashboardPreview = ({ className }: DashboardPreviewProps) => {
    const metrics: DashboardMetric[] = [
        { label: 'Active Agents', value: '24', icon: Activity },
        { label: 'Requests/min', value: '1.2K', icon: Zap },
        { label: 'Success Rate', value: '99.8%', icon: CheckCircle2 },
        { label: 'Avg Latency', value: '0.8s', icon: Clock },
    ]

    const activities = [
        { time: '2m ago', event: 'Agent web_scraper_v3 completed task', status: 'success' },
        { time: '5m ago', event: 'New data extraction request received', status: 'info' },
        { time: '12m ago', event: 'Agent pricing_monitor updated dataset', status: 'success' },
    ]

    return (
        <div
            className={cn(
                'group overflow-hidden rounded-2xl border border-white/10 bg-black/60 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:border-green-light/30 hover:shadow-green-light/20',
                className,
            )}
        >
            {/* Dashboard Header */}
            <div className="border-b border-white/10 bg-white/5 px-6 py-5 transition-colors duration-300 group-hover:bg-white/10">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white transition-colors duration-300 group-hover:text-green-light">
                        Enterprise Dashboard
                    </h3>
                    <span className="inline-flex items-center gap-2 rounded-full bg-green-light/10 px-3 py-1 text-xs font-medium text-green-light transition-all duration-300 group-hover:bg-green-light/20">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-green-light"></span>
                        Real-time monitoring
                    </span>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4 border-b border-white/10 p-6 lg:grid-cols-4">
                {metrics.map((metric, index) => (
                    <div
                        key={index}
                        className="group/metric rounded-xl border border-white/10 bg-white/5 p-4 transition-all duration-300 hover:border-green-light/30 hover:bg-white/10 hover:shadow-lg hover:shadow-green-light/10 hover:-translate-y-1"
                    >
                        <div className="mb-2 flex items-center gap-2">
                            <metric.icon className="h-4 w-4 text-green-light transition-transform duration-300 group-hover/metric:scale-110" />
                            <span className="text-xs font-medium text-gray transition-colors duration-300 group-hover/metric:text-white">
                                {metric.label}
                            </span>
                        </div>
                        <div className="bg-linear-to-l from-green-100 to-green-light bg-clip-text text-2xl font-bold text-transparent transition-transform duration-300 group-hover/metric:scale-105">
                            {metric.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* Activity Feed */}
            <div className="p-6">
                <h4 className="mb-4 text-sm font-semibold text-white">
                    Recent Activity
                </h4>
                <div className="space-y-3">
                    {activities.map((activity, index) => (
                        <div
                            key={index}
                            className="group/activity flex items-start gap-3 rounded-lg p-2 text-sm transition-all duration-300 hover:bg-white/5"
                        >
                            <div
                                className={cn(
                                    'mt-1.5 h-2.5 w-2.5 rounded-full transition-all duration-300',
                                    activity.status === 'success'
                                        ? 'bg-green-light shadow-lg shadow-green-light/50'
                                        : 'bg-blue-400 shadow-lg shadow-blue-400/50',
                                )}
                            />
                            <div className="flex-1">
                                <p className="text-gray transition-colors duration-300 group-hover/activity:text-white">{activity.event}</p>
                                <span className="text-xs text-gray/60">
                                    {activity.time}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quota Bar */}
                <div className="mt-6">
                    <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="font-medium text-gray">Daily Quota</span>
                        <span className="font-bold text-white">78%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full w-[78%] rounded-full bg-linear-to-r from-green-light to-green-100 shadow-lg shadow-green-light/30 transition-all duration-500" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DashboardPreview

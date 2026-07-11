import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
    'inline-flex items-center relative z-1! justify-center gap-2 whitespace-nowrap font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-light/50 focus-visible:ring-offset-2 focus-visible:ring-offset-primary disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]',
    {
        variants: {
            variant: {
                default:
                    'rounded-full bg-green-100 text-primary shadow-lg shadow-green-light/20 before:absolute before:inset-0 before:-z-1 before:rounded-full before:bg-linear-to-l before:from-transparent before:via-green-light before:to-transparent before:bg-size-[250%] before:bg-left before:duration-500 hover:before:bg-right hover:shadow-xl hover:shadow-green-light/30 hover:-translate-y-0.5',
                destructive:
                    'rounded-full bg-red-500 text-white shadow-lg shadow-red-500/20 hover:bg-red-600 hover:shadow-xl hover:shadow-red-500/30 hover:-translate-y-0.5',
                outline:
                    'rounded-full border-2 border-green-light/30 bg-transparent text-white backdrop-blur-sm hover:bg-green-light/10 hover:border-green-light/50 hover:shadow-lg hover:shadow-green-light/20 hover:-translate-y-0.5',
                secondary:
                    'rounded-full bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:shadow-lg hover:shadow-white/10 hover:-translate-y-0.5',
                ghost: 'rounded-full hover:bg-white/10 hover:text-white',
                link: 'text-green-light underline-offset-4 hover:underline hover:text-green-100',
            },
            size: {
                default: 'px-6 py-3',
                sm: 'px-4 py-2 text-sm',
                lg: 'px-8 py-4 text-lg',
                icon: 'h-10 w-10',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : 'button'
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    },
)
Button.displayName = 'Button'

export { Button, buttonVariants }

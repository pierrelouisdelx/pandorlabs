import * as React from 'react'

import { cn } from '@/lib/utils'

const Textarea = React.forwardRef<
    HTMLTextAreaElement,
    React.ComponentProps<'textarea'>
>(({ className, rows, ...props }, ref) => {
    return (
        <textarea
            className={cn(
                'flex min-h-[60px] w-full resize-none border border-gray/20 bg-white/5 p-4 text-base text-white backdrop-blur-md transition placeholder:text-gray focus:border-green-100/50 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
                className,
            )}
            ref={ref}
            rows={rows}
            {...props}
        />
    )
})
Textarea.displayName = 'Textarea'

export { Textarea }

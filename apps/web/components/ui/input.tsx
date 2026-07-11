'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'
import { cva, VariantProps } from 'class-variance-authority'
import { Slot } from '@radix-ui/react-slot'
import { EyeIcon, EyeOffIcon } from 'lucide-react'

// const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
//   ({ className, type, ...props }, ref) => {
//     return (
//       <input
//         type={type}
//         className={cn(
//           "flex border w-full border-gray/20 bg-white/5 p-4 text-base text-white backdrop-blur-md transition focus:border-green-100/50 placeholder:text-gray focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
//           className
//         )}
//         ref={ref}
//         {...props}
//       />
//     )
//   }
// )
// Input.displayName = "Input"

// export { Input }

const inputVariants = cva(
  'flex border w-full rounded-full border-gray/20 bg-white/5 px-6 py-3.5 text-base text-white backdrop-blur-md transition-all duration-300 focus:border-green-light/50 focus:shadow-lg focus:shadow-green-light/10 placeholder:text-gray focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 hover:border-gray/30',
  {
    variants: {
      variant: {
        default: '',
        'input-form': 'py-3 pr-11',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  asChild?: boolean
  iconLeft?: React.ReactNode
  iconRight?: React.ReactNode
  small?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      type,
      asChild = false,
      small = false,
      iconLeft = null,
      iconRight = null,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'input'
    const [fieldType, setFieldType] = React.useState(type)
    const isIconLeft = iconLeft ? 'pl-11' : ''
    const isIconRight = iconLeft ? 'pr-11' : ''

    return (
      <div className="relative w-full">
        <Comp
          type={fieldType}
          className={cn(
            inputVariants({
              variant,
              className,
            }),
            isIconLeft,
            isIconRight,
          )}
          ref={ref}
          {...props}
        />
        {!!iconLeft && (
          <span
            className={cn(
              'absolute top-1/2 left-4 z-2 size-5 -translate-y-1/2 text-white',
            )}
          >
            {iconLeft}
          </span>
        )}

        {!!iconRight && (
          <span
            className={cn(
              'absolute top-1/2 right-4 z-2 size-5 -translate-y-1/2 text-white',
            )}
          >
            {iconRight}
          </span>
        )}

        {type === 'password' && (
          <button
            tabIndex={-1}
            type="button"
            className="absolute top-1/2 right-4 z-2 inline-flex size-5 -translate-y-1/2 items-center justify-center text-white transition hover:opacity-80"
            onClick={() =>
              setFieldType(fieldType === 'password' ? 'text' : 'password')
            }
          >
            {fieldType === 'password' ? (
              <EyeIcon width={20} height={20} />
            ) : (
              <EyeOffIcon className="size-[18px]" width={16} height={16} />
            )}
          </button>
        )}
      </div>
    )
  },
)
Input.displayName = 'Input'

export { Input, inputVariants }

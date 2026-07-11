'use client'

import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-gray-900 group-[.toaster]:text-white group-[.toaster]:border-white/10 group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-gray-400',
          actionButton:
            'group-[.toast]:bg-green-light group-[.toast]:text-gray-900',
          cancelButton: 'group-[.toast]:bg-white/10 group-[.toast]:text-white',
          success: 'group-[.toast]:border-green-light/30',
          error: 'group-[.toast]:border-red-400/30',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

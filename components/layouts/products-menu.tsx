'use client'

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import * as React from 'react'

const products = [
  {
    id: 'real-estate',
    title: 'Real Estate Data',
    description:
      'Comprehensive property listings, market trends, and investment analytics at your fingertips',
    href: '/products/real-estate',
  },
  {
    id: 'lead-generation',
    title: 'Lead Generation',
    description:
      'Capture, qualify, and convert high-quality leads with automated intelligence',
    href: '/products/lead-generation',
  },
  {
    id: 'shopping',
    title: 'Shopping Monitoring',
    description:
      'Track competitor prices, stock levels, and market trends across e-commerce platforms',
    href: '/products/shopping',
  },
  {
    id: 'crypto',
    title: 'Crypto Data',
    description:
      'Real-time cryptocurrency prices, blockchain analytics, and market intelligence APIs',
    href: '/products/crypto',
  },
  {
    id: 'ai-datasets',
    title: 'AI Datasets',
    description:
      'Production-ready training data for machine learning models across text, vision, and audio',
    href: '/products/ai-datasets',
  },
  {
    id: 'social-media',
    title: 'Social Media Data',
    description:
      'Real-time social media intelligence from 10+ platforms for brand monitoring and analytics',
    href: '/products/social-media',
  },
]

export default function ProductsMenu() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="nav-links bg-transparent text-white">
            Products
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="z-50 grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {products.map((product) => (
                <ListItem
                  key={product.id}
                  title={product.title}
                  href={product.href}
                >
                  {product.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<'a'>,
  React.ComponentPropsWithoutRef<'a'> & { href?: string }
>(({ className, title, children, href, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          ref={ref}
          href={href || '#'}
          className={cn(
            'block space-y-1 rounded-lg p-3 leading-none no-underline transition-colors outline-none select-none hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white',
            className,
          )}
          {...props}
        >
          <div className="text-sm leading-none font-medium text-white">
            {title}
          </div>
          <p className="line-clamp-2 text-xs leading-snug text-white/70">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = 'ListItem'

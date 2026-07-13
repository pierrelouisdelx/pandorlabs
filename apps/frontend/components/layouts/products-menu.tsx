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
import { products } from './products'

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
              <li className="md:col-span-2">
                <NavigationMenuLink asChild>
                  <Link
                    href="/products"
                    className="text-green-light hover:bg-green-light/10 block rounded-lg p-3 text-sm font-medium no-underline transition-colors"
                  >
                    Browse all products →
                  </Link>
                </NavigationMenuLink>
              </li>
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

'use client'

import * as AccordionPrimitive from '@radix-ui/react-accordion'
import NavLink from '@/components/ui/nav-link'
import { cn } from '@/lib/utils'
import { ChevronDownIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import ProductsMenu from './products-menu'
import { products } from './products'

const NavLinks = ({ className }: any) => {
  return (
    <ul
      className={cn(
        'flex flex-col gap-5 transition-all duration-300 lg:flex-row lg:items-center lg:gap-10 lg:p-0',
        className,
      )}
    >
      <li className="inline-block lg:hidden">
        <Link href="/" className="inline-block">
          <Image src="/images/logo.svg" alt="logo" width={128} height={26} />
        </Link>
      </li>
      <span className="via-green-light/50 mb-4 block h-px w-full bg-linear-to-r from-white/5 to-white/5 lg:hidden"></span>
      <li className="hidden lg:block">
        <ProductsMenu />
      </li>
      <li className="lg:hidden">
        <AccordionPrimitive.Root type="single" collapsible>
          <AccordionPrimitive.Item value="products">
            <AccordionPrimitive.Header>
              <AccordionPrimitive.Trigger className="nav-links flex w-full items-center justify-between gap-2 text-left [&[data-state=open]>svg]:rotate-180">
                Products
                <ChevronDownIcon className="size-4 shrink-0 transition-transform duration-300" />
              </AccordionPrimitive.Trigger>
            </AccordionPrimitive.Header>
            <AccordionPrimitive.Content className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden">
              <ul className="mt-3 flex flex-col gap-1 border-l border-white/10 pl-4">
                {products.map((product) => (
                  <li key={product.id}>
                    <Link
                      href={product.href}
                      className="block rounded-lg py-2 text-sm text-white/70 transition-colors hover:text-white"
                    >
                      {product.title}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/products"
                    className="text-green-light block rounded-lg py-2 text-sm font-medium"
                  >
                    Browse all products →
                  </Link>
                </li>
              </ul>
            </AccordionPrimitive.Content>
          </AccordionPrimitive.Item>
        </AccordionPrimitive.Root>
      </li>
      <li>
        <NavLink href="/about" className="nav-links">
          About us
        </NavLink>
      </li>
      <li>
        <NavLink href="/contact" className="nav-links">
          Contact us
        </NavLink>
      </li>
    </ul>
  )
}
export default NavLinks

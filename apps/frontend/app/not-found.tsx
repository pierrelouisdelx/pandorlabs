import { buttonVariants } from '@/components/ui/button'
import helper from '@/lib/helper'
import { Home } from 'lucide-react'
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '404 | PandorLabs',
  description:
    "We couldn't find the page you're looking for. It might have been moved, renamed, or is temporarily unavailable. Let's help you get back on track!",
  openGraph: {
    ...helper.openGraphData,
    title: '404 | PandorLabs',
    description:
      "We couldn't find the page you're looking for. It might have been moved, renamed, or is temporarily unavailable. Let's help you get back on track!",
    url: process.env.NEXT_PUBLIC_APP_URL + '/not-found',
    type: 'website',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL}/not-found`,
  },
}

export default function NotFound() {
  return (
    <>
      <div className="relative flex min-h-screen bg-[url(/images/404.jpg)] bg-cover bg-center bg-no-repeat">
        <span className="from-primary/90 via-primary/80 to-primary/90 absolute inset-0 bg-linear-to-l"></span>
        <div className="relative z-10 container m-auto py-20 text-center">
          <div className="text-center">
            <div>
              <span className="border-webkit absolute mb-5 bg-clip-text text-[100px]/[150px] font-bold tracking-wider text-transparent lg:text-[250px]/[260px]">
                404
              </span>
              <span className="wave-animation to-green-light mb-5 bg-linear-to-l from-green-100 bg-clip-text text-[100px]/[150px] font-bold tracking-wider text-transparent lg:text-[250px]/[260px]">
                404
              </span>
            </div>
            <h1 className="mb-2.5 text-2xl font-semibold sm:text-3xl lg:mb-5 lg:text-[40px]/[50px]">
              Oops! Page not found.
            </h1>
            <div className="text-brown text-gray mx-auto mb-[30px] max-w-xl space-y-4 lg:text-lg/[26px]">
              <p>
                We couldn&apos;t find the page you&apos;re looking for. It might
                have been moved, renamed, or is temporarily unavailable.
                Let&apos;s help you get back on track!
              </p>
            </div>
            <Link href="/" className={buttonVariants()}>
              <Home className="size-4 shrink-0" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "404",
                "url": "${process.env.NEXT_PUBLIC_APP_URL}",
                "description": "Enhance your service offerings and streamline processes with our intuitive AI SaaS template.",
                "inLanguage": "en",
                "image": "${process.env.NEXT_PUBLIC_APP_URL}/images/logo.svg",
                "breadcrumb": {
                    "@type": "BreadcrumbList",
                    "itemListElement": [{
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": "${process.env.NEXT_PUBLIC_APP_URL}"
                    },{
                        "@type": "ListItem",
                        "position": 2,
                        "name": "404 | PandorLabs",
                        "item": "${process.env.NEXT_PUBLIC_APP_URL}/not-found"
                    }]
                }
            }`,
        }}
      />
    </>
  )
}

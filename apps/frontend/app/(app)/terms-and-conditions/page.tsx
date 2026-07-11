import helper from '@/lib/helper'
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms & Conditions | PandorLabs',
  description:
    'PandorLabs Terms & Conditions: User responsibilities, service terms, and legal agreements for using our data intelligence platform. Read our usage policies.',
  keywords: [
    'terms and conditions',
    'terms of service',
    'user agreement',
    'service terms',
    'legal terms',
    'usage policy',
    'service agreement',
    'user responsibilities',
  ],
  openGraph: {
    ...helper.openGraphData,
    title: 'Terms & Conditions | PandorLabs',
    description:
      'PandorLabs Terms & Conditions: User responsibilities, service terms, and legal agreements for using our data intelligence platform.',
    url: process.env.NEXT_PUBLIC_APP_URL + '/terms-and-conditions',
    type: 'website',
    siteName: 'PandorLabs',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms & Conditions | PandorLabs',
    description:
      'PandorLabs Terms & Conditions: User responsibilities, service terms, and legal agreements for using our data intelligence platform.',
    images: [`${process.env.NEXT_PUBLIC_APP_URL}/images/og-image.jpg`],
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL}/terms-and-conditions`,
  },
}

export default function TermsConditions() {
  return (
    <>
      <div className="relative -mt-24 bg-[url(/images/privacy-bg.jpg)] bg-cover bg-right bg-no-repeat pt-24 sm:bg-center">
        <div className="flex h-60 items-center justify-center lg:h-80">
          <span className="from-primary/90 to-primary/40 absolute inset-0 bg-linear-to-r"></span>
          <h1 className="relative container text-center text-[30px]/9 font-semibold sm:text-4xl lg:text-5xl/[60px]">
            Terms &
            <span className="to-green-light bg-linear-to-l from-green-100 bg-clip-text text-transparent">
              &nbsp;Conditions
            </span>
          </h1>
        </div>
      </div>

      <div className="prose lg:prose-lg mx-auto w-full max-w-[1142px] px-4 pt-12 lg:pt-20">
        <p>
          Welcome to PandorLabs! By using our services, you agree to comply with
          and be bound by the following Terms &amp; Conditions. Please read
          these terms carefully before using our website and services.
        </p>
        <ol type="1">
          <li>
            <h2>Acceptance of terms</h2>
            <p>
              By accessing or using our services, you agree to these Terms &amp;
              Conditions. If you do not agree, do not use our services.
            </p>
          </li>
          <li>
            <h2>User responsibilities</h2>
            <ul>
              <li>
                You agree to use our services for lawful purposes only and in
                compliance with all applicable laws and regulations.
              </li>
              <li>
                You agree not to engage in activities that may disrupt or damage
                the functionality of our platform or harm other users.
              </li>
            </ul>
          </li>
          <li>
            <h2>Account creation</h2>
            <ul>
              <li>
                To access certain features, you may need to create an account.
                You are responsible for maintaining the confidentiality of your
                login credentials and all activities that occur under your
                account.
              </li>
              <li>
                You agree to provide accurate, current, and complete information
                when creating your account.
              </li>
            </ul>
          </li>
          <li>
            <h2>Payment and Pricing</h2>
            <ul>
              <li>
                Our services are offered at various pricing tiers. By
                subscribing to any paid plan, you agree to pay the specified
                fees in accordance with the billing terms.
              </li>
              <li>
                Payments are processed securely, and you are responsible for
                ensuring that the billing information provided is accurate and
                up-to-date.
              </li>
            </ul>
          </li>
          <li>
            <h2>Service availability</h2>
            <p>
              We make reasonable efforts to ensure our platform is accessible
              24/7. However, we do not guarantee uninterrupted access, and we
              may perform maintenance or updates as needed.
            </p>
          </li>
          <li>
            <h2>License to use</h2>
            <p>
              PandorLabs grants you a limited, non-exclusive, non-transferable
              license to use our platform and services for personal or business
              purposes in accordance with these Terms.
            </p>
          </li>
          <li>
            <h2>Prohibited activities</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use our services for illegal or unauthorized activities</li>
              <li>
                Attempt to gain unauthorized access to our systems or services
              </li>
              <li>
                Use the platform to distribute harmful, misleading, or offensive
                content
              </li>
            </ul>
          </li>
          <li>
            <h2>Termination of service</h2>
            <ul>
              <li>
                We reserve the right to suspend or terminate your account and
                access to our services if you violate these Terms &amp;
                Conditions.
              </li>
              <li>
                You may terminate your account at any time by contacting us or
                using the account settings.
              </li>
            </ul>
          </li>
          <li>
            <h2>Limitation of liability</h2>
            <p>
              PandorLabs’s liability to you is limited to the amount paid for
              the specific service in question. We are not liable for indirect,
              incidental, or consequential damages resulting from your use of
              the platform.
            </p>
          </li>
          <li>
            <h2>Privacy and data protection</h2>
            <p>
              Your use of our services is also governed by our Privacy Policy,
              which explains how we collect, use, and protect your personal
              data. Please review our Privacy Policy for more information.
            </p>
          </li>
          <li>
            <h2>Amendments to terms</h2>
            <p>
              We may update these Terms &amp; Conditions from time to time. Any
              changes will be posted on this page, and the effective date will
              be updated accordingly. Continued use of our services after
              changes are made constitutes your acceptance of the new terms.
            </p>
          </li>
          <li>
            <h2>Contacting Us</h2>
            <p>
              If there are any questions regarding this privacy policy, you may
              contact us using the information below:
            </p>
            <p className="mb-2.5 leading-5! lg:mb-5">
              Email address: &nbsp;
              <Link href="mailto:info@pandorlabs.com">info@pandorlabs.com</Link>
            </p>
          </li>
        </ol>
        <div className="pt-5">
          <p>
            Thank you for your continued support, and we hope our website
            remains a valuable resource for you.
          </p>
          <p className="mb-0!">Sincerely,</p>
          <h4 className="text-green-light">PandorLabs Team</h4>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
                "@context": "https://schema.org",
                "@type": "WebPage",
                "name": "Terms & Conditions | PandorLabs",
                "url": "${process.env.NEXT_PUBLIC_APP_URL}/terms-and-conditions",
                "description": "PandorLabs Terms & Conditions: User responsibilities, service terms, and legal agreements for using our data intelligence platform. Read our usage policies.",
                "inLanguage": "en",
                "image": "${process.env.NEXT_PUBLIC_APP_URL}/images/logo.svg",
                "isPartOf": {
                    "@type": "WebSite",
                    "name": "PandorLabs",
                    "url": "${process.env.NEXT_PUBLIC_APP_URL}"
                },
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
                        "name": "Terms & Conditions",
                        "item": "${process.env.NEXT_PUBLIC_APP_URL}/terms-and-conditions"
                    }]
                }
            }`,
        }}
      />
    </>
  )
}

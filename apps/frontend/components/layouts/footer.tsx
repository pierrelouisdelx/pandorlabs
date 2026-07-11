import Logo from './logo'
import Image from 'next/image'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTelegram, faDiscord } from '@fortawesome/free-brands-svg-icons'

export default function Footer() {
  return (
    <div className="mt-auto shadow-[0_0_20px_-10px_rgba(255,255,255,0.4)]">
      <div className="container">
        <div className="relative py-14 text-center lg:py-20">
          <Image
            src="/images/round.png"
            width={900}
            height={450}
            alt="round"
            className="absolute bottom-0 left-1/2 -z-1 w-[900px] -translate-x-1/2 animate-pulse opacity-80"
          />
          <div className="flex justify-center">
            <Logo />
          </div>
          <ul className="mt-10 flex flex-col items-center justify-center gap-5 sm:flex-row sm:gap-10">
            <li>
              <Link href="/about" className="hover:text-green">
                About us
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-green">
                Contact us
              </Link>
            </li>
            <li>
              <Link href="/privacy-policy" className="hover:text-green">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms-and-conditions" className="hover:text-green">
                Terms & Conditions
              </Link>
            </li>
          </ul>
        </div>
        <div className="flex flex-col items-center gap-5 border-t border-white/30 py-7 sm:flex-row sm:justify-between">
          <p className="order-2 text-center font-semibold sm:order-0 md:text-left">
            © {new Date().getFullYear()}&nbsp;PandorLabs, Inc. All rights
            reserved.
          </p>
          <div className="order-1 flex items-center gap-5 sm:order-0">
            <Link href="#" target="_blank">
              <span className="sr-only">Telegram</span>
              <FontAwesomeIcon
                icon={faTelegram}
                className="h-8 w-8 hover:scale-110"
              />
            </Link>
            <Link href="#" target="_blank">
              <span className="sr-only">Discord</span>
              <FontAwesomeIcon
                icon={faDiscord}
                className="h-6 w-6 hover:scale-110"
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

import Image from 'next/image'
import Link from 'next/link'

const COMPANIES = [
  { logo: 'avian', href: 'https://avian.io', name: 'avian' },
  { logo: 'nvidia', href: 'https://www.nvidia.com', name: 'nvidia' },
  { logo: 'maxai', href: 'https://www.maxcare.ai', name: 'max ai' },
  { logo: 'palantir', href: 'https://www.palantir.com', name: 'palantir' },
  { logo: 'joinmassive', href: 'https://www.joinmassive.com', name: 'massive' },
  {
    logo: 'siemens-healthineers',
    href: 'https://www.siemens-healthineers.com',
    name: 'siemens healthineers',
  },
  { logo: 'cryptoautos', href: 'https://www.cryptoautos.com', name: 'cryptoautos' },
] as const

function formatAlt(name: string) {
  return name
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function CompanyLogo({
  logo,
  href,
  name,
}: {
  logo: string
  href: string
  name: string
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="mx-6 flex shrink-0 items-center opacity-80 transition-opacity hover:opacity-100 sm:mx-8 md:mx-12"
    >
      <Image
        src={`/images/companies/${logo}.svg`}
        alt={formatAlt(name)}
        width={198}
        height={79}
        className="h-auto w-24 sm:w-32 md:w-40 lg:w-48"
      />
    </Link>
  )
}

const CompanyLogoMarquee = () => {
  return (
    <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <div className="flex w-max animate-marquee-scroll">
        <div className="flex items-center">
          {COMPANIES.map((company) => (
            <CompanyLogo key={company.logo} {...company} />
          ))}
        </div>
        <div className="flex items-center" aria-hidden="true">
          {COMPANIES.map((company) => (
            <CompanyLogo key={`${company.logo}-duplicate`} {...company} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default CompanyLogoMarquee

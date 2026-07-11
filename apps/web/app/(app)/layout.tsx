import Footer from '@/components/layouts/footer'
import Header from '@/components/layouts/header'

export default function DefaultLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <Header />
      <div className="grow pb-20">{children}</div>
      <Footer />
    </>
  )
}

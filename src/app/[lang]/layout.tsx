import { Inter } from 'next/font/google'
import { Layout } from '@/components/Layout'
import { i18n, type Locale } from '@/lib/i18n-config'
import '../globals.css'

const inter = Inter({ subsets: ['latin'] })

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }))
}

export default function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { lang: Locale }
}) {
  return (
    <html lang={params.lang}>
      <body className={inter.className}>
        <Layout>{children}</Layout>
      </body>
    </html>
  )
}

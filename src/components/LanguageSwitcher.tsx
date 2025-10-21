'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { i18n, type Locale, addLocaleToPath } from '@/lib/i18n-config'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Globe } from 'lucide-react'

export default function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const pathname = usePathname()

  // Remove current locale from pathname to get the base path
  const getLocalizedPath = (locale: Locale) => {
    let pathWithoutLocale = pathname

    // Remove existing locale prefix
    for (const loc of i18n.locales) {
      if (pathname.startsWith(`/${loc}/`) || pathname === `/${loc}`) {
        pathWithoutLocale = pathname.replace(`/${loc}`, '') || '/'
        break
      }
    }

    // Add new locale (or not, if it's default)
    return addLocaleToPath(pathWithoutLocale, locale)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Globe size={16} />
          <span className="hidden sm:inline">{i18n.localeNames[currentLocale]}</span>
          <span className="sm:hidden">{i18n.localeFlags[currentLocale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {i18n.locales.map((locale) => (
          <DropdownMenuItem key={locale} asChild>
            <Link href={getLocalizedPath(locale)} className="flex items-center gap-2 cursor-pointer">
              <span>{i18n.localeFlags[locale]}</span>
              <span>{i18n.localeNames[locale]}</span>
              {locale === currentLocale && <span className="ml-auto text-xs">✓</span>}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const i18n = {
  defaultLocale: 'en',
  locales: ['en', 'zh', 'ja'],
  localeNames: {
    en: 'English',
    zh: '中文',
    ja: '日本語',
  },
  localeFlags: {
    en: '🇺🇸',
    zh: '🇨🇳',
    ja: '🇯🇵',
  }
} as const

export type Locale = (typeof i18n)['locales'][number]

// Check if a path contains a locale
export function getLocaleFromPath(pathname: string): Locale | null {
  const segments = pathname.split('/')
  const potentialLocale = segments[1]

  if (i18n.locales.includes(potentialLocale as Locale)) {
    return potentialLocale as Locale
  }

  return null
}

// Remove locale from path
export function removeLocaleFromPath(pathname: string): string {
  const locale = getLocaleFromPath(pathname)
  if (locale) {
    return pathname.replace(`/${locale}`, '') || '/'
  }
  return pathname
}

// Add locale to path
export function addLocaleToPath(pathname: string, locale: Locale): string {
  // Don't add default locale to path
  if (locale === i18n.defaultLocale) {
    return removeLocaleFromPath(pathname)
  }

  const pathWithoutLocale = removeLocaleFromPath(pathname)
  return `/${locale}${pathWithoutLocale}`
}

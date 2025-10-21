'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { i18n, type Locale, addLocaleToPath, removeLocaleFromPath } from '@/lib/i18n-config'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { X, Globe } from 'lucide-react'

// Import all dictionaries for client-side use
import enDict from '@/dictionaries/en.json'
import zhDict from '@/dictionaries/zh.json'
import jaDict from '@/dictionaries/ja.json'

const dictionaries = {
  en: enDict,
  zh: zhDict,
  ja: jaDict,
}

interface LanguageSuggestionProps {
  currentLocale: Locale
  currentPath: string
}

export default function LanguageSuggestion({ currentLocale, currentPath }: LanguageSuggestionProps) {
  const router = useRouter()
  const [showSuggestion, setShowSuggestion] = useState(false)
  const [browserLocale, setBrowserLocale] = useState<Locale | null>(null)

  useEffect(() => {
    // Check if user has already dismissed the suggestion
    const dismissed = localStorage.getItem('language-suggestion-dismissed')
    if (dismissed === 'true') {
      return
    }

    // Detect browser language
    const browserLang = navigator.language.toLowerCase()

    // Extract the language code (e.g., 'zh-CN' -> 'zh', 'en-US' -> 'en')
    const langCode = browserLang.split('-')[0]

    // Check if we support this language and if it differs from current locale
    if (i18n.locales.includes(langCode as Locale) && langCode !== currentLocale) {
      setBrowserLocale(langCode as Locale)
      setShowSuggestion(true)
    }
  }, [currentLocale])

  const handleSwitch = () => {
    if (!browserLocale) return

    // Remove current locale and add new locale to path
    const pathWithoutLocale = removeLocaleFromPath(currentPath)
    const newPath = addLocaleToPath(pathWithoutLocale, browserLocale)

    // Remember user's preference
    localStorage.setItem('language-suggestion-dismissed', 'true')
    setShowSuggestion(false)

    // Navigate to new locale
    router.push(newPath)
  }

  const handleDismiss = () => {
    localStorage.setItem('language-suggestion-dismissed', 'true')
    setShowSuggestion(false)
  }

  if (!showSuggestion || !browserLocale) {
    return null
  }

  // Get dictionary for browser's language (not current page language!)
  const dict = dictionaries[browserLocale]
  const browserLanguageName = i18n.localeNames[browserLocale]
  const currentLanguageName = i18n.localeNames[currentLocale]

  // Replace placeholders in translation strings
  const message = dict.language.suggestion.message.replace('{language}', browserLanguageName)
  const switchText = dict.language.suggestion.switch.replace('{language}', browserLanguageName)
  const dismissText = dict.language.suggestion.dismiss.replace('{currentLanguage}', currentLanguageName)

  return (
    <div className="fixed top-16 left-0 right-0 z-30 px-4 py-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto">
        <Alert className="border-primary/50 bg-primary/5">
          <Globe className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between gap-4">
            <span className="text-sm">{message}</span>
            <div className="flex items-center gap-2 shrink-0">
              <Button size="sm" onClick={handleSwitch} className="h-8">
                {switchText}
              </Button>
              <Button size="sm" variant="ghost" onClick={handleDismiss} className="h-8">
                {dismissText}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="h-8 w-8 p-0"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}

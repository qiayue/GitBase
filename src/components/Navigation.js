'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Github } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import LanguageSwitcher from '@/components/LanguageSwitcher'
import LanguageSuggestion from '@/components/LanguageSuggestion'
import { i18n, getLocaleFromPath } from '@/lib/i18n-config'

const navItems = [
  { path: '/', label: 'Home' },
  { path: '/resources', label: 'Resources' },
  { path: '/posts', label: 'Articles' },
]

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Extract current locale from pathname
  const currentLocale = getLocaleFromPath(pathname) || i18n.defaultLocale

  // Get localized paths for nav items
  const getLocalizedPath = (path) => {
    if (currentLocale === i18n.defaultLocale) {
      return path
    }
    return `/${currentLocale}${path}`
  }

  useEffect(() => {
    let isMounted = true;
    const checkLoginStatus = async () => {
      if (!isMounted) return;
      setIsLoading(true);
      try {
        const response = await fetch('/api/check-auth');
        const data = await response.json();
        if (isMounted) setIsLoggedIn(data.isLoggedIn);
      } catch (error) {
        console.error('Failed to check auth status:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    checkLoginStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      setIsLoggedIn(false);
      router.push('/');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <>
      <LanguageSuggestion currentLocale={currentLocale} currentPath={pathname} />
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
        <div className="flex gap-6 md:gap-10">
          <Link href={getLocalizedPath('/')} className="flex items-center space-x-2">
            <span className="inline-block font-bold">GitBase</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            {navItems.map((item) => {
              const localizedPath = getLocalizedPath(item.path)
              return (
                <Link
                  key={item.path}
                  href={localizedPath}
                  className={cn(
                    "flex items-center text-sm font-medium text-muted-foreground",
                    pathname === localizedPath && "text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher currentLocale={currentLocale} />
          <Link
            href="https://github.com/qiayue/gitbase"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground"
          >
            <Github className="h-5 w-5" />
            <span className="sr-only">GitHub</span>
          </Link>
          {!isLoading && (
            isLoggedIn ? (
              <>
                <Link href={getLocalizedPath('/admin')}>
                  <Button variant="ghost">Admin</Button>
                </Link>
                <Button onClick={handleLogout} variant="outline">Logout</Button>
              </>
            ) : (
              <Link href={getLocalizedPath('/login')}>
                <Button>Login</Button>
              </Link>
            )
          )}
        </div>
      </div>
    </header>
    </>
  )
}
// components/ResourceList.js
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ExternalLink } from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import CategoryBadge from './CategoryBadge'
import { getLocaleFromPath, addLocaleToPath } from '@/lib/i18n-config'

export default function ResourceList({ resources, showMoreLink = true }) {
  const [categories, setCategories] = useState([])
  const pathname = usePathname()
  const currentLocale = getLocaleFromPath(pathname)

  useEffect(() => {
    // Fetch categories
    fetch('/api/categories?type=resource')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error('Error fetching categories:', err))
  }, [])

  const getLocalizedPath = (path) => {
    return addLocaleToPath(path, currentLocale)
  }

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold tracking-tighter">Resources</h2>
        {showMoreLink && (
          <Link href={getLocalizedPath('/resources')} className="text-blue-600 hover:text-blue-800 transition-colors">
            More resources →
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {resources.map((resource, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                {resource.category && <CategoryBadge category={resource.category} categories={categories} />}
              </div>
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-1"
              >
                <CardTitle>{resource.name}</CardTitle>
                <ExternalLink size={16} />
              </a>
              <CardDescription>{resource.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  )
}
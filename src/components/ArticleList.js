// components/ArticleList.js
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import CategoryBadge from './CategoryBadge'

export default function ArticleList({ articles, showMoreLink = true }) {
  const [categories, setCategories] = useState([])

  useEffect(() => {
    // Fetch categories
    fetch('/api/categories?type=article')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error('Error fetching categories:', err))
  }, [])

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold tracking-tighter">Articles</h2>
        {showMoreLink && (
          <Link href="/posts" className="text-blue-600 hover:text-blue-800 transition-colors">
            More articles →
          </Link>
        )}
      </div>
      <div className="space-y-6">
        {articles.map(({ id, title, description, category }) => (
          <Card key={id}>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                {category && <CategoryBadge category={category} categories={categories} />}
              </div>
              <Link
                href={`/posts/${id}`}
                className="text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-1"
              >
                <CardTitle>{title}</CardTitle>
                →
              </Link>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  )
}
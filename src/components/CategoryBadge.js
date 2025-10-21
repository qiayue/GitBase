'use client'

import { Badge } from "@/components/ui/badge"

const colorMap = {
  blue: 'blue',
  green: 'green',
  purple: 'purple',
  red: 'red',
  orange: 'orange',
}

export default function CategoryBadge({ category, categories }) {
  if (!category) return null

  // Find category details
  const categoryInfo = categories?.find(cat => cat.id === category)

  if (!categoryInfo) {
    return <Badge variant="outline">{category}</Badge>
  }

  const variant = colorMap[categoryInfo.color] || 'default'

  return (
    <Badge variant={variant}>
      {categoryInfo.name}
    </Badge>
  )
}

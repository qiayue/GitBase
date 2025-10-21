import fs from 'fs'
import path from 'path'
import ResourceList from '@/components/ResourceList'
import { getDictionary } from '@/lib/get-dictionary'
import { i18n } from '@/lib/i18n-config'

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }))
}

export async function generateMetadata({ params }) {
  const dict = await getDictionary(params.lang)

  return {
    title: dict.resources.title,
    description: 'Explore our curated list of resources for web development, GitHub, and more.',
  }
}

export default async function Resources({ params }) {
  const dict = await getDictionary(params.lang)
  const resourcesPath = path.join(process.cwd(), 'data', 'json', 'resources.json')
  const allResources = JSON.parse(fs.readFileSync(resourcesPath, 'utf8'))
  // Filter out deleted resources
  const resources = allResources.filter(resource => !resource.deleted)

  return (
    <div className="container mx-auto py-12">
      <ResourceList resources={resources} showMoreLink={false} />
    </div>
  )
}

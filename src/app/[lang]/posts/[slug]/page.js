import { getPostData } from '@/lib/posts'
import Link from 'next/link'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { getDictionary } from '@/lib/get-dictionary'
import { i18n, addLocaleToPath } from '@/lib/i18n-config'

export async function generateStaticParams() {
  // This would need to be populated with actual slugs
  return []
}

export async function generateMetadata({ params }) {
  const postData = await getPostData(params.slug)
  return {
    title: `${postData.title}`,
    description: postData.description || `Read about ${postData.title} on GitBase`,
  }
}

export default async function Post({ params }) {
  const dict = await getDictionary(params.lang)
  const postData = await getPostData(params.slug)

  const homePath = addLocaleToPath('/', params.lang)
  const postsPath = addLocaleToPath('/posts', params.lang)

  return (
    <article className="container mx-auto px-4 py-12 max-w-3xl">
      {/* Breadcrumb navigation */}
      <nav className="flex items-center text-sm text-gray-500 mb-6">
        <Link href={homePath} className="hover:text-blue-600">{dict.navigation.home}</Link>
        <ChevronRight className="mx-2" size={16} />
        <Link href={postsPath} className="hover:text-blue-600">{dict.navigation.posts}</Link>
        <ChevronRight className="mx-2" size={16} />
        <span className="text-gray-900">{postData.title}</span>
      </nav>

      {/* Meta information card */}
      <div className="bg-gray-100 rounded-lg p-6 mb-8">
        {postData.date && (
          <p className="text-gray-600 mb-2">{new Date(postData.date).toLocaleDateString()}</p>
        )}
        {postData.description && (
          <p className="text-gray-800">{postData.description}</p>
        )}
      </div>

      {/* Article content */}
      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: postData.contentHtml }}
      />

      {/* Back to articles link */}
      <div className="mt-12">
        <Link href={postsPath} className="text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-2">
          <ArrowLeft size={20} />
          {dict.navigation.posts}
        </Link>
      </div>
    </article>
  )
}

import ArticleList from '@/components/ArticleList'
import { getSortedPostsData } from '@/lib/posts';

export const metadata = {
  title: 'Articles',
  description: 'Read our latest articles on web development, GitHub tips, and best practices.',
};

export default function Articles() {
  const allPostsData = getSortedPostsData();


  return (
    <div className="container mx-auto py-12">
      <ArticleList articles={allPostsData} showMoreLink={false} />
    </div>
  )
}


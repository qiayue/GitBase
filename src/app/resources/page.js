import fs from 'fs';
import path from 'path';
import ResourceList from '@/components/ResourceList'


export const metadata = {
  title: 'Resources',
  description: 'Explore our curated list of resources for web development, GitHub, and more.',
}


export default function Resources() {
  const resourcesPath = path.join(process.cwd(), 'data', 'json', 'resources.json');
  const resources = JSON.parse(fs.readFileSync(resourcesPath, 'utf8'));

  return (
    <div className="container mx-auto py-12">
      <ResourceList resources={resources} showMoreLink={false} />
    </div>
  )
}
import fs from 'fs';
import path from 'path';
import ResourceList from '@/components/ResourceList'


export const metadata = {
  title: 'Resources',
  description: 'Explore our curated list of resources for web development, GitHub, and more.',
}


export default function Resources() {
  const resourcesPath = path.join(process.cwd(), 'data', 'json', 'resources.json');
  const allResources = JSON.parse(fs.readFileSync(resourcesPath, 'utf8'));
  // Filter out deleted resources
  const resources = allResources.filter(resource => !resource.deleted);

  return (
    <div className="container mx-auto py-12">
      <ResourceList resources={resources} showMoreLink={false} />
    </div>
  )
}
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RotateCcw, Trash2 } from 'lucide-react';

export default function TrashPage() {
  const [articles, setArticles] = useState([]);
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/check-auth');
      const data = await response.json();
      if (!data.isLoggedIn) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      router.push('/login');
    }
  }, [router]);

  const fetchDeletedItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch deleted articles
      const articlesRes = await fetch('/api/articles?includeDeleted=true');
      if (articlesRes.ok) {
        const articlesData = await articlesRes.json();
        setArticles(articlesData.filter(a => a.deleted));
      }

      // Fetch deleted resources
      const resourcesRes = await fetch('/api/resources?source=github&includeDeleted=true');
      if (resourcesRes.ok) {
        const resourcesData = await resourcesRes.json();
        setResources(resourcesData.filter(r => r.deleted));
      }
    } catch (error) {
      console.error('Error fetching deleted items:', error);
      setError('Failed to fetch deleted items');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
    fetchDeletedItems();
  }, [checkAuth, fetchDeletedItems]);

  const handleRestoreArticle = useCallback(async (articlePath) => {
    if (!confirm('确定要恢复此文章吗？')) {
      return;
    }

    try {
      const response = await fetch('/api/articles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: articlePath, action: 'restore' }),
      });

      if (!response.ok) {
        throw new Error('Failed to restore article');
      }

      fetchDeletedItems();
      alert('文章已恢复');
    } catch (error) {
      console.error('Error restoring article:', error);
      alert('恢复文章失败');
    }
  }, [fetchDeletedItems]);

  const handlePermanentDeleteArticle = useCallback(async (articlePath) => {
    if (!confirm('警告：此操作将永久删除文章且无法恢复！确定要继续吗？')) {
      return;
    }

    try {
      const response = await fetch('/api/articles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: articlePath, action: 'permanentDelete' }),
      });

      if (!response.ok) {
        throw new Error('Failed to permanently delete article');
      }

      fetchDeletedItems();
      alert('文章已永久删除');
    } catch (error) {
      console.error('Error permanently deleting article:', error);
      alert('永久删除失败');
    }
  }, [fetchDeletedItems]);

  const handleRestoreResource = useCallback(async (index) => {
    if (!confirm('确定要恢复此资源吗？')) {
      return;
    }

    try {
      const response = await fetch('/api/resources', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index, action: 'restore' }),
      });

      if (!response.ok) {
        throw new Error('Failed to restore resource');
      }

      fetchDeletedItems();
      alert('资源已恢复');
    } catch (error) {
      console.error('Error restoring resource:', error);
      alert('恢复资源失败');
    }
  }, [fetchDeletedItems]);

  const handlePermanentDeleteResource = useCallback(async (index) => {
    if (!confirm('警告：此操作将永久删除资源且无法恢复！确定要继续吗？')) {
      return;
    }

    try {
      const response = await fetch('/api/resources', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index, action: 'permanentDelete' }),
      });

      if (!response.ok) {
        throw new Error('Failed to permanently delete resource');
      }

      fetchDeletedItems();
      alert('资源已永久删除');
    } catch (error) {
      console.error('Error permanently deleting resource:', error);
      alert('永久删除失败');
    }
  }, [fetchDeletedItems]);

  if (isLoading) return <div className="container mx-auto p-4">Loading...</div>;
  if (error) return <div className="container mx-auto p-4">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Trash Bin</h1>
      <div className="mb-4">
        <Link href="/admin">
          <Button>Back to Admin Dashboard</Button>
        </Link>
      </div>

      <Tabs defaultValue="articles" className="w-full">
        <TabsList>
          <TabsTrigger value="articles">
            Articles ({articles.length})
          </TabsTrigger>
          <TabsTrigger value="resources">
            Resources ({resources.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="articles">
          {articles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No deleted articles
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Deleted At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.map((article, index) => (
                  <TableRow key={index}>
                    <TableCell>{article.title}</TableCell>
                    <TableCell>{article.description}</TableCell>
                    <TableCell>
                      {article.deletedAt ? new Date(article.deletedAt).toLocaleString() : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRestoreArticle(article.path)}
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Restore
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handlePermanentDeleteArticle(article.path)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete Forever
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="resources">
          {resources.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No deleted resources
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Deleted At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resources.map((resource, index) => (
                  <TableRow key={index}>
                    <TableCell>{resource.name}</TableCell>
                    <TableCell>{resource.description}</TableCell>
                    <TableCell className="max-w-xs truncate">{resource.url}</TableCell>
                    <TableCell>
                      {resource.deletedAt ? new Date(resource.deletedAt).toLocaleString() : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRestoreResource(index)}
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Restore
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handlePermanentDeleteResource(index)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete Forever
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

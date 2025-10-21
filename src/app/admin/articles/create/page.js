'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";

export default function CreateArticlePage() {
  const [article, setArticle] = useState({ title: '', description: '', content: '', slug: '', category: '' });
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Fetch article categories
    fetch('/api/categories?type=article')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error('Error fetching categories:', err));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setArticle({ ...article, [name]: value });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/articles/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(article),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create article');
      }

      router.push('/admin/articles');
    } catch (error) {
      console.error('Error creating article:', error);
      setError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create New Article</h1>
      {error && <Alert variant="destructive" className="mb-4">{error}</Alert>}
      <div className="space-y-4">
        <Input
          name="title"
          value={article.title}
          onChange={handleInputChange}
          placeholder="Article Title"
        />
        <Input
          name="description"
          value={article.description}
          onChange={handleInputChange}
          placeholder="Article Description"
        />
        <Input
          name="slug"
          value={article.slug}
          onChange={handleInputChange}
          placeholder="Article Slug (e.g., my-new-article)"
        />
        <div>
          <label className="block text-sm font-medium mb-2">Category (Optional)</label>
          <select
            name="category"
            value={article.category}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">No Category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <Textarea
          name="content"
          value={article.content}
          onChange={handleInputChange}
          placeholder="Article Content (Markdown)"
          rows={20}
        />
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Creating...' : 'Create Article'}
        </Button>
      </div>
    </div>
  );
}
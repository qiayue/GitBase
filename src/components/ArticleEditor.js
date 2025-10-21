'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ArticleEditor() {
  const [article, setArticle] = useState({ title: '', description: '', content: '', path: '', category: '' });
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const searchParams = useSearchParams();
  const path = searchParams.get('path');

  useEffect(() => {
    if (path) {
      fetchArticle(decodeURIComponent(path));
    } else {
      setError('No article path provided');
      setIsLoading(false);
    }

    // Fetch categories
    fetch('/api/categories?type=article')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error('Error fetching categories:', err));
  }, [path]);

  const fetchArticle = async (articlePath) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/articles?path=${encodeURIComponent(articlePath)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch article');
      }
      const data = await response.json();
      setArticle(data);
    } catch (error) {
      console.error('Error fetching article:', error);
      setError('Failed to fetch article. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setArticle({ ...article, [name]: value });
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ article }),
      });
      if (!response.ok) {
        throw new Error('Failed to save article');
      }
      alert('Article saved successfully');
    } catch (error) {
      console.error('Error saving article:', error);
      setError('Failed to save article. Please try again.');
    }
  };

  if (isLoading) return <div>Loading article...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
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
      <div>
        <label className="block text-sm font-medium mb-2">Category (Optional)</label>
        <select
          name="category"
          value={article.category || ''}
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
        placeholder="Article Content"
        rows={20}
      />
      <Button onClick={handleSave}>Save Article</Button>
    </div>
  );
}
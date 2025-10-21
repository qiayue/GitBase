'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2 } from 'lucide-react';

export default function AdminPage() {
  const [resources, setResources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newResource, setNewResource] = useState({ name: '', description: '', url: '', category: '' });
  const [editingIndex, setEditingIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/check-auth');
      const data = await response.json();
      if (!data.isLoggedIn) {
        router.push('/login');
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setError('Failed to authenticate. Please try again.');
      setIsLoading(false);
    }
  }, [router]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/categories?type=resource');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  const fetchResources = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/resources?source=github');
      if (!response.ok) {
        throw new Error('Failed to fetch resources');
      }
      const data = await response.json();
      setResources(data);
    } catch (error) {
      console.error('Error fetching resources:', error);
      setError('Failed to fetch resources. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
    fetchResources();
    fetchCategories();
  }, [checkAuth, fetchResources, fetchCategories]);

  const handleInputChange = (e, index = null) => {
    const { name, value } = e.target;
    if (index !== null) {
      const updatedResources = [...resources];
      updatedResources[index] = { ...updatedResources[index], [name]: value };
      setResources(updatedResources);
    } else {
      setNewResource({ ...newResource, [name]: value });
    }
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
  };

  const handleSave = async (index) => {
    let updatedResources = [...resources];
    if (index === -1) {
      updatedResources.push(newResource);
      setNewResource({ name: '', description: '', url: '', category: '' });
    }
    try {
      const response = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedResources),
      });
      if (!response.ok) {
        throw new Error('Failed to save resources');
      }
      await fetchResources(); // Fetch the latest data after saving
      setEditingIndex(null);
    } catch (error) {
      console.error('Error saving resources:', error);
      setError('Failed to save resources. Please try again.');
    }
  };

  const handleDelete = useCallback(async (index) => {
    if (!confirm('确定要将此资源移至垃圾箱吗？')) {
      return;
    }

    try {
      const response = await fetch(`/api/resources?index=${index}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete resource');
      }

      await fetchResources();
      alert('资源已移至垃圾箱');
    } catch (error) {
      console.error('Error deleting resource:', error);
      alert('删除失败');
    }
  }, [fetchResources]);

  if (isLoading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="mb-4 flex gap-2">
        <Link href="/admin/articles">
          <Button>Manage Articles</Button>
        </Link>
        <Link href="/admin/trash">
          <Button variant="outline">
            <Trash2 className="h-4 w-4 mr-2" />
            垃圾箱
          </Button>
        </Link>
        <Link href="/admin/ai-dev">
          <Button variant="outline">AI 功能开发中心</Button>
        </Link>
      </div>
      <h2 className="text-xl font-bold mb-4">Resource Management</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>URL</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {resources.map((resource, index) => (
            <TableRow key={index}>
              <TableCell>
                {editingIndex === index ? (
                  <Input name="name" value={resource.name} onChange={(e) => handleInputChange(e, index)} />
                ) : (
                  resource.name
                )}
              </TableCell>
              <TableCell>
                {editingIndex === index ? (
                  <Input name="description" value={resource.description} onChange={(e) => handleInputChange(e, index)} />
                ) : (
                  resource.description
                )}
              </TableCell>
              <TableCell>
                {editingIndex === index ? (
                  <Input name="url" value={resource.url} onChange={(e) => handleInputChange(e, index)} />
                ) : (
                  resource.url
                )}
              </TableCell>
              <TableCell>
                {editingIndex === index ? (
                  <select
                    name="category"
                    value={resource.category || ''}
                    onChange={(e) => handleInputChange(e, index)}
                    className="w-full border rounded px-2 py-1"
                  >
                    <option value="">No Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                ) : (
                  categories.find(c => c.id === resource.category)?.name || '-'
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {editingIndex === index ? (
                    <Button onClick={() => handleSave(index)}>Save</Button>
                  ) : (
                    <Button onClick={() => handleEdit(index)}>Edit</Button>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell>
              <Input name="name" value={newResource.name} onChange={handleInputChange} placeholder="New resource name" />
            </TableCell>
            <TableCell>
              <Input name="description" value={newResource.description} onChange={handleInputChange} placeholder="New resource description" />
            </TableCell>
            <TableCell>
              <Input name="url" value={newResource.url} onChange={handleInputChange} placeholder="New resource URL" />
            </TableCell>
            <TableCell>
              <select
                name="category"
                value={newResource.category}
                onChange={handleInputChange}
                className="w-full border rounded px-2 py-1"
              >
                <option value="">No Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </TableCell>
            <TableCell>
              <Button onClick={() => handleSave(-1)}>Add New</Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
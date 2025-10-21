'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the component that uses useSearchParams
const ArticleEditor = dynamic(() => import('@/components/ArticleEditor'), {
  ssr: false,
});

export default function ArticleEditorPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Article</h1>
      <Suspense fallback={<div>Loading editor...</div>}>
        <ArticleEditor />
      </Suspense>
    </div>
  );
}
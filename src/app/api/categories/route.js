import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

const owner = process.env.GITHUB_OWNER;
const repo = process.env.GITHUB_REPO;
const categoriesJsonPath = 'data/json/categories.json';
const localPath = path.join(process.cwd(), 'data', 'json', 'categories.json');

async function getCategoriesFromGitHub() {
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: categoriesJsonPath,
    });

    const content = Buffer.from(data.content, 'base64').toString('utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error fetching categories from GitHub:', error);
    throw error;
  }
}

function getLocalCategories() {
  try {
    return JSON.parse(fs.readFileSync(localPath, 'utf8'));
  } catch (error) {
    console.error('Error reading local categories:', error);
    return [];
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const source = searchParams.get('source');
  const type = searchParams.get('type'); // 'article' or 'resource'

  try {
    let categories;

    if (source === 'github') {
      categories = await getCategoriesFromGitHub();
    } else {
      categories = getLocalCategories();
    }

    // Filter by type if specified
    if (type) {
      categories = categories.filter(cat => cat.type === type);
    }

    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req) {
  // Double-check authentication
  const { verifyRequestAuth } = await import('@/lib/auth');
  if (!verifyRequestAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const updatedCategories = await req.json();

  try {
    // Validate categories structure
    if (!Array.isArray(updatedCategories)) {
      return NextResponse.json({ error: 'Categories must be an array' }, { status: 400 });
    }

    // Update GitHub file
    const { data: currentFile } = await octokit.repos.getContent({
      owner,
      repo,
      path: categoriesJsonPath,
    });

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: categoriesJsonPath,
      message: 'Update categories',
      content: Buffer.from(JSON.stringify(updatedCategories, null, 2)).toString('base64'),
      sha: currentFile.sha,
    });

    return NextResponse.json({ message: 'Categories updated successfully' });
  } catch (error) {
    console.error('Error updating categories:', error);
    return NextResponse.json({ error: 'Failed to update categories' }, { status: 500 });
  }
}

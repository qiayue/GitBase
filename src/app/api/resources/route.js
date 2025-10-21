import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

const owner = process.env.GITHUB_OWNER;
const repo = process.env.GITHUB_REPO;
const githubPath = 'data/json/resources.json';
const localPath = path.join(process.cwd(), 'data', 'json', 'resources.json');

async function getResourcesFromGitHub() {
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: githubPath,
    });

    const content = Buffer.from(data.content, 'base64').toString('utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error fetching resources from GitHub:', error);
    throw error;
  }
}

function getLocalResources() {
  return JSON.parse(fs.readFileSync(localPath, 'utf8'));
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const source = searchParams.get('source');
  const category = searchParams.get('category');
  const includeDeleted = searchParams.get('includeDeleted') === 'true';

  try {
    let resources;

    if (source === 'github') {
      resources = await getResourcesFromGitHub();
    } else {
      // Default to local file for homepage
      resources = getLocalResources();
    }

    // Filter out deleted resources unless explicitly requested
    if (!includeDeleted) {
      resources = resources.filter(resource => !resource.deleted);
    }

    // Filter by category if specified
    if (category) {
      resources = resources.filter(resource => resource.category === category);
    }

    return NextResponse.json(resources);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 });
  }
}

export async function POST(req) {
  // Double-check authentication (belt and suspenders approach)
  const { verifyRequestAuth } = await import('@/lib/auth');
  if (!verifyRequestAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const updatedResources = await req.json();

  try {
    const { data: currentFile } = await octokit.repos.getContent({
      owner,
      repo,
      path: githubPath,
    });

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: githubPath,
      message: 'Update resources',
      content: Buffer.from(JSON.stringify(updatedResources, null, 2)).toString('base64'),
      sha: currentFile.sha,
    });

    // Update local file as well
    //fs.writeFileSync(localPath, JSON.stringify(updatedResources, null, 2));

    return NextResponse.json(updatedResources);
  } catch (error) {
    console.error('Error updating resources:', error);
    return NextResponse.json({ error: 'Failed to update resources' }, { status: 500 });
  }
}

// Soft delete (mark as deleted)
export async function DELETE(req) {
  const { verifyRequestAuth } = await import('@/lib/auth');
  if (!verifyRequestAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const index = searchParams.get('index');

  if (index === null) {
    return NextResponse.json({ error: 'Index is required' }, { status: 400 });
  }

  try {
    const { data: currentFile } = await octokit.repos.getContent({
      owner,
      repo,
      path: githubPath,
    });

    const content = Buffer.from(currentFile.content, 'base64').toString('utf8');
    let resources = JSON.parse(content);

    // Mark resource as deleted
    const resourceIndex = parseInt(index);
    if (resourceIndex >= 0 && resourceIndex < resources.length) {
      resources[resourceIndex] = {
        ...resources[resourceIndex],
        deleted: true,
        deletedAt: new Date().toISOString()
      };

      await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: githubPath,
        message: `Soft delete resource: ${resources[resourceIndex].name}`,
        content: Buffer.from(JSON.stringify(resources, null, 2)).toString('base64'),
        sha: currentFile.sha,
      });

      return NextResponse.json({ message: 'Resource moved to trash' });
    }

    return NextResponse.json({ error: 'Invalid index' }, { status: 400 });
  } catch (error) {
    console.error('Error deleting resource:', error);
    return NextResponse.json({ error: 'Failed to delete resource' }, { status: 500 });
  }
}

// Restore or permanently delete
export async function PATCH(req) {
  const { verifyRequestAuth } = await import('@/lib/auth');
  if (!verifyRequestAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { index, action } = await req.json();

  if (index === null || !action) {
    return NextResponse.json({ error: 'Index and action are required' }, { status: 400 });
  }

  try {
    const { data: currentFile } = await octokit.repos.getContent({
      owner,
      repo,
      path: githubPath,
    });

    const content = Buffer.from(currentFile.content, 'base64').toString('utf8');
    let resources = JSON.parse(content);

    const resourceIndex = parseInt(index);

    if (action === 'restore') {
      // Restore resource
      if (resourceIndex >= 0 && resourceIndex < resources.length) {
        resources[resourceIndex] = {
          ...resources[resourceIndex],
          deleted: false,
          deletedAt: undefined
        };

        await octokit.repos.createOrUpdateFileContents({
          owner,
          repo,
          path: githubPath,
          message: `Restore resource: ${resources[resourceIndex].name}`,
          content: Buffer.from(JSON.stringify(resources, null, 2)).toString('base64'),
          sha: currentFile.sha,
        });

        return NextResponse.json({ message: 'Resource restored' });
      }
    } else if (action === 'permanentDelete') {
      // Permanently delete: remove from array
      if (resourceIndex >= 0 && resourceIndex < resources.length) {
        const deletedResource = resources[resourceIndex];
        resources.splice(resourceIndex, 1);

        await octokit.repos.createOrUpdateFileContents({
          owner,
          repo,
          path: githubPath,
          message: `Permanently delete resource: ${deletedResource.name}`,
          content: Buffer.from(JSON.stringify(resources, null, 2)).toString('base64'),
          sha: currentFile.sha,
        });

        return NextResponse.json({ message: 'Resource permanently deleted' });
      }
    }

    return NextResponse.json({ error: 'Invalid action or index' }, { status: 400 });
  } catch (error) {
    console.error('Error in PATCH:', error);
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
  }
}
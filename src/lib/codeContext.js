/**
 * 代码上下文提取工具
 * 用于分析项目结构并构建 AI 所需的上下文
 */

import { Octokit } from '@octokit/rest';

/**
 * 获取项目代码上下文（客户端版本 - 使用 GitHub API）
 * @param {string} owner - GitHub 仓库所有者
 * @param {string} repo - GitHub 仓库名称
 * @param {string} token - GitHub Token
 * @param {string} branch - 分支名称
 * @returns {Promise<Object>} - 代码上下文对象
 */
export async function getProjectContext(owner, repo, token, branch = 'main') {
  const octokit = new Octokit({ auth: token });

  try {
    // 获取仓库文件树
    const { data: treeData } = await octokit.git.getTree({
      owner,
      repo,
      tree_sha: branch,
      recursive: '1'  // 递归获取所有文件
    });

    // 过滤出重要的文件
    const importantFiles = treeData.tree.filter(item => {
      const path = item.path;
      return (
        item.type === 'blob' && (
          // 配置文件
          path === 'package.json' ||
          path === 'next.config.js' ||
          path === 'tailwind.config.js' ||
          path === '.env.example' ||
          // 关键源代码目录
          path.startsWith('src/app/') ||
          path.startsWith('src/components/') ||
          path.startsWith('src/lib/') ||
          // 数据文件
          path.startsWith('data/')
        )
      );
    });

    // 构建文件树结构
    const fileTree = buildFileTree(importantFiles.map(f => f.path));

    // 读取关键配置文件
    const packageJson = await readFileContent(octokit, owner, repo, 'package.json');
    const envExample = await readFileContent(octokit, owner, repo, '.env.example');

    // 读取关键代码文件的列表（不读取内容，只提供结构）
    const componentFiles = importantFiles
      .filter(f => f.path.startsWith('src/components/'))
      .map(f => f.path);

    const appFiles = importantFiles
      .filter(f => f.path.startsWith('src/app/'))
      .map(f => f.path);

    const libFiles = importantFiles
      .filter(f => f.path.startsWith('src/lib/'))
      .map(f => f.path);

    return {
      projectInfo: {
        name: packageJson?.name || 'GitBase',
        description: packageJson?.description || '',
        dependencies: packageJson?.dependencies || {},
        devDependencies: packageJson?.devDependencies || {}
      },
      structure: {
        components: componentFiles,
        pages: appFiles,
        libs: libFiles,
        fileTree: fileTree
      },
      env: envExample,
      techStack: extractTechStack(packageJson)
    };
  } catch (error) {
    console.error('获取项目上下文失败:', error);
    throw error;
  }
}

/**
 * 读取文件内容
 */
async function readFileContent(octokit, owner, repo, path) {
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path
    });

    if (data.type === 'file' && data.content) {
      return JSON.parse(Buffer.from(data.content, 'base64').toString('utf8'));
    }
    return null;
  } catch (error) {
    console.error(`读取文件失败 ${path}:`, error.message);
    return null;
  }
}

/**
 * 构建文件树结构
 */
function buildFileTree(paths) {
  const tree = {};

  paths.forEach(path => {
    const parts = path.split('/');
    let current = tree;

    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        // 文件
        if (!current.files) current.files = [];
        current.files.push(part);
      } else {
        // 目录
        if (!current[part]) current[part] = {};
        current = current[part];
      }
    });
  });

  return tree;
}

/**
 * 从 package.json 提取技术栈
 */
function extractTechStack(packageJson) {
  if (!packageJson || !packageJson.dependencies) {
    return [];
  }

  const deps = packageJson.dependencies;
  const stack = [];

  if (deps['next']) stack.push('Next.js');
  if (deps['react']) stack.push('React');
  if (deps['typescript'] || packageJson.devDependencies?.['typescript']) stack.push('TypeScript');
  if (deps['tailwindcss'] || packageJson.devDependencies?.['tailwindcss']) stack.push('Tailwind CSS');
  if (deps['@octokit/rest']) stack.push('GitHub API (Octokit)');
  if (deps['gray-matter']) stack.push('Markdown');

  return stack;
}

/**
 * 简化的上下文（用于减少 token 使用）
 * @param {Object} fullContext - 完整上下文
 * @returns {Object} - 简化的上下文
 */
export function simplifyContext(fullContext) {
  return {
    techStack: fullContext.techStack,
    structure: {
      components: fullContext.structure.components.map(f => f.split('/').pop()),
      pages: fullContext.structure.pages.filter(f => f.endsWith('page.js') || f.endsWith('page.tsx')),
      libs: fullContext.structure.libs.map(f => f.split('/').pop())
    },
    dependencies: Object.keys(fullContext.projectInfo.dependencies || {})
  };
}

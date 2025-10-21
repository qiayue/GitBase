/**
 * GitHub 批量提交工具
 * 使用 Git Trees API 批量提交多个文件修改，避免超过 API 频率限制
 */

import { Octokit } from '@octokit/rest';

/**
 * 批量提交文件修改到 GitHub
 * @param {Object} options - 配置选项
 * @param {string} options.owner - GitHub 仓库所有者
 * @param {string} options.repo - GitHub 仓库名称
 * @param {string} options.token - GitHub Token
 * @param {string} options.branch - 分支名称
 * @param {Array} options.files - 文件修改数组 [{path, content, action}]
 * @param {string} options.commitMessage - Commit 消息
 * @returns {Promise<Object>} - Commit 信息
 */
export async function batchCommitFiles(options) {
  const { owner, repo, token, branch, files, commitMessage } = options;

  const octokit = new Octokit({ auth: token });

  try {
    console.log(`开始批量提交 ${files.length} 个文件到分支 ${branch}...`);

    // 1. 获取分支的最新 commit
    const { data: refData } = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${branch}`
    });

    const latestCommitSha = refData.object.sha;
    console.log(`最新 commit SHA: ${latestCommitSha}`);

    // 2. 获取最新 commit 的 tree
    const { data: commitData } = await octokit.git.getCommit({
      owner,
      repo,
      commit_sha: latestCommitSha
    });

    const baseTreeSha = commitData.tree.sha;
    console.log(`基础 tree SHA: ${baseTreeSha}`);

    // 3. 为每个文件创建 blob 并构建 tree
    const treeItems = [];

    for (const file of files) {
      if (file.action === 'create' || file.action === 'modify') {
        // 创建 blob
        const { data: blobData } = await octokit.git.createBlob({
          owner,
          repo,
          content: Buffer.from(file.content).toString('base64'),
          encoding: 'base64'
        });

        treeItems.push({
          path: file.path,
          mode: '100644',  // 普通文件模式
          type: 'blob',
          sha: blobData.sha
        });

        console.log(`创建 blob: ${file.path} (${blobData.sha.substring(0, 7)})`);
      }
      // 注意：我们不支持删除文件（符合设计约束）
    }

    // 4. 创建新的 tree
    const { data: newTreeData } = await octokit.git.createTree({
      owner,
      repo,
      base_tree: baseTreeSha,
      tree: treeItems
    });

    console.log(`创建新 tree: ${newTreeData.sha}`);

    // 5. 创建新的 commit
    const { data: newCommitData } = await octokit.git.createCommit({
      owner,
      repo,
      message: commitMessage,
      tree: newTreeData.sha,
      parents: [latestCommitSha]
    });

    console.log(`创建新 commit: ${newCommitData.sha}`);

    // 6. 更新分支引用
    await octokit.git.updateRef({
      owner,
      repo,
      ref: `heads/${branch}`,
      sha: newCommitData.sha
    });

    console.log(`更新分支引用成功！`);

    return {
      success: true,
      commitSha: newCommitData.sha,
      commitUrl: newCommitData.html_url,
      filesChanged: files.length
    };

  } catch (error) {
    console.error('批量提交失败:', error);
    throw new Error(`批量提交失败: ${error.message}`);
  }
}

/**
 * 验证文件路径
 * @param {string} path - 文件路径
 * @returns {boolean} - 是否有效
 */
export function validateFilePath(path) {
  // 禁止的路径模式
  const forbiddenPatterns = [
    /^\.\./,           // 不允许 ../
    /\/\.\./,          // 不允许 /../
    /^\.env$/,         // 不允许修改 .env
    /^\.git\//,        // 不允许修改 .git
    /node_modules\//,  // 不允许修改 node_modules
  ];

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(path)) {
      return false;
    }
  }

  return true;
}

/**
 * 读取现有文件内容（用于 diff 对比）
 * @param {Octokit} octokit - Octokit 实例
 * @param {string} owner - 仓库所有者
 * @param {string} repo - 仓库名称
 * @param {string} path - 文件路径
 * @returns {Promise<string|null>} - 文件内容
 */
export async function readExistingFile(octokit, owner, repo, path) {
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path
    });

    if (data.type === 'file' && data.content) {
      return Buffer.from(data.content, 'base64').toString('utf8');
    }
    return null;
  } catch (error) {
    // 文件不存在
    if (error.status === 404) {
      return null;
    }
    throw error;
  }
}

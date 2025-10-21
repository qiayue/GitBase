/**
 * OpenRouter API 调用工具
 * 用于调用 Claude 模型生成代码
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * 调用 OpenRouter API
 * @param {string} apiKey - OpenRouter API Key
 * @param {string} model - 模型名称，如 'anthropic/claude-3.5-sonnet'
 * @param {Array} messages - 消息数组
 * @param {number} maxTokens - 最大 token 数
 * @returns {Promise<string>} - AI 返回的文本
 */
export async function callOpenRouter(apiKey, model, messages, maxTokens = 4000) {
  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
        'X-Title': 'GitBase AI Dev'
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        max_tokens: maxTokens,
        temperature: 0.7,
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenRouter API 错误: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenRouter API 调用失败:', error);
    throw error;
  }
}

/**
 * 生成代码修改的 prompt
 * @param {string} featureRequest - 用户的功能需求
 * @param {Object} codeContext - 代码上下文
 * @returns {Array} - 消息数组
 */
export function buildCodeGenerationPrompt(featureRequest, codeContext) {
  const systemPrompt = `你是一个专业的全栈开发工程师，擅长 Next.js、React、TypeScript 和 GitHub API。

项目技术栈：
- Next.js 14 (App Router)
- React
- TypeScript
- Tailwind CSS
- Shadcn/UI
- GitHub API (Octokit)
- JWT 认证

你的任务是根据用户的功能需求，生成相应的代码修改方案。

**重要约束**：
1. 只能修改现有文件或创建新文件，不能删除文件
2. 必须遵循项目现有的代码风格和架构
3. 生成的代码必须是完整可运行的
4. 使用现有的 UI 组件库（Shadcn/UI）
5. 所有 API 路由都需要添加身份验证
6. 使用 GitHub API 来存储数据（无数据库）

**输出格式**：
请以 JSON 格式返回代码修改方案，格式如下：

\`\`\`json
{
  "description": "功能实现说明",
  "files": [
    {
      "path": "src/components/Example.js",
      "action": "create",
      "content": "完整的文件内容..."
    },
    {
      "path": "src/app/page.js",
      "action": "modify",
      "content": "修改后的完整文件内容..."
    }
  ],
  "commitMessage": "简洁的 commit 消息"
}
\`\`\`

action 可以是：
- "create": 创建新文件
- "modify": 修改现有文件

请确保返回的是纯 JSON，不要包含任何其他文本或解释。`;

  const userPrompt = `项目代码结构：
${JSON.stringify(codeContext, null, 2)}

用户的功能需求：
${featureRequest}

请生成实现此功能的代码修改方案。`;

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];
}

/**
 * 解析 AI 返回的代码修改方案
 * @param {string} aiResponse - AI 返回的文本
 * @returns {Object} - 解析后的修改方案
 */
export function parseCodeChanges(aiResponse) {
  try {
    // 尝试提取 JSON (可能包含在 markdown 代码块中)
    const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/) ||
                     aiResponse.match(/```\s*([\s\S]*?)\s*```/);

    const jsonStr = jsonMatch ? jsonMatch[1] : aiResponse;
    const parsed = JSON.parse(jsonStr.trim());

    // 验证必需字段
    if (!parsed.files || !Array.isArray(parsed.files)) {
      throw new Error('返回的数据格式不正确：缺少 files 数组');
    }

    // 验证每个文件修改
    for (const file of parsed.files) {
      if (!file.path || !file.action || !file.content) {
        throw new Error(`文件修改格式不正确: ${JSON.stringify(file)}`);
      }
      if (!['create', 'modify'].includes(file.action)) {
        throw new Error(`不支持的操作: ${file.action}`);
      }
    }

    return parsed;
  } catch (error) {
    console.error('解析 AI 返回数据失败:', error);
    throw new Error(`AI 返回的数据格式不正确: ${error.message}`);
  }
}

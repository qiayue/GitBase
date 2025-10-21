# GitBase

[GitBase](https://gitbase.app/) 是一个无需传统数据库的开源动态网站解决方案，使用 Next.js、Tailwind CSS 和 Shadcn/UI 构建。它利用 GitHub 作为内容管理系统，提供了一种无缝创建和管理网站内容的方式。

![GitBase](https://toimg.xyz/file/5aa892c8e8385232fcdf3.png)

## 在 Vercel 上部署

[![使用 Vercel 部署](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fqiayue%2Fgitbase&project-name=GitBase&repository-name=GitBase&external-id=https%3A%2F%2Fgithub.com%2Fqiayue%2Fgitbase%2Ftree%2Fmain)

## 功能特性

- **无数据库架构**：利用 GitHub 进行内容存储和管理
- **动态内容**：使用 Next.js 服务端渲染动态渲染内容
- **Markdown 支持**：使用 Markdown 格式编写内容，便于编辑和版本控制
- **管理界面**：内置管理面板进行内容管理
- **AI 驱动的功能开发**：革命性的 AI 开发中心，从自然语言请求生成代码
- **自我进化的 CMS**：网站可以通过 AI 自主成长和添加功能
- **多语言支持**：内置国际化支持，支持子目录路由（en、zh、ja）
- **智能语言检测**：自动检测浏览器语言并提供非侵入式建议
- **分类系统**：使用可视化分类徽章组织文章和资源
- **响应式设计**：使用 Tailwind CSS 实现完全响应式设计
- **SEO 友好**：通过动态元数据优化搜索引擎
- **易于部署**：简单的 Vercel 部署流程

## 前置要求

- Node.js（14 版本或更高）
- npm（随 Node.js 一起安装）
- Git
- GitHub 账号
- Vercel 账号（用于部署）

## 安装

1. 克隆仓库：
   ```
   git clone https://github.com/qiayue/gitbase.git
   cd gitbase
   ```

2. 安装依赖：
   ```
   npm install
   ```

3. 在根目录创建 `.env.local` 文件并添加以下内容：
   ```
   GITHUB_TOKEN=你的github个人访问令牌
   GITHUB_OWNER=你的github用户名
   GITHUB_REPO=你的仓库名称
   JWT_SECRET=你的jwt密钥
   DOMAIN=localhost
   ACCESS_USERNAME=你的管理员用户名
   ACCESS_PASSWORD=你的安全访问密码
   ```

4. 设置你的 GitHub 仓库：
   - 在 GitHub 上创建一个新仓库
   - 在仓库中创建两个文件夹：`data/json` 和 `data/md`
   - 在 `data/json` 中，创建一个名为 `resources.json` 的文件，内容为空数组：`[]`

5. 运行开发服务器：
   ```
   npm run dev
   ```

访问 `http://localhost:3000` 即可看到本地运行的 GitBase 实例。

## 部署

1. 将代码推送到 GitHub。
2. 登录 Vercel 并从 GitHub 仓库创建新项目。
3. 在 Vercel 中配置环境变量：
   - `GITHUB_TOKEN` - 你的 GitHub 个人访问令牌
   - `GITHUB_OWNER` - 你的 GitHub 用户名
   - `GITHUB_REPO` - 你的仓库名称
   - `JWT_SECRET` - 一个安全的随机字符串（至少 32 个字符）
   - `DOMAIN` - 你的生产域名（例如：yourdomain.com）
   - `ACCESS_USERNAME` - 登录的管理员用户名
   - `ACCESS_PASSWORD` - 登录的管理员密码
4. 部署项目。

详细的部署指南，请参考我们的[安装和部署指南](https://gitbase.app/posts/gitbase-install-guide)。

## 使用方法

- 访问 `/login` 并输入你的 `ACCESS_USERNAME` 和 `ACCESS_PASSWORD` 进入管理面板
- 通过 `/admin` 的管理界面创建和编辑文章
- 在管理面板中管理资源
- 所有更改会自动与 GitHub 仓库同步
- 出于安全考虑，管理员会话在 1 小时后过期

## AI 功能开发中心

GitBase 包含一个革命性的 **AI 驱动功能开发中心**，允许你的网站自主进化并添加新功能。此功能通过 OpenRouter 调用 Claude AI，从自然语言请求生成代码。

### 工作原理

1. **描述你的功能**：用中文（或任何语言）描述你想要的功能
2. **AI 分析**：系统通过 GitHub API 分析你的项目结构
3. **代码生成**：Claude AI 生成必要的代码修改
4. **审查更改**：使用可视化 diff 查看器预览所有文件更改
5. **一键部署**：使用 Git Trees API 批量提交所有更改到 GitHub
6. **即时更新**：你的网站立即拥有新功能

### 设置说明

#### 1. 获取 OpenRouter API 密钥

1. 访问 [OpenRouter.ai](https://openrouter.ai)
2. 注册账号
3. 进入 API Keys 部分
4. 生成新的 API 密钥（以 `sk-or-v1-...` 开头）

#### 2. 创建 GitHub 个人访问令牌

1. 进入 GitHub 设置 → 开发者设置 → 个人访问令牌 → Tokens (classic)
2. 点击 "Generate new token (classic)"
3. 给它一个描述性名称（例如："GitBase AI Dev"）
4. 选择以下权限范围：
   - ✅ `repo`（私有仓库的完全控制）
5. 点击 "Generate token"
6. **重要**：立即复制令牌（你将无法再次看到它）

#### 3. 配置 AI 开发中心

1. 登录你的 GitBase 管理面板（`/login`）
2. 导航到 **AI 功能开发中心**（`/admin/ai-dev`）
3. 点击**"配置"**按钮
4. 输入以下信息：

   **OpenRouter 配置：**
   - **OpenRouter API Key**：粘贴你的 OpenRouter API 密钥
   - **AI 模型**：选择 "Claude 3.5 Sonnet"（推荐）

   **GitHub 配置：**
   - **GitHub Token**：粘贴你的个人访问令牌
   - **GitHub Owner**：你的 GitHub 用户名
   - **GitHub Repo**：你的仓库名称（例如："gitbase"）
   - **分支名称**：要提交到的分支（默认："main"）

5. 点击**"保存配置"**
   - 所有凭证都安全地存储在你的浏览器 localStorage 中
   - 它们永远不会发送到任何服务器，除了 GitHub 和 OpenRouter API

### 使用 AI 开发中心

#### 示例 1：添加功能

**功能需求：**
```
我想在首页添加一个轮播图组件，展示最新的 3 篇文章，
每 5 秒自动切换，带有平滑的淡入淡出过渡效果。
```

**流程：**
1. 在"功能需求"文本框中粘贴请求
2. 点击**"生成代码"**
3. 观看执行日志，AI 将：
   - 分析你的项目结构
   - 识别相关文件
   - 生成新代码
4. 在代码 diff 查看器中审查生成的更改
5. 点击**"确认并提交到 GitHub"**
6. 完成！功能已上线

#### 示例 2：修复 Bug

**功能需求：**
```
文章列表页面没有显示分类徽章。请修复这个问题，
在文章卡片中添加 CategoryBadge 组件。
```

#### 示例 3：添加样式

**功能需求：**
```
让导航栏在滚动时具有粘性效果和模糊背景，
类似现代网页设计。
```

### 技术细节

#### 批量提交优化

AI 开发中心使用 GitHub 的 **Git Trees API** 进行高效批量提交：
- 多个文件更改在单个操作中提交
- 无论修改多少文件，只需 3-4 个 API 请求
- 避免 GitHub API 速率限制
- 原子提交确保一致性

#### 安全特性

1. **仅本地存储**：API 密钥存储在浏览器 localStorage 中
2. **路径验证**：防止修改敏感文件（.env、.git 等）
3. **人工审查**：所有代码更改必须在提交前审查
4. **无自动合并**：更改已提交但不会自动部署（生产环境需要手动审查）

#### 支持的操作

- ✅ 创建新文件
- ✅ 修改现有文件
- ❌ 删除文件（出于安全考虑已禁用）

### 最佳实践

1. **从小处开始**：首先测试简单功能
2. **使用测试分支**：为实验配置测试分支
3. **审查代码**：提交前始终审查 AI 生成的代码
4. **清晰描述**：在功能请求中要具体和详细
5. **迭代方法**：将复杂功能分解为较小的步骤

### 故障排除

**"请先配置 OpenRouter API Key"**
- 进入配置并输入你的 OpenRouter API 密钥

**"获取项目上下文失败"**
- 检查你的 GitHub 令牌是否具有 `repo` 权限
- 验证所有者/仓库名称是否正确
- 确保分支存在于你的仓库中

**"超过速率限制"**
- 批量提交功能应该能防止这种情况
- 如果发生，等待几分钟后重试
- 考虑使用不同的 GitHub 令牌

**"AI 生成了无效代码"**
- 尝试更清楚地重新表述你的请求
- 将复杂请求分解为较小的任务
- 审查并手动修复生成的代码

### 限制

- AI 生成的代码可能需要手动调整
- 复杂功能可能需要多次迭代
- AI 无法访问你的数据库或环境变量
- 最适合 UI 组件、页面和前端逻辑

## 贡献

我们欢迎对 GitBase 的贡献！请阅读我们的[贡献指南](https://gitbase.app/posts/how-to-contributing-to-gitbase)了解我们的行为准则和提交拉取请求的流程。

## 许可证

GitBase 是根据 [MIT 许可证](https://github.com/qiayue/gitbase/?tab=MIT-1-ov-file)授权的开源软件。

## 支持

如果你遇到任何问题或有疑问，请在 GitHub 仓库上提交 issue。

## 致谢

GitBase 使用以下开源库构建：
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn/UI](https://ui.shadcn.com/)

我们感谢这些项目的维护者和贡献者。

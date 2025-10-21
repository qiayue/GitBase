# GitBase

[GitBase](https://gitbase.app/) is an open-source dynamic website solution without a traditional database, built with Next.js, Tailwind CSS, and Shadcn/UI. It leverages GitHub as a content management system, providing a seamless way to create and manage website content.

![GitBase](https://toimg.xyz/file/5aa892c8e8385232fcdf3.png)


## Deploy on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fqiayue%2Fgitbase&project-name=GitBase&repository-name=GitBase&external-id=https%3A%2F%2Fgithub.com%2Fqiayue%2Fgitbase%2Ftree%2Fmain)


## Features

- **Database-free Architecture**: Utilizes GitHub for content storage and management.
- **Dynamic Content**: Renders content dynamically using Next.js server-side rendering.
- **Markdown Support**: Write your content in Markdown format for easy editing and version control.
- **Admin Interface**: Built-in admin panel for content management.
- **AI-Powered Feature Development**: Revolutionary AI development center that generates code from natural language requests.
- **Self-Evolving CMS**: The website can grow and add features autonomously through AI.
- **Multi-language Support**: Built-in internationalization with subdirectory routing (en, zh, ja).
- **Smart Language Detection**: Automatic browser language detection with non-intrusive suggestions.
- **Category System**: Organize articles and resources with visual category badges.
- **Responsive Design**: Fully responsive design using Tailwind CSS.
- **SEO Friendly**: Optimized for search engines with dynamic metadata.
- **Easy Deployment**: Simple deployment process to Vercel.

## Prerequisites

- Node.js (version 14 or later)
- npm (comes with Node.js)
- Git
- GitHub account
- Vercel account (for deployment)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/qiayue/gitbase.git
   cd gitbase
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env.local` file in the root directory and add the following:
   ```
   GITHUB_TOKEN=your_github_personal_access_token
   GITHUB_OWNER=your_github_username
   GITHUB_REPO=your_repo_name
   JWT_SECRET=your_jwt_secret_key
   DOMAIN=localhost
   ACCESS_USERNAME=your_admin_username
   ACCESS_PASSWORD=your_secure_access_password
   ```

4. Set up your GitHub repository:
   - Create a new repository on GitHub
   - Create two folders in the repository: `data/json` and `data/md`
   - In `data/json`, create a file named `resources.json` with an empty array: `[]`

5. Run the development server:
   ```
   npm run dev
   ```

Visit `http://localhost:3000` to see your GitBase instance running locally.

## Deployment

1. Push your code to GitHub.
2. Log in to Vercel and create a new project from your GitHub repository.
3. Configure the environment variables in Vercel:
   - `GITHUB_TOKEN` - Your GitHub personal access token
   - `GITHUB_OWNER` - Your GitHub username
   - `GITHUB_REPO` - Your repository name
   - `JWT_SECRET` - A secure random string (at least 32 characters)
   - `DOMAIN` - Your production domain (e.g., yourdomain.com)
   - `ACCESS_USERNAME` - Admin username for login
   - `ACCESS_PASSWORD` - Admin password for login
4. Deploy the project.

For a detailed deployment guide, please refer to our [Installation and Deployment Guide](https://gitbase.app/posts/gitbase-install-guide).

## Usage

- Access the admin panel by navigating to `/login` and entering your `ACCESS_USERNAME` and `ACCESS_PASSWORD`.
- Create and edit articles through the admin interface at `/admin`.
- Manage resources in the admin panel.
- All changes are automatically synced with your GitHub repository.
- Admin session expires after 1 hour for security.

## AI Feature Development Center

GitBase includes a revolutionary **AI-Powered Feature Development Center** that allows your website to evolve and add new features autonomously. This feature leverages Claude AI through OpenRouter to generate code from natural language requests.

### How It Works

1. **Describe Your Feature**: Write what you want in plain English (or any language)
2. **AI Analyzes**: The system analyzes your project structure via GitHub API
3. **Code Generation**: Claude AI generates the necessary code modifications
4. **Review Changes**: Preview all file changes with a visual diff viewer
5. **One-Click Deploy**: Batch commit all changes to GitHub using Git Trees API
6. **Instant Update**: Your website immediately has the new feature

### Setup Instructions

#### 1. Get OpenRouter API Key

1. Visit [OpenRouter.ai](https://openrouter.ai)
2. Sign up for an account
3. Navigate to API Keys section
4. Generate a new API key (starts with `sk-or-v1-...`)

#### 2. Create GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a descriptive name (e.g., "GitBase AI Dev")
4. Select the following scopes:
   - ✅ `repo` (Full control of private repositories)
5. Click "Generate token"
6. **Important**: Copy the token immediately (you won't see it again)

#### 3. Configure AI Development Center

1. Log in to your GitBase admin panel (`/login`)
2. Navigate to **AI Feature Development Center** (`/admin/ai-dev`)
3. Click the **"Configuration"** button
4. Enter the following information:

   **OpenRouter Configuration:**
   - **OpenRouter API Key**: Paste your OpenRouter API key
   - **AI Model**: Select "Claude 3.5 Sonnet" (recommended)

   **GitHub Configuration:**
   - **GitHub Token**: Paste your Personal Access Token
   - **GitHub Owner**: Your GitHub username
   - **GitHub Repo**: Your repository name (e.g., "gitbase")
   - **Branch Name**: The branch to commit to (default: "main")

5. Click **"Save Configuration"**
   - All credentials are stored securely in your browser's localStorage
   - They are never sent to any server except GitHub and OpenRouter APIs

### Using the AI Development Center

#### Example 1: Add a Feature

**Feature Request:**
```
I want to add a carousel component on the homepage that displays
the latest 3 articles, automatically switching every 5 seconds,
with smooth fade transitions.
```

**Process:**
1. Paste the request in the "Feature Request" textarea
2. Click **"Generate Code"**
3. Watch the execution log as AI:
   - Analyzes your project structure
   - Identifies relevant files
   - Generates new code
4. Review the generated changes in the code diff viewer
5. Click **"Confirm and Commit to GitHub"**
6. Done! The feature is live

#### Example 2: Fix a Bug

**Feature Request:**
```
The article list page is not showing category badges. Please fix this
by adding the CategoryBadge component to the article cards.
```

#### Example 3: Add Styling

**Feature Request:**
```
Make the navigation bar sticky with a blur effect when scrolling,
similar to modern web designs.
```

### Technical Details

#### Batch Commit Optimization

The AI Development Center uses GitHub's **Git Trees API** for efficient batch commits:
- Multiple file changes are committed in a single operation
- Only 3-4 API requests regardless of the number of files modified
- Avoids GitHub API rate limits
- Atomic commits ensure consistency

#### Security Features

1. **Local Storage Only**: API keys stored in browser localStorage
2. **Path Validation**: Prevents modification of sensitive files (.env, .git, etc.)
3. **Human Review**: All code changes must be reviewed before committing
4. **No Auto-Merge**: Changes are committed but not automatically deployed (requires manual review in production)

#### Supported Operations

- ✅ Create new files
- ✅ Modify existing files
- ❌ Delete files (disabled for safety)

### Best Practices

1. **Start Small**: Test with simple features first
2. **Use Test Branch**: Configure a test branch for experiments
3. **Review Code**: Always review AI-generated code before committing
4. **Clear Descriptions**: Be specific and detailed in feature requests
5. **Iterative Approach**: Build complex features in smaller steps

### Troubleshooting

**"Please configure OpenRouter API Key"**
- Go to Configuration and enter your OpenRouter API key

**"Failed to fetch project context"**
- Check that your GitHub token has `repo` permissions
- Verify the owner/repo names are correct
- Ensure the branch exists in your repository

**"Rate limit exceeded"**
- The batch commit feature should prevent this
- If it occurs, wait a few minutes before retrying
- Consider using a different GitHub token

**"AI generated invalid code"**
- Try rephrasing your request more clearly
- Break complex requests into smaller tasks
- Review and manually fix the generated code

### Limitations

- AI-generated code may require manual adjustments
- Complex features might need multiple iterations
- The AI doesn't have access to your database or environment variables
- Best suited for UI components, pages, and frontend logic

## Contributing

We welcome contributions to GitBase! Please read our [Contributing Guide](https://gitbase.app/posts/how-to-contributing-to-gitbase) for details on our code of conduct and the process for submitting pull requests.

## License

GitBase is open-source software licensed under the [MIT license](https://github.com/qiayue/gitbase/?tab=MIT-1-ov-file).

## Support

If you encounter any issues or have questions, please file an issue on the GitHub repository.

## Acknowledgements

GitBase is built with the following open-source libraries:
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn/UI](https://ui.shadcn.com/)

We are grateful to the maintainers and contributors of these projects.
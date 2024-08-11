---
title: "Installing and Deploying GitBase: A Step-by-Step Guide"
description: "A comprehensive guide for setting up GitBase locally and deploying it to Vercel, suitable for beginners."
date: "2024-08-11"
---

# Installing and Deploying GitBase: A Step-by-Step Guide

This guide will walk you through the process of setting up GitBase on your local machine and deploying it to Vercel. Even if you're new to web development, you should be able to follow these steps to get your GitBase instance up and running.

## Prerequisites

- Node.js (version 14 or later)
- npm (usually comes with Node.js)
- Git
- A GitHub account
- A Vercel account

## Step 1: Clone the Repository

1. Open your terminal or command prompt.
2. Navigate to the directory where you want to store your project.
3. Run the following command:

```bash
git clone https://github.com/qiayue/gitbase.git
cd gitbase
```

## Step 2: Install Dependencies

In the project directory, run:

```bash
npm install
```

This will install all necessary dependencies for the project.

## Step 3: Set Up Environment Variables

1. In the root of your project, create a file named `.env.local`.
2. Open this file and add the following lines:

```
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_OWNER=your_github_username
GITHUB_REPO=your_repo_name
ACCESS_PASSWORD=your_secure_access_password
```

Replace the placeholders with your actual GitHub information and desired access password.

## Step 4: Configure GitHub Repository

1. Create a new repository on GitHub if you haven't already.
2. In your GitHub repository, create two folders: `data/json` and `data/md`.
3. In the `data/json` folder, create a file named `resources.json` with an empty array: `[]`.

## Step 5: Run the Development Server

To start the development server, run:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser. You should see the GitBase homepage.

## Step 6: Build the Project

If the development server runs without errors, try building the project:

```bash
npm run build
```

If this completes successfully, your project is ready for deployment.

## Step 7: Deploy to Vercel

1. Log in to your Vercel account.
2. Click "New Project".
3. Import your GitBase repository from GitHub.
4. In the "Configure Project" step, add the following environment variables:
   - `GITHUB_TOKEN`
   - `GITHUB_OWNER`
   - `GITHUB_REPO`
   - `ACCESS_PASSWORD`
   Use the same values as in your `.env.local` file.
5. Click "Deploy".

## Step 8: Test Your Deployment

Once the deployment is complete, Vercel will provide you with a URL. Open this URL in your browser to verify that your GitBase instance is working correctly.

## Step 9: Configure Custom Domain (Optional)

If you want to use your own domain:

1. In your Vercel project dashboard, go to "Settings" > "Domains".
2. Add your custom domain and follow Vercel's instructions for DNS configuration.

## Using GitBase

- To access the admin panel, go to `/admin` and use the `ACCESS_PASSWORD` you set.
- You can now create, edit, and manage articles and resources through the admin interface.
- All changes will be automatically synced with your GitHub repository.

## Troubleshooting

If you encounter any issues:
- Make sure all environment variables are correctly set both locally and on Vercel.
- Check the console in your browser and the Vercel deployment logs for any error messages.
- Ensure your GitHub token has the necessary permissions (repo scope).

Congratulations! You've successfully set up and deployed your own GitBase instance. Enjoy your new database-free, GitHub-powered website!

For more help, refer to the [GitBase documentation](https://github.com/qiayue/gitbase) or open an issue on the GitHub repository.
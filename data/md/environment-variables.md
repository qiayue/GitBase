---
title: Configuring Environment Variables for GitBase
description: How to configure GitBase environment variables
date: '2024-08-11T13:08:05.474Z'
---
# Configuring Environment Variables for GitBase

GitBase relies on several crucial environment variables for secure GitHub integration, authentication, and admin access; this guide explains each variable's purpose and provides step-by-step instructions for proper configuration.

Environment variables play a crucial role in the setup and security of your GitBase project. This guide will walk you through each variable, explaining its purpose and how to set it up correctly.

## GITHUB_TOKEN

**Purpose**: This token allows GitBase to interact with your GitHub repository, enabling it to read and write content.

**How to obtain**: 
1. Go to GitHub and log into your account.
2. Click on your profile picture in the top right corner and select "Settings".
3. In the left sidebar, click on "Developer settings".
4. Select "Personal access tokens" and then "Tokens (classic)".
5. Click "Generate new token" and select "Generate new token (classic)".
6. Give your token a descriptive name and select the following scopes:
   - repo (Full control of private repositories)
7. Click "Generate token" at the bottom of the page.
8. Copy the generated token immediately - you won't be able to see it again!

**Requirements**: Must be a valid GitHub personal access token with the correct permissions.

## GITHUB_OWNER

**Purpose**: This is the username or organization name that owns the GitHub repository where your content will be stored.

**How to obtain**: This is simply your GitHub username or the name of your GitHub organization.

**Requirements**: Must be an exact match to the owner of the repository you're using.

## GITHUB_REPO

**Purpose**: This is the name of the GitHub repository where your content will be stored.

**How to obtain**: This is the name of the repository you created for your GitBase content.

**Requirements**: Must be an exact match to the repository name, not including the owner (e.g., "my-gitbase-content", not "username/my-gitbase-content").

## JWT_SECRET

**Purpose**: This secret is used to sign JSON Web Tokens (JWTs) for authentication in your GitBase application.

**How to obtain**: You should generate a random, secure string for this. You can use a password generator or run this command in your terminal:
```
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Requirements**: Should be a long, random string. At least 32 characters is recommended for security.

## DOMAIN

**Purpose**: This specifies the domain where your GitBase instance is running. It's used for security purposes to prevent unauthorized access.

**How to obtain**: This should be the domain where you're hosting your GitBase instance. For local development, you can use "localhost".

**Requirements**: Should be a valid domain name. For production, this would be your actual domain (e.g., "mygitbase.com"). For local development, use "localhost".

## ACCESS_PASSWORD

**Purpose**: This password is used to access the admin interface of your GitBase instance.

**How to obtain**: You should create a strong, unique password for this.

**Requirements**: Should be a strong password. It's recommended to use a combination of uppercase and lowercase letters, numbers, and special characters. Aim for at least 12 characters.

## Setting Up Your Environment Variables

1. In your GitBase project root, create a file named `.env.local`.
2. Add your variables to this file in the following format:

```
GITHUB_TOKEN=your_github_token_here
GITHUB_OWNER=your_github_username_or_org
GITHUB_REPO=your_repo_name
JWT_SECRET=your_generated_jwt_secret
DOMAIN=your_domain_or_localhost
ACCESS_PASSWORD=your_strong_password
```

3. Save the file.

Remember, never commit your `.env.local` file to version control. It's already included in the `.gitignore` file for GitBase, but always double-check to ensure you're not accidentally exposing your sensitive information.

For production deployment (e.g., on Vercel), you'll need to add these environment variables in your hosting platform's settings.

By properly configuring these environment variables, you ensure that your GitBase instance can securely interact with GitHub, authenticate users, and protect your admin interface.

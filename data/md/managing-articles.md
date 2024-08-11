---
title: Managing Articles in GitBase Admin Panel
description: >-
  This guide will walk you through the process of viewing, editing, and creating
  new articles using the admin panel.
date: '2024-08-11T13:16:44.231Z'
---
# Managing Articles in GitBase Admin Panel

GitBase provides a powerful and user-friendly interface for managing your website's articles. This guide will walk you through the process of viewing, editing, and creating new articles using the admin panel.

## Accessing the Article Management Section

1. Log into the admin panel by navigating to `https://yourgitbasesite.com/admin` and entering your access password.
2. Once on the admin dashboard, locate and click on the "Manage Articles" or "Articles" option.

## Viewing Articles

1. In the article management section, you'll see a list of all existing articles.
2. Each article entry typically displays:
   - Title
   - Brief description or excerpt
   - Creation date
   - Last modified date

## Editing an Existing Article

1. Find the article you wish to edit in the list.
2. Click on the "Edit" button next to the article title.
3. You'll be taken to the article editor page, where you can modify:
   - Title: The main headline of your article
   - Description: A brief summary or subtitle
   - Content: The main body of your article (in Markdown format)
   - Slug: The URL-friendly version of the title (if editable)
4. Make your desired changes in the provided fields.
5. Use the Markdown editor for the content. You can typically:
   - Format text (bold, italic, etc.)
   - Add headers
   - Insert links and images
   - Create lists
6. Preview your changes if the option is available.
7. Once satisfied, click the "Save" or "Update" button.

## Creating a New Article

1. In the article management section, look for a "New Article" or "Create Article" button.
2. Click this button to open the article creation form.
3. Fill in the following fields:
   - Title: Enter a compelling title for your new article
   - Description: Write a brief summary or subtitle
   - Content: Compose your article content using Markdown
   - Slug: If required, enter a URL-friendly version of your title
4. Use the Markdown editor to format your content as desired.
5. If available, use the preview function to see how your article will look.
6. Once you're happy with your new article, click "Create" or "Publish".

## Understanding Markdown

GitBase uses Markdown for article formatting. Here are some basic Markdown tips:

- Use `#` for headers (e.g., `# Main Title`, `## Subtitle`)
- Wrap text with `*` for italic and `**` for bold
- Create links with `[Link Text](URL)`
- Insert images with `![Alt Text](Image URL)`

## Managing Article Metadata

Depending on your GitBase setup, you might be able to manage additional metadata for your articles:

- Tags or Categories
- Featured Image
- Publication Date
- Author Information

Look for these options in the article editor and fill them out as needed.

## Syncing with GitHub

After saving or creating an article:

1. GitBase will automatically sync your changes with the configured GitHub repository.
2. A new Markdown file will be created (for new articles) or updated (for edits) in the `data/md/` directory of your repository.
3. The `articles.json` file in the `data/json/` directory will also be updated to reflect the changes.

## Best Practices

1. **Regular Saving**: Save your work frequently to prevent loss of content.
2. **Consistent Formatting**: Maintain a consistent style across your articles for a professional look.
3. **Optimized Titles and Descriptions**: Write clear, SEO-friendly titles and descriptions.
4. **Image Optimization**: If including images, ensure they are optimized for web use.
5. **Proofreading**: Always proofread your articles before publishing.

## Troubleshooting

If you encounter issues while managing articles:

1. **Changes Not Saving**: Check your internet connection and try again. If the problem persists, try refreshing the page and re-entering your changes.
2. **Formatting Issues**: If your Markdown isn't rendering correctly, double-check your syntax.
3. **Sync Errors**: If changes aren't reflecting in GitHub, verify your GitHub token permissions and repository settings.

By following these guidelines, you should be able to effectively manage articles on your GitBase website through the admin panel. Remember, all your content is version-controlled through GitHub, allowing for easy tracking of changes and the ability to revert if necessary.

---
title: Accessing the Admin Panel and Managing Resources in GitBase
description: How to access the admin panel and manage your resource list in GitBase
date: '2024-08-11T13:14:40.737Z'
---
# Accessing the Admin Panel and Managing Resources in GitBase

GitBase provides a user-friendly admin interface for managing your website's resources. This guide will walk you through the process of accessing the admin panel and managing your resources effectively.

## Accessing the Admin Panel

1. **Navigate to the Admin URL**: Open your web browser and go to your GitBase website's URL, followed by `/admin`. For example: `https://yourgitbasesite.com/admin`.

2. **Enter the Access Password**: You will be prompted to enter the access password. This is the `ACCESS_PASSWORD` you set in your environment variables. Enter it and click "Login".

3. **Admin Dashboard**: After successful authentication, you'll be directed to the admin dashboard. Here, you'll see various management options, including "Manage Resources".

## Managing Resources

### Viewing Resources

1. From the admin dashboard, click on "Manage Resources".
2. You'll see a list of all current resources, displaying their names, descriptions, and URLs.

### Adding a New Resource

1. On the resource management page, locate the "Add New Resource" section, typically at the bottom of the resource list.
2. Fill in the following fields:
   - **Name**: Enter the name of the resource.
   - **Description**: Provide a brief description of the resource.
   - **URL**: Enter the full URL of the resource.
3. Click the "Add New" button to save the resource.
4. The new resource will appear in the list, and changes will be automatically synced with your GitHub repository.

### Modifying an Existing Resource

1. Find the resource you want to edit in the resource list.
2. Click the "Edit" button next to the resource.
3. The resource's fields will become editable.
4. Make your desired changes to the name, description, or URL.
5. Click the "Save" button to confirm your changes.
6. The updated resource information will be displayed in the list and synced with GitHub.

### Deleting a Resource

Note: The current version of GitBase might not support direct deletion through the admin interface. If you need to remove a resource:

1. Edit the resource.
2. Replace its content with placeholder text or mark it as "Deprecated" in the description.
3. Save the changes.
4. For permanent removal, you may need to manually delete the entry from the `resources.json` file in your GitHub repository.

## Syncing Changes

GitBase automatically syncs your changes with the GitHub repository configured in your environment variables. After making changes:

1. The `resources.json` file in your GitHub repository will be updated.
2. These changes will be reflected on your live site after a short delay (usually a few minutes, depending on your hosting setup).

## Best Practices

1. **Regular Backups**: Although GitBase uses GitHub for version control, it's a good practice to periodically backup your `resources.json` file.
2. **Descriptive Names and Descriptions**: Use clear, concise names and descriptions for your resources to make them easy to understand and find.
3. **URL Verification**: Always double-check the URLs you enter to ensure they are correct and functional.
4. **Consistent Formatting**: Maintain a consistent style in your resource descriptions for a professional appearance.

## Troubleshooting

If you encounter issues while managing resources:

1. **Changes Not Appearing**: Ensure your GitHub token has the necessary permissions, and check your GitHub repository for any error messages in the commit history.
2. **Unable to Save**: Verify your internet connection and try refreshing the page before attempting to save again.
3. **Access Denied**: Double-check that you're using the correct `ACCESS_PASSWORD` and that it matches the one in your environment variables.

By following these steps, you should be able to effectively manage the resources on your GitBase website through the admin panel. Remember, all changes are version-controlled through GitHub, allowing you to track modifications and revert if necessary.

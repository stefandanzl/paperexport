# PaperExport Installation Guide

This guide will help you install and set up the PaperExport plugin for Obsidian.

## Prerequisites

- Obsidian v0.15.0 or higher
- Basic familiarity with Obsidian plugins

## Installation Methods

### Method 1: Install from Obsidian Community Plugins (Coming Soon)

1. Open Obsidian
2. Click on Settings (gear icon in the left sidebar)
3. Go to "Community plugins"
4. Click "Browse" and search for "PaperExport"
5. Click "Install"
6. Once installed, enable the plugin by toggling the switch

### Method 2: Manual Installation

1. Download the latest release from the [GitHub repository](https://github.com/yourusername/paperexport/releases)
2. Extract the ZIP file
3. Copy the extracted folder to your Obsidian plugins folder:
   - Windows: `%APPDATA%\Obsidian\plugins\`
   - macOS: `~/Library/Application Support/Obsidian/plugins/`
   - Linux: `~/.config/Obsidian/plugins/`
4. Restart Obsidian
5. Go to Settings → Community plugins
6. Enable "PaperExport" from the list

### Method 3: BRAT Installation (For Beta Testing)

If you're using the [BRAT](https://github.com/TfTHacker/obsidian42-brat) plugin for Obsidian:

1. Install BRAT if you haven't already
2. Open BRAT settings
3. Click "Add Beta Plugin"
4. Enter the repository URL: `https://github.com/yourusername/paperexport`
5. Click "Add Plugin"
6. Enable the plugin in Community plugins settings

## Manual Installation from Source

If you want to install from source code:

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/paperexport.git
   ```

2. Navigate to the project directory:
   ```
   cd paperexport
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Build the plugin:
   ```
   npm run build
   ```

5. Copy the `main.js`, `manifest.json`, and `styles.css` files to your Obsidian plugins folder:
   ```
   cp main.js manifest.json styles.css /path/to/your/obsidian/vault/.obsidian/plugins/paperexport/
   ```

6. Restart Obsidian and enable the plugin

## Post-Installation Setup

After installing PaperExport, you should configure it to match your preferences:

1. Go to Settings → PaperExport
2. Configure the basic settings:
   - Set your preferred export directory
   - Choose default filename format
   - Select page size and margins
3. (Optional) Set up a custom HTML template if you have specific formatting requirements
4. (Optional) Add custom CSS to further customize the appearance of your exported PDFs

## Troubleshooting

If you encounter issues during installation or use:

1. **Plugin doesn't appear in the list:**
   - Make sure all files are in the correct folder
   - Restart Obsidian completely

2. **Plugin doesn't work after installation:**
   - Check the console for errors (Ctrl+Shift+I or Cmd+Opt+I)
   - Verify that you're using a compatible version of Obsidian

3. **PDF export fails:**
   - Ensure you have the necessary permissions to write to the export directory
   - Try using a different export directory

## Getting Help

If you continue to experience issues:

1. Check the [GitHub issues](https://github.com/yourusername/paperexport/issues) to see if your problem has been reported
2. Create a new issue with detailed information about your problem
3. Include your Obsidian version, operating system, and steps to reproduce the issue

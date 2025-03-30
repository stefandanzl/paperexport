import { PaperExportSettings } from '../settings/settings';
import { TFile, Vault, normalizePath } from 'obsidian';
import { getVaultBasePath } from './vault-helpers';
import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';

// Since direct import of html-pdf-node and showdown might have compatibility issues,
// we'll handle these dynamically at runtime

// Default HTML template
const DEFAULT_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
    <style>
        body {
            font-family: "Times New Roman", Times, serif;
            font-size: 12pt;
            line-height: 1.5;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 100%;
            margin: 0;
            padding: 0;
        }
        h1 {
            font-size: 18pt;
            font-weight: bold;
            margin-top: 1em;
            margin-bottom: 0.5em;
        }
        h2 {
            font-size: 16pt;
            font-weight: bold;
            margin-top: 1em;
            margin-bottom: 0.5em;
        }
        h3 {
            font-size: O14pt;
            font-weight: bold;
            margin-top: 1em;
            margin-bottom: 0.5em;
        }
        p {
            margin-bottom: 0.5em;
            text-align: justify;
        }
        .page-break {
            page-break-after: always;
        }
        img {
            max-width: 100%;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 1em;
        }
        table, th, td {
            border: 1px solid black;
        }
        th, td {
            padding: 0.5em;
        }
        blockquote {
            margin-left: 2em;
            margin-right: 2em;
            padding-left: 1em;
            border-left: 3px solid #ccc;
            color: #555;
        }
        code {
            font-family: "Courier New", Courier, monospace;
            background-color: #f5f5f5;
            padding: 0.2em 0.4em;
            border-radius: 3px;
        }
        pre {
            background-color: #f5f5f5;
            padding: 1em;
            overflow-x: auto;
            border-radius: 3px;
        }
        pre code {
            background-color: transparent;
            padding: 0;
        }
        .footnote {
            font-size: 10pt;
        }
        .bibliography {
            margin-top: 2em;
        }
        .bibliography p {
            text-indent: -2em;
            margin-left: 2em;
        }
        {{customCss}}
    </style>
    
    {{#if renderMathJax}}
    <script type="text/javascript" id="MathJax-script" async
        src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js">
    </script>
    <script>
        MathJax = {
            tex: {
                inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
                displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']],
                processEscapes: true
            },
            options: {
                skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre']
            }
        };
    </script>
    {{/if}}
</head>
<body>
    <div class="container">
        {{content}}
    </div>
</body>
</html>`;

/**
 * Read a custom template file or return the default template
 */
export async function getTemplate(
    templatePath: string,
    vault: Vault
): Promise<string> {
    if (!templatePath) {
        return DEFAULT_TEMPLATE;
    }

    try {
        const normalizedPath = normalizePath(templatePath);
        const templateFile = vault.getAbstractFileByPath(normalizedPath);
        
        if (templateFile instanceof TFile) {
            return await vault.read(templateFile);
        }
        
        // If template file not found, fall back to default
        console.warn(`Template file not found: ${templatePath}. Using default template.`);
        return DEFAULT_TEMPLATE;
    } catch (error) {
        console.error('Error reading template:', error);
        return DEFAULT_TEMPLATE;
    }
}

/**
 * Convert markdown to HTML using showdown
 */
export function markdownToHtml(
    markdown: string,
    title: string,
    settings: PaperExportSettings,
    template: string
): string {
    // This would ideally use the require() function, but that might not be available
    // in the Obsidian environment. Consider bundling these dependencies.
    
    // For now, we'll simulate the conversion process
    
    // Replace template placeholders
    let html = template
        .replace('{{title}}', title)
        .replace('{{customCss}}', settings.customCss || '')
        .replace('{{#if renderMathJax}}', settings.renderMathJax ? '' : '<!--')
        .replace('{{/if}}', settings.renderMathJax ? '' : '-->');
    
    // Convert markdown to HTML
    // This is a placeholder for actual conversion
    // In real implementation, you'd use showdown or another md->html converter
    
    // Simple markdown to HTML conversion (very basic)
    let contentHtml = markdown
        // Headers
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Paragraphs
        .replace(/^\s*(\n)?(.+)/gm, function(m) {
            return /^<(\/)?(h\d|p|ul|ol|li|blockquote|pre|img)/.test(m) ? m : '<p>' + m + '</p>';
        })
        // Line breaks
        .replace(/^\s*[\r\n]/gm, '')
        // Code blocks
        .replace(/```([a-z]*)\n([\s\S]*?)\n```/g, '<pre><code class="language-$1">$2</code></pre>')
        // Inline code
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        // Page breaks
        .replace(/<div class="page-break"><\/div>/g, '<div style="page-break-after: always;"></div>');
    
    // Insert converted content into template
    html = html.replace('{{content}}', contentHtml);
    
    return html;
}

/**
 * Generate a PDF file from HTML
 */
export async function htmlToPdf(
    html: string,
    outputPath: string,
    settings: PaperExportSettings
): Promise<string> {
    // In a real implementation, this would use html-pdf-node or another library
    // Since direct imports might be tricky in Obsidian plugins, you might need
    // to use a different approach or bundle these libraries
    
    // For now, this is a placeholder function that would be replaced
    // with actual PDF generation in the final implementation
    
    // Return the path where the PDF would be saved
    return outputPath;
}

/**
 * Ensure the output directory exists
 */
export async function ensureOutputDirectory(
    exportPath: string,
    vault: Vault
): Promise<string> {
    // Get the vault path
    const vaultPath = await getVaultBasePath(vault);
    const fullPath = path.join(vaultPath, exportPath);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(fullPath)) {
        await promisify(fs.mkdir)(fullPath, { recursive: true });
    }
    
    return fullPath;
}

/**
 * Main export function that coordinates the entire process
 */
export async function exportToPdf(
    markdownContent: string,
    outputFilename: string,
    settings: PaperExportSettings,
    vault: Vault
): Promise<string> {
    try {
        // Ensure output directory exists
        const outputDir = settings.exportPath 
            ? await ensureOutputDirectory(settings.exportPath, vault)
            : await getVaultBasePath(vault);
        
        // Get HTML template
        const template = await getTemplate(settings.templatePath, vault);
        
        // Convert markdown to HTML
        const html = markdownToHtml(
            markdownContent,
            outputFilename,
            settings,
            template
        );
        
        // Generate PDF
        const outputPath = path.join(outputDir, `${outputFilename}.pdf`);
        await htmlToPdf(html, outputPath, settings);
        
        return outputPath;
    } catch (error) {
        console.error('Error exporting PDF:', error);
        throw error;
    }
}

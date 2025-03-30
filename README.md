# PaperExport for Obsidian

PaperExport is an Obsidian plugin designed specifically for academic writing. It allows you to:

- Write your academic papers in Markdown across multiple files
- Merge these files together in a specified order
- Export the merged content as a professional-looking PDF
- Use customizable HTML templates for the PDF output
- Handle academic citations and bibliography

## Features

- **Multiple File Merging**: Combine multiple Markdown files into a single document, perfect for working on different chapters or sections of a paper separately.
- **Customizable Order**: Arrange your files in the desired sequence for the final document.
- **Professional PDF Output**: Generate high-quality PDFs suitable for academic submission.
- **Customizable Templates**: Use the default academic template or create your own HTML templates for full control over PDF appearance.
- **YAML Frontmatter Support**: Extract metadata like title, author, and date from YAML frontmatter to include in your exports.
- **MathJax Integration**: Support for mathematical equations using MathJax.
- **Citation Support**: Process wiki-links as citations, automatically generating a references section based on linked markdown files.

## Installation

1. In Obsidian, go to Settings > Community Plugins
2. Disable Safe Mode if necessary
3. Click "Browse" and search for "PaperExport"
4. Install the plugin and enable it

## How to Use

### Basic Usage

1. Write your academic paper in multiple Markdown files
2. Click the PaperExport icon in the left ribbon, or use the command "Export Academic Paper"
3. Select the files you want to include and arrange them in order
4. Enter a filename for the export
5. Click "Export" and your PDF will be generated

### File Organization

Files can be organized in any way, but here are some suggested approaches:

- Prefix filenames with numbers (e.g., "01-introduction.md", "02-literature-review.md")
- Use YAML frontmatter to specify chapter numbers:
  ```yaml
  ---
  title: Introduction
  chapter: 1
  ---
  ```

### YAML Frontmatter

The plugin recognizes the following frontmatter properties:

- `title`: The title of the chapter/section
- `author`: The author's name (for title page)
- `date`: The document date (for title page)
- `chapter` or `order`: Numeric value for ordering files

### Citations with Wiki-Links

PaperExport supports a native Obsidian approach to citations using wiki-links. Here's how it works:

1. Create markdown files for your sources in a dedicated folder (e.g., `sources/`)
2. Each source file should have frontmatter with properties like:
   ```yaml
   ---
   title: The impact of markup languages on writing processes
   short: Johnson (2018)  # This is what will appear in your citation
   author: Johnson, K.
   year: 2018
   journal: Journal of Writing Research
   volume: 10(1)
   pages: 67-84
   ---
   ```
3. In your paper, cite sources using standard Obsidian wiki-links: `[[johnson2018]]`
4. When exporting, PaperExport will:
   - Convert `[[johnson2018]]` to `[Johnson (2018)]` in the text (using the `short` property)
   - Automatically generate a references section at the end with full details of all cited sources

## Settings

PaperExport offers multiple configuration options:

- **Export Directory**: Choose where your PDFs will be saved
- **Default Filename**: Set a default name for exported PDFs
- **HTML Template**: Select a custom HTML template file
- **Custom CSS**: Add your own CSS for precise control over the document appearance
- **Page Size**: Choose between A4, A3, Letter, and Legal formats
- **Margins**: Set custom margins for the document
- **Content Options**:
  - Include/exclude YAML frontmatter
  - Enable/disable MathJax rendering
- **Citation Settings**:
  - Enable/disable wiki-link citation processing
  - Set the sources folder path
  - Choose whether to include an auto-generated references section
  - Customize the references section title

## Templates

PaperExport comes with a default academic template, but you can create your own. Templates are HTML files with placeholders that get replaced during export:

- `{{title}}`: Document title
- `{{author}}`: Author name
- `{{date}}`: Document date
- `{{content}}`: The merged markdown content (converted to HTML)
- `{{pageSize}}`: Selected page size
- `{{margins.top}}`, `{{margins.right}}`, etc.: Margin values
- `{{customCss}}`: Custom CSS from settings
- `{{#if renderMathJax}}...{{/if}}`: Conditional blocks

## Roadmap

Future features planned for PaperExport:

- Enhanced citation features (custom citation styles, citation groups)
- Integration with external reference managers like Zotero
- Table of contents generation
- Figure and table numbering
- Multiple export formats (DocX, LaTeX)
- Advanced template system with more placeholders

## Support

If you encounter any issues or have feature requests, please file them at the [GitHub repository](https://github.com/yourusername/paperexport).

## License

This project is licensed under the MIT License - see the LICENSE file for details.

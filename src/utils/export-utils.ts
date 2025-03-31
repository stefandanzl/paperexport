/* eslint-disable no-useless-escape */
import { PaperExportSettings } from "../settings/settings";
import { TFile, Vault, normalizePath } from "obsidian";
import * as Showdown from "showdown";
// import * as htmlPdfNode from "html-pdf-node";
// import * as jsPDF from "jspdf";
import { jsPDF } from "jspdf";
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
		console.warn(
			`Template file not found: ${templatePath}. Using default template.`
		);
		return DEFAULT_TEMPLATE;
	} catch (error) {
		console.error("Error reading template:", error);
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
) {
	try {
		// Use showdown to convert markdown to HTML

		// Configure showdown
		const converter = new Showdown.Converter({
			// tables: true,
			// tasklists: true,
			// strikethrough: true,
			// ghCodeBlocks: true,
			// smoothLivePreview: true,
			// simpleLineBreaks: true,
			// openLinksInNewWindow: true,
			// emoji: true,
		});

		// Convert the markdown content to HTML
		let contentHtml = converter.makeHtml(markdown);

		// Handle page breaks
		contentHtml = contentHtml.replace(
			/<div class="page-break"><\/div>/g,
			'<div style="page-break-after: always;"></div>'
		);

		// Replace template placeholders
		let html = template
			.replace("{{title}}", title)
			.replace("{{customCss}}", settings.customCss || "")
			.replace(
				"{{#if renderMathJax}}",
				settings.renderMathJax ? "" : "<!--"
			)
			.replace("{{/if}}", settings.renderMathJax ? "" : "-->");

		// Insert converted content into template
		html = html.replace("{{content}}", contentHtml);
		console.log(JSON.stringify(html));
		return html;
	} catch (error) {
		console.error("Error converting markdown to HTML:", error);

		// Fallback to basic conversion if showdown fails
		// return basicMarkdownToHtml(markdown, title, settings, template);
	}
}

export async function htmlToPdf(
	html: string,
	outputPath: string,
	settings: PaperExportSettings
) {
	const doc = new jsPDF(); //"p", "mm", [2000, 2000]);
	html = ` <div class="container">
        <h1 id="introduction">Introduction</h1>
<p>Academic writing is a critical component of scholarly work. It allows researchers to communicate their findings, arguments, and insights to the broader academic community. However, the process of writing academic papers can be challenging, especially when it comes to formatting and organizing the final document.</p>
<p>This paper discusses the development of PaperExport, an Obsidian plugin designed to streamline the process of academic writing by allowing authors to write in Markdown and export to professional-looking PDFs.</p>
<h2 id="background">Background</h2>
<p>Markdown has gained popularity as a lightweight markup language that allows writers to focus on content rather than formatting. Its simplicity and readability make it an attractive option for academic writing. However, academic papers often require specific formatting that can be difficult to achieve with basic Markdown.</p>
<p>Additionally, many researchers prefer to work on different sections of their papers separately, which can make it challenging to maintain a cohesive document. This is where PaperExport comes in.</p>
<h2 id="purposeandscope">Purpose and Scope</h2>
<p>The purpose of this paper is to:</p>
<ol>
<li>Introduce the PaperExport plugin for Obsidian</li>
<li>Explain its key features and functionality</li>
<li>Demonstrate its effectiveness in streamlining the academic writing workflow</li>
<li>Discuss potential future developments</li>
</ol>
<p>The scope of this paper is limited to the technical aspects of the PaperExport plugin and its applications in academic writing. It does not cover the broader topics of academic writing guidelines or best practices.</p>
<h2 id="researchquestions">Research Questions</h2>
<p>This paper aims to address the following research questions:</p>
<ol>
<li>How can Markdown be effectively used for academic writing?</li>
<li>What features are essential for converting Markdown documents to professional academic papers?</li>
<li>How can a plugin streamline the workflow for researchers writing academic papers?</li>
</ol>
<p>By addressing these questions, this paper contributes to the ongoing discussion about digital tools for academic writing and their impact on scholarly productivity.</p>
    </div>`;
	//@ts-ignore
	return await doc
		.html(html, {
			// callback?: (doc: jsPDF) => void;
			margin: [10, 10], //: number | number[];
			// autoPaging?: boolean | "slice" | "text";
			filename: "testfile",
			// image?: HTMLOptionImage;
			// html2canvas?: Html2CanvasOptions;
			// jsPDF?: jsPDF;
			// x?: number;
			// y?: number;
			width: 100,
			// windowWidth?: number;
			// fontFaces?: HTMLFontFace[];
		})
		.outputPdf("arraybuffer");
}

/**
 * Generate a PDF file from HTML
 */
/**
 * export async function htmlToPdf2(
	html: string,
	outputPath: string,
	settings: PaperExportSettings
): Promise<void | Buffer | undefined> {
	try {
		// Use html-pdf-node to generate PDF
		// We need to dynamically import it because it's not available in Obsidian's environment directly

		// Configure the PDF options
		const options = {
			format: settings.pageSize,
			margin: {
				top: settings.margins.top,
				right: settings.margins.right,
				bottom: settings.margins.bottom,
				left: settings.margins.left,
			},
			// path: outputPath,
			printBackground: true,
		};

		// Create the PDF
		const file = { content: html };

		let pdfBuffer: ArrayBufferLike;
		console.log("FILLE", file);
		htmlPdfNode.generatePdf(file, options, (err, buffer) => {
			if (err) {
				new Notice("PDF Conversion error " + err.message);
				throw new Error("PDF");
			}
			pdfBuffer = buffer;
		});
		return pdfBuffer;
	} catch (error) {
		console.error("Error generating PDF:", error);
		throw new Error(`Failed to generate PDF: ${error.message}`);
	}
}
*/
/**
 * Ensure the output directory exists
 */
export async function ensureOutputDirectory(
	exportPath: string,
	vault: Vault
): Promise<string> {
	// Check if export path is valid
	if (!exportPath || exportPath.trim() === "") {
		return "";
	}

	// Normalize the path
	const normalizedPath = normalizePath(exportPath);

	// Create directory if it doesn't exist
	if (!(await vault.adapter.exists(normalizedPath))) {
		await vault.adapter.mkdir(normalizedPath);
	}

	return normalizedPath;
}

/**
 * Main export function that coordinates the entire process
 */
export async function exportToPdf(
	markdownContent: string,
	outputFilename: string,
	settings: PaperExportSettings,
	vault: Vault
) {
	try {
		// Make sure we have a valid filename
		if (!outputFilename || outputFilename.trim() === "") {
			outputFilename = settings.defaultFilename || "exported_paper";
		}

		// Clean the filename of any special characters
		outputFilename = outputFilename.replace(/[\/:*?"<>|]/g, "_");

		// Determine the output path
		let outputPath;
		if (settings.exportPath && settings.exportPath.trim() !== "") {
			// Ensure export directory exists
			await ensureOutputDirectory(settings.exportPath, vault);
			// Normalize the output path
			outputPath = normalizePath(
				`${settings.exportPath}/${outputFilename}.pdf`
			);
		} else {
			// Use vault root
			outputPath = normalizePath(`${outputFilename}.pdf`);
		}

		console.log("OUTPUT PATH: ", outputPath);
		// Get HTML template
		const template = await getTemplate(settings.templatePath, vault);

		console.log(template);
		// Convert markdown to HTML
		const html = markdownToHtml(
			markdownContent,
			outputFilename,
			settings,
			template
		);
		if (!html) {
			throw new Error("No HTML");
		}

		console.log("htlm", html);

		// Generate PDF
		const buffer = (await htmlToPdf(
			html,
			outputPath,
			settings
		)) as ArrayBufferLike;

		console.log("buffer", buffer);
		await vault.adapter.writeBinary(outputPath, buffer);

		return outputPath;
	} catch (error) {
		console.error("Error exporting PDF:", error);
		throw error;
	}
}

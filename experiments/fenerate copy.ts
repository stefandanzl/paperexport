import { htmlToPdf } from "./html-pdf";
//@ts-ignore
import fs from "fs";

async function generateExamplePdf() {
    try {
        // 1. Your HTML content
        const html = `
     <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>01-introduction</title>
    <style>
	
	
        body {
            font-family: "Times New Roman", Times, serif;
            font-size: 12pt;
            line-height: 1.5;
            margin: 0;
            padding: 0;
			font-color: black;
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
            font-size: 14pt;
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
        
    </style>
    

    </head>

    <body>
        <div class="container">
            <h1 id="introduction">Introduction</h1>
            <p>Academic writing is a critical component of scholarly work. It allows researchers to communicate their
                findings, arguments, and insights to the broader academic community. However, the process of writing
                academic papers can be challenging, especially when it comes to formatting and organizing the final
                document.</p>
            <p>This paper discusses the development of PaperExport, an Obsidian plugin designed to streamline the
                process of academic writing by allowing authors to write in Markdown and export to professional-looking
                PDFs.</p>
            <h2 id="background">Background</h2>
            <p>Markdown has gained popularity as a lightweight markup language that allows writers to focus on content
                rather than formatting. Its simplicity and readability make it an attractive option for academic
                writing. However, academic papers often require specific formatting that can be difficult to achieve
                with basic Markdown.</p>
            <p>Additionally, many researchers prefer to work on different sections of their papers separately, which can
                make it challenging to maintain a cohesive document. This is where PaperExport comes in.</p>
            <h2 id="purposeandscope">Purpose and Scope</h2>
            <p>The purpose of this paper is to:</p>
            <ol>
                <li>Introduce the PaperExport plugin for Obsidian</li>
                <li>Explain its key features and functionality</li>
                <li>Demonstrate its effectiveness in streamlining the academic writing workflow</li>
                <li>Discuss potential future developments</li>
            </ol>
            <p>The scope of this paper is limited to the technical aspects of the PaperExport plugin and its
                applications in academic writing. It does not cover the broader topics of academic writing guidelines or
                best practices.</p>
            <h2 id="researchquestions">Research Questions</h2>
            <p>This paper aims to address the following research questions:</p>
            <ol>
                <li>How can Markdown be effectively used for academic writing?</li>
                <li>What features are essential for converting Markdown documents to professional academic papers?</li>
                <li>How can a plugin streamline the workflow for researchers writing academic papers?</li>
            </ol>
            <p>By addressing these questions, this paper contributes to the ongoing discussion about digital tools for
                academic writing and their impact on scholarly productivity.</p>
        </div>
    </body>

</html>
    `;

        // 2. Additional CSS (optional)
        const additionalCSS = `
      p { 
        color: #3498db;
        font-size: 16px;
      }
      img {
        border: 2px solid #e74c3c;
      }
    `;

        // 3. PDF options (override defaults as needed)
        const pdfOptions = {
            path: "output.pdf", // Save to file
            printBackground: true,
            displayHeaderFooter: true,
            footerTemplate: `
        <div style="width:100%; text-align:center; font-size:10px;">
          Page <span class="pageNumber"></span> of <span class="totalPages"></span>
        </div>
      `,
        };

        // 4. Generate PDF
        console.log("Generating PDF...");
        const pdfBuffer = await htmlToPdf(html, pdfOptions, additionalCSS);

        // Optional: If not using 'path' in options
        fs.writeFileSync("output.pdf", pdfBuffer);

        console.log("PDF generated successfully!");
    } catch (error) {
        console.error("Failed to generate PDF:", error);
    }
}

// Execute
generateExamplePdf();

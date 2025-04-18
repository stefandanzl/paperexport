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
          <title>PDF Demo</title>
          <style>
            body { font-family: Arial; }
            h1 { color: #2c3e50; }
          </style>
        </head>
        <body>
          <h1>Hello PDF World!</h1>
          <p>This is a test document generated with Playwright</p>
          <img src="https://via.placeholder.com/150" alt="Sample Image">
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

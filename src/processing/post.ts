import { PDFDocument, rgb } from "pdf-lib";

async function addPageNumbers(
    pdfBuffer: Buffer,
    options?: {
        startNumber?: number;
        oddPosition?: { x: number; y: number };
        evenPosition?: { x: number; y: number };
    }
) {
    const {
        startNumber = 1,
        oddPosition = { x: 50, y: 20 }, // Left-aligned (odd pages)
        evenPosition = { x: 545, y: 20 }, // Right-aligned (even pages)
    } = options || {};

    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const helveticaFont = await pdfDoc.embedFont("Helvetica");
    const pages = pdfDoc.getPages();

    pages.forEach((page, index) => {
        const pageNum = startNumber + index;
        const isEven = pageNum % 2 === 0;
        const { x, y } = isEven ? evenPosition : oddPosition;

        page.drawText(`${pageNum}`, {
            x,
            y,
            size: 10,
            font: helveticaFont,
            color: rgb(0, 0, 0),
        });
    });

    return await pdfDoc.save();
}
/**
// Usage Example
const rawPdf = await page.pdf({ margin: { bottom: "25mm" } });
const finalPdf = await addPageNumbers(rawPdf, {
    startNumber: 1,
    oddPosition: { x: 30, y: 25 }, // 30mm from left, 25mm from bottom
    evenPosition: { x: 565, y: 25 }, // 35mm from right (A4: 595pt wide)
});
*/

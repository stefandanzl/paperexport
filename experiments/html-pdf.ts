import { Browser, Page, chromium } from "playwright";

export async function htmlToPdf(html: string, options: Parameters<Page["pdf"]>[0] = {}, additionalCSS?: string): Promise<Buffer> {
    let browser: Browser | null = null;

    const DEFAULT_OPTIONS = {
        format: "A4",
        margin: {
            top: "1cm",
            right: "1cm",
            bottom: "1cm",
            left: "1cm",
        },
        scale: 1,
        outline: true,
    };

    options = {
        ...options,
        ...DEFAULT_OPTIONS,
    };

    try {
        browser = await chromium.launch();
        const context = await browser.newContext();
        const page = await context.newPage();

        await page.setContent(html, { waitUntil: "networkidle" });

        if (additionalCSS) {
            await page.addStyleTag({ content: additionalCSS });
        }

        const pdfBuffer = await page.pdf(options);
        return pdfBuffer;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

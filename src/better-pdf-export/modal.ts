import * as electron from "electron";
import * as fs from "fs/promises";
import { ButtonComponent, FrontMatterCache, Modal, Setting, TFile, TFolder, debounce } from "obsidian";
import { PageSize } from "./constant";
import BetterExportPdfPlugin from "./main";
import { exportToPDF, getOutputFile, getOutputPath } from "./pdf";
import { createWebview, fixDoc, getAllStyles, getPatchStyle, renderMarkdown } from "./render";
import { isNumber, joinPath, mm2px, px2mm, traverseFolder } from "./utils";

export type PageSizeType = electron.PrintToPDFOptions["pageSize"];

export interface TConfig {
    pageSize: PageSizeType | "Custom";
    pageWidth?: string;
    pageHeight?: string;

    marginType: string;
    open: boolean;
    landscape: boolean;
    scale: number;
    showTitle: boolean;
    displayHeader: boolean;
    displayFooter: boolean;

    marginTop?: string;
    marginBottom?: string;
    marginLeft?: string;
    marginRight?: string;

    cssSnippet?: string;

    multiple?: boolean;
}

export type DocType = {
    doc: Document;
    frontMatter?: FrontMatterCache;
    file: TFile;
};

type Callback = (conf: TConfig) => void;

function fullWidthButton(button: ButtonComponent) {
    button.buttonEl.setAttribute("style", `margin: "0 auto"; width: -webkit-fill-available`);
}

function setInputWidth(inputEl: HTMLInputElement) {
    inputEl.setAttribute("style", `width: 100px;`);
}

export class ExportConfigModal extends Modal {
    config: TConfig;
    canceled: boolean;
    multiplePdf?: boolean;
    callback: Callback;
    plugin: BetterExportPdfPlugin;
    file: TFile | TFolder;
    preview: electron.WebviewTag;
    webviews: electron.WebviewTag[];
    previewDiv: HTMLDivElement;
    completed: boolean;
    docs: DocType[];
    title: string;
    frontMatter: FrontMatterCache;
    scale: number;

    constructor(plugin: BetterExportPdfPlugin, file: TFile | TFolder, multiplePdf?: boolean) {
        super(plugin.app);
        this.canceled = true;
        this.plugin = plugin;
        this.file = file;
        this.completed = false;
        this.docs = [];
        this.scale = 0.75;
        this.webviews = [];
        this.multiplePdf = multiplePdf;

        this.config = {
            pageSize: "A4",
            marginType: "1",
            showTitle: plugin.settings.showTitle ?? true,
            open: true,
            scale: 100,
            landscape: false,
            marginTop: "10",
            marginBottom: "10",
            marginLeft: "10",
            marginRight: "10",
            displayHeader: plugin.settings.displayHeader ?? true,
            displayFooter: plugin.settings.displayHeader ?? true,
            cssSnippet: "0",
            ...(plugin.settings?.prevConfig ?? {}),
        } as TConfig;
    }

    getFileCache(file: TFile) {
        return this.app.metadataCache.getFileCache(file);
    }

    async renderFiles(el: HTMLDivElement) {
        const app = this.plugin.app;

        let docs: DocType[] = [];
        if (this.file instanceof TFolder) {
            const files = traverseFolder(this.file);
            for (const file of files) {
                el.createDiv({
                    attr: { class: "progress" },
                    text: `${file.name}`,
                });
                docs.push(await renderMarkdown(app, file, this.config));
            }
        } else {
            const { doc, frontMatter, file } = await renderMarkdown(app, this.file, this.config);
            docs.push({ doc, frontMatter, file });
            if (frontMatter.toc) {
                const files = this.parseToc(doc);
                for (const item of files) {
                    docs.push(await renderMarkdown(app, item.file, this.config, item));
                    console.log(item.file);
                }
                const leaf = this.app.workspace.getLeaf();
                await leaf.openFile(this.file);
            }
        }
        if (!this.multiplePdf) {
            docs = this.mergeDoc(docs);
        }
        this.docs = docs.map(({ doc, ...rest }) => {
            return { ...rest, doc: fixDoc(doc, doc.title) };
        });
    }

    private parseToc(doc: Document) {
        const cache = this.getFileCache(this.file as TFile);
        const files =
            cache?.links
                ?.map(({ link, displayText }) => {
                    const id = crypto.randomUUID();
                    const elem = doc.querySelector(`a[data-href="${link}"]`) as HTMLAnchorElement;
                    if (elem) {
                        elem.href = `#${id}`;
                    }
                    return {
                        title: displayText,
                        file: this.app.metadataCache.getFirstLinkpathDest(link, this.file.path) as TFile,
                        id,
                    };
                })
                .filter((item) => item.file instanceof TFile) ?? [];
        return files;
    }

    mergeDoc(docs: DocType[]) {
        const { doc: doc0, frontMatter, file } = docs[0];
        const sections = [];
        for (const { doc } of docs) {
            const element = doc.querySelector(".markdown-preview-view");

            if (element) {
                const section = doc0.createElement("section");
                Array.from(element.children).forEach((child) => {
                    section.appendChild(doc0.importNode(child, true));
                });

                sections.push(section);
            }
        }
        const root = doc0.querySelector(".markdown-preview-view");
        if (root) {
            root.innerHTML = "";
        }
        sections.forEach((section) => {
            root?.appendChild(section);
        });

        return [{ doc: doc0, frontMatter, file }];
    }

    calcPageSize(element?: HTMLDivElement, config?: TConfig) {
        const { pageSize, pageWidth } = config ?? this.config;
        const el = element ?? this.previewDiv;
        let width = PageSize?.[pageSize as string]?.[0] ?? parseFloat(pageWidth as string);
        if (isNaN(width)) {
            width = 210;
        }
        const scale = Math.floor((mm2px(width) / el.offsetWidth) * 100) / 100;
        this.webviews.forEach((wb) => {
            wb.style.transform = `scale(${1 / scale},${1 / scale})`;
            wb.style.width = `calc(${scale} * 100%)`;
            wb.style.height = `calc(${scale} * 100%)`;
        });
        this.scale = scale;
        return scale;
    }

    async calcWebviewSize() {
        await sleep(500);
        this.webviews.forEach(async (e, i) => {
            const [width, height] = await e.executeJavaScript("[document.body.offsetWidth, document.body.offsetHeight]");
            const sizeEl = e.parentNode?.querySelector(".print-size");
            if (sizeEl) {
                sizeEl.innerHTML = `${width}×${height}px\n${px2mm(width)}×${px2mm(height)}mm`;
            }
        });
    }

    async togglePrintSize() {
        document.querySelectorAll(".print-size")?.forEach((sizeEl: HTMLDivElement) => {
            if (this.config["pageSize"] == "Custom") {
                sizeEl.style.visibility = "visible";
            } else {
                sizeEl.style.visibility = "hidden";
            }
        });
    }

    makeWebviewJs(doc: Document) {
        return `
      document.body.innerHTML = decodeURIComponent(\`${encodeURIComponent(doc.body.innerHTML)}\`);
      document.head.innerHTML = decodeURIComponent(\`${encodeURIComponent(document.head.innerHTML)}\`);
      
      // Function to recursively decode and replace innerHTML of span.markdown-embed elements
      function decodeAndReplaceEmbed(element) {
				// Replace the innerHTML with the decoded content
				element.innerHTML = decodeURIComponent(element.innerHTML);
				// Check if the new content contains further span.markdown-embed elements
				const newEmbeds = element.querySelectorAll("span.markdown-embed");
				newEmbeds.forEach(decodeAndReplaceEmbed);
      }
      
      // Start the process with all span.markdown-embed elements in the document
      document.querySelectorAll("span.markdown-embed").forEach(decodeAndReplaceEmbed);

      document.body.setAttribute("class", \`${document.body.getAttribute("class")}\`)
      document.body.setAttribute("style", \`${document.body.getAttribute("style")}\`)
      document.body.addClass("theme-light");
      document.body.removeClass("theme-dark");
      document.title = \`${doc.title}\`;
      `;
    }
    /**
     * append webview
     * @param e HTMLDivElement
     * @param render Rerender or not
     */
    async appendWebview(e: HTMLDivElement, doc: Document) {
        const webview = createWebview(this.scale);
        const preview = e.appendChild(webview);
        this.webviews.push(preview);
        this.preview = preview;
        preview.addEventListener("dom-ready", async (e) => {
            this.completed = true;
            getAllStyles().forEach(async (css) => {
                await preview.insertCSS(css);
            });
            if (this.config.cssSnippet && this.config.cssSnippet != "0") {
                try {
                    const cssSnippet = await fs.readFile(this.config.cssSnippet, { encoding: "utf8" });
                    // remove `@media print { ... }`
                    const printCss = cssSnippet.replaceAll(/@media print\s*{([^}]+)}/g, "$1");
                    await preview.insertCSS(printCss);
                    await preview.insertCSS(cssSnippet);
                } catch (error) {
                    console.warn(error);
                }
            }
            await preview.executeJavaScript(this.makeWebviewJs(doc));
            getPatchStyle().forEach(async (css) => {
                await preview.insertCSS(css);
            });
        });
    }
    async appendWebviews(el: HTMLDivElement, render = true) {
        el.empty();
        if (render) {
            await this.renderFiles(el);
        }
        el.empty();
        await Promise.all(
            this.docs?.map(async ({ doc }, i) => {
                if (this.multiplePdf) {
                    el.createDiv({
                        text: `${i + 1}-${doc.title}`,
                        attr: { class: "filename" },
                    });
                }
                const div = el.createDiv({
                    attr: { class: "webview-wrapper" },
                });
                div.createDiv({ attr: { class: "print-size" } });
                await this.appendWebview(div, doc);
            })
        );
        await this.calcWebviewSize();
    }
    async onOpen() {
        this.contentEl.empty();
        this.containerEl.style.setProperty("--dialog-width", "60vw");

        this.titleEl.setText("Export to PDF");
        const wrapper = this.contentEl.createDiv({
            attr: { id: "better-export-pdf" },
        });

        const title = (this.file as TFile)?.basename ?? this.file?.name;

        this.previewDiv = wrapper.createDiv({ attr: { class: "pdf-preview" } }, async (el) => {
            el.empty();
            const resizeObserver = new ResizeObserver(() => {
                this.calcPageSize(el);
            });
            resizeObserver.observe(el);
            await this.appendWebviews(el);
            this.togglePrintSize();
        });

        const contentEl = wrapper.createDiv({
            attr: { class: "setting-wrapper" },
        });
        contentEl.addEventListener("keyup", (event) => {
            if (event.key === "Enter") {
                handleExport();
            }
        });
        this.generateForm(contentEl);

        const handleExport = async () => {
            this.plugin.settings.prevConfig = this.config;
            await this.plugin.saveSettings();
            if (this.config["pageSize"] == "Custom") {
                if (!isNumber(this.config["pageWidth"] ?? "") || !isNumber(this.config["pageHeight"] ?? "")) {
                    alert("When the page size is Custom, the Width/Height cannot be empty.");
                    return;
                }
            }

            if (this.multiplePdf) {
                const outputPath = await getOutputPath(title);
                console.log("output:", outputPath);
                if (outputPath) {
                    await Promise.all(
                        this.webviews.map(async (wb, i) => {
                            await exportToPDF(`${outputPath}/${this.docs[i].file.basename}.pdf`, { ...this.plugin.settings, ...this.config }, wb, this.docs[i]);
                        })
                    );
                    this.close();
                }
            } else {
                const outputFile = await getOutputFile(title, this.plugin.settings.isTimestamp);
                if (outputFile) {
                    await exportToPDF(outputFile, { ...this.plugin.settings, ...this.config }, this.webviews[0], this.docs[0]);
                    this.close();
                }
            }
        };

        new Setting(contentEl).setHeading().addButton((button) => {
            button.setButtonText("Export").onClick(handleExport);
            button.setCta();
            fullWidthButton(button);
        });

        new Setting(contentEl).setHeading().addButton((button) => {
            button.setButtonText("Refresh").onClick(async () => {
                await this.appendWebviews(this.previewDiv);
            });
            fullWidthButton(button);
        });

        const debugEl = new Setting(contentEl).setHeading().addButton((button) => {
            button.setButtonText("Debug").onClick(async () => {
                this.preview?.openDevTools();
            });
            fullWidthButton(button);
        });
        debugEl.settingEl.hidden = !this.plugin.settings.debug;
    }

    private generateForm(contentEl: HTMLDivElement) {
        new Setting(contentEl).setName("Include file name as title").addToggle((toggle) =>
            toggle
                .setTooltip("Include file name as title")
                .setValue(this.config["showTitle"])
                .onChange(async (value) => {
                    this.config["showTitle"] = value;
                    this.webviews.forEach((wv, i) => {
                        wv.executeJavaScript(`
              var _title = document.querySelector("h1.__title__");
              if (_title) {
              	_title.style.display = "${value ? "block" : "none"}";
              }
              `);
                        const _title = this.docs[i]?.doc?.querySelector("h1.__title__") as HTMLHeadingElement;
                        if (_title) {
                            _title.style.display = value ? "block" : "none";
                        }
                    });
                })
        );
        const pageSizes: (PageSizeType | "Custom")[] = ["A0", "A1", "A2", "A3", "A4", "A5", "A6", "Legal", "Letter", "Tabloid", "Ledger", "Custom"];
        new Setting(contentEl).setName("Page Size").addDropdown((dropdown) => {
            dropdown
                .addOptions(Object.fromEntries(pageSizes.map((size) => [size, size])))
                .setValue(this.config.pageSize as string)
                .onChange(async (value: string) => {
                    this.config["pageSize"] = value as PageSizeType;
                    if (value == "Custom") {
                        sizeEl.settingEl.hidden = false;
                    } else {
                        sizeEl.settingEl.hidden = true;
                    }
                    this.togglePrintSize();
                    this.calcPageSize();
                    await this.calcWebviewSize();
                });
        });

        const sizeEl = new Setting(contentEl)
            .setName("Width/Height")
            .addText((text) => {
                setInputWidth(text.inputEl);
                text.setPlaceholder("width")
                    .setValue(this.config["pageWidth"] as string)
                    .onChange(
                        debounce(
                            async (value) => {
                                this.config["pageWidth"] = value;
                                this.calcPageSize();
                                await this.calcWebviewSize();
                            },
                            500,
                            true
                        )
                    );
            })
            .addText((text) => {
                setInputWidth(text.inputEl);
                text.setPlaceholder("height")
                    .setValue(this.config["pageHeight"] as string)
                    .onChange((value) => {
                        this.config["pageHeight"] = value;
                    });
            });

        sizeEl.settingEl.hidden = this.config["pageSize"] !== "Custom";

        new Setting(contentEl)
            .setName("Margin")
            .setDesc("The unit is millimeters.")
            .addDropdown((dropdown) => {
                dropdown
                    .addOption("0", "None")
                    .addOption("1", "Default")
                    .addOption("2", "Small")
                    .addOption("3", "Custom")
                    .setValue(this.config["marginType"])
                    .onChange(async (value: string) => {
                        this.config["marginType"] = value;
                        if (value == "3") {
                            topEl.settingEl.hidden = false;
                            btmEl.settingEl.hidden = false;
                        } else {
                            topEl.settingEl.hidden = true;
                            btmEl.settingEl.hidden = true;
                        }
                    });
            });

        const topEl = new Setting(contentEl)
            .setName("Top/Bottom")
            .addText((text) => {
                setInputWidth(text.inputEl);
                text.setPlaceholder("margin top")
                    .setValue(this.config["marginTop"] as string)
                    .onChange((value) => {
                        this.config["marginTop"] = value;
                    });
            })
            .addText((text) => {
                setInputWidth(text.inputEl);
                text.setPlaceholder("margin bottom")
                    .setValue(this.config["marginBottom"] as string)
                    .onChange((value) => {
                        this.config["marginBottom"] = value;
                    });
            });
        topEl.settingEl.hidden = this.config["marginType"] != "3";
        const btmEl = new Setting(contentEl)
            .setName("Left/Right")
            .addText((text) => {
                setInputWidth(text.inputEl);
                text.setPlaceholder("margin left")
                    .setValue(this.config["marginLeft"] as string)
                    .onChange((value) => {
                        this.config["marginLeft"] = value;
                    });
            })
            .addText((text) => {
                setInputWidth(text.inputEl);
                text.setPlaceholder("margin right")
                    .setValue(this.config["marginRight"] as string)
                    .onChange((value) => {
                        this.config["marginRight"] = value;
                    });
            });
        btmEl.settingEl.hidden = this.config["marginType"] != "3";

        new Setting(contentEl).setName("Downscale Percent").addSlider((slider) => {
            slider
                .setLimits(0, 100, 1)
                .setValue(this.config["scale"] as number)
                .onChange(async (value) => {
                    this.config["scale"] = value;
                    slider.showTooltip();
                });
        });
        new Setting(contentEl).setName("Landscape").addToggle((toggle) =>
            toggle
                .setTooltip("landscape")
                .setValue(this.config["landscape"])
                .onChange(async (value) => {
                    this.config["landscape"] = value;
                })
        );

        new Setting(contentEl).setName("Display Header").addToggle((toggle) =>
            toggle
                .setTooltip("Display header")
                .setValue(this.config["displayHeader"])
                .onChange(async (value) => {
                    this.config["displayHeader"] = value;
                })
        );

        new Setting(contentEl).setName("Display Footer").addToggle((toggle) =>
            toggle
                .setTooltip("Display footer")
                .setValue(this.config["displayFooter"])
                .onChange(async (value) => {
                    this.config["displayFooter"] = value;
                })
        );

        new Setting(contentEl).setName("Open after export").addToggle((toggle) =>
            toggle
                .setTooltip("Open the exported file after exporting.")
                .setValue(this.config["open"])
                .onChange(async (value) => {
                    this.config["open"] = value;
                })
        );

        const snippets = this.cssSnippets();

        if (Object.keys(snippets).length > 0 && this.plugin.settings.enabledCss) {
            new Setting(contentEl).setName("CSS snippets").addDropdown((dropdown) => {
                dropdown
                    .addOption("0", "Not select")
                    .addOptions(snippets)
                    .setValue(this.config["cssSnippet"] as string)
                    .onChange(async (value: string) => {
                        this.config["cssSnippet"] = value;
                        await this.appendWebviews(this.previewDiv, false);
                    });
            });
        }
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }

    cssSnippets(): Record<string, string> {
        // @ts-ignore
        const { snippets, enabledSnippets } = this.app?.customCss ?? {};
        // @ts-ignore
        const basePath = this.app.vault.adapter.basePath;
        return Object.fromEntries(
            snippets
                ?.filter((item: string) => !enabledSnippets.has(item))
                .map((name: string) => {
                    const file = joinPath(basePath, ".obsidian/snippets", name + ".css");
                    return [file, name];
                })
        );
    }
}

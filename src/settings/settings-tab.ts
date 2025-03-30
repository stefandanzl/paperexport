import { App, PluginSettingTab, Setting } from 'obsidian';
import PaperExportPlugin from '../main';

export class PaperExportSettingTab extends PluginSettingTab {
    plugin: PaperExportPlugin;

    constructor(app: App, plugin: PaperExportPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h1', { text: 'PaperExport Settings' });

        // Basic Settings
        containerEl.createEl('h2', { text: 'Basic Settings' });

        new Setting(containerEl)
            .setName('Export Directory')
            .setDesc('Directory where PDFs will be saved. Leave empty to use the vault root.')
            .addText(text => text
                .setPlaceholder('e.g., exports/papers')
                .setValue(this.plugin.settings.exportPath)
                .onChange(async (value) => {
                    this.plugin.settings.exportPath = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Default Filename')
            .setDesc('Default filename for exported PDF (without extension)')
            .addText(text => text
                .setPlaceholder('exported_paper')
                .setValue(this.plugin.settings.defaultFilename)
                .onChange(async (value) => {
                    this.plugin.settings.defaultFilename = value;
                    await this.plugin.saveSettings();
                }));

        // Template Settings
        containerEl.createEl('h2', { text: 'Template Settings' });

        new Setting(containerEl)
            .setName('HTML Template Path')
            .setDesc('Path to a custom HTML template file. Leave empty to use the default template.')
            .addText(text => text
                .setPlaceholder('e.g., templates/academic.html')
                .setValue(this.plugin.settings.templatePath)
                .onChange(async (value) => {
                    this.plugin.settings.templatePath = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Custom CSS')
            .setDesc('Additional CSS to include in the HTML before conversion to PDF')
            .addTextArea(textarea => textarea
                .setPlaceholder('Enter custom CSS here...')
                .setValue(this.plugin.settings.customCss)
                .onChange(async (value) => {
                    this.plugin.settings.customCss = value;
                    await this.plugin.saveSettings();
                }))
            .addExtraButton(button => {
                button
                    .setIcon('reset')
                    .setTooltip('Reset to default')
                    .onClick(async () => {
                        this.plugin.settings.customCss = '';
                        await this.plugin.saveSettings();
                        this.display();
                    });
            });

        // PDF Settings
        containerEl.createEl('h2', { text: 'PDF Settings' });

        const pageSizes = ['A4', 'A3', 'Letter', 'Legal'];
        new Setting(containerEl)
            .setName('Page Size')
            .setDesc('PDF page size')
            .addDropdown(dropdown => dropdown
                .addOptions(pageSizes.reduce((acc, size) => {
                    acc[size] = size;
                    return acc;
                }, {} as Record<string, string>))
                .setValue(this.plugin.settings.pageSize)
                .onChange(async (value) => {
                    this.plugin.settings.pageSize = value;
                    await this.plugin.saveSettings();
                }));

        containerEl.createEl('h3', { text: 'Margins' });

        new Setting(containerEl)
            .setName('Top Margin')
            .addText(text => text
                .setPlaceholder('1in')
                .setValue(this.plugin.settings.margins.top)
                .onChange(async (value) => {
                    this.plugin.settings.margins.top = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Right Margin')
            .addText(text => text
                .setPlaceholder('1in')
                .setValue(this.plugin.settings.margins.right)
                .onChange(async (value) => {
                    this.plugin.settings.margins.right = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Bottom Margin')
            .addText(text => text
                .setPlaceholder('1in')
                .setValue(this.plugin.settings.margins.bottom)
                .onChange(async (value) => {
                    this.plugin.settings.margins.bottom = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Left Margin')
            .addText(text => text
                .setPlaceholder('1in')
                .setValue(this.plugin.settings.margins.left)
                .onChange(async (value) => {
                    this.plugin.settings.margins.left = value;
                    await this.plugin.saveSettings();
                }));

        // Content Settings
        containerEl.createEl('h2', { text: 'Content Settings' });

        new Setting(containerEl)
            .setName('Include YAML Frontmatter')
            .setDesc('Include YAML frontmatter in the exported document')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.includeYamlFrontmatter)
                .onChange(async (value) => {
                    this.plugin.settings.includeYamlFrontmatter = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Render MathJax')
            .setDesc('Render MathJax equations in the exported document')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.renderMathJax)
                .onChange(async (value) => {
                    this.plugin.settings.renderMathJax = value;
                    await this.plugin.saveSettings();
                }));

        // Citation Settings
        containerEl.createEl('h2', { text: 'Citation Settings' });

        // Legacy citation settings
        new Setting(containerEl)
            .setName('Bibliography Path')
            .setDesc('Path to a bibliography file (.bib or .json) - Legacy feature')
            .addText(text => text
                .setPlaceholder('e.g., bibliography.bib')
                .setValue(this.plugin.settings.bibliographyPath)
                .onChange(async (value) => {
                    this.plugin.settings.bibliographyPath = value;
                    await this.plugin.saveSettings();
                }));

        const citationStyles = ['apa', 'mla', 'chicago', 'harvard', 'ieee'];
        new Setting(containerEl)
            .setName('Citation Style')
            .setDesc('Style to use for citations - Legacy feature')
            .addDropdown(dropdown => dropdown
                .addOptions(citationStyles.reduce((acc, style) => {
                    acc[style] = style.toUpperCase();
                    return acc;
                }, {} as Record<string, string>))
                .setValue(this.plugin.settings.citationStyle)
                .onChange(async (value) => {
                    this.plugin.settings.citationStyle = value;
                    await this.plugin.saveSettings();
                }));
                
        // Wiki-link based citation settings
        containerEl.createEl('h3', { text: 'Wiki-Link Citations' });
        
        new Setting(containerEl)
            .setName('Enable Wiki-Link Citations')
            .setDesc('Process [[sourceFile]] links as citations using the linked file\'s frontmatter')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.citations.enabled)
                .onChange(async (value) => {
                    this.plugin.settings.citations.enabled = value;
                    await this.plugin.saveSettings();
                }));
        
        new Setting(containerEl)
            .setName('Sources Folder')
            .setDesc('Path to the folder containing source files (with frontmatter)')
            .addText(text => text
                .setPlaceholder('sources')
                .setValue(this.plugin.settings.citations.sourcesFolderPath)
                .onChange(async (value) => {
                    this.plugin.settings.citations.sourcesFolderPath = value;
                    await this.plugin.saveSettings();
                }));
                
        new Setting(containerEl)
            .setName('Include References Section')
            .setDesc('Automatically generate a references section at the end of the document')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.citations.includeReferencesSection)
                .onChange(async (value) => {
                    this.plugin.settings.citations.includeReferencesSection = value;
                    await this.plugin.saveSettings();
                }));
                
        new Setting(containerEl)
            .setName('References Section Title')
            .setDesc('Title for the automatically generated references section')
            .addText(text => text
                .setPlaceholder('References')
                .setValue(this.plugin.settings.citations.referencesSectionTitle)
                .onChange(async (value) => {
                    this.plugin.settings.citations.referencesSectionTitle = value;
                    await this.plugin.saveSettings();
                }));
    }
}

import { Notice, Plugin, TFile } from 'obsidian';
import { PaperExportSettings, DEFAULT_SETTINGS } from './settings/settings';
import { PaperExportSettingTab } from './settings/settings-tab';
import { FileSelectionModal } from './ui/file-selection-modal';
import { mergeFiles } from './utils/merge-utils';
import { exportToPdf } from './utils/export-utils';

export default class PaperExportPlugin extends Plugin {
    settings: PaperExportSettings;

    async onload() {
        await this.loadSettings();

        // Add ribbon icon
        this.addRibbonIcon('file-text-plus', 'Export Academic Paper', () => {
            new FileSelectionModal(this.app, this).open();
        });

        // Add command
        this.addCommand({
            id: 'export-academic-paper',
            name: 'Export Academic Paper',
            callback: () => {
                new FileSelectionModal(this.app, this).open();
            }
        });

        // Add command to export current file
        this.addCommand({
            id: 'export-current-file',
            name: 'Export Current File as PDF',
            editorCheckCallback: (checking) => {
                const activeView = this.app.workspace.getActiveViewOfType(this.app.workspace.getViewType('markdown'));
                if (activeView) {
                    if (!checking) {
                        const file = this.app.workspace.getActiveFile();
                        if (file) {
                            this.exportFiles([file], file.basename);
                        }
                    }
                    return true;
                }
                return false;
            }
        });

        // Add settings tab
        this.addSettingTab(new PaperExportSettingTab(this.app, this));
    }

    onunload() {
        // Clean up
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    /**
     * Export selected files to PDF
     */
    async exportFiles(files: TFile[], outputFilename: string) {
        try {
            new Notice('PaperExport: Merging files...');
            
            // Merge markdown files
            const mergedMarkdown = await mergeFiles(files, this.app.vault, this.settings);
            
            new Notice('PaperExport: Generating PDF...');
            
            // Export to PDF
            const outputPath = await exportToPdf(
                mergedMarkdown,
                outputFilename || this.settings.defaultFilename,
                this.settings,
                this.app.vault
            );
            
            new Notice(`PaperExport: PDF saved to ${outputPath}`);
            
            return outputPath;
        } catch (error) {
            console.error('PaperExport: Error exporting files', error);
            this.displayError(`Error exporting files: ${error.message}`);
        }
    }

    /**
     * Display an error message
     */
    displayError(message: string) {
        new Notice(`PaperExport Error: ${message}`);
    }
}

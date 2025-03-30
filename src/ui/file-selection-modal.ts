import { App, Modal, Setting, TFile, TFolder } from 'obsidian';
import PaperExportPlugin from '../main';

interface FileSelectionItem {
    file: TFile;
    selected: boolean;
    order: number;
}

export class FileSelectionModal extends Modal {
    plugin: PaperExportPlugin;
    selectedFiles: Map<string, FileSelectionItem> = new Map();
    outputFilename: string;
    
    constructor(app: App, plugin: PaperExportPlugin) {
        super(app);
        this.plugin = plugin;
        this.outputFilename = plugin.settings.defaultFilename;
    }

    onOpen() {
        const { contentEl } = this;
        
        contentEl.createEl('h1', { text: 'Select Files to Merge and Export' });
        
        // Output filename setting
        new Setting(contentEl)
            .setName('Output Filename')
            .setDesc('Name of the output PDF file (without extension)')
            .addText(text => text
                .setValue(this.outputFilename)
                .onChange(value => {
                    this.outputFilename = value;
                }));
        
        // Create file selection area
        const fileSelectionContainer = contentEl.createDiv({ cls: 'paper-export-file-selection' });
        
        // Add some style to make the list more usable
        fileSelectionContainer.createEl('style', {
            text: `
                .paper-export-file-selection {
                    max-height: 300px;
                    overflow-y: auto;
                    border: 1px solid var(--background-modifier-border);
                    margin-bottom: 1em;
                    padding: 0.5em;
                }
                .paper-export-file-item {
                    display: flex;
                    align-items: center;
                    padding: 0.3em 0;
                }
                .paper-export-file-item input[type="checkbox"] {
                    margin-right: 0.5em;
                }
                .paper-export-file-order {
                    width: 50px;
                    margin-left: 0.5em;
                }
            `
        });
        
        // Get all markdown files in the vault
        this.populateFileSelection(fileSelectionContainer);
        
        // Add buttons
        const buttonContainer = contentEl.createDiv({ cls: 'paper-export-buttons' });
        
        buttonContainer.createEl('button', {
            text: 'Export',
            cls: 'mod-cta',
            attr: {
                style: 'margin-right: 10px;'
            }
        }).addEventListener('click', () => this.exportFiles());
        
        buttonContainer.createEl('button', {
            text: 'Cancel'
        }).addEventListener('click', () => this.close());
    }

    populateFileSelection(container: HTMLElement) {
        // Get all markdown files
        const markdownFiles = this.getAllMarkdownFiles();
        
        // Sort files by path
        markdownFiles.sort((a, b) => a.path.localeCompare(b.path));
        
        // Create a list item for each file
        for (let i = 0; i < markdownFiles.length; i++) {
            const file = markdownFiles[i];
            const fileItem = container.createDiv({ cls: 'paper-export-file-item' });
            
            // Create checkbox
            const checkbox = fileItem.createEl('input', {
                type: 'checkbox',
                attr: {
                    id: `file-${i}`
                }
            });
            
            // Create label
            fileItem.createEl('label', {
                text: file.path,
                attr: {
                    for: `file-${i}`
                }
            });
            
            // Create order input
            const orderInput = fileItem.createEl('input', {
                cls: 'paper-export-file-order',
                type: 'number',
                value: (i + 1).toString(),
                attr: {
                    min: '1',
                    style: 'width: 60px; margin-left: 10px;'
                }
            });
            
            // Add event listeners
            checkbox.addEventListener('change', (e) => {
                const target = e.target as HTMLInputElement;
                if (target.checked) {
                    this.selectedFiles.set(file.path, {
                        file,
                        selected: true,
                        order: parseInt(orderInput.value)
                    });
                } else {
                    this.selectedFiles.delete(file.path);
                }
            });
            
            orderInput.addEventListener('change', (e) => {
                const target = e.target as HTMLInputElement;
                const fileItem = this.selectedFiles.get(file.path);
                if (fileItem) {
                    fileItem.order = parseInt(target.value);
                }
            });
        }
    }

    getAllMarkdownFiles(): TFile[] {
        const files: TFile[] = [];
        
        // Recursive function to get all markdown files
        const getFiles = (folder: TFolder) => {
            folder.children.forEach(child => {
                if (child instanceof TFile && child.extension === 'md') {
                    files.push(child);
                } else if (child instanceof TFolder) {
                    getFiles(child);
                }
            });
        };
        
        // Start from the vault root
        getFiles(this.app.vault.getRoot());
        
        return files;
    }

    async exportFiles() {
        // Convert Map to array and sort by order
        const selectedFiles = Array.from(this.selectedFiles.values())
            .filter(item => item.selected)
            .sort((a, b) => a.order - b.order)
            .map(item => item.file);
        
        if (selectedFiles.length === 0) {
            this.plugin.displayError('No files selected for export.');
            return;
        }
        
        // Close modal
        this.close();
        
        // Call export function from the plugin
        await this.plugin.exportFiles(selectedFiles, this.outputFilename);
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}

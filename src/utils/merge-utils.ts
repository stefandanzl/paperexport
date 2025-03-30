import { TFile, Vault, normalizePath } from 'obsidian';
import { PaperExportSettings } from '../settings/settings';

export interface ChapterInfo {
    file: TFile;
    content: string;
    frontmatter: any;
    order: number;
}

export interface SourceInfo {
    key: string;  // The source identifier (filename without extension)
    file: TFile;
    frontmatter: any;
}

/**
 * Process wiki-link citations in the content
 * Converts [[sourceKey]] to [sourceKey.short] based on source frontmatter
 * Returns processed content and a set of used source keys
 */
export async function processCitations(
    content: string,
    sources: Map<string, SourceInfo>,
    vault: Vault
): Promise<{ content: string, usedSources: Set<string> }> {
    // Regular expression to find wiki links: [[sourceKey]]
    const wikiLinkRegex = /\[\[(.*?)\]\]/g;
    
    // Track which sources are actually used in this content
    const usedSources = new Set<string>();
    
    // Replace each wiki link with the citation format
    const processedContent = content.replace(wikiLinkRegex, (match, sourceKey) => {
        const source = sources.get(sourceKey);
        
        if (!source) {
            // Source not found, keep the original link
            return match;
        }
        
        // Track that this source was used
        usedSources.add(sourceKey);
        
        // Get the short citation from the frontmatter
        const shortCitation = source.frontmatter.short || sourceKey;
        
        // Return the formatted citation
        return `[${shortCitation}]`;
    });
    
    return { content: processedContent, usedSources };
}

/**
 * Find and load all source files in the vault
 */
export async function loadSources(
    vault: Vault,
    sourcesFolderPath?: string
): Promise<Map<string, SourceInfo>> {
    const sources = new Map<string, SourceInfo>();
    
    // Get all markdown files that could be sources
    let files = vault.getMarkdownFiles();
    
    // Filter to only include files in the sources folder if specified
    if (sourcesFolderPath) {
        const normalizedSourcesPath = normalizePath(sourcesFolderPath);
        files = files.filter(file => {
            // Check if the file is in the sources folder or a subfolder
            return file.path.startsWith(normalizedSourcesPath + '/') || 
                   file.path === normalizedSourcesPath;
        });
    }
    
    for (const file of files) {
        // Read the file content
        const content = await vault.read(file);
        
        // Extract frontmatter
        let frontmatter = {};
        if (content.startsWith('---')) {
            const endFrontMatter = content.indexOf('---', 3);
            if (endFrontMatter !== -1) {
                const frontmatterText = content.substring(3, endFrontMatter).trim();
                
                // Parse frontmatter
                frontmatterText.split('\n').forEach(line => {
                    const [key, value] = line.split(':').map(s => s?.trim());
                    if (key && value) {
                        frontmatter[key] = value;
                    }
                });
            }
        }
        
        // If this file has a 'short' property in frontmatter, consider it a source
        if ('short' in frontmatter) {
            sources.set(file.basename, {
                key: file.basename,
                file,
                frontmatter
            });
        }
    }
    
    return sources;
}

/**
 * Merge multiple markdown files into a single string
 */
export async function mergeFiles(
    files: TFile[], 
    vault: Vault, 
    settings: PaperExportSettings
): Promise<string> {
    const chapters: ChapterInfo[] = [];
    
    // Load all sources from the vault for citation processing
    const sources = settings.citations.enabled ? 
        await loadSources(vault, settings.citations.sourcesFolderPath) : 
        new Map<string, SourceInfo>();

    // Track all used sources across all files
    const allUsedSources = new Set<string>();
    
    // Read content from all files
    for (const file of files) {
        const content = await vault.read(file);
        
        // Extract frontmatter if available
        let frontmatter = {};
        let cleanContent = content;
        
        // Simple frontmatter extraction (could be improved with a proper YAML parser)
        if (content.startsWith('---')) {
            const endFrontMatter = content.indexOf('---', 3);
            if (endFrontMatter !== -1) {
                const frontmatterText = content.substring(3, endFrontMatter).trim();
                
                // Basic parsing - this could be improved
                frontmatterText.split('\n').forEach(line => {
                    const [key, value] = line.split(':').map(s => s?.trim());
                    if (key && value) {
                        frontmatter[key] = value;
                    }
                });
                
                // Remove frontmatter from content if not included
                if (!settings.includeYamlFrontmatter) {
                    cleanContent = content.substring(endFrontMatter + 3).trim();
                }
            }
        }
        
        // Process citations in the content
        const { content: processedContent, usedSources } = await processCitations(cleanContent, sources, vault);
        cleanContent = processedContent;
        
        // Add these sources to our overall collection
        usedSources.forEach(sourceKey => allUsedSources.add(sourceKey));

        // Determine chapter order from frontmatter or filename
        // You might have a `chapter` or `order` field in frontmatter to use
        let order = 999; // Default high number for unordered
        
        if ('order' in frontmatter) {
            order = parseInt(frontmatter.order);
        } else if ('chapter' in frontmatter) {
            order = parseInt(frontmatter.chapter);
        } else {
            // Try to extract order from filename if it starts with a number
            const match = file.basename.match(/^(\d+)/);
            if (match) {
                order = parseInt(match[1]);
            }
        }

        chapters.push({
            file,
            content: cleanContent,
            frontmatter,
            order
        });
    }

    // Sort chapters by order
    chapters.sort((a, b) => a.order - b.order);

    // Generate references section if any sources were used
    const generateReferencesSection = async (): Promise<string> => {
        if (!settings.citations.enabled || !settings.citations.includeReferencesSection || allUsedSources.size === 0) {
            return ''; // No references to include
        }
        
        let referencesContent = '\n\n<div class="page-break"></div>\n\n';
        referencesContent += `# ${settings.citations.referencesSectionTitle || 'References'}\n\n`;
        
        // Sort sources alphabetically by key
        const sortedSourceKeys = Array.from(allUsedSources).sort();
        
        // Add each reference
        for (const sourceKey of sortedSourceKeys) {
            const source = sources.get(sourceKey);
            if (!source) continue;
            
            // Get reference information from source frontmatter
            const title = source.frontmatter.title || '';
            const author = source.frontmatter.author || '';
            const year = source.frontmatter.year || '';
            const journal = source.frontmatter.journal || '';
            const volume = source.frontmatter.volume || '';
            const pages = source.frontmatter.pages || '';
            const publisher = source.frontmatter.publisher || '';
            const url = source.frontmatter.url || '';
            
            // Format the reference
            let reference = '';
            
            if (author) reference += `${author}. `;
            if (year) reference += `(${year}). `;
            if (title) reference += `${title}. `;
            if (journal) {
                reference += `*${journal}*`;
                if (volume) reference += `, ${volume}`;
                if (pages) reference += `, ${pages}`;
                reference += '. ';
            } else if (publisher) {
                reference += `${publisher}. `;
            }
            if (url) reference += `Retrieved from ${url}`;
            
            referencesContent += `${reference}\n\n`;
        }
        
        return referencesContent;
    };

    // Merge content with appropriate breaks between chapters
    let mergedContent = '';
    
    chapters.forEach((chapter, index) => {
        if (index > 0) {
            // Add page break between chapters
            mergedContent += '\n\n<div class="page-break"></div>\n\n';
        }

        // If frontmatter contains a title, add it as a heading
        if (chapter.frontmatter.title && !chapter.content.trim().startsWith('#')) {
            mergedContent += `# ${chapter.frontmatter.title}\n\n`;
        }

        mergedContent += chapter.content;
    });
    
    // Add references section if needed
    const referencesSection = await generateReferencesSection();
    mergedContent += referencesSection;

    return mergedContent;
}

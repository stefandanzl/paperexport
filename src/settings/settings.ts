export interface PaperExportSettings {
    exportPath: string;
    templatePath: string;
    customCss: string;
    defaultFilename: string;
    pageSize: string;
    margins: {
        top: string;
        right: string;
        bottom: string;
        left: string;
    };
    includeYamlFrontmatter: boolean;
    renderMathJax: boolean;
    bibliographyPath: string;
    citationStyle: string;
    citations: {
        enabled: boolean;
        sourcesFolderPath: string;
        includeReferencesSection: boolean;
        referencesSectionTitle: string;
    };
}

export const DEFAULT_SETTINGS: PaperExportSettings = {
    exportPath: '',
    templatePath: '',
    customCss: '',
    defaultFilename: 'exported_paper',
    pageSize: 'A4',
    margins: {
        top: '1in',
        right: '1in',
        bottom: '1in',
        left: '1in'
    },
    includeYamlFrontmatter: true,
    renderMathJax: true,
    bibliographyPath: '',
    citationStyle: 'apa',
    citations: {
        enabled: true,
        sourcesFolderPath: 'sources',
        includeReferencesSection: true,
        referencesSectionTitle: 'References'
    }
};

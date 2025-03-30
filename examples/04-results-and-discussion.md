---
title: Results and Discussion
chapter: 4
---

# Results and Discussion

## Performance Results

The PaperExport plugin was evaluated based on several key metrics. Table 1 summarizes the performance metrics collected during testing.

**Table 1: Performance Metrics for PaperExport**

| Metric | Value | Notes |
|--------|-------|-------|
| Average Processing Time | 2.3 seconds | For documents with 5-10 files |
| PDF Generation Time | 1.5 seconds | Average for a 20-page document |
| PDF File Size | 0.5-2 MB | Depends on content and images |
| Memory Usage | 25-40 MB | During PDF generation |

The performance results indicate that PaperExport is efficient for typical academic papers, with processing times remaining under 5 seconds even for larger documents with multiple files and images.

## Mathematical Notation Support

One of the key requirements for academic writing in many fields is support for mathematical notation. PaperExport supports both inline and block-level equations using MathJax.

For example, the quadratic formula can be represented as:

$$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$

And inline equations like $E = mc^2$ or $\int_{a}^{b} f(x) dx$ can be seamlessly integrated into paragraphs without disrupting the flow of text.

More complex equations are also supported, such as:

$$
\begin{align}
\nabla \times \vec{\mathbf{B}} -\, \frac1c\, \frac{\partial\vec{\mathbf{E}}}{\partial t} & = \frac{4\pi}{c}\vec{\mathbf{j}} \\
\nabla \cdot \vec{\mathbf{E}} & = 4 \pi \rho \\
\nabla \times \vec{\mathbf{E}}\, +\, \frac1c\, \frac{\partial\vec{\mathbf{B}}}{\partial t} & = \vec{\mathbf{0}} \\
\nabla \cdot \vec{\mathbf{B}} & = 0
\end{align}
$$

This capability makes PaperExport suitable for papers in physics, mathematics, engineering, and other quantitative disciplines.

## User Feedback Analysis

The qualitative feedback from users (n=15) revealed several key insights about the plugin's effectiveness. Figure 1 illustrates the distribution of user ratings across different aspects of the plugin.

Overall, users expressed high satisfaction with the plugin's core functionality and the quality of the exported PDFs. The most frequently cited positive aspects included:

1. **Seamless workflow integration**: Users appreciated how the plugin integrated with their existing Obsidian workflows, allowing them to maintain their notes and academic writing in a single environment.

2. **Simplified collaboration**: Several users noted that the ability to work with multiple files separately while still producing a cohesive final document facilitated collaboration with co-authors.

3. **Professional output**: The quality of the exported PDFs was consistently rated highly, with users describing them as "publication-ready" and "professionally formatted."

Areas for improvement identified through user feedback included:

1. **Citation management**: Users expressed a need for more robust citation management features, including direct integration with reference management software.

2. **Table of contents generation**: Automatic generation of a table of contents was frequently requested, particularly for longer documents.

3. **Page numbering options**: More control over page numbering, including the ability to use different numbering styles for different sections (e.g., roman numerals for front matter).

## Discussion of Key Findings

### Workflow Optimization

The results suggest that PaperExport successfully addresses the workflow challenges identified in the literature review. By allowing researchers to write in Markdown across multiple files and then combine them into a professionally formatted PDF, the plugin reduces the cognitive load associated with document formatting and organization.

This aligns with the theoretical framework of cognitive load theory, as discussed by Williams et al. (2019), who argue that "tools that automate formatting tasks free cognitive resources for higher-order thinking tasks essential to scholarly writing."

### Platform Limitations

Despite the positive results, it is important to acknowledge the limitations imposed by the platform. As a browser-based application, Obsidian (and by extension, PaperExport) faces certain constraints in terms of processing power and access to system resources. This affects the implementation of certain features, particularly those related to advanced PDF manipulation and integration with external tools.

### Implications for Academic Writing

The development and evaluation of PaperExport contribute to the broader discussion about the future of academic writing tools. The results suggest that there is significant value in approaches that combine the simplicity of Markdown with the formatting capabilities needed for academic publishing.

As noted by one participant: "This plugin bridges the gap between the note-taking and drafting phases of my research process, which has always been a point of friction in my workflow."

## Comparison with Other Tools

To contextualize these findings, Table 2 presents a comparison of PaperExport with other academic writing tools.

**Table 2: Comparison of Academic Writing Tools**

| Feature | PaperExport | Traditional Word Processors | LaTeX Editors | Other Markdown Tools |
|---------|-------------|------------------------------|---------------|----------------------|
| Ease of Learning | High | High | Low | High |
| Formatting Control | Medium | High | Very High | Low-Medium |
| Math Support | Good | Limited | Excellent | Variable |
| Multi-file Support | Excellent | Limited | Good | Limited |
| Integration with Note-taking | Excellent | Poor | Poor | Variable |
| Output Quality | High | Medium-High | Very High | Medium |

This comparison highlights PaperExport's unique position in combining the ease of use associated with Markdown with the output quality typically associated with more complex systems like LaTeX.

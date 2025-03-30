---
title: Methodology
chapter: 3
---

# Methodology

This section outlines the approach taken in developing and evaluating the PaperExport plugin. A mixed-method approach was employed, combining software development methodologies with qualitative user feedback.

## Development Approach

The development of PaperExport followed an iterative process based on the Agile methodology. This approach allowed for continuous refinement based on user feedback and changing requirements. The development process consisted of the following phases:

1. **Requirements Gathering**: Identifying the core needs of academic writers through literature review and informal discussions with potential users.

2. **Initial Design**: Creating a conceptual design for the plugin, focusing on the core functionality of merging multiple Markdown files and exporting to PDF.

3. **Implementation**: Developing the plugin using TypeScript and the Obsidian API. This phase involved several sprints, each focusing on specific features such as file merging, template rendering, and PDF generation.

4. **Testing**: Testing the plugin with various types of academic content to ensure reliability and consistency in the output.

5. **Refinement**: Making adjustments based on initial testing and feedback.

## Technical Implementation

The plugin was implemented using TypeScript, leveraging the Obsidian plugin API. Key technical components include:

- **File Management**: Utilizing Obsidian's file system API to access and merge Markdown files.
- **Markdown Processing**: Parsing and processing Markdown content, including handling of YAML frontmatter and special syntax.
- **HTML Rendering**: Converting Markdown to HTML using a customizable template system.
- **PDF Generation**: Generating PDFs from the HTML output with controlled formatting and pagination.

The implementation prioritized extensibility, allowing for future enhancements such as citation management and additional export formats.

## Evaluation Methods

To evaluate the effectiveness of PaperExport, the following methods were employed:

### Performance Metrics

The plugin was evaluated based on several performance metrics:

- **Processing Time**: Measuring the time required to merge files and generate PDFs of varying sizes.
- **File Size**: Analyzing the size and quality of the generated PDFs.
- **Compatibility**: Testing compatibility with different Obsidian versions and operating systems.

### Qualitative Feedback

Feedback was collected from a small group of academic users (n=15) who tested the plugin for their writing projects. The feedback focused on:

- User experience and ease of use
- Quality and professionalism of the output
- Integration with existing writing workflows
- Suggestions for improvement

Participants were selected to represent diverse academic disciplines, including humanities, social sciences, and STEM fields, to ensure the plugin's versatility across different types of academic writing.

## Limitations

The methodology has several limitations that should be acknowledged:

1. The sample size for user feedback was relatively small, which may limit the generalizability of the findings.

2. The evaluation focused primarily on the technical functionality and user experience rather than measuring the impact on actual writing productivity.

3. The development was constrained by the capabilities of the Obsidian API and the limitations of browser-based PDF generation.

Despite these limitations, the methodology provides a solid foundation for evaluating the plugin's effectiveness and identifying areas for future development.

## Ethical Considerations

All user testing was conducted with informed consent, and no sensitive personal data was collected during the evaluation process. Participants were informed about the purpose of the testing and how their feedback would be used.

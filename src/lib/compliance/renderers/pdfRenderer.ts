/**
 * PDF Renderer for Compliance Reports
 *
 * Generates government-style formatted PDF reports
 * Features:
 * - Section numbers and headers
 * - Table of contents
 * - Page headers and footers
 * - Professional formatting
 * - Appendix tables
 *
 * Production Implementation would use:
 * - pdfkit or jsPDF for PDF generation
 * - markdown-it for markdown to PDF conversion
 * - chart.js or d3 for charts and graphs
 */

import type {
  RenderedSection,
  ReportGenerationOptions,
  EmissionsInventory
} from '../types';

/**
 * Render report sections as PDF
 *
 * @param sections - Rendered report sections
 * @param framework - Framework configuration
 * @param emissionsData - Complete emissions data
 * @param options - Report generation options
 * @returns PDF as Blob
 */
export async function renderPDF(
  sections: RenderedSection[],
  framework: any,
  emissionsData: EmissionsInventory,
  options: ReportGenerationOptions
): Promise<Blob> {
  // In production, this would use a PDF library like pdfkit or jsPDF
  // For now, we'll create a structured HTML representation that can be converted to PDF

  const htmlContent = generatePDFHTML(sections, framework, emissionsData, options);

  // Convert HTML to Blob
  // In production, use a proper PDF library
  const blob = new Blob([htmlContent], { type: 'application/pdf' });

  return blob;
}

/**
 * Generate HTML structure for PDF conversion
 */
function generatePDFHTML(
  sections: RenderedSection[],
  framework: any,
  emissionsData: EmissionsInventory,
  options: ReportGenerationOptions
): string {
  const org = emissionsData.organizationInfo;
  const year = emissionsData.reportingPeriod.end.getFullYear();

  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${framework.fullName} Report - ${org.legalName} ${year}</title>
  <style>
    ${getPDFStyles()}
  </style>
</head>
<body>
  <!-- Cover Page -->
  <div class="cover-page">
    <div class="cover-header">
      <h1>${framework.fullName}</h1>
      <h2>${framework.name} Compliance Report</h2>
    </div>
    <div class="cover-org">
      <h2>${org.legalName}</h2>
      ${org.tradingName ? `<p class="trading-name">${org.tradingName}</p>` : ''}
    </div>
    <div class="cover-period">
      <h3>Reporting Period</h3>
      <p>${emissionsData.reportingPeriod.start.toLocaleDateString()} - ${emissionsData.reportingPeriod.end.toLocaleDateString()}</p>
    </div>
    <div class="cover-footer">
      <p>Generated: ${new Date().toLocaleDateString()}</p>
      ${options.confidentialityLevel ? `<p class="confidentiality">${options.confidentialityLevel.toUpperCase()}</p>` : ''}
    </div>
  </div>

  <!-- Executive Summary -->
  <div class="page executive-summary">
    <h1>Executive Summary</h1>
    <div class="summary-box">
      <h3>GHG Emissions Summary</h3>
      <table class="summary-table">
        <tr>
          <th>Scope</th>
          <th>Emissions (metric tons CO2e)</th>
        </tr>
        <tr>
          <td>Scope 1 (Direct Emissions)</td>
          <td>${emissionsData.totalScope1.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
        <tr>
          <td>Scope 2 (Indirect Energy - Market-Based)</td>
          <td>${emissionsData.totalScope2MarketBased.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
        <tr>
          <td>Scope 3 (Other Indirect)</td>
          <td>${emissionsData.totalScope3.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
        <tr class="total-row">
          <td><strong>Total GHG Emissions</strong></td>
          <td><strong>${emissionsData.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
        </tr>
      </table>
    </div>

    ${
      emissionsData.yearOverYearComparison
        ? `
    <div class="summary-box">
      <h3>Year-over-Year Comparison</h3>
      <table class="summary-table">
        <tr>
          <th>Metric</th>
          <th>${emissionsData.yearOverYearComparison.previousYear.year}</th>
          <th>${emissionsData.yearOverYearComparison.currentYear.year}</th>
          <th>Change</th>
        </tr>
        <tr>
          <td>Total Emissions</td>
          <td>${emissionsData.yearOverYearComparison.previousYear.total.toFixed(2)}</td>
          <td>${emissionsData.yearOverYearComparison.currentYear.total.toFixed(2)}</td>
          <td>${emissionsData.yearOverYearComparison.changes.total.percentage.toFixed(1)}%</td>
        </tr>
      </table>
    </div>
    `
        : ''
    }

    <div class="methodology-note">
      <h4>Methodology</h4>
      <p>${emissionsData.methodology}</p>
      <p><strong>GWP Standard:</strong> IPCC Fifth Assessment Report (AR5) - 100 year</p>
    </div>
  </div>

  <!-- Table of Contents -->
  <div class="page toc">
    <h1>Table of Contents</h1>
    <ul class="toc-list">
      ${sections
        .map(
          (section, index) => `
        <li>
          <span class="toc-number">${index + 1}.</span>
          <span class="toc-title">${section.title}</span>
          <span class="toc-dots"></span>
          <span class="toc-page">${section.pageNumber}</span>
        </li>
        ${
          section.subsections
            ? section.subsections
                .map(
                  (subsection, subIndex) => `
          <li class="toc-subsection">
            <span class="toc-number">${index + 1}.${subIndex + 1}</span>
            <span class="toc-title">${subsection.title}</span>
            <span class="toc-dots"></span>
            <span class="toc-page">${subsection.pageNumber}</span>
          </li>
        `
                )
                .join('')
            : ''
        }
      `
        )
        .join('')}
    </ul>
  </div>

  <!-- Report Sections -->
  ${sections
    .map(
      (section, index) => `
  <div class="page section">
    <div class="section-header">
      <h1><span class="section-number">${index + 1}.</span> ${section.title}</h1>
    </div>
    <div class="section-content">
      ${markdownToHTML(section.content)}
    </div>
    ${
      section.subsections
        ? section.subsections
            .map(
              (subsection, subIndex) => `
      <div class="subsection">
        <h2><span class="section-number">${index + 1}.${subIndex + 1}</span> ${subsection.title}</h2>
        <div class="subsection-content">
          ${markdownToHTML(subsection.content)}
        </div>
      </div>
    `
            )
            .join('')
        : ''
    }
  </div>
  `
    )
    .join('')}

  <!-- Footer (appears on every page) -->
  <div class="page-footer">
    <div class="footer-left">${org.legalName} - ${framework.name} Report ${year}</div>
    <div class="footer-center">CONFIDENTIAL</div>
    <div class="footer-right">Page <span class="page-number"></span></div>
  </div>
</body>
</html>
`;

  return html;
}

/**
 * PDF-optimized CSS styles
 */
function getPDFStyles(): string {
  return `
    @page {
      size: A4;
      margin: 2.5cm 2cm;
    }

    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #333;
    }

    .cover-page {
      page-break-after: always;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100vh;
      text-align: center;
    }

    .cover-header h1 {
      font-size: 28pt;
      margin-bottom: 10px;
      color: #1a1a1a;
    }

    .cover-header h2 {
      font-size: 20pt;
      color: #666;
      font-weight: 300;
    }

    .cover-org {
      margin: 40px 0;
    }

    .cover-org h2 {
      font-size: 24pt;
      margin-bottom: 5px;
    }

    .trading-name {
      font-size: 14pt;
      color: #666;
    }

    .cover-period {
      margin: 30px 0;
    }

    .cover-footer {
      position: absolute;
      bottom: 50px;
      font-size: 10pt;
      color: #999;
    }

    .confidentiality {
      color: #d32f2f;
      font-weight: bold;
      margin-top: 10px;
    }

    .page {
      page-break-after: always;
    }

    .executive-summary {
      padding: 20px 0;
    }

    .summary-box {
      margin: 25px 0;
      padding: 20px;
      border: 1px solid #ddd;
      background: #f9f9f9;
    }

    .summary-box h3 {
      margin-top: 0;
      color: #1976d2;
    }

    .summary-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }

    .summary-table th,
    .summary-table td {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }

    .summary-table th {
      background: #f5f5f5;
      font-weight: 600;
    }

    .total-row {
      background: #e3f2fd;
      font-weight: bold;
    }

    .methodology-note {
      margin-top: 30px;
      padding: 15px;
      background: #fff3e0;
      border-left: 4px solid #ff9800;
    }

    .toc {
      padding: 20px 0;
    }

    .toc h1 {
      margin-bottom: 30px;
    }

    .toc-list {
      list-style: none;
      padding: 0;
    }

    .toc-list li {
      display: flex;
      align-items: baseline;
      margin: 8px 0;
      font-size: 11pt;
    }

    .toc-subsection {
      padding-left: 20px;
      font-size: 10pt;
    }

    .toc-number {
      font-weight: bold;
      min-width: 40px;
    }

    .toc-title {
      flex: 1;
    }

    .toc-dots {
      flex: 1;
      border-bottom: 1px dotted #999;
      margin: 0 10px;
    }

    .toc-page {
      font-weight: bold;
      min-width: 30px;
      text-align: right;
    }

    .section-header {
      border-bottom: 3px solid #1976d2;
      padding-bottom: 10px;
      margin-bottom: 25px;
    }

    .section-header h1 {
      color: #1976d2;
      font-size: 20pt;
      margin: 0;
    }

    .section-number {
      color: #1976d2;
      margin-right: 10px;
    }

    .section-content {
      margin: 20px 0;
    }

    .subsection {
      margin: 30px 0;
    }

    .subsection h2 {
      color: #424242;
      font-size: 16pt;
      border-bottom: 1px solid #ddd;
      padding-bottom: 8px;
    }

    h1 {
      font-size: 18pt;
      color: #1a1a1a;
      margin-top: 20px;
      margin-bottom: 15px;
    }

    h2 {
      font-size: 14pt;
      color: #424242;
      margin-top: 18px;
      margin-bottom: 12px;
    }

    h3 {
      font-size: 12pt;
      color: #616161;
      margin-top: 15px;
      margin-bottom: 10px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      font-size: 10pt;
    }

    table th {
      background: #f5f5f5;
      padding: 8px;
      text-align: left;
      font-weight: 600;
      border: 1px solid #ddd;
    }

    table td {
      padding: 8px;
      border: 1px solid #ddd;
    }

    .page-footer {
      position: fixed;
      bottom: 1cm;
      left: 2cm;
      right: 2cm;
      font-size: 9pt;
      color: #666;
      border-top: 1px solid #ddd;
      padding-top: 10px;
      display: flex;
      justify-content: space-between;
    }

    @media print {
      .page {
        page-break-after: always;
      }
    }
  `;
}

/**
 * Simple Markdown to HTML converter
 * In production, use a library like markdown-it
 */
function markdownToHTML(markdown: string): string {
  let html = markdown;

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Lists
  html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
  html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

  // Paragraphs
  html = html.replace(/\n\n/g, '</p><p>');
  html = `<p>${html}</p>`;

  // Tables (basic support)
  html = html.replace(/\n\n/g, '</p><p>');

  return html;
}

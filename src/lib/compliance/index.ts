/**
 * Project Zero - Compliance Report Generation System
 *
 * Government-compliant sustainability reporting for:
 * - SB-253 (California Climate Corporate Data Accountability Act)
 * - CSRD (EU Corporate Sustainability Reporting Directive)
 * - CDP (Carbon Disclosure Project)
 * - TCFD (Task Force on Climate-related Financial Disclosures)
 * - ISSB S1/S2 (International Sustainability Standards Board)
 *
 * Features:
 * - Regulatory-grade emission calculations (EPA, eGRID, IPCC AR5, DEFRA)
 * - Framework-specific report templates
 * - Multiple export formats (PDF, XBRL, Excel)
 * - Audit-ready methodology documentation
 * - Full traceability and validation
 *
 * @module compliance
 */

// Core types
export * from './types';

// Regulatory frameworks configuration
export {
  REGULATORY_FRAMEWORKS,
  getFramework,
  getAllFrameworkIds,
  isValidFramework
} from './frameworks';

// Emissions calculator with government emission factors
export {
  calculateSingleEmission,
  calculateEmissions,
  buildEmissionsInventory,
  validateInventory,
  initializeEmissionFactors,
  // Emission factor databases
  EPA_STATIONARY_COMBUSTION_FACTORS,
  EGRID_2023_FACTORS,
  DEFRA_2024_FACTORS,
  SCOPE3_DEFAULT_FACTORS,
  IPCC_AR5_GWP
} from './emissionsCalculator';

// Report generator - main entry point
export {
  generateComplianceReport,
  submitToRegulator
} from './reportGenerator';

// Renderers for different export formats
export { renderPDF } from './renderers/pdfRenderer';
export { renderXBRL, validateXBRL, generateInlineXBRL } from './renderers/xbrlRenderer';
export { renderExcel, generateCSV } from './renderers/excelRenderer';

// Sample reports for demonstration
export {
  generateSampleReportSkeleton,
  printSampleReport,
  SAMPLE_REPORTS
} from './sampleReports';

/**
 * Quick Start Example
 *
 * ```typescript
 * import {
 *   generateComplianceReport,
 *   buildEmissionsInventory,
 *   calculateEmissions,
 *   initializeEmissionFactors
 * } from '@/lib/compliance';
 *
 * // 1. Prepare your emissions data
 * const activityData = [
 *   {
 *     scope: 1,
 *     category: 'stationary_combustion',
 *     activityAmount: 50000,
 *     activityUnit: 'cubic feet',
 *     timePeriod: { start: new Date('2024-01-01'), end: new Date('2024-12-31') },
 *     dataQuality: 'measured',
 *     source: 'Utility bills'
 *   }
 * ];
 *
 * // 2. Initialize emission factors
 * const emissionFactors = initializeEmissionFactors();
 *
 * // 3. Calculate emissions
 * const emissionResults = calculateEmissions(activityData, emissionFactors);
 *
 * // 4. Build complete inventory
 * const inventory = buildEmissionsInventory(
 *   organizationInfo,
 *   emissionResults,
 *   { start: new Date('2024-01-01'), end: new Date('2024-12-31') }
 * );
 *
 * // 5. Generate compliance report
 * const report = await generateComplianceReport(
 *   inventory,
 *   'SB-253',  // or 'CSRD', 'CDP', 'TCFD', 'ISSB'
 *   'PDF'      // or 'XBRL', 'EXCEL'
 * );
 *
 * // 6. Download or submit
 * downloadReport(report.outputData, `SB-253-Report-2024.pdf`);
 * ```
 */

/**
 * Validation Example
 *
 * ```typescript
 * import { validateInventory, getFramework } from '@/lib/compliance';
 *
 * const framework = getFramework('CSRD');
 * const errors = validateInventory(inventory, 'CSRD');
 *
 * if (errors.length > 0) {
 *   console.error('Validation errors:', errors);
 * } else {
 *   console.log('Inventory is compliant with CSRD requirements');
 * }
 * ```
 */

/**
 * Sample Report Generation
 *
 * ```typescript
 * import { printSampleReport, SAMPLE_REPORTS } from '@/lib/compliance';
 *
 * // Print sample to console for review
 * printSampleReport('SB-253');
 *
 * // Access pre-generated samples
 * const csrdSample = SAMPLE_REPORTS['CSRD'];
 * ```
 */

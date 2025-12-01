/**
 * Excel Renderer for Compliance Reports
 *
 * Generates Excel workbooks with:
 * - One sheet per major section
 * - Emission data tables
 * - Activity data breakdowns
 * - Year-over-year comparisons
 * - Pivot-ready data formats
 *
 * Production Implementation would use:
 * - xlsx or exceljs library for Excel generation
 * - Formatted tables with styling
 * - Charts and graphs
 * - Data validation and formulas
 */

import type {
  RenderedSection,
  ReportGenerationOptions,
  EmissionsInventory
} from '../types';

/**
 * Render report as Excel workbook
 *
 * @param sections - Rendered report sections
 * @param framework - Framework configuration
 * @param emissionsData - Complete emissions data
 * @param options - Report generation options
 * @returns Excel file as Blob
 */
export async function renderExcel(
  sections: RenderedSection[],
  framework: any,
  emissionsData: EmissionsInventory,
  options: ReportGenerationOptions
): Promise<Blob> {
  // In production, use xlsx or exceljs library
  // For now, we'll generate CSV-style data that represents the Excel structure

  const excelData = generateExcelStructure(sections, emissionsData, framework);

  // Convert to Blob
  // In production, use proper Excel library
  const blob = new Blob([excelData], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });

  return blob;
}

/**
 * Generate Excel workbook structure
 */
function generateExcelStructure(
  sections: RenderedSection[],
  data: EmissionsInventory,
  framework: any
): string {
  let excelContent = '';

  // Sheet 1: Executive Summary
  excelContent += generateSummarySheet(data, framework);
  excelContent += '\n\n';

  // Sheet 2: Scope 1 Details
  excelContent += generateScope1Sheet(data);
  excelContent += '\n\n';

  // Sheet 3: Scope 2 Details
  excelContent += generateScope2Sheet(data);
  excelContent += '\n\n';

  // Sheet 4: Scope 3 Details
  excelContent += generateScope3Sheet(data);
  excelContent += '\n\n';

  // Sheet 5: Activity Data
  excelContent += generateActivityDataSheet(data);
  excelContent += '\n\n';

  // Sheet 6: Emission Factors
  excelContent += generateEmissionFactorsSheet(data);
  excelContent += '\n\n';

  // Sheet 7: Year-over-Year (if applicable)
  if (data.yearOverYearComparison) {
    excelContent += generateYearOverYearSheet(data);
    excelContent += '\n\n';
  }

  return excelContent;
}

/**
 * Generate Executive Summary sheet
 */
function generateSummarySheet(data: EmissionsInventory, framework: any): string {
  let sheet = '=== SHEET: Executive Summary ===\n\n';

  sheet += `${framework.fullName}\n`;
  sheet += `${data.organizationInfo.legalName}\n`;
  sheet += `Reporting Period: ${data.reportingPeriod.start.toLocaleDateString()} - ${data.reportingPeriod.end.toLocaleDateString()}\n\n`;

  sheet += 'GHG EMISSIONS SUMMARY\n';
  sheet += 'Scope,Emissions (metric tons CO2e)\n';
  sheet += `Scope 1,${data.totalScope1.toFixed(2)}\n`;
  sheet += `Scope 2 (Location-based),${data.totalScope2LocationBased.toFixed(2)}\n`;
  sheet += `Scope 2 (Market-based),${data.totalScope2MarketBased.toFixed(2)}\n`;
  sheet += `Scope 3,${data.totalScope3.toFixed(2)}\n`;
  sheet += `Total (using market-based Scope 2),${data.grandTotal.toFixed(2)}\n\n`;

  sheet += 'ORGANIZATION INFORMATION\n';
  sheet += `Legal Name,${data.organizationInfo.legalName}\n`;
  sheet += `Registration Number,${data.organizationInfo.registrationNumber}\n`;
  sheet += `Industry,${data.organizationInfo.industry}\n`;
  sheet += `Industry Code,${data.organizationInfo.industryCode}\n`;
  sheet += `Employees,${data.organizationInfo.numberOfEmployees}\n`;
  sheet += `Revenue,${data.organizationInfo.currency} ${data.organizationInfo.revenue.toLocaleString()}\n`;
  sheet += `Headquarters,"${data.organizationInfo.headquarters.city}, ${data.organizationInfo.headquarters.country}"\n\n`;

  sheet += 'EMISSION INTENSITY METRICS\n';
  sheet += `Emissions per Employee,${(data.grandTotal / data.organizationInfo.numberOfEmployees).toFixed(4)} tons CO2e/employee\n`;
  sheet += `Emissions per Million ${data.organizationInfo.currency} Revenue,${((data.grandTotal / data.organizationInfo.revenue) * 1000000).toFixed(2)} tons CO2e/M ${data.organizationInfo.currency}\n\n`;

  return sheet;
}

/**
 * Generate Scope 1 Details sheet
 */
function generateScope1Sheet(data: EmissionsInventory): string {
  let sheet = '=== SHEET: Scope 1 Emissions ===\n\n';

  sheet += 'SCOPE 1 DIRECT GHG EMISSIONS\n';
  sheet += `Total Scope 1: ${data.totalScope1.toFixed(2)} metric tons CO2e\n\n`;

  sheet += 'SOURCE DETAILS\n';
  sheet += 'Category,Source,Location,Activity Data,Unit,Emission Factor,Factor Unit,Emissions (tons CO2e),Data Quality,Calculation Method\n';

  for (const emission of data.scope1) {
    sheet += `${emission.category},`;
    sheet += `${emission.activityData.source},`;
    sheet += `${emission.activityData.location || 'N/A'},`;
    sheet += `${emission.activityData.activityAmount},`;
    sheet += `${emission.activityData.activityUnit},`;
    sheet += `${emission.emissionFactor.factor},`;
    sheet += `${emission.emissionFactor.unit},`;
    sheet += `${emission.emissionAmount.toFixed(4)},`;
    sheet += `${emission.dataQuality},`;
    sheet += `${emission.traceability.calculationMethod}\n`;
  }

  sheet += '\n';

  // Summary by category
  sheet += 'CATEGORY SUMMARY\n';
  sheet += 'Category,Emissions (tons CO2e),% of Scope 1\n';

  const byCategory: Record<string, number> = {};
  for (const emission of data.scope1) {
    byCategory[emission.category] = (byCategory[emission.category] || 0) + emission.emissionAmount;
  }

  for (const [category, total] of Object.entries(byCategory)) {
    const percentage = (total / data.totalScope1) * 100;
    sheet += `${category},${total.toFixed(2)},${percentage.toFixed(1)}%\n`;
  }

  return sheet;
}

/**
 * Generate Scope 2 Details sheet
 */
function generateScope2Sheet(data: EmissionsInventory): string {
  let sheet = '=== SHEET: Scope 2 Emissions ===\n\n';

  sheet += 'SCOPE 2 INDIRECT ENERGY EMISSIONS\n';
  sheet += `Location-based Total: ${data.totalScope2LocationBased.toFixed(2)} metric tons CO2e\n`;
  sheet += `Market-based Total: ${data.totalScope2MarketBased.toFixed(2)} metric tons CO2e\n\n`;

  sheet += 'LOCATION-BASED METHOD\n';
  sheet += 'Facility/Location,Electricity Consumed (MWh),eGRID Subregion,Emission Factor (kg CO2e/MWh),Emissions (tons CO2e)\n';

  for (const emission of data.scope2.locationBased) {
    sheet += `${emission.activityData.location || 'N/A'},`;
    sheet += `${emission.activityData.activityAmount.toFixed(2)},`;
    sheet += `${emission.emissionFactor.geography || 'N/A'},`;
    sheet += `${emission.emissionFactor.factor.toFixed(2)},`;
    sheet += `${emission.emissionAmount.toFixed(4)}\n`;
  }

  sheet += '\n';

  sheet += 'MARKET-BASED METHOD\n';
  sheet += 'Facility/Location,Electricity Consumed (MWh),Contractual Instrument,Emission Factor (kg CO2e/MWh),Emissions (tons CO2e)\n';

  for (const emission of data.scope2.marketBased) {
    sheet += `${emission.activityData.location || 'N/A'},`;
    sheet += `${emission.activityData.activityAmount.toFixed(2)},`;
    sheet += `${emission.activityData.notes || 'Grid Average'},`;
    sheet += `${emission.emissionFactor.factor.toFixed(2)},`;
    sheet += `${emission.emissionAmount.toFixed(4)}\n`;
  }

  return sheet;
}

/**
 * Generate Scope 3 Details sheet
 */
function generateScope3Sheet(data: EmissionsInventory): string {
  let sheet = '=== SHEET: Scope 3 Emissions ===\n\n';

  sheet += 'SCOPE 3 VALUE CHAIN EMISSIONS\n';
  sheet += `Total Scope 3: ${data.totalScope3.toFixed(2)} metric tons CO2e\n\n`;

  sheet += 'CATEGORY SUMMARY (GHG Protocol 15 Categories)\n';
  sheet += 'Category,Description,Emissions (tons CO2e),% of Scope 3,Data Quality\n';

  const categoryDescriptions: Record<string, string> = {
    purchased_goods_services: 'Cat 1: Purchased Goods & Services',
    capital_goods: 'Cat 2: Capital Goods',
    fuel_energy_related: 'Cat 3: Fuel & Energy Related Activities',
    upstream_transportation: 'Cat 4: Upstream Transportation & Distribution',
    waste_generated: 'Cat 5: Waste Generated in Operations',
    business_travel: 'Cat 6: Business Travel',
    employee_commuting: 'Cat 7: Employee Commuting',
    upstream_leased_assets: 'Cat 8: Upstream Leased Assets',
    downstream_transportation: 'Cat 9: Downstream Transportation & Distribution',
    processing_sold_products: 'Cat 10: Processing of Sold Products',
    use_sold_products: 'Cat 11: Use of Sold Products',
    end_of_life: 'Cat 12: End-of-Life Treatment',
    downstream_leased_assets: 'Cat 13: Downstream Leased Assets',
    franchises: 'Cat 14: Franchises',
    investments: 'Cat 15: Investments'
  };

  for (const [category, emissions] of Object.entries(data.scope3)) {
    if (!emissions || emissions.length === 0) continue;

    const categoryTotal = emissions.reduce((sum, e) => sum + e.emissionAmount, 0);
    const percentage = (categoryTotal / data.totalScope3) * 100;
    const avgDataQuality = emissions[0].dataQuality;

    sheet += `${category},`;
    sheet += `${categoryDescriptions[category] || category},`;
    sheet += `${categoryTotal.toFixed(2)},`;
    sheet += `${percentage.toFixed(1)}%,`;
    sheet += `${avgDataQuality}\n`;
  }

  sheet += '\n';

  sheet += 'DETAILED EMISSION SOURCES\n';
  sheet += 'Category,Subcategory,Activity Data,Unit,Emission Factor,Factor Source,Emissions (tons CO2e),Data Quality\n';

  for (const [category, emissions] of Object.entries(data.scope3)) {
    if (!emissions) continue;

    for (const emission of emissions) {
      sheet += `${category},`;
      sheet += `${emission.subcategory || 'N/A'},`;
      sheet += `${emission.activityData.activityAmount},`;
      sheet += `${emission.activityData.activityUnit},`;
      sheet += `${emission.emissionFactor.factor},`;
      sheet += `${emission.emissionFactor.source} ${emission.emissionFactor.version},`;
      sheet += `${emission.emissionAmount.toFixed(4)},`;
      sheet += `${emission.dataQuality}\n`;
    }
  }

  return sheet;
}

/**
 * Generate Activity Data sheet
 */
function generateActivityDataSheet(data: EmissionsInventory): string {
  let sheet = '=== SHEET: Activity Data ===\n\n';

  sheet += 'COMPLETE ACTIVITY DATA INVENTORY\n\n';
  sheet += 'Scope,Category,Subcategory,Activity Amount,Unit,Time Period,Data Quality,Data Source,Location,Notes\n';

  // Combine all activity data from all scopes
  const allEmissions = [...data.scope1, ...data.scope2.locationBased, ...data.scope2.marketBased];

  for (const [category, emissions] of Object.entries(data.scope3)) {
    if (emissions) {
      allEmissions.push(...emissions);
    }
  }

  for (const emission of allEmissions) {
    const activityData = emission.activityData;

    sheet += `${emission.scope},`;
    sheet += `${emission.category},`;
    sheet += `${emission.subcategory || 'N/A'},`;
    sheet += `${activityData.activityAmount},`;
    sheet += `${activityData.activityUnit},`;
    sheet += `${activityData.timePeriod.start.toLocaleDateString()} - ${activityData.timePeriod.end.toLocaleDateString()},`;
    sheet += `${activityData.dataQuality},`;
    sheet += `${activityData.source},`;
    sheet += `${activityData.location || 'N/A'},`;
    sheet += `"${activityData.notes || 'N/A'}"\n`;
  }

  return sheet;
}

/**
 * Generate Emission Factors sheet
 */
function generateEmissionFactorsSheet(data: EmissionsInventory): string {
  let sheet = '=== SHEET: Emission Factors ===\n\n';

  sheet += 'EMISSION FACTORS APPLIED\n\n';
  sheet += 'Factor ID,Name,Source,Version,Scope,Category,Factor Value,Unit,GWP Standard,Geography,Applicable Years,Last Updated\n';

  // Collect unique emission factors
  const factors = new Map<string, any>();

  const allEmissions = [...data.scope1, ...data.scope2.locationBased, ...data.scope2.marketBased];
  for (const [category, emissions] of Object.entries(data.scope3)) {
    if (emissions) {
      allEmissions.push(...emissions);
    }
  }

  for (const emission of allEmissions) {
    const factor = emission.emissionFactor;
    if (!factors.has(factor.id)) {
      factors.set(factor.id, factor);
    }
  }

  for (const [id, factor] of factors) {
    sheet += `${factor.id},`;
    sheet += `${factor.name},`;
    sheet += `${factor.source},`;
    sheet += `${factor.version},`;
    sheet += `${factor.scope},`;
    sheet += `${factor.category},`;
    sheet += `${factor.factor},`;
    sheet += `${factor.unit},`;
    sheet += `${factor.gwp},`;
    sheet += `${factor.geography || 'N/A'},`;
    sheet += `"${factor.applicableYears.join(', ')}",`;
    sheet += `${factor.lastUpdated.toLocaleDateString()}\n`;
  }

  return sheet;
}

/**
 * Generate Year-over-Year Comparison sheet
 */
function generateYearOverYearSheet(data: EmissionsInventory): string {
  if (!data.yearOverYearComparison) return '';

  const yoy = data.yearOverYearComparison;
  let sheet = '=== SHEET: Year-over-Year Comparison ===\n\n';

  sheet += 'YEAR-OVER-YEAR EMISSIONS COMPARISON\n\n';
  sheet += `Scope,${yoy.previousYear.year},${yoy.currentYear.year},Absolute Change,Percentage Change\n`;

  sheet += `Scope 1,${yoy.previousYear.scope1.toFixed(2)},${yoy.currentYear.scope1.toFixed(2)},${yoy.changes.scope1.absolute.toFixed(2)},${yoy.changes.scope1.percentage.toFixed(1)}%\n`;
  sheet += `Scope 2,${yoy.previousYear.scope2.toFixed(2)},${yoy.currentYear.scope2.toFixed(2)},${yoy.changes.scope2.absolute.toFixed(2)},${yoy.changes.scope2.percentage.toFixed(1)}%\n`;
  sheet += `Scope 3,${yoy.previousYear.scope3.toFixed(2)},${yoy.currentYear.scope3.toFixed(2)},${yoy.changes.scope3.absolute.toFixed(2)},${yoy.changes.scope3.percentage.toFixed(1)}%\n`;
  sheet += `Total,${yoy.previousYear.total.toFixed(2)},${yoy.currentYear.total.toFixed(2)},${yoy.changes.total.absolute.toFixed(2)},${yoy.changes.total.percentage.toFixed(1)}%\n\n`;

  sheet += 'EXPLANATION OF CHANGES\n';
  sheet += `${yoy.explanationOfChanges}\n`;

  return sheet;
}

/**
 * Generate CSV format for a simple export
 */
export function generateCSV(data: EmissionsInventory): string {
  let csv = 'Scope,Category,Emissions (tons CO2e)\n';

  // Scope 1
  const scope1ByCategory: Record<string, number> = {};
  for (const emission of data.scope1) {
    scope1ByCategory[emission.category] = (scope1ByCategory[emission.category] || 0) + emission.emissionAmount;
  }
  for (const [category, total] of Object.entries(scope1ByCategory)) {
    csv += `1,${category},${total.toFixed(2)}\n`;
  }

  // Scope 2
  csv += `2,Location-based,${data.totalScope2LocationBased.toFixed(2)}\n`;
  csv += `2,Market-based,${data.totalScope2MarketBased.toFixed(2)}\n`;

  // Scope 3
  for (const [category, emissions] of Object.entries(data.scope3)) {
    if (!emissions) continue;
    const total = emissions.reduce((sum, e) => sum + e.emissionAmount, 0);
    csv += `3,${category},${total.toFixed(2)}\n`;
  }

  return csv;
}

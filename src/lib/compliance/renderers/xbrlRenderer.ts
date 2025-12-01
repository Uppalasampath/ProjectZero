/**
 * XBRL Renderer for CSRD Compliance
 *
 * Generates ESRS-compliant XBRL output for digital reporting
 * Reference: EFRAG ESRS XBRL Taxonomy 1.0
 *
 * XBRL (eXtensible Business Reporting Language) is required for:
 * - CSRD reporting in the EU (via ESAP - European Single Access Point)
 * - Digital filing with regulators
 * - Machine-readable sustainability data
 *
 * Production Implementation Notes:
 * - Use official ESRS XBRL taxonomy from EFRAG
 * - Validate against XBRL schema
 * - Include all required contexts and units
 * - Support iXBRL (inline XBRL) for human-readable reports
 */

import type {
  RenderedSection,
  ReportGenerationOptions,
  EmissionsInventory,
  XBRLTag
} from '../types';

/**
 * Render report as ESRS-compliant XBRL
 *
 * @param sections - Rendered report sections
 * @param framework - Framework configuration
 * @param emissionsData - Complete emissions data
 * @param options - Report generation options
 * @returns XBRL as XML string
 */
export function renderXBRL(
  sections: RenderedSection[],
  framework: any,
  emissionsData: EmissionsInventory,
  options: ReportGenerationOptions
): string {
  // Generate XBRL tags from emissions data
  const xbrlTags = generateXBRLTags(emissionsData, framework);

  // Build XBRL XML document
  const xbrlDocument = buildXBRLDocument(xbrlTags, emissionsData, framework);

  return xbrlDocument;
}

/**
 * Generate XBRL tags from emissions data
 */
function generateXBRLTags(
  data: EmissionsInventory,
  framework: any
): XBRLTag[] {
  const tags: XBRLTag[] = [];
  const period = {
    start: data.reportingPeriod.start,
    end: data.reportingPeriod.end
  };

  // Organization Information Tags (ESRS 2)
  tags.push({
    namespace: 'esrs',
    element: 'NameOfReportingEntity',
    value: data.organizationInfo.legalName,
    context: 'CurrentYear',
    period
  });

  tags.push({
    namespace: 'esrs',
    element: 'LEI',
    value: data.organizationInfo.registrationNumber,
    context: 'CurrentYear',
    period
  });

  tags.push({
    namespace: 'esrs',
    element: 'ReportingPeriodStartDate',
    value: data.reportingPeriod.start.toISOString().split('T')[0],
    context: 'CurrentYear',
    period
  });

  tags.push({
    namespace: 'esrs',
    element: 'ReportingPeriodEndDate',
    value: data.reportingPeriod.end.toISOString().split('T')[0],
    context: 'CurrentYear',
    period
  });

  // Climate Change (E1) - GHG Emissions
  // Scope 1
  tags.push({
    namespace: 'esrs-e1',
    element: 'GrossScope1GHGEmissions',
    value: data.totalScope1,
    context: 'CurrentYear',
    unit: 'tonnes_CO2e',
    decimals: 2,
    period
  });

  // Scope 2 - Location-based
  tags.push({
    namespace: 'esrs-e1',
    element: 'GrossLocationBasedScope2GHGEmissions',
    value: data.totalScope2LocationBased,
    context: 'CurrentYear',
    unit: 'tonnes_CO2e',
    decimals: 2,
    period
  });

  // Scope 2 - Market-based
  tags.push({
    namespace: 'esrs-e1',
    element: 'GrossMarketBasedScope2GHGEmissions',
    value: data.totalScope2MarketBased,
    context: 'CurrentYear',
    unit: 'tonnes_CO2e',
    decimals: 2,
    period
  });

  // Scope 3 Total
  tags.push({
    namespace: 'esrs-e1',
    element: 'GrossScope3GHGEmissions',
    value: data.totalScope3,
    context: 'CurrentYear',
    unit: 'tonnes_CO2e',
    decimals: 2,
    period
  });

  // Scope 3 by Category
  const scope3CategoryMapping: Record<string, string> = {
    purchased_goods_services: 'Scope3Category1PurchasedGoodsAndServices',
    capital_goods: 'Scope3Category2CapitalGoods',
    fuel_energy_related: 'Scope3Category3FuelAndEnergyRelatedActivities',
    upstream_transportation: 'Scope3Category4UpstreamTransportationAndDistribution',
    waste_generated: 'Scope3Category5WasteGeneratedInOperations',
    business_travel: 'Scope3Category6BusinessTravel',
    employee_commuting: 'Scope3Category7EmployeeCommuting',
    upstream_leased_assets: 'Scope3Category8UpstreamLeasedAssets',
    downstream_transportation: 'Scope3Category9DownstreamTransportationAndDistribution',
    processing_sold_products: 'Scope3Category10ProcessingOfSoldProducts',
    use_sold_products: 'Scope3Category11UseOfSoldProducts',
    end_of_life: 'Scope3Category12EndOfLifeTreatmentOfSoldProducts',
    downstream_leased_assets: 'Scope3Category13DownstreamLeasedAssets',
    franchises: 'Scope3Category14Franchises',
    investments: 'Scope3Category15Investments'
  };

  for (const [category, emissions] of Object.entries(data.scope3)) {
    if (!emissions || emissions.length === 0) continue;

    const categoryTotal = emissions.reduce((sum, e) => sum + e.emissionAmount, 0);
    const xbrlElement = scope3CategoryMapping[category];

    if (xbrlElement) {
      tags.push({
        namespace: 'esrs-e1',
        element: xbrlElement,
        value: categoryTotal,
        context: 'CurrentYear',
        unit: 'tonnes_CO2e',
        decimals: 2,
        period
      });
    }
  }

  // Total GHG Emissions
  tags.push({
    namespace: 'esrs-e1',
    element: 'TotalGHGEmissions',
    value: data.grandTotal,
    context: 'CurrentYear',
    unit: 'tonnes_CO2e',
    decimals: 2,
    period
  });

  // GHG Intensity (per revenue)
  const intensityPerRevenue = (data.grandTotal / data.organizationInfo.revenue) * 1000000;
  tags.push({
    namespace: 'esrs-e1',
    element: 'GHGIntensityPerMillionEURRevenue',
    value: intensityPerRevenue,
    context: 'CurrentYear',
    unit: 'tonnes_CO2e_per_million_EUR',
    decimals: 2,
    period
  });

  // Year-over-Year comparison (if available)
  if (data.yearOverYearComparison) {
    const prevYear = data.yearOverYearComparison.previousYear;

    tags.push({
      namespace: 'esrs-e1',
      element: 'TotalGHGEmissions',
      value: prevYear.total,
      context: 'PreviousYear',
      unit: 'tonnes_CO2e',
      decimals: 2,
      period: {
        start: new Date(prevYear.year, 0, 1),
        end: new Date(prevYear.year, 11, 31)
      }
    });
  }

  // SB-253 Specific Tags (if applicable)
  if (framework.id === 'SB-253') {
    tags.push({
      namespace: 'carb-sb253',
      element: 'ThirdPartyAssuranceProvider',
      value: 'To be provided',
      context: 'CurrentYear',
      period
    });

    tags.push({
      namespace: 'carb-sb253',
      element: 'AssuranceLevel',
      value: data.assuranceLevel || 'limited',
      context: 'CurrentYear',
      period
    });
  }

  return tags;
}

/**
 * Build complete XBRL XML document
 */
function buildXBRLDocument(
  tags: XBRLTag[],
  data: EmissionsInventory,
  framework: any
): string {
  const currentYear = data.reportingPeriod.end.getFullYear();

  // XBRL Header
  let xbrl = `<?xml version="1.0" encoding="UTF-8"?>
<xbrl xmlns="http://www.xbrl.org/2003/instance"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      xmlns:esrs="http://www.efrag.org/taxonomy/esrs/2023"
      xmlns:esrs-e1="http://www.efrag.org/taxonomy/esrs-e1/2023"
      xmlns:carb-sb253="http://ww2.arb.ca.gov/taxonomy/sb253/2024"
      xmlns:iso4217="http://www.xbrl.org/2003/iso4217"
      xmlns:utr="http://www.xbrl.org/2009/utr">

  <!-- Schema References -->
  <link:schemaRef xlink:type="simple" xlink:href="http://www.efrag.org/taxonomy/esrs/2023/esrs.xsd" />

  <!-- Contexts -->
  <context id="CurrentYear">
    <entity>
      <identifier scheme="http://standards.iso.org/iso/17442">${data.organizationInfo.registrationNumber}</identifier>
    </entity>
    <period>
      <startDate>${data.reportingPeriod.start.toISOString().split('T')[0]}</startDate>
      <endDate>${data.reportingPeriod.end.toISOString().split('T')[0]}</endDate>
    </period>
  </context>

  ${
    data.yearOverYearComparison
      ? `
  <context id="PreviousYear">
    <entity>
      <identifier scheme="http://standards.iso.org/iso/17442">${data.organizationInfo.registrationNumber}</identifier>
    </entity>
    <period>
      <startDate>${data.yearOverYearComparison.previousYear.year}-01-01</startDate>
      <endDate>${data.yearOverYearComparison.previousYear.year}-12-31</endDate>
    </period>
  </context>
  `
      : ''
  }

  <!-- Units -->
  <unit id="tonnes_CO2e">
    <measure>esrs:MetricTonnesCO2Equivalent</measure>
  </unit>

  <unit id="tonnes_CO2e_per_million_EUR">
    <divide>
      <unitNumerator>
        <measure>esrs:MetricTonnesCO2Equivalent</measure>
      </unitNumerator>
      <unitDenominator>
        <measure>iso4217:EUR</measure>
      </unitDenominator>
    </divide>
  </unit>

  <unit id="EUR">
    <measure>iso4217:EUR</measure>
  </unit>

  <!-- Facts -->
`;

  // Add all XBRL tags as facts
  for (const tag of tags) {
    xbrl += `  <${tag.namespace}:${tag.element} contextRef="${tag.context}"`;

    if (tag.unit) {
      xbrl += ` unitRef="${tag.unit}"`;
    }

    if (tag.decimals !== undefined) {
      xbrl += ` decimals="${tag.decimals}"`;
    }

    xbrl += `>${tag.value}</${tag.namespace}:${tag.element}>\n`;
  }

  xbrl += `
</xbrl>`;

  return xbrl;
}

/**
 * Validate XBRL against taxonomy schema
 * In production, use an XBRL validation library
 */
export function validateXBRL(xbrlDocument: string): {
  valid: boolean;
  errors: string[];
} {
  // Placeholder validation
  // In production, use XBRL validation libraries

  const errors: string[] = [];

  // Basic XML validation
  if (!xbrlDocument.includes('<?xml')) {
    errors.push('Missing XML declaration');
  }

  if (!xbrlDocument.includes('<xbrl')) {
    errors.push('Missing XBRL root element');
  }

  if (!xbrlDocument.includes('</xbrl>')) {
    errors.push('Incomplete XBRL document');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Generate iXBRL (Inline XBRL) - human-readable HTML with embedded XBRL tags
 */
export function generateInlineXBRL(
  sections: RenderedSection[],
  emissionsData: EmissionsInventory,
  framework: any
): string {
  // iXBRL embeds XBRL tags within HTML for dual-purpose documents
  // Readable by humans and machines

  return `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml"
      xmlns:ix="http://www.xbrl.org/2013/inlineXBRL"
      xmlns:esrs="http://www.efrag.org/taxonomy/esrs/2023">
<head>
  <meta charset="UTF-8"/>
  <title>${framework.fullName} - ${emissionsData.organizationInfo.legalName}</title>
</head>
<body>
  <h1>${framework.fullName} Report</h1>

  <h2>Organization: <ix:nonNumeric contextRef="CurrentYear" name="esrs:NameOfReportingEntity">${emissionsData.organizationInfo.legalName}</ix:nonNumeric></h2>

  <h2>GHG Emissions Summary</h2>
  <table>
    <tr>
      <td>Scope 1:</td>
      <td><ix:nonFraction contextRef="CurrentYear" name="esrs-e1:GrossScope1GHGEmissions" unitRef="tonnes_CO2e" decimals="2">${emissionsData.totalScope1.toFixed(2)}</ix:nonFraction> tonnes CO2e</td>
    </tr>
    <tr>
      <td>Scope 2 (Market-based):</td>
      <td><ix:nonFraction contextRef="CurrentYear" name="esrs-e1:GrossMarketBasedScope2GHGEmissions" unitRef="tonnes_CO2e" decimals="2">${emissionsData.totalScope2MarketBased.toFixed(2)}</ix:nonFraction> tonnes CO2e</td>
    </tr>
    <tr>
      <td>Scope 3:</td>
      <td><ix:nonFraction contextRef="CurrentYear" name="esrs-e1:GrossScope3GHGEmissions" unitRef="tonnes_CO2e" decimals="2">${emissionsData.totalScope3.toFixed(2)}</ix:nonFraction> tonnes CO2e</td>
    </tr>
    <tr>
      <td><strong>Total:</strong></td>
      <td><strong><ix:nonFraction contextRef="CurrentYear" name="esrs-e1:TotalGHGEmissions" unitRef="tonnes_CO2e" decimals="2">${emissionsData.grandTotal.toFixed(2)}</ix:nonFraction> tonnes CO2e</strong></td>
    </tr>
  </table>

  <!-- Additional iXBRL tagged content would go here -->

</body>
</html>
`;
}

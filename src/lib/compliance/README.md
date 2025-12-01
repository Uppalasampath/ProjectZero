# Compliance Report Generation System

## Overview

Government-compliant sustainability reporting system for Project Zero, supporting five major regulatory frameworks:

- **SB-253** - California Climate Corporate Data Accountability Act
- **CSRD** - EU Corporate Sustainability Reporting Directive (ESRS)
- **CDP** - Carbon Disclosure Project Climate Change Questionnaire
- **TCFD** - Task Force on Climate-related Financial Disclosures
- **ISSB S1/S2** - International Sustainability Standards Board

## Features

✅ **Regulatory-Grade Emission Calculations**
- EPA Emission Factors Hub (2024)
- eGRID 2023 electricity factors
- IPCC AR5 Global Warming Potentials
- DEFRA 2024 UK factors
- GHG Protocol methodologies

✅ **Framework-Specific Templates**
- Section structures per regulatory requirements
- Mandatory vs. optional disclosures
- Page count estimates
- Validation rules

✅ **Multiple Export Formats**
- PDF (government-style formatting)
- XBRL (ESRS taxonomy for CSRD)
- Excel (tabular data with multiple sheets)
- JSON (programmatic access)

✅ **Audit-Ready Documentation**
- Full calculation traceability
- Emission factor sources and versions
- Data quality assessments
- Uncertainty ranges

## Architecture

```
src/lib/compliance/
├── types.ts                    # TypeScript type definitions
├── frameworks.ts               # REGULATORY_FRAMEWORKS configuration
├── emissionsCalculator.ts      # Emission calculation engine
├── reportGenerator.ts          # Main report generation logic
├── sampleReports.ts            # Sample report skeletons
├── index.ts                    # Public API exports
├── renderers/
│   ├── pdfRenderer.ts          # PDF generation
│   ├── xbrlRenderer.ts         # XBRL/iXBRL generation
│   └── excelRenderer.ts        # Excel workbook generation
└── README.md                   # This file
```

## Quick Start

### 1. Calculate Emissions

```typescript
import {
  calculateEmissions,
  initializeEmissionFactors
} from '@/lib/compliance';

// Initialize emission factor database
const emissionFactors = initializeEmissionFactors();

// Define activity data
const activityData = [
  {
    scope: 1,
    category: 'stationary_combustion',
    activityAmount: 50000, // cubic feet
    activityUnit: 'cubic feet',
    timePeriod: {
      start: new Date('2024-01-01'),
      end: new Date('2024-12-31')
    },
    dataQuality: 'measured',
    source: 'Natural gas utility bills',
    location: 'Headquarters - San Francisco'
  },
  {
    scope: 2,
    category: 'purchased_electricity',
    activityAmount: 1250, // MWh
    activityUnit: 'MWh',
    timePeriod: {
      start: new Date('2024-01-01'),
      end: new Date('2024-12-31')
    },
    dataQuality: 'measured',
    source: 'Electricity invoices'
  }
];

// Calculate emissions
const emissionResults = calculateEmissions(activityData, emissionFactors);
```

### 2. Build Emissions Inventory

```typescript
import { buildEmissionsInventory } from '@/lib/compliance';

const organizationInfo = {
  legalName: 'Acme Corporation',
  registrationNumber: 'C1234567',
  jurisdiction: 'Delaware, USA',
  headquarters: {
    street: '123 Main St',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94102',
    country: 'USA'
  },
  fiscalYearEnd: '12/31',
  industry: 'Technology',
  industryCode: '541512',
  numberOfEmployees: 500,
  revenue: 50000000,
  currency: 'USD',
  consolidationApproach: 'operational-control',
  organizationalBoundary: 'All subsidiaries under operational control',
  reportingContacts: [
    {
      name: 'Jane Smith',
      title: 'Sustainability Director',
      email: 'jane.smith@acme.com',
      phone: '+1-555-123-4567'
    }
  ]
};

const inventory = buildEmissionsInventory(
  organizationInfo,
  emissionResults,
  {
    start: new Date('2024-01-01'),
    end: new Date('2024-12-31')
  }
);
```

### 3. Generate Compliance Report

```typescript
import { generateComplianceReport } from '@/lib/compliance';

// Generate SB-253 report as PDF
const report = await generateComplianceReport(
  inventory,
  'SB-253',
  'PDF',
  {
    includeAppendices: true,
    includeRawData: true,
    includeCharts: true,
    language: 'en'
  }
);

// Check validation results
if (report.completeness < 100) {
  console.warn('Report is incomplete:', report.validationResults);
}

// Download report
const blob = new Blob([report.outputData], { type: 'application/pdf' });
const url = URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = `SB-253-Report-${new Date().getFullYear()}.pdf`;
link.click();
```

## Supported Frameworks

### SB-253 (California)

**Effective:** 2026 (Scope 1 & 2), 2027 (Scope 3)
**Applies to:** Companies with >$1B revenue doing business in California
**Key Requirements:**
- Scope 1, 2, and 3 GHG emissions
- Third-party assurance (limited or reasonable)
- Public disclosure on company website
- Annual reporting

**Report Structure:**
- General Entity Information (4 pages)
- Emission Calculation Methodology (6 pages)
- Scope 1 Emissions (4 pages)
- Scope 2 Emissions (4 pages)
- Scope 3 Emissions (14 pages)
- Data Sources & Assumptions (3 pages)
- Assurance & Verification Statement
- Internal Controls Description
- Appendices (8 pages)

### CSRD (EU)

**Effective:** 2024 (large EU companies)
**Applies to:** EU companies meeting 2 of 3 criteria: >250 employees, >€40M revenue, >€20M assets
**Key Requirements:**
- Double materiality assessment
- All ESRS standards (E, S, G)
- XBRL tagging (ESRS taxonomy)
- Assurance required

**Report Structure:**
- General Information (ESRS 2) - 5 pages
- Governance - 8 pages
- E1: Climate Change - 12 pages
- E2: Pollution - 9 pages
- E3: Water & Marine - 7 pages
- E4: Biodiversity - 6 pages
- E5: Circular Economy - 10 pages
- S1: Own Workforce - 15 pages
- S2: Workers in Value Chain - 12 pages
- S3: Affected Communities - 10 pages
- S4: Consumers/End-Users - 10 pages
- G1: Business Conduct - 8 pages
- Double Materiality Assessment - 5 pages

### CDP

**Version:** 2024
**Voluntary:** Yes (but investor-requested)
**Scoring:** A to D-

**Questionnaire Modules:**
- C0: Introduction
- C1: Governance
- C2: Risks & Opportunities
- C3: Business Strategy
- C4: Targets & Performance
- C5: Emissions Methodology
- C6: Emissions Data
- C7: Energy
- C8: Additional Metrics
- C9: Verification
- C10: Biodiversity

### TCFD

**Status:** Recommendations (becoming mandatory in many jurisdictions)
**Structure:** 4 pillars

1. **Governance** - Board oversight and management responsibility
2. **Strategy** - Climate risks, opportunities, and scenario analysis
3. **Risk Management** - Processes for identifying and managing climate risks
4. **Metrics & Targets** - GHG emissions, climate metrics, targets

**Scenario Analysis Required:** 1.5°C, 2°C, and higher temperature scenarios

### ISSB S1 & S2

**Effective:** 2024
**Issued by:** International Financial Reporting Standards (IFRS) Foundation
**Builds on:** TCFD, SASB

**S1:** General Requirements for Sustainability Disclosure
**S2:** Climate-related Disclosures

**Industry-Based Metrics:** SASB standards incorporated

## Emission Factor Sources

### EPA (U.S. Environmental Protection Agency)

- **Source:** EPA Emission Factors Hub
- **Version:** 2024
- **Scope 1:** Stationary combustion, mobile combustion
- **Coverage:** Natural gas, fuel oil, gasoline, diesel, coal, propane

### eGRID (Emissions & Generation Resource Integrated Database)

- **Source:** EPA eGRID
- **Version:** 2023
- **Scope 2:** Electricity emission factors by subregion
- **Coverage:** All U.S. NERC regions
- **Methods:** Location-based (grid average)

### IPCC AR5

- **Source:** IPCC Fifth Assessment Report
- **Year:** 2014
- **Purpose:** Global Warming Potentials (100-year)
- **Coverage:** CO2, CH4, N2O, HFCs, PFCs, SF6, NF3

### DEFRA

- **Source:** UK Department for Environment, Food & Rural Affairs
- **Version:** 2024
- **Coverage:** UK electricity, business travel, hotel stays
- **Update Frequency:** Annual

## Validation Rules

Each framework has specific validation rules:

**SB-253:**
- ✓ Scope 1 emissions required
- ✓ Scope 2 emissions required (both location and market-based)
- ✓ Scope 3 emissions required
- ✓ Third-party assurance required
- ✓ Must use IPCC AR5 GWPs

**CSRD:**
- ✓ Double materiality assessment required
- ✓ XBRL tagging required
- ✓ Scope 1, 2, 3 emissions required
- ✓ All material ESRS topics must be addressed

**CDP:**
- ✓ Scope 1 and 2 emissions required
- ✓ Scope 3 emissions required (all applicable categories)
- ✓ Emission reduction targets encouraged

**TCFD:**
- ✓ Scenario analysis required (including 2°C or lower)
- ✓ Scope 1 and 2 emissions required
- ✓ Scope 3 emissions "if appropriate"

**ISSB:**
- ✓ Scope 1, 2, 3 emissions required
- ✓ Transition plan required
- ✓ Scenario analysis required
- ✓ Industry-based metrics (SASB) required

## Export Formats

### PDF

**Features:**
- Government-style formatting
- Section numbers and headers
- Table of contents
- Professional layout
- Page headers/footers
- Regulatory-compliant structure

**Libraries (Production):**
- pdfkit
- jsPDF
- puppeteer (HTML to PDF)

### XBRL

**Features:**
- ESRS taxonomy tags
- Machine-readable
- Regulatory submission-ready
- iXBRL support (inline XBRL)

**Use Cases:**
- CSRD reporting via ESAP (European Single Access Point)
- Digital regulatory filings
- Data aggregation by regulators

**Libraries (Production):**
- xbrl-js
- arelle (validation)

### Excel

**Features:**
- Multiple worksheets
- Emissions summary
- Activity data tables
- Emission factor reference
- Year-over-year comparisons
- Pivot-ready data

**Libraries (Production):**
- xlsx
- exceljs

## Data Quality Tiers

The system supports five data quality levels:

1. **measured** - Direct measurement (highest quality)
2. **calculated** - Activity data × specific emission factor
3. **estimated** - Proxy data or assumptions
4. **supplier-specific** - Supplier-provided data
5. **industry-average** - Industry average factors (lowest quality)

## Uncertainty

Emission factors include uncertainty ranges where applicable:

```typescript
{
  emissionAmount: 100.5, // tons CO2e
  uncertaintyRange: {
    lower: 70.35,  // -30%
    upper: 130.65  // +30%
  }
}
```

## Year-over-Year Comparison

Track emissions trends:

```typescript
{
  previousYear: { year: 2023, total: 10250 },
  currentYear: { year: 2024, total: 9500 },
  changes: {
    total: {
      absolute: -750,      // tons CO2e
      percentage: -7.3     // percent
    }
  },
  explanationOfChanges: "Reduction driven by renewable energy procurement and energy efficiency initiatives."
}
```

## Sample Reports

Generate sample report skeletons:

```typescript
import { printSampleReport, SAMPLE_REPORTS } from '@/lib/compliance';

// Print to console
printSampleReport('SB-253');

// Access programmatically
const tcfdSample = SAMPLE_REPORTS['TCFD'];
console.log(tcfdSample);
```

## Regulatory References

- **CARB SB-253 Regulations:** https://ww2.arb.ca.gov/our-work/programs/ab-1305-ghg-reporting
- **ESRS Standards:** https://www.efrag.org/lab6
- **CDP Guidance:** https://www.cdp.net/en/guidance/guidance-for-companies
- **TCFD Recommendations:** https://www.fsb-tcfd.org/recommendations/
- **IFRS S1 & S2:** https://www.ifrs.org/issued-standards/ifrs-sustainability-standards-navigator/
- **GHG Protocol:** https://ghgprotocol.org/
- **EPA Emission Factors:** https://www.epa.gov/climateleadership/ghg-emission-factors-hub
- **eGRID:** https://www.epa.gov/egrid

## Compliance Checklist

Before generating final reports:

- [ ] All Scope 1 emissions sources identified
- [ ] All Scope 2 electricity consumption tracked
- [ ] Scope 3 screening assessment completed
- [ ] Activity data collected with appropriate data quality
- [ ] Emission factors from approved sources (EPA, eGRID, IPCC)
- [ ] Double materiality assessment (for CSRD)
- [ ] Scenario analysis (for TCFD/ISSB)
- [ ] Internal review completed
- [ ] Third-party assurance arranged (if required)
- [ ] Board/management approval obtained

## Future Enhancements

Roadmap for production implementation:

1. **Enhanced PDF Generation**
   - Professional PDF library integration
   - Charts and graphs
   - Embedded fonts and styling

2. **XBRL Validation**
   - Schema validation against official taxonomies
   - XBRL formula validation
   - Submission file generation

3. **API Integrations**
   - ERP system connectors
   - Utility data APIs
   - Carbon accounting platforms

4. **Machine Learning**
   - Automated emission factor selection
   - Anomaly detection in activity data
   - Spend-based emission estimation

5. **Regulatory Submission**
   - Direct integration with CARB portal
   - ESAP submission for CSRD
   - CDP online response system

6. **Multi-language Support**
   - French, German, Spanish translations
   - Regional formatting (dates, numbers)

7. **Advanced Analytics**
   - Emission hotspot analysis
   - Reduction opportunity identification
   - Scenario modeling

## License

Copyright © 2024 Project Zero. All rights reserved.

## Support

For issues, questions, or contributions, please contact the sustainability team.

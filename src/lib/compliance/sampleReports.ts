/**
 * Sample Report Skeletons
 *
 * Demonstrates the structure and content of compliance reports for each framework:
 * - SB-253 (California)
 * - CSRD (EU)
 * - CDP
 * - TCFD
 * - ISSB S1/S2
 *
 * These samples show:
 * - Section titles
 * - Intended page lengths
 * - Placeholder content structure
 * - Required disclosures
 */

import { REGULATORY_FRAMEWORKS } from './frameworks';
import type { RenderedSection } from './types';

/**
 * Generate sample report skeleton for a specific framework
 *
 * @param frameworkId - Framework identifier
 * @returns Array of sample rendered sections
 */
export function generateSampleReportSkeleton(frameworkId: string): RenderedSection[] {
  const framework = REGULATORY_FRAMEWORKS[frameworkId];
  if (!framework) {
    throw new Error(`Unknown framework: ${frameworkId}`);
  }

  const sections: RenderedSection[] = [];
  let pageNumber = 1;

  for (const section of framework.sections) {
    const sampleSection: RenderedSection = {
      id: section.id,
      title: section.title,
      content: generateSampleContent(section.id, section.title, section.description),
      pageNumber: pageNumber,
      pageCount: section.estimatedPages
    };

    // Generate subsections if they exist
    if (section.subsections && section.subsections.length > 0) {
      sampleSection.subsections = section.subsections.map((subsection, index) => ({
        id: subsection.id,
        title: subsection.title,
        content: generateSampleContent(
          subsection.id,
          subsection.title,
          subsection.description
        ),
        pageNumber: pageNumber + index,
        pageCount: subsection.estimatedPages
      }));
    }

    sections.push(sampleSection);
    pageNumber += section.estimatedPages;
  }

  return sections;
}

/**
 * Generate sample content for a section
 */
function generateSampleContent(
  sectionId: string,
  title: string,
  description: string
): string {
  // Framework-specific sample content
  if (sectionId.startsWith('sb253-')) {
    return generateSB253SampleContent(sectionId, title, description);
  } else if (sectionId.startsWith('csrd-')) {
    return generateCSRDSampleContent(sectionId, title, description);
  } else if (sectionId.startsWith('cdp-')) {
    return generateCDPSampleContent(sectionId, title, description);
  } else if (sectionId.startsWith('tcfd-')) {
    return generateTCFDSampleContent(sectionId, title, description);
  } else if (sectionId.startsWith('issb-')) {
    return generateISSBSampleContent(sectionId, title, description);
  }

  // Generic sample content
  return `
# ${title}

## Description
${description}

## Section Purpose
This section provides [PURPOSE BASED ON REGULATORY REQUIREMENT].

## Required Disclosures
[LIST OF MANDATORY DISCLOSURES]

## Content Placeholder
*This section will be automatically populated with data from your organization's emissions inventory, activity data, and sustainability management systems.*

---
*Generated: ${new Date().toLocaleDateString()}*
`;
}

/**
 * SB-253 Sample Content
 */
function generateSB253SampleContent(
  sectionId: string,
  title: string,
  description: string
): string {
  const samples: Record<string, string> = {
    'sb253-general-info': `
# ${title}

## Company Profile

**Legal Name:** [COMPANY LEGAL NAME]
**Trading Name:** [DBA NAME, IF APPLICABLE]
**Business Registration Number:** [CA REGISTRATION OR FEIN]
**Jurisdiction of Incorporation:** [STATE/COUNTRY]

**Headquarters Address:**
[STREET ADDRESS]
[CITY, STATE ZIP]
[COUNTRY]

**Primary Industry:** [INDUSTRY SECTOR]
**NAICS Code:** [6-DIGIT CODE]

**Annual Revenue (FY2024):** USD [AMOUNT]
**Number of Employees:** [COUNT]
**Fiscal Year End:** [DATE]

## Organizational Boundary

${description}

**Consolidation Approach:** [Equity Share / Financial Control / Operational Control]

Per GHG Protocol Corporate Standard, [COMPANY NAME] applies the [APPROACH] consolidation approach. This includes:

- All wholly-owned subsidiaries
- Joint ventures where [COMPANY] holds [%] equity
- [EXCLUDED ENTITIES, IF ANY, WITH JUSTIFICATION]

## Reporting Period

**Reporting Period:** January 1, 2024 - December 31, 2024
**Submission Deadline:** [DATE PER CARB REGULATIONS]
**Report Prepared By:** [NAME, TITLE]
**Report Review:** [NAME, TITLE]

## Contact Information

**Primary Contact:**
- Name: [FULL NAME]
- Title: [TITLE]
- Email: [EMAIL]
- Phone: [PHONE]

**Sustainability Officer:**
- Name: [FULL NAME]
- Title: [TITLE]
- Email: [EMAIL]

---
*Pages: 4* | *Regulatory Reference: CARB SB-253 §95100-95103*
`,

    'sb253-scope1': `
# ${title}

## Summary

**Total Scope 1 Emissions:** [XXX,XXX.XX] metric tons CO2e

Scope 1 emissions are direct GHG emissions from sources that are owned or controlled by [COMPANY NAME].

## Stationary Combustion Sources

### Natural Gas Consumption

| Facility | Usage (MMBtu) | Emission Factor | Emissions (tons CO2e) |
|----------|--------------|----------------|----------------------|
| [Facility A] | [AMOUNT] | 0.05306 kg CO2e/scf | [CALCULATED] |
| [Facility B] | [AMOUNT] | 0.05306 kg CO2e/scf | [CALCULATED] |
| **Subtotal** | **[TOTAL]** | | **[TOTAL]** |

**Emission Factor Source:** EPA Emission Factors Hub 2024

### Fuel Oil Consumption

| Facility | Fuel Type | Usage (gal) | Emission Factor | Emissions (tons CO2e) |
|----------|-----------|------------|----------------|----------------------|
| [Facility A] | No. 2 Distillate | [AMOUNT] | 10.21 kg CO2e/gal | [CALCULATED] |
| **Subtotal** | | **[TOTAL]** | | **[TOTAL]** |

## Mobile Combustion Sources

### Company Fleet Vehicles

| Vehicle Type | Fuel | Miles Driven | Fuel Consumed (gal) | Emissions (tons CO2e) |
|--------------|------|-------------|-------------------|----------------------|
| Passenger Cars | Gasoline | [AMOUNT] | [AMOUNT] | [CALCULATED] |
| Light Trucks | Diesel | [AMOUNT] | [AMOUNT] | [CALCULATED] |
| Heavy Trucks | Diesel | [AMOUNT] | [AMOUNT] | [CALCULATED] |
| **Subtotal** | | **[TOTAL]** | **[TOTAL]** | **[TOTAL]** |

**Emission Factors:**
- Gasoline: 8.78 kg CO2e/gallon (EPA 2024)
- Diesel: 10.21 kg CO2e/gallon (EPA 2024)

## Fugitive Emissions

### Refrigerant Leaks

| Refrigerant Type | GWP (AR5) | Amount Leaked (kg) | Emissions (tons CO2e) |
|-----------------|-----------|-------------------|----------------------|
| HFC-134a | 1,300 | [AMOUNT] | [CALCULATED] |
| R-410A | [GWP] | [AMOUNT] | [CALCULATED] |
| **Subtotal** | | **[TOTAL]** | **[TOTAL]** |

**GWP Source:** IPCC Fifth Assessment Report (AR5)

## Methodology

All Scope 1 emissions are calculated using the GHG Protocol Corporate Standard activity-based method:

**Emissions = Activity Data × Emission Factor**

Activity data is sourced from:
- Utility bills (natural gas, fuel oil)
- Fleet fuel purchase records
- Refrigerant service records

Emission factors are from:
- EPA Emission Factors Hub (2024)
- IPCC AR5 for GWPs

---
*Pages: 4* | *Regulatory Reference: GHG Protocol Chapter 4, CARB §95110*
`,

    'sb253-scope3': `
# ${title}

## Summary

**Total Scope 3 Emissions:** [XXX,XXX.XX] metric tons CO2e

Scope 3 emissions are all indirect emissions (not included in Scope 2) that occur in the value chain.

## Category 1: Purchased Goods & Services

**Emissions:** [XXX,XXX.XX] tons CO2e | **% of Scope 3:** [XX]%

**Methodology:** Spend-based method using EPA Supply Chain GHG Emission Factors

| Spend Category | Amount (USD) | Emission Factor | Emissions (tons CO2e) |
|----------------|-------------|----------------|----------------------|
| [Category A] | [AMOUNT] | [FACTOR] kg CO2e/USD | [CALCULATED] |
| [Category B] | [AMOUNT] | [FACTOR] kg CO2e/USD | [CALCULATED] |
| **Subtotal** | **[TOTAL]** | | **[TOTAL]** |

**Data Quality:** Estimated (Spend-based) - Medium Uncertainty

## Category 2: Capital Goods

**Emissions:** [XX,XXX.XX] tons CO2e | **% of Scope 3:** [XX]%

[SIMILAR TABLE STRUCTURE]

## Category 3: Fuel & Energy Related Activities

**Emissions:** [XX,XXX.XX] tons CO2e | **% of Scope 3:** [XX]%

Upstream emissions from:
- Extraction, production, and transportation of fuels (not in Scope 1/2)
- Transmission and distribution losses (electricity)

## Category 4: Upstream Transportation & Distribution

**Emissions:** [XX,XXX.XX] tons CO2e | **% of Scope 3:** [XX]%

| Transport Mode | Distance (ton-miles) | Emission Factor | Emissions (tons CO2e) |
|----------------|---------------------|----------------|----------------------|
| Truck | [AMOUNT] | 0.161 kg CO2e/ton-mile | [CALCULATED] |
| Rail | [AMOUNT] | [FACTOR] | [CALCULATED] |
| Ocean Freight | [AMOUNT] | [FACTOR] | [CALCULATED] |
| **Subtotal** | **[TOTAL]** | | **[TOTAL]** |

## Category 5: Waste Generated in Operations

**Emissions:** [X,XXX.XX] tons CO2e | **% of Scope 3:** [XX]%

| Waste Type | Amount (tons) | Disposal Method | Emission Factor | Emissions (tons CO2e) |
|------------|--------------|----------------|----------------|----------------------|
| Municipal Solid Waste | [AMOUNT] | Landfill | 0.456 kg CO2e/kg | [CALCULATED] |
| Recycling | [AMOUNT] | Recycled | [FACTOR] | [CALCULATED] |
| **Subtotal** | **[TOTAL]** | | | **[TOTAL]** |

## Category 6: Business Travel

**Emissions:** [XX,XXX.XX] tons CO2e | **% of Scope 3:** [XX]%

| Travel Type | Distance (miles/km) | Emission Factor | Emissions (tons CO2e) |
|-------------|-------------------|----------------|----------------------|
| Air - Domestic | [AMOUNT] passenger-miles | [FACTOR] | [CALCULATED] |
| Air - International | [AMOUNT] passenger-miles | [FACTOR] | [CALCULATED] |
| Hotel Stays | [AMOUNT] room-nights | 25.7 kg CO2e/night | [CALCULATED] |
| **Subtotal** | | | **[TOTAL]** |

## Category 7: Employee Commuting

**Emissions:** [XX,XXX.XX] tons CO2e | **% of Scope 3:** [XX]%

**Methodology:** Employee survey + commute distance modeling

| Commute Method | % of Employees | Avg Daily Distance | Days/Year | Emissions (tons CO2e) |
|----------------|---------------|-------------------|-----------|----------------------|
| Personal Vehicle | [%] | [MILES] | 220 | [CALCULATED] |
| Public Transit | [%] | [MILES] | 220 | [CALCULATED] |
| Remote Work | [%] | 0 | 0 | 0 |
| **Total** | **100%** | | | **[TOTAL]** |

## Categories 8-15

[DETAILED BREAKDOWNS FOR REMAINING CATEGORIES IF APPLICABLE]

**Category 8: Upstream Leased Assets** - [AMOUNT] tons CO2e or Not Applicable
**Category 9: Downstream Transportation** - [AMOUNT] tons CO2e
**Category 10: Processing of Sold Products** - [AMOUNT] tons CO2e or Not Applicable
**Category 11: Use of Sold Products** - [AMOUNT] tons CO2e
**Category 12: End-of-Life Treatment** - [AMOUNT] tons CO2e
**Category 13: Downstream Leased Assets** - Not Applicable
**Category 14: Franchises** - Not Applicable
**Category 15: Investments** - [AMOUNT] tons CO2e or Not Applicable

## Data Quality Assessment

| Category | Data Quality | Uncertainty | Improvement Plan |
|----------|-------------|-------------|-----------------|
| Cat 1 | Medium | ±30% | Transition to hybrid/activity-based in FY2025 |
| Cat 6 | High | ±10% | Actual booking data from travel system |
| Cat 7 | Medium | ±25% | Annual employee survey |

---
*Pages: 14* | *Regulatory Reference: GHG Protocol Scope 3 Standard, CARB §95115*
`
  };

  return samples[sectionId] || generateGenericSample(title, description);
}

/**
 * CSRD Sample Content
 */
function generateCSRDSampleContent(
  sectionId: string,
  title: string,
  description: string
): string {
  if (sectionId === 'csrd-e1') {
    return `
# ${title}

## E1-1: Transition Plan for Climate Change Mitigation

[COMPANY NAME] has developed a comprehensive climate transition plan aligned with limiting global warming to 1.5°C above pre-industrial levels, consistent with the Paris Agreement.

### Decarbonization Targets

**Net Zero Target:** 2050 for Scope 1 & 2 emissions
**Interim Target (2030):** 50% reduction vs. 2020 baseline (Science-Based Target)
**Scope 3 Engagement Target:** 67% of suppliers by emissions to set science-based targets by 2027

**Progress:**
- Current year emissions: [XXX,XXX] tons CO2e
- vs. 2020 baseline: [+/-XX]%
- On track: [YES/NO with explanation]

### Decarbonization Levers

1. **Renewable Energy Procurement**
   - Target: 100% renewable electricity by 2030
   - Current: [XX]% renewable
   - PPAs signed: [XX] MW

2. **Energy Efficiency**
   - LED lighting retrofits: [XX]% complete
   - HVAC upgrades: [FACILITIES]
   - Expected savings: [XX] MWh/year, [XX] tons CO2e/year

3. **Fleet Electrification**
   - Target: 100% EV fleet by 2035
   - Current: [XX]% EV
   - Infrastructure: [XX] charging stations

4. **Supplier Engagement**
   - Supplier emissions accounting: [XX]% coverage
   - Suppliers with SBTs: [XX]%

### Financial Resources for Transition

**CapEx Committed (2024-2030):** EUR [XXX] million
- Renewable energy: EUR [XX] million
- Energy efficiency: EUR [XX] million
- Fleet electrification: EUR [XX] million
- R&D low-carbon products: EUR [XX] million

## E1-4: Climate Adaptation

### Physical Climate Risks Identified

| Risk | Likelihood | Impact | Time Horizon | Adaptation Measures |
|------|------------|--------|--------------|---------------------|
| Extreme heat affecting operations | Medium | High | 2030-2040 | HVAC upgrades, heat action plans |
| Water stress at [FACILITY] | High | High | 2025-2030 | Water recycling, alternative sources |
| Flooding risk [LOCATION] | Low | High | 2040-2050 | Flood barriers, relocation planning |

### Adaptation Plan

[DESCRIPTION OF ADAPTATION STRATEGY]

## E1-5: Energy Consumption and Mix

**Total Energy Consumption (MWh):** [XXX,XXX]
- Electricity: [XXX,XXX] MWh ([XX]% from renewable sources)
- Natural Gas: [XXX,XXX] MWh
- Fuel Oil: [XX,XXX] MWh
- Transport Fuels: [XX,XXX] MWh

**Energy Intensity:** [XXX] MWh per million EUR revenue

## E1-6: Gross GHG Emissions

| Scope | Emissions (tons CO2e) | Intensity (per M EUR) |
|-------|----------------------|----------------------|
| Scope 1 | [XXX,XXX.XX] | [XX.XX] |
| Scope 2 (location-based) | [XXX,XXX.XX] | [XX.XX] |
| Scope 2 (market-based) | [XXX,XXX.XX] | [XX.XX] |
| Scope 3 | [XXX,XXX.XX] | [XX.XX] |
| **Total** | **[XXX,XXX.XX]** | **[XX.XX]** |

**Methodology:** GHG Protocol Corporate Standard, GHG Protocol Scope 2 Guidance, GHG Protocol Corporate Value Chain (Scope 3) Standard

**Verification:** [Limited/Reasonable] assurance obtained from [ASSURANCE PROVIDER]

---
*Pages: 12* | *Regulatory Reference: ESRS E1*
`;
  }

  if (sectionId === 'csrd-materiality') {
    return `
# ${title}

## Double Materiality Assessment Process

${description}

### Methodology

[COMPANY NAME] conducted a double materiality assessment during [PERIOD] following ESRS 2 guidance.

**Steps:**
1. **Topic Identification:** Identified sustainability topics from ESRS and sector-specific sources
2. **Impact Assessment:** Evaluated actual and potential impacts on people and environment
3. **Financial Assessment:** Evaluated risks and opportunities affecting enterprise value
4. **Stakeholder Engagement:** Consulted with [LIST OF STAKEHOLDER GROUPS]
5. **Materiality Determination:** Applied thresholds to determine material topics

### Stakeholders Consulted

- Investors and shareholders ([NUMBER] engaged)
- Employees ([NUMBER] surveyed)
- Customers ([NUMBER] interviewed)
- Suppliers ([NUMBER] surveyed)
- Local communities ([NUMBER] consultations)
- NGOs and civil society ([ORGANIZATIONS])

### Materiality Thresholds

**Impact Materiality:**
- Severity: [DEFINITION]
- Scope: [DEFINITION]
- Irremediability: [DEFINITION]

**Financial Materiality:**
- Magnitude of financial effect
- Likelihood of occurrence
- Time horizon

## Material Topics Identified

### Climate Change (E1) - MATERIAL

**Impact Materiality:** 5/5 (Very High)
- Rationale: Operations emitted [XXX,XXX] tons CO2e in FY2024, contributing to climate change
- Affected stakeholders: Global population, future generations
- Type of impact: Negative, actual and ongoing

**Financial Materiality:** 5/5 (Very High)
- Rationale: Exposure to carbon pricing (EU ETS), transition risks, physical risks
- Potential financial effect: EUR [XXX] million (transition costs) to EUR [XX] million (physical risks)
- Time horizon: Short to long-term

### Pollution (E2) - MATERIAL

**Impact Materiality:** 4/5 (High)
**Financial Materiality:** 3/5 (Medium)
[SIMILAR STRUCTURE]

### Water & Marine Resources (E3) - MATERIAL

[DETAILS]

### [ADDITIONAL MATERIAL TOPICS]

## Non-Material Topics

The following topics were assessed as not material based on the company's business model and context:

- [TOPIC] - Rationale: [EXPLANATION]

## Dynamic Materiality

The materiality assessment will be reviewed annually to account for:
- Changes in business model or operations
- New or emerging sustainability impacts
- Evolving stakeholder expectations
- Regulatory developments

---
*Pages: 5* | *Regulatory Reference: ESRS 2 IRO-1, IRO-2*
`;
  }

  return generateGenericSample(title, description);
}

/**
 * CDP Sample Content
 */
function generateCDPSampleContent(
  sectionId: string,
  title: string,
  description: string
): string {
  if (sectionId === 'cdp-c2') {
    return `
# ${title}

## C2.1: Risk Management Process

**C2.1a:** Does your organization have a process for identifying, assessing, and managing climate-related risks?

**Answer:** Yes

${description}

### Process Description

[COMPANY NAME] has integrated climate risk identification and management into our enterprise risk management (ERM) framework.

**Identification:**
- Annual climate risk assessment workshop
- Review of TCFD scenarios and sector-specific climate risks
- Stakeholder consultation (investors, customers, suppliers)
- Monitoring of scientific reports (IPCC, IEA) and policy developments

**Assessment:**
- Quantitative modeling of physical risks (heat stress, flooding, water stress)
- Transition risk analysis (carbon pricing, technology shifts, market changes)
- Time horizons: Short (0-3 years), Medium (3-10 years), Long (10+ years)
- Financial impact assessment using internal carbon price of USD [XX]/ton CO2e

**Management:**
- Assignment of risk owners within business units
- Integration into capital allocation decisions
- Board oversight through [COMMITTEE NAME]
- Annual review and update

## C2.3: Climate-related Risks

**C2.3a:** Substantive financial or strategic climate risks identified

### Risk 1: Carbon Pricing (Transition Risk - Policy/Legal)

**Type:** Transition Risk - Policy and Legal
**Primary Climate Hazard:** Increased carbon pricing
**Time Horizon:** Medium-term (3-10 years)
**Likelihood:** Very likely
**Magnitude of Impact:** Medium-high
**Financial Impact:** USD [XX-XX] million per year

**Description:**
Expansion of carbon pricing mechanisms (e.g., EU ETS, potential U.S. carbon tax) could increase operational costs. Current emissions of [XXX,XXX] tons CO2e at a carbon price of USD [XX]/ton could result in annual costs of USD [XX] million.

**Response Strategy:**
- Decarbonization initiatives to reduce exposure
- Energy efficiency investments
- Renewable energy procurement
- Product innovation toward low-carbon alternatives
- Active engagement in policy development

### Risk 2: Acute Physical - Increased Severity of Extreme Weather

**Type:** Physical Risk - Acute
**Primary Climate Hazard:** Extreme weather events (hurricanes, floods)
**Time Horizon:** Short to Medium-term
**Likelihood:** Likely
**Magnitude of Impact:** Medium
**Financial Impact:** USD [X-XX] million (one-time)

**Description:**
Manufacturing facilities in [LOCATIONS] face increased risk of disruption from extreme weather. Historical frequency: [X] events per decade. Under RCP 4.5 scenario: [X] events per decade by 2030.

**Response Strategy:**
- Business continuity and disaster recovery planning
- Insurance coverage review
- Infrastructure hardening at vulnerable sites
- Supply chain diversification
- Climate risk assessment in site selection

[ADDITIONAL RISKS...]

---
*Pages: 6* | *Regulatory Reference: CDP C2*
`;
  }

  return generateGenericSample(title, description);
}

/**
 * TCFD Sample Content
 */
function generateTCFDSampleContent(
  sectionId: string,
  title: string,
  description: string
): string {
  if (sectionId === 'tcfd-scenarios') {
    return `
# ${title}

## Scenario Analysis Overview

[COMPANY NAME] has conducted climate scenario analysis to assess the resilience of our strategy under different climate futures, in line with TCFD recommendations.

### Scenarios Applied

We analyzed three scenarios based on IEA World Energy Outlook and NGFS Climate Scenarios:

#### 1.5°C Scenario (IEA Net Zero by 2050)

**Key Assumptions:**
- Rapid decarbonization
- Carbon price reaches USD 250/ton CO2e by 2050
- Coal phased out by 2030 in developed economies
- Renewable energy reaches 90% of electricity generation by 2050
- Electric vehicles dominate by 2035

**Implications for [COMPANY]:**
- High carbon costs: USD [XXX] million cumulative 2024-2050
- Accelerated asset stranding of fossil fuel-dependent equipment
- Opportunities in low-carbon product demand

**Financial Impact:**
- Transition costs: USD [XXX] million
- Opportunity value: USD [XXX] million
- Net impact: [POSITIVE/NEGATIVE] USD [XX] million

#### 2°C Scenario (IEA Stated Policies)

**Key Assumptions:**
- Orderly transition
- Carbon price reaches USD 100/ton CO2e by 2050
- Gradual policy tightening
- Renewable energy reaches 70% by 2050

**Implications:**
[ANALYSIS]

**Financial Impact:**
- Transition costs: USD [XXX] million
- Opportunity value: USD [XXX] million
- Net impact: [POSITIVE/NEGATIVE] USD [XX] million

#### 3°C Scenario (IEA Current Policies / Delayed Action)

**Key Assumptions:**
- Limited near-term policy action
- Higher physical climate risks materialize
- Disorderly late transition
- Temperature overshoot then decline

**Implications:**
- Lower near-term transition costs but higher long-term physical risks
- Acute physical risks at facilities in [LOCATIONS]
- Chronic physical risks (water stress, heat stress) affect operations
- Supply chain disruptions
- Stranded assets from sudden policy changes post-2030

**Financial Impact:**
- Physical risk costs: USD [XXX] million cumulative
- Late transition costs: USD [XXX] million
- Net impact: [NEGATIVE] USD [XXX] million

## Strategic Resilience Assessment

Our strategy demonstrates resilience across all three scenarios:

1. **Diversification:** Geographic and product diversification reduces concentration risk
2. **Flexibility:** Modular capital investments allow pivoting based on policy trajectory
3. **Innovation:** R&D in low-carbon solutions positions us for all scenarios
4. **Risk Management:** Active monitoring and adaptive planning

---
*Pages: 6* | *Regulatory Reference: TCFD Strategy Recommendation, Scenario Analysis Guidance*
`;
  }

  return generateGenericSample(title, description);
}

/**
 * ISSB Sample Content
 */
function generateISSBSampleContent(
  sectionId: string,
  title: string,
  description: string
): string {
  if (sectionId === 'issb-industry-metrics') {
    return `
# ${title}

## SASB Industry-Based Metrics

${description}

[COMPANY NAME] operates in the [INDUSTRY SECTOR] industry and reports the following industry-specific metrics in accordance with SASB Standards, as referenced by IFRS S2.

### SASB Industry: [INDUSTRY NAME]

#### Greenhouse Gas Emissions

| Metric | FY2024 | FY2023 | Unit |
|--------|--------|--------|------|
| Gross global Scope 1 emissions | [XXX,XXX] | [XXX,XXX] | metric tons CO2e |
| Emissions from perfluorinated compounds (if applicable) | [XXX] | [XXX] | metric tons CO2e |

#### Energy Management

| Metric | FY2024 | FY2023 | Unit |
|--------|--------|--------|------|
| Total energy consumed | [XXX,XXX] | [XXX,XXX] | GJ |
| Percentage grid electricity | [XX]% | [XX]% | % |
| Percentage renewable | [XX]% | [XX]% | % |

#### Water Management (if material to industry)

| Metric | FY2024 | FY2023 | Unit |
|--------|--------|--------|------|
| Total water withdrawn | [XXX,XXX] | [XXX,XXX] | m³ |
| Total water consumed | [XXX,XXX] | [XXX,XXX] | m³ |
| Percentage in high or extremely high baseline water stress areas | [XX]% | [XX]% | % |

#### Waste & Hazardous Materials (if material to industry)

| Metric | FY2024 | FY2023 | Unit |
|--------|--------|--------|------|
| Hazardous waste generated | [XXX] | [XXX] | metric tons |
| Percentage recycled | [XX]% | [XX]% | % |
| Number of reportable spills | [X] | [X] | number |

### Industry-Specific Metrics

[ADDITIONAL SASB METRICS SPECIFIC TO INDUSTRY SECTOR]

### Cross-Industry Metrics

All companies report these regardless of industry:

- GHG emissions (Scope 1, 2, 3)
- Climate-related opportunities
- Capital deployment in climate-related opportunities
- Internal carbon price (if used)
- Remuneration linked to climate considerations

---
*Pages: 6* | *Regulatory Reference: IFRS S2 Appendix B (Industry-based requirements), SASB Standards*
`;
  }

  return generateGenericSample(title, description);
}

/**
 * Generic sample for sections without specific templates
 */
function generateGenericSample(title: string, description: string): string {
  return `
# ${title}

## Section Description

${description}

## Required Content

*This section will be populated with the following required disclosures:*

- [Disclosure requirement 1]
- [Disclosure requirement 2]
- [Disclosure requirement 3]

## Data Sources

The information in this section is derived from:
- Organizational sustainability management systems
- Emissions inventory and activity data
- Corporate governance documents
- Stakeholder engagement records
- Financial reporting systems

## Placeholder Content

*Actual report content will be generated based on your organization's collected data and will include:*

- Quantitative metrics and KPIs
- Qualitative descriptions and narratives
- Tables and data visualizations
- Year-over-year comparisons
- Supporting documentation references

---
*Generated: ${new Date().toLocaleDateString()}*
`;
}

/**
 * Export all sample report skeletons
 */
export const SAMPLE_REPORTS = {
  'SB-253': generateSampleReportSkeleton('SB-253'),
  'CSRD': generateSampleReportSkeleton('CSRD'),
  'CDP': generateSampleReportSkeleton('CDP'),
  'TCFD': generateSampleReportSkeleton('TCFD'),
  'ISSB': generateSampleReportSkeleton('ISSB')
};

/**
 * Print sample report to console for review
 */
export function printSampleReport(frameworkId: string): void {
  const sections = generateSampleReportSkeleton(frameworkId);

  console.log(`\n${'='.repeat(80)}`);
  console.log(`SAMPLE REPORT: ${frameworkId}`);
  console.log(`${'='.repeat(80)}\n`);

  for (const section of sections) {
    console.log(`\n--- Section ${section.pageNumber}: ${section.title} (${section.pageCount} pages) ---\n`);
    console.log(section.content);

    if (section.subsections) {
      for (const subsection of section.subsections) {
        console.log(`\n  --- Subsection: ${subsection.title} (${subsection.pageCount} pages) ---\n`);
        console.log(subsection.content);
      }
    }
  }

  console.log(`\n${'='.repeat(80)}\n`);
}

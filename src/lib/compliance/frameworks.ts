/**
 * REGULATORY_FRAMEWORKS Master Configuration
 *
 * Government-compliant frameworks:
 * - SB-253 (California Climate Corporate Data Accountability Act)
 * - CSRD (EU Corporate Sustainability Reporting Directive - ESRS)
 * - CDP (Carbon Disclosure Project)
 * - TCFD (Task Force on Climate-related Financial Disclosures)
 * - ISSB S1/S2 (International Sustainability Standards Board)
 *
 * References:
 * - CARB SB-253 Draft Rule
 * - EU ESRS Standards (2023)
 * - CDP Climate Change Questionnaire 2024
 * - TCFD Recommendations (2017, updated 2021)
 * - IFRS S1 & S2 (2023)
 * - GHG Protocol Corporate Standard
 * - IPCC AR5 Global Warming Potentials
 */

import type { RegulatoryFramework, ReportSection, RegulatoryReference } from './types';

/**
 * SB-253 California Climate Corporate Data Accountability Act
 * Effective: 2026 for Scope 1 & 2, 2027 for Scope 3
 */
const SB253_FRAMEWORK: RegulatoryFramework = {
  id: 'SB-253',
  name: 'SB-253',
  fullName: 'California Climate Corporate Data Accountability Act',
  jurisdiction: 'California, USA',
  version: '2023',
  effectiveDate: '2026-01-01',
  requiredScopes: [1, 2, 3],
  supportedExportFormats: ['PDF', 'XBRL', 'EXCEL'],

  regulatoryReferences: [
    {
      name: 'CARB SB-253 Regulations',
      version: '2024 Draft',
      url: 'https://ww2.arb.ca.gov/our-work/programs/ab-1305-ghg-reporting',
      description: 'California Air Resources Board implementing regulations'
    },
    {
      name: 'GHG Protocol Corporate Standard',
      version: 'Revised 2015',
      url: 'https://ghgprotocol.org/corporate-standard',
      description: 'Primary methodology for emissions accounting'
    },
    {
      name: 'IPCC Fifth Assessment Report',
      version: 'AR5 (2014)',
      url: 'https://www.ipcc.ch/assessment-report/ar5/',
      description: 'Global Warming Potential values'
    },
    {
      name: 'EPA Emission Factors Hub',
      version: '2024',
      url: 'https://www.epa.gov/climateleadership/ghg-emission-factors-hub',
      description: 'U.S. emission factors database'
    },
    {
      name: 'eGRID',
      version: '2023',
      url: 'https://www.epa.gov/egrid',
      description: 'Electricity grid subregion emission factors'
    }
  ],

  sections: [
    {
      id: 'sb253-general-info',
      title: 'General Entity Information',
      description: 'Corporate identification, organizational boundaries, and reporting parameters',
      estimatedPages: 4,
      mandatory: true,
      subsections: [
        {
          id: 'sb253-company-profile',
          title: 'Company Profile',
          description: 'Legal name, registration, headquarters, contact information',
          estimatedPages: 1,
          mandatory: true
        },
        {
          id: 'sb253-org-boundary',
          title: 'Organizational Boundary',
          description: 'Consolidation approach, included entities, exclusions',
          estimatedPages: 2,
          mandatory: true
        },
        {
          id: 'sb253-reporting-period',
          title: 'Reporting Period',
          description: 'Fiscal year, reporting deadlines, submission details',
          estimatedPages: 1,
          mandatory: true
        }
      ],
      regulatoryReferences: ['CARB SB-253 Regulations §95100-95103']
    },
    {
      id: 'sb253-methodology',
      title: 'Emission Calculation Methodology',
      description: 'Detailed methodology, standards applied, and calculation approaches',
      estimatedPages: 6,
      mandatory: true,
      subsections: [
        {
          id: 'sb253-accounting-standards',
          title: 'Accounting Standards Applied',
          description: 'GHG Protocol, IPCC AR5, EPA methodologies',
          estimatedPages: 2,
          mandatory: true
        },
        {
          id: 'sb253-calculation-approach',
          title: 'Calculation Approaches',
          description: 'Direct measurement, calculation-based methods, estimation hierarchies',
          estimatedPages: 2,
          mandatory: true
        },
        {
          id: 'sb253-data-quality',
          title: 'Data Quality Assessment',
          description: 'Data sources, quality tiers, uncertainty analysis',
          estimatedPages: 2,
          mandatory: true
        }
      ],
      regulatoryReferences: ['GHG Protocol Corporate Standard Chapter 5', 'CARB §95105']
    },
    {
      id: 'sb253-scope1',
      title: 'Scope 1 Emissions',
      description: 'Direct GHG emissions from owned or controlled sources',
      estimatedPages: 4,
      mandatory: true,
      subsections: [
        {
          id: 'sb253-scope1-stationary',
          title: 'Stationary Combustion',
          description: 'Boilers, furnaces, generators - natural gas, fuel oil, coal',
          estimatedPages: 1.5,
          mandatory: true
        },
        {
          id: 'sb253-scope1-mobile',
          title: 'Mobile Combustion',
          description: 'Company vehicles, fleet - gasoline, diesel, alternative fuels',
          estimatedPages: 1.5,
          mandatory: true
        },
        {
          id: 'sb253-scope1-fugitive',
          title: 'Fugitive Emissions',
          description: 'Refrigerants, leaks, process emissions',
          estimatedPages: 1,
          mandatory: true
        }
      ],
      regulatoryReferences: ['GHG Protocol Chapter 4', 'EPA 40 CFR Part 98 Subpart C']
    },
    {
      id: 'sb253-scope2',
      title: 'Scope 2 Emissions',
      description: 'Indirect emissions from purchased electricity, steam, heating, cooling',
      estimatedPages: 4,
      mandatory: true,
      subsections: [
        {
          id: 'sb253-scope2-location',
          title: 'Location-Based Method',
          description: 'Regional grid average emission factors (eGRID subregions)',
          estimatedPages: 2,
          mandatory: true
        },
        {
          id: 'sb253-scope2-market',
          title: 'Market-Based Method',
          description: 'Contractual instruments, renewable energy certificates, PPAs',
          estimatedPages: 2,
          mandatory: true
        }
      ],
      regulatoryReferences: ['GHG Protocol Scope 2 Guidance', 'eGRID 2023', 'CARB §95110']
    },
    {
      id: 'sb253-scope3',
      title: 'Scope 3 Emissions',
      description: 'All indirect emissions in the value chain (15 categories)',
      estimatedPages: 14,
      mandatory: true,
      subsections: [
        {
          id: 'sb253-scope3-cat1',
          title: 'Category 1: Purchased Goods & Services',
          description: 'Cradle-to-gate emissions from purchased products',
          estimatedPages: 1,
          mandatory: true
        },
        {
          id: 'sb253-scope3-cat2',
          title: 'Category 2: Capital Goods',
          description: 'Emissions from purchased capital equipment and infrastructure',
          estimatedPages: 1,
          mandatory: true
        },
        {
          id: 'sb253-scope3-cat3',
          title: 'Category 3: Fuel & Energy Related Activities',
          description: 'Upstream emissions from fuel/electricity production',
          estimatedPages: 1,
          mandatory: true
        },
        {
          id: 'sb253-scope3-cat4',
          title: 'Category 4: Upstream Transportation & Distribution',
          description: 'Transport of purchased goods in vehicles not owned by reporting company',
          estimatedPages: 1,
          mandatory: true
        },
        {
          id: 'sb253-scope3-cat5',
          title: 'Category 5: Waste Generated in Operations',
          description: 'Disposal and treatment of waste',
          estimatedPages: 1,
          mandatory: true
        },
        {
          id: 'sb253-scope3-cat6',
          title: 'Category 6: Business Travel',
          description: 'Employee air, rail, road, hotel stays',
          estimatedPages: 1,
          mandatory: true
        },
        {
          id: 'sb253-scope3-cat7',
          title: 'Category 7: Employee Commuting',
          description: 'Employee transportation between home and work',
          estimatedPages: 1,
          mandatory: true
        },
        {
          id: 'sb253-scope3-cat8',
          title: 'Category 8: Upstream Leased Assets',
          description: 'Operation of assets leased by reporting company (lessee)',
          estimatedPages: 1,
          mandatory: true
        },
        {
          id: 'sb253-scope3-cat9',
          title: 'Category 9: Downstream Transportation & Distribution',
          description: 'Transport and distribution of sold products',
          estimatedPages: 1,
          mandatory: true
        },
        {
          id: 'sb253-scope3-cat10',
          title: 'Category 10: Processing of Sold Products',
          description: 'Emissions from processing of intermediate products by third parties',
          estimatedPages: 1,
          mandatory: false
        },
        {
          id: 'sb253-scope3-cat11',
          title: 'Category 11: Use of Sold Products',
          description: 'End-use of goods and services sold',
          estimatedPages: 1,
          mandatory: false
        },
        {
          id: 'sb253-scope3-cat12',
          title: 'Category 12: End-of-Life Treatment',
          description: 'Waste disposal and treatment of sold products',
          estimatedPages: 1,
          mandatory: false
        },
        {
          id: 'sb253-scope3-cat13',
          title: 'Category 13: Downstream Leased Assets',
          description: 'Operation of assets owned and leased to others (lessor)',
          estimatedPages: 1,
          mandatory: false
        },
        {
          id: 'sb253-scope3-cat14',
          title: 'Category 14: Franchises',
          description: 'Operation of franchises not included in Scope 1 or 2',
          estimatedPages: 1,
          mandatory: false
        },
        {
          id: 'sb253-scope3-cat15',
          title: 'Category 15: Investments',
          description: 'Scope 3 emissions from investments (equity, debt, project finance)',
          estimatedPages: 1,
          mandatory: false
        }
      ],
      regulatoryReferences: ['GHG Protocol Corporate Value Chain (Scope 3) Standard', 'CARB §95115']
    },
    {
      id: 'sb253-data-sources',
      title: 'Data Sources & Assumptions',
      description: 'Activity data collection, emission factors, assumptions, limitations',
      estimatedPages: 3,
      mandatory: true,
      subsections: [
        {
          id: 'sb253-activity-data',
          title: 'Activity Data Sources',
          description: 'Metered data, invoices, fuel records, travel records',
          estimatedPages: 1.5,
          mandatory: true
        },
        {
          id: 'sb253-emission-factors',
          title: 'Emission Factors Applied',
          description: 'EPA, eGRID, IPCC, custom factors with justification',
          estimatedPages: 1.5,
          mandatory: true
        }
      ],
      regulatoryReferences: ['EPA Emission Factors Hub', 'eGRID 2023']
    },
    {
      id: 'sb253-assurance',
      title: 'Assurance & Verification Statement',
      description: 'Third-party verification or assurance provider statement',
      estimatedPages: 2,
      mandatory: true,
      subsections: [
        {
          id: 'sb253-assurance-level',
          title: 'Assurance Level',
          description: 'Limited or reasonable assurance engagement',
          estimatedPages: 0.5,
          mandatory: true
        },
        {
          id: 'sb253-verifier-statement',
          title: 'Verification Statement',
          description: 'Independent third-party assurance opinion',
          estimatedPages: 1.5,
          mandatory: true
        }
      ],
      regulatoryReferences: ['CARB §95130 - Assurance Requirements']
    },
    {
      id: 'sb253-internal-controls',
      title: 'Internal Controls Description',
      description: 'Internal processes, governance, data quality controls',
      estimatedPages: 2,
      mandatory: true,
      subsections: [
        {
          id: 'sb253-governance',
          title: 'Governance Structure',
          description: 'Roles, responsibilities, oversight',
          estimatedPages: 1,
          mandatory: true
        },
        {
          id: 'sb253-controls',
          title: 'Data Collection & Quality Controls',
          description: 'Procedures, validation, review processes',
          estimatedPages: 1,
          mandatory: true
        }
      ],
      regulatoryReferences: ['CARB §95125']
    },
    {
      id: 'sb253-yoy-comparison',
      title: 'Year-over-Year Comparison',
      description: 'Historical trends, explanations of significant changes',
      estimatedPages: 2,
      mandatory: false,
      subsections: [
        {
          id: 'sb253-historical-data',
          title: 'Historical Emissions Data',
          description: 'Scope 1, 2, 3 emissions for previous years',
          estimatedPages: 1,
          mandatory: false
        },
        {
          id: 'sb253-change-analysis',
          title: 'Analysis of Changes',
          description: 'Drivers of increases/decreases, structural changes',
          estimatedPages: 1,
          mandatory: false
        }
      ]
    },
    {
      id: 'sb253-appendices',
      title: 'Appendices',
      description: 'Activity data tables, emission factor tables, supporting calculations',
      estimatedPages: 8,
      mandatory: false,
      subsections: [
        {
          id: 'sb253-appendix-activity',
          title: 'Appendix A: Activity Data Tables',
          description: 'Detailed activity data by source category',
          estimatedPages: 3,
          mandatory: false
        },
        {
          id: 'sb253-appendix-factors',
          title: 'Appendix B: Emission Factors',
          description: 'Complete emission factor reference table',
          estimatedPages: 2,
          mandatory: false
        },
        {
          id: 'sb253-appendix-calcs',
          title: 'Appendix C: Sample Calculations',
          description: 'Worked examples of emission calculations',
          estimatedPages: 3,
          mandatory: false
        }
      ]
    }
  ],

  validationRules: [
    {
      field: 'scope1',
      rule: 'required',
      message: 'Scope 1 emissions must be reported'
    },
    {
      field: 'scope2',
      rule: 'required',
      message: 'Scope 2 emissions must be reported (both location and market-based)'
    },
    {
      field: 'scope3',
      rule: 'required',
      message: 'Scope 3 emissions must be reported for all applicable categories'
    },
    {
      field: 'assurance',
      rule: 'required',
      message: 'Third-party assurance is required for SB-253 compliance'
    },
    {
      field: 'gwp',
      rule: 'custom',
      message: 'Must use IPCC AR5 100-year Global Warming Potentials',
      validator: (data: any) => data.gwpStandard === 'AR5'
    }
  ]
};

/**
 * CSRD - EU Corporate Sustainability Reporting Directive
 * Based on ESRS (European Sustainability Reporting Standards)
 * Effective: 2024 for large EU companies
 */
const CSRD_FRAMEWORK: RegulatoryFramework = {
  id: 'CSRD',
  name: 'CSRD',
  fullName: 'Corporate Sustainability Reporting Directive (ESRS)',
  jurisdiction: 'European Union',
  version: 'ESRS 2023',
  effectiveDate: '2024-01-01',
  requiredScopes: [1, 2, 3],
  supportedExportFormats: ['PDF', 'XBRL', 'EXCEL'],

  regulatoryReferences: [
    {
      name: 'ESRS Set 1',
      version: '2023',
      url: 'https://www.efrag.org/lab6',
      description: 'European Sustainability Reporting Standards'
    },
    {
      name: 'CSRD Directive',
      version: '(EU) 2022/2464',
      url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32022L2464',
      description: 'EU Corporate Sustainability Reporting Directive'
    },
    {
      name: 'ESRS XBRL Taxonomy',
      version: '1.0',
      url: 'https://www.efrag.org/lab3',
      description: 'Digital reporting taxonomy'
    }
  ],

  sections: [
    {
      id: 'csrd-general',
      title: 'General Information (ESRS 2)',
      description: 'Basis for preparation, governance, strategy, and impact management',
      estimatedPages: 5,
      mandatory: true,
      subsections: [
        {
          id: 'csrd-basis-prep',
          title: 'Basis for Preparation',
          description: 'Reporting scope, consolidation, reporting period',
          estimatedPages: 2,
          mandatory: true
        },
        {
          id: 'csrd-value-chain',
          title: 'Value Chain Description',
          description: 'Upstream and downstream value chain overview',
          estimatedPages: 2,
          mandatory: true
        },
        {
          id: 'csrd-material-impacts',
          title: 'Material Impacts, Risks & Opportunities',
          description: 'Results of double materiality assessment',
          estimatedPages: 1,
          mandatory: true
        }
      ],
      regulatoryReferences: ['ESRS 2']
    },
    {
      id: 'csrd-governance',
      title: 'Governance',
      description: 'Governance structure, bodies, and processes for sustainability',
      estimatedPages: 8,
      mandatory: true,
      subsections: [
        {
          id: 'csrd-gov-bodies',
          title: 'Administrative, Management & Supervisory Bodies',
          description: 'Board composition, expertise, diversity',
          estimatedPages: 3,
          mandatory: true
        },
        {
          id: 'csrd-gov-processes',
          title: 'Governance Processes',
          description: 'Integration of sustainability into governance',
          estimatedPages: 3,
          mandatory: true
        },
        {
          id: 'csrd-gov-incentives',
          title: 'Integration into Incentive Schemes',
          description: 'Executive compensation linked to sustainability',
          estimatedPages: 2,
          mandatory: true
        }
      ],
      regulatoryReferences: ['ESRS 2 GOV-1, GOV-2, GOV-3']
    },
    {
      id: 'csrd-e1',
      title: 'E1: Climate Change',
      description: 'Transition plan, climate adaptation, GHG emissions, energy',
      estimatedPages: 12,
      mandatory: true,
      subsections: [
        {
          id: 'csrd-e1-transition',
          title: 'Transition Plan for Climate Change Mitigation',
          description: 'Decarbonization targets, levers, investments',
          estimatedPages: 3,
          mandatory: true
        },
        {
          id: 'csrd-e1-adaptation',
          title: 'Climate Change Adaptation',
          description: 'Physical and transition risks, adaptation plan',
          estimatedPages: 2,
          mandatory: true
        },
        {
          id: 'csrd-e1-energy',
          title: 'Energy Consumption and Mix',
          description: 'Total energy, renewable share, energy intensity',
          estimatedPages: 2,
          mandatory: true
        },
        {
          id: 'csrd-e1-ghg',
          title: 'GHG Emissions',
          description: 'Scope 1, 2, 3 emissions, GHG intensity',
          estimatedPages: 3,
          mandatory: true
        },
        {
          id: 'csrd-e1-carbon-pricing',
          title: 'Internal Carbon Pricing',
          description: 'Shadow price, fee-based mechanisms',
          estimatedPages: 1,
          mandatory: false
        },
        {
          id: 'csrd-e1-removals',
          title: 'GHG Removals and Carbon Credits',
          description: 'Carbon capture, offsets, quality criteria',
          estimatedPages: 1,
          mandatory: false
        }
      ],
      regulatoryReferences: ['ESRS E1']
    },
    {
      id: 'csrd-e2',
      title: 'E2: Pollution',
      description: 'Air, water, soil pollution; substances of concern',
      estimatedPages: 9,
      mandatory: true,
      subsections: [
        {
          id: 'csrd-e2-air',
          title: 'Air Pollutants',
          description: 'SOx, NOx, PM, VOCs',
          estimatedPages: 3,
          mandatory: true
        },
        {
          id: 'csrd-e2-water',
          title: 'Water Pollutants',
          description: 'Discharge quality, microplastics',
          estimatedPages: 3,
          mandatory: true
        },
        {
          id: 'csrd-e2-soil',
          title: 'Soil Pollutants',
          description: 'Contamination prevention and remediation',
          estimatedPages: 2,
          mandatory: true
        },
        {
          id: 'csrd-e2-substances',
          title: 'Substances of Concern',
          description: 'SVHC, production, use, phaseout plans',
          estimatedPages: 1,
          mandatory: false
        }
      ],
      regulatoryReferences: ['ESRS E2']
    },
    {
      id: 'csrd-e3',
      title: 'E3: Water & Marine Resources',
      description: 'Water consumption, discharge, marine resources impact',
      estimatedPages: 7,
      mandatory: true,
      subsections: [
        {
          id: 'csrd-e3-consumption',
          title: 'Water Consumption',
          description: 'Total withdrawal by source, water stress areas',
          estimatedPages: 3,
          mandatory: true
        },
        {
          id: 'csrd-e3-discharge',
          title: 'Water Discharge',
          description: 'Volume and quality by destination',
          estimatedPages: 2,
          mandatory: true
        },
        {
          id: 'csrd-e3-marine',
          title: 'Marine Resources',
          description: 'Impact on marine ecosystems, sustainable sourcing',
          estimatedPages: 2,
          mandatory: false
        }
      ],
      regulatoryReferences: ['ESRS E3']
    },
    {
      id: 'csrd-e4',
      title: 'E4: Biodiversity & Ecosystems',
      description: 'Impact on nature, land use, protected areas',
      estimatedPages: 6,
      mandatory: true,
      subsections: [
        {
          id: 'csrd-e4-impacts',
          title: 'Impact on Biodiversity',
          description: 'Direct operations and value chain impacts',
          estimatedPages: 2,
          mandatory: true
        },
        {
          id: 'csrd-e4-land-use',
          title: 'Land Use and Land-Use Change',
          description: 'Deforestation, habitat conversion',
          estimatedPages: 2,
          mandatory: true
        },
        {
          id: 'csrd-e4-protected',
          title: 'Protected Areas',
          description: 'Operations in or near protected areas',
          estimatedPages: 2,
          mandatory: true
        }
      ],
      regulatoryReferences: ['ESRS E4']
    },
    {
      id: 'csrd-e5',
      title: 'E5: Circular Economy',
      description: 'Resource inflows, waste, product design for circularity',
      estimatedPages: 10,
      mandatory: true,
      subsections: [
        {
          id: 'csrd-e5-resource-inflows',
          title: 'Resource Inflows',
          description: 'Material consumption, recycled content, regenerative materials',
          estimatedPages: 3,
          mandatory: true
        },
        {
          id: 'csrd-e5-resource-outflows',
          title: 'Resource Outflows',
          description: 'Products, waste generated, hazardous waste',
          estimatedPages: 3,
          mandatory: true
        },
        {
          id: 'csrd-e5-waste',
          title: 'Waste Management',
          description: 'Waste by type and disposal method',
          estimatedPages: 2,
          mandatory: true
        },
        {
          id: 'csrd-e5-products',
          title: 'Products and Materials',
          description: 'Design for circularity, end-of-life management',
          estimatedPages: 2,
          mandatory: false
        }
      ],
      regulatoryReferences: ['ESRS E5']
    },
    {
      id: 'csrd-s1',
      title: 'S1: Own Workforce',
      description: 'Working conditions, equal treatment, employee development',
      estimatedPages: 15,
      mandatory: true,
      subsections: [
        {
          id: 'csrd-s1-conditions',
          title: 'Working Conditions',
          description: 'Health & safety, working hours, work-life balance',
          estimatedPages: 4,
          mandatory: true
        },
        {
          id: 'csrd-s1-equal-treatment',
          title: 'Equal Treatment and Opportunities',
          description: 'Diversity, pay gap, non-discrimination',
          estimatedPages: 4,
          mandatory: true
        },
        {
          id: 'csrd-s1-rights',
          title: 'Workers Rights',
          description: 'Freedom of association, collective bargaining, worker participation',
          estimatedPages: 3,
          mandatory: true
        },
        {
          id: 'csrd-s1-development',
          title: 'Training and Skills Development',
          description: 'Training hours, career development, reskilling',
          estimatedPages: 2,
          mandatory: true
        },
        {
          id: 'csrd-s1-employment',
          title: 'Employment Security',
          description: 'Job stability, restructuring, social dialogue',
          estimatedPages: 2,
          mandatory: true
        }
      ],
      regulatoryReferences: ['ESRS S1']
    },
    {
      id: 'csrd-s2',
      title: 'S2: Workers in the Value Chain',
      description: 'Supply chain labor practices, human rights',
      estimatedPages: 12,
      mandatory: true,
      subsections: [
        {
          id: 'csrd-s2-conditions',
          title: 'Working Conditions in Value Chain',
          description: 'Supplier working conditions, modern slavery risks',
          estimatedPages: 4,
          mandatory: true
        },
        {
          id: 'csrd-s2-equal-treatment',
          title: 'Equal Treatment in Value Chain',
          description: 'Supplier diversity and inclusion practices',
          estimatedPages: 3,
          mandatory: true
        },
        {
          id: 'csrd-s2-rights',
          title: 'Workers Rights in Value Chain',
          description: 'Freedom of association, collective bargaining throughout supply chain',
          estimatedPages: 3,
          mandatory: true
        },
        {
          id: 'csrd-s2-due-diligence',
          title: 'Human Rights Due Diligence',
          description: 'Risk assessment, mitigation, grievance mechanisms',
          estimatedPages: 2,
          mandatory: true
        }
      ],
      regulatoryReferences: ['ESRS S2']
    },
    {
      id: 'csrd-s3',
      title: 'S3: Affected Communities',
      description: 'Community impacts, indigenous peoples, land rights',
      estimatedPages: 10,
      mandatory: true,
      subsections: [
        {
          id: 'csrd-s3-communities',
          title: 'Communities Impacted',
          description: 'Local communities affected by operations',
          estimatedPages: 3,
          mandatory: true
        },
        {
          id: 'csrd-s3-indigenous',
          title: 'Indigenous Peoples',
          description: 'Rights, free prior informed consent',
          estimatedPages: 3,
          mandatory: true
        },
        {
          id: 'csrd-s3-land',
          title: 'Land and Resource Rights',
          description: 'Land acquisition, resettlement, compensation',
          estimatedPages: 2,
          mandatory: true
        },
        {
          id: 'csrd-s3-engagement',
          title: 'Community Engagement',
          description: 'Stakeholder engagement, consultation processes',
          estimatedPages: 2,
          mandatory: true
        }
      ],
      regulatoryReferences: ['ESRS S3']
    },
    {
      id: 'csrd-s4',
      title: 'S4: Consumers and End-Users',
      description: 'Product safety, consumer information, data privacy',
      estimatedPages: 10,
      mandatory: true,
      subsections: [
        {
          id: 'csrd-s4-safety',
          title: 'Product Safety',
          description: 'Safety incidents, recalls, quality management',
          estimatedPages: 3,
          mandatory: true
        },
        {
          id: 'csrd-s4-information',
          title: 'Consumer Information',
          description: 'Labeling, transparency, responsible marketing',
          estimatedPages: 3,
          mandatory: true
        },
        {
          id: 'csrd-s4-privacy',
          title: 'Data Privacy',
          description: 'GDPR compliance, data breaches, consumer rights',
          estimatedPages: 2,
          mandatory: true
        },
        {
          id: 'csrd-s4-access',
          title: 'Accessibility and Inclusion',
          description: 'Inclusive design, affordability, access',
          estimatedPages: 2,
          mandatory: false
        }
      ],
      regulatoryReferences: ['ESRS S4']
    },
    {
      id: 'csrd-g1',
      title: 'G1: Business Conduct',
      description: 'Corporate culture, whistleblowing, anti-corruption, political engagement',
      estimatedPages: 8,
      mandatory: true,
      subsections: [
        {
          id: 'csrd-g1-culture',
          title: 'Corporate Culture',
          description: 'Values, ethics, code of conduct',
          estimatedPages: 2,
          mandatory: true
        },
        {
          id: 'csrd-g1-whistleblowing',
          title: 'Whistleblowing and Grievance Mechanisms',
          description: 'Protection of whistleblowers, reporting channels',
          estimatedPages: 2,
          mandatory: true
        },
        {
          id: 'csrd-g1-corruption',
          title: 'Anti-Corruption and Anti-Bribery',
          description: 'Policies, training, incidents',
          estimatedPages: 2,
          mandatory: true
        },
        {
          id: 'csrd-g1-political',
          title: 'Political Engagement and Lobbying',
          description: 'Lobbying activities, political contributions',
          estimatedPages: 2,
          mandatory: true
        }
      ],
      regulatoryReferences: ['ESRS G1']
    },
    {
      id: 'csrd-materiality',
      title: 'Double Materiality Assessment Summary',
      description: 'Process and results of impact and financial materiality assessment',
      estimatedPages: 5,
      mandatory: true,
      subsections: [
        {
          id: 'csrd-materiality-process',
          title: 'Materiality Assessment Process',
          description: 'Methodology, stakeholder engagement, criteria',
          estimatedPages: 2,
          mandatory: true
        },
        {
          id: 'csrd-materiality-results',
          title: 'Material Topics',
          description: 'Topics identified as material, rationale, thresholds',
          estimatedPages: 3,
          mandatory: true
        }
      ],
      regulatoryReferences: ['ESRS 2 IRO-1, IRO-2']
    }
  ],

  validationRules: [
    {
      field: 'doubleMateriality',
      rule: 'required',
      message: 'Double materiality assessment is mandatory for CSRD'
    },
    {
      field: 'xbrlTags',
      rule: 'required',
      message: 'ESRS XBRL taxonomy tags must be applied'
    },
    {
      field: 'scope1',
      rule: 'required',
      message: 'Scope 1 emissions required under ESRS E1'
    },
    {
      field: 'scope2',
      rule: 'required',
      message: 'Scope 2 emissions required under ESRS E1'
    },
    {
      field: 'scope3',
      rule: 'required',
      message: 'Scope 3 emissions required under ESRS E1 (all significant categories)'
    }
  ]
};

/**
 * CDP Climate Change Questionnaire 2024
 */
const CDP_FRAMEWORK: RegulatoryFramework = {
  id: 'CDP',
  name: 'CDP',
  fullName: 'CDP Climate Change Questionnaire',
  jurisdiction: 'Global',
  version: '2024',
  effectiveDate: '2024-01-01',
  requiredScopes: [1, 2, 3],
  supportedExportFormats: ['PDF', 'EXCEL'],

  regulatoryReferences: [
    {
      name: 'CDP Climate Change 2024',
      version: '2024',
      url: 'https://www.cdp.net/en/guidance/guidance-for-companies',
      description: 'CDP Climate Change Questionnaire Guidance'
    },
    {
      name: 'CDP Scoring Methodology',
      version: '2024',
      url: 'https://www.cdp.net/en/guidance/guidance-for-companies',
      description: 'Climate Change Scoring Methodology'
    }
  ],

  sections: [
    {
      id: 'cdp-c0',
      title: 'C0: Introduction',
      description: 'Company profile, reporting boundary, methodology',
      estimatedPages: 2,
      mandatory: true,
      regulatoryReferences: ['CDP C0']
    },
    {
      id: 'cdp-c1',
      title: 'C1: Governance',
      description: 'Board oversight, management responsibility for climate',
      estimatedPages: 3,
      mandatory: true,
      subsections: [
        {
          id: 'cdp-c1-1',
          title: 'C1.1: Board Oversight',
          description: 'Board-level position or committee with responsibility',
          estimatedPages: 1,
          mandatory: true
        },
        {
          id: 'cdp-c1-2',
          title: 'C1.2: Management Responsibility',
          description: 'Management-level position or committee',
          estimatedPages: 1,
          mandatory: true
        },
        {
          id: 'cdp-c1-3',
          title: 'C1.3: Incentives',
          description: 'Climate-related targets and incentives',
          estimatedPages: 1,
          mandatory: true
        }
      ],
      regulatoryReferences: ['CDP C1']
    },
    {
      id: 'cdp-c2',
      title: 'C2: Risks and Opportunities',
      description: 'Climate-related risks and opportunities identification and management',
      estimatedPages: 6,
      mandatory: true,
      subsections: [
        {
          id: 'cdp-c2-1',
          title: 'C2.1-C2.2: Risk Management Process',
          description: 'Processes for identifying, assessing, and managing climate risks',
          estimatedPages: 2,
          mandatory: true
        },
        {
          id: 'cdp-c2-3',
          title: 'C2.3-C2.4: Climate Risks',
          description: 'Identified climate risks and their financial impact',
          estimatedPages: 2,
          mandatory: true
        },
        {
          id: 'cdp-c2-5',
          title: 'C2.5: Climate Opportunities',
          description: 'Identified opportunities and potential financial impact',
          estimatedPages: 2,
          mandatory: true
        }
      ],
      regulatoryReferences: ['CDP C2']
    },
    {
      id: 'cdp-c3',
      title: 'C3: Business Strategy',
      description: 'Climate-related strategy, transition plan, scenario analysis',
      estimatedPages: 5,
      mandatory: true,
      subsections: [
        {
          id: 'cdp-c3-1',
          title: 'C3.1-C3.2: Strategy & Financial Planning',
          description: 'Integration of climate into business strategy',
          estimatedPages: 2,
          mandatory: true
        },
        {
          id: 'cdp-c3-3',
          title: 'C3.3-C3.4: Scenario Analysis',
          description: 'Climate scenario analysis (1.5°C, 2°C, etc.)',
          estimatedPages: 2,
          mandatory: true
        },
        {
          id: 'cdp-c3-5',
          title: 'C3.5: Transition Plan',
          description: 'Plan to transition to low-carbon economy',
          estimatedPages: 1,
          mandatory: true
        }
      ],
      regulatoryReferences: ['CDP C3']
    },
    {
      id: 'cdp-c4',
      title: 'C4: Targets and Performance',
      description: 'Emission reduction targets, renewable energy targets, progress',
      estimatedPages: 4,
      mandatory: true,
      subsections: [
        {
          id: 'cdp-c4-1',
          title: 'C4.1-C4.2: Emission Reduction Targets',
          description: 'Absolute, intensity, or science-based targets',
          estimatedPages: 2,
          mandatory: true
        },
        {
          id: 'cdp-c4-3',
          title: 'C4.3: Renewable Energy Targets',
          description: 'RE100, renewable electricity goals',
          estimatedPages: 1,
          mandatory: false
        },
        {
          id: 'cdp-c4-5',
          title: 'C4.5: Emission Reduction Initiatives',
          description: 'Specific initiatives, estimated savings, investment',
          estimatedPages: 1,
          mandatory: true
        }
      ],
      regulatoryReferences: ['CDP C4']
    },
    {
      id: 'cdp-c5',
      title: 'C5: Emissions Methodology',
      description: 'Methodology, organizational boundary, base year',
      estimatedPages: 3,
      mandatory: true,
      subsections: [
        {
          id: 'cdp-c5-1',
          title: 'C5.1-C5.2: Base Year and Reporting Boundary',
          description: 'Base year, recalculation policy, consolidation approach',
          estimatedPages: 2,
          mandatory: true
        },
        {
          id: 'cdp-c5-3',
          title: 'C5.3: Exclusions',
          description: 'Excluded sources, rationale',
          estimatedPages: 1,
          mandatory: true
        }
      ],
      regulatoryReferences: ['CDP C5']
    },
    {
      id: 'cdp-c6',
      title: 'C6: Emissions Data',
      description: 'Scope 1, 2, 3 emissions data and breakdowns',
      estimatedPages: 8,
      mandatory: true,
      subsections: [
        {
          id: 'cdp-c6-1',
          title: 'C6.1: Scope 1 Emissions',
          description: 'Gross global Scope 1 emissions in metric tons CO2e',
          estimatedPages: 2,
          mandatory: true
        },
        {
          id: 'cdp-c6-2',
          title: 'C6.2: Scope 2 Emissions',
          description: 'Location and market-based Scope 2 emissions',
          estimatedPages: 2,
          mandatory: true
        },
        {
          id: 'cdp-c6-3',
          title: 'C6.3: Scope 1 & 2 Breakdown',
          description: 'By country, business division, facility, activity',
          estimatedPages: 2,
          mandatory: true
        },
        {
          id: 'cdp-c6-5',
          title: 'C6.5: Scope 3 Emissions',
          description: 'All 15 Scope 3 categories with breakdowns',
          estimatedPages: 2,
          mandatory: true
        }
      ],
      regulatoryReferences: ['CDP C6']
    },
    {
      id: 'cdp-c7',
      title: 'C7: Energy',
      description: 'Energy consumption, renewable energy use',
      estimatedPages: 3,
      mandatory: true,
      subsections: [
        {
          id: 'cdp-c7-1',
          title: 'C7.1: Energy Consumption',
          description: 'Total energy consumption by fuel type',
          estimatedPages: 2,
          mandatory: true
        },
        {
          id: 'cdp-c7-2',
          title: 'C7.2: Renewable Energy',
          description: 'Renewable electricity, heat, steam, cooling',
          estimatedPages: 1,
          mandatory: true
        }
      ],
      regulatoryReferences: ['CDP C7']
    },
    {
      id: 'cdp-c8',
      title: 'C8: Additional Metrics',
      description: 'Energy intensity, emission intensity, revenue from low-carbon',
      estimatedPages: 3,
      mandatory: true,
      subsections: [
        {
          id: 'cdp-c8-1',
          title: 'C8.1: Energy Intensity',
          description: 'Energy consumption per unit (revenue, FTE, m²)',
          estimatedPages: 1,
          mandatory: true
        },
        {
          id: 'cdp-c8-2',
          title: 'C8.2: Emission Intensity',
          description: 'Emission intensity metrics',
          estimatedPages: 1,
          mandatory: true
        },
        {
          id: 'cdp-c8-3',
          title: 'C8.3: Low-Carbon Revenue',
          description: 'Products and services enabling third-party GHG reductions',
          estimatedPages: 1,
          mandatory: false
        }
      ],
      regulatoryReferences: ['CDP C8']
    },
    {
      id: 'cdp-c9',
      title: 'C9: Verification',
      description: 'Third-party verification of emissions data',
      estimatedPages: 2,
      mandatory: false,
      subsections: [
        {
          id: 'cdp-c9-1',
          title: 'C9.1: Verification Status',
          description: 'Scope 1, 2, 3 verification status',
          estimatedPages: 1,
          mandatory: false
        },
        {
          id: 'cdp-c9-2',
          title: 'C9.2: Verification Statement',
          description: 'Assurance provider and statement',
          estimatedPages: 1,
          mandatory: false
        }
      ],
      regulatoryReferences: ['CDP C9']
    },
    {
      id: 'cdp-c10',
      title: 'C10: Biodiversity',
      description: 'Biodiversity-related impacts and dependencies (if applicable)',
      estimatedPages: 3,
      mandatory: false,
      subsections: [
        {
          id: 'cdp-c10-1',
          title: 'C10.1: Biodiversity Assessment',
          description: 'TNFD, biodiversity risks and dependencies',
          estimatedPages: 2,
          mandatory: false
        },
        {
          id: 'cdp-c10-2',
          title: 'C10.2: Conservation Actions',
          description: 'Biodiversity conservation and restoration',
          estimatedPages: 1,
          mandatory: false
        }
      ],
      regulatoryReferences: ['CDP C10']
    }
  ],

  validationRules: [
    {
      field: 'scope1',
      rule: 'required',
      message: 'Scope 1 emissions required (C6.1)'
    },
    {
      field: 'scope2',
      rule: 'required',
      message: 'Scope 2 emissions required (C6.2) - both location and market-based'
    },
    {
      field: 'scope3',
      rule: 'required',
      message: 'Scope 3 emissions required (C6.5) - all applicable categories'
    }
  ]
};

/**
 * TCFD - Task Force on Climate-related Financial Disclosures
 */
const TCFD_FRAMEWORK: RegulatoryFramework = {
  id: 'TCFD',
  name: 'TCFD',
  fullName: 'Task Force on Climate-related Financial Disclosures',
  jurisdiction: 'Global',
  version: '2021',
  effectiveDate: '2017-06-29',
  requiredScopes: [1, 2, 3],
  supportedExportFormats: ['PDF', 'EXCEL'],

  regulatoryReferences: [
    {
      name: 'TCFD Recommendations',
      version: '2017 (updated 2021)',
      url: 'https://www.fsb-tcfd.org/recommendations/',
      description: 'Final Report: Recommendations of the Task Force on Climate-related Financial Disclosures'
    },
    {
      name: 'TCFD Guidance on Scenario Analysis',
      version: '2020',
      url: 'https://www.fsb-tcfd.org/publications/',
      description: 'Guidance on Scenario Analysis for Non-Financial Companies'
    }
  ],

  sections: [
    {
      id: 'tcfd-governance',
      title: 'Governance',
      description: 'Board and management oversight of climate-related risks and opportunities',
      estimatedPages: 4,
      mandatory: true,
      subsections: [
        {
          id: 'tcfd-gov-board',
          title: 'Board Oversight',
          description: 'Board oversight of climate-related risks and opportunities',
          estimatedPages: 2,
          mandatory: true
        },
        {
          id: 'tcfd-gov-mgmt',
          title: 'Management Role',
          description: 'Management role in assessing and managing climate risks',
          estimatedPages: 2,
          mandatory: true
        }
      ],
      regulatoryReferences: ['TCFD Pillar: Governance']
    },
    {
      id: 'tcfd-strategy',
      title: 'Strategy',
      description: 'Actual and potential impacts of climate-related risks and opportunities on business, strategy, and financial planning',
      estimatedPages: 8,
      mandatory: true,
      subsections: [
        {
          id: 'tcfd-strategy-risks',
          title: 'Climate Risks and Opportunities',
          description: 'Short, medium, long-term climate risks and opportunities',
          estimatedPages: 3,
          mandatory: true
        },
        {
          id: 'tcfd-strategy-impact',
          title: 'Impact on Business and Strategy',
          description: 'Impact on business model, products, services, supply chain',
          estimatedPages: 2,
          mandatory: true
        },
        {
          id: 'tcfd-strategy-scenarios',
          title: 'Scenario Analysis',
          description: 'Resilience of strategy under 1.5°C, 2°C, 3°C scenarios',
          estimatedPages: 3,
          mandatory: true
        }
      ],
      regulatoryReferences: ['TCFD Pillar: Strategy']
    },
    {
      id: 'tcfd-risk-mgmt',
      title: 'Risk Management',
      description: 'Processes for identifying, assessing, and managing climate-related risks',
      estimatedPages: 4,
      mandatory: true,
      subsections: [
        {
          id: 'tcfd-risk-identify',
          title: 'Identification Process',
          description: 'How organization identifies climate-related risks',
          estimatedPages: 1.5,
          mandatory: true
        },
        {
          id: 'tcfd-risk-assess',
          title: 'Assessment Process',
          description: 'How organization assesses climate-related risks',
          estimatedPages: 1.5,
          mandatory: true
        },
        {
          id: 'tcfd-risk-integrate',
          title: 'Integration into ERM',
          description: 'Integration into overall risk management',
          estimatedPages: 1,
          mandatory: true
        }
      ],
      regulatoryReferences: ['TCFD Pillar: Risk Management']
    },
    {
      id: 'tcfd-metrics',
      title: 'Metrics and Targets',
      description: 'Metrics and targets used to assess and manage climate-related risks and opportunities',
      estimatedPages: 6,
      mandatory: true,
      subsections: [
        {
          id: 'tcfd-metrics-ghg',
          title: 'GHG Emissions',
          description: 'Scope 1, 2, and significant Scope 3 emissions',
          estimatedPages: 2,
          mandatory: true
        },
        {
          id: 'tcfd-metrics-climate',
          title: 'Climate-Related Metrics',
          description: 'Metrics used to assess climate risks and opportunities (energy, water, carbon price)',
          estimatedPages: 2,
          mandatory: true
        },
        {
          id: 'tcfd-metrics-targets',
          title: 'Targets and Performance',
          description: 'Targets used to manage climate risks and performance against targets',
          estimatedPages: 2,
          mandatory: true
        }
      ],
      regulatoryReferences: ['TCFD Pillar: Metrics and Targets']
    },
    {
      id: 'tcfd-scenarios',
      title: 'Scenario Analysis Detail',
      description: 'Detailed scenario analysis (1.5°C, 2°C, 3°C pathways)',
      estimatedPages: 6,
      mandatory: true,
      subsections: [
        {
          id: 'tcfd-scenario-1.5',
          title: '1.5°C Scenario',
          description: 'Rapid decarbonization, strong policy action',
          estimatedPages: 2,
          mandatory: true
        },
        {
          id: 'tcfd-scenario-2',
          title: '2°C Scenario',
          description: 'Orderly transition, gradual policy tightening',
          estimatedPages: 2,
          mandatory: true
        },
        {
          id: 'tcfd-scenario-3',
          title: '3°C Scenario',
          description: 'Delayed action, increased physical risks',
          estimatedPages: 2,
          mandatory: true
        }
      ],
      regulatoryReferences: ['TCFD Guidance on Scenario Analysis']
    }
  ],

  validationRules: [
    {
      field: 'scenarioAnalysis',
      rule: 'required',
      message: 'TCFD requires scenario analysis including 2°C or lower scenario'
    },
    {
      field: 'scope1',
      rule: 'required',
      message: 'Scope 1 GHG emissions required'
    },
    {
      field: 'scope2',
      rule: 'required',
      message: 'Scope 2 GHG emissions required'
    },
    {
      field: 'scope3',
      rule: 'custom',
      message: 'Scope 3 emissions required if appropriate',
      validator: (data: any) => data.scope3Applicable ? !!data.scope3 : true
    }
  ]
};

/**
 * ISSB S1 & S2 - International Sustainability Standards Board
 * IFRS S1: General Requirements for Disclosure of Sustainability-related Financial Information
 * IFRS S2: Climate-related Disclosures
 */
const ISSB_FRAMEWORK: RegulatoryFramework = {
  id: 'ISSB',
  name: 'ISSB S1 & S2',
  fullName: 'IFRS Sustainability Disclosure Standards S1 & S2',
  jurisdiction: 'Global',
  version: '2023',
  effectiveDate: '2024-01-01',
  requiredScopes: [1, 2, 3],
  supportedExportFormats: ['PDF', 'XBRL', 'EXCEL'],

  regulatoryReferences: [
    {
      name: 'IFRS S1',
      version: '2023',
      url: 'https://www.ifrs.org/issued-standards/ifrs-sustainability-standards-navigator/ifrs-s1-general-requirements/',
      description: 'General Requirements for Disclosure of Sustainability-related Financial Information'
    },
    {
      name: 'IFRS S2',
      version: '2023',
      url: 'https://www.ifrs.org/issued-standards/ifrs-sustainability-standards-navigator/ifrs-s2-climate-related-disclosures/',
      description: 'Climate-related Disclosures'
    },
    {
      name: 'SASB Standards',
      version: '2023',
      url: 'https://www.sasb.org/standards/',
      description: 'Industry-based disclosure topics and metrics'
    }
  ],

  sections: [
    {
      id: 'issb-s1-general',
      title: 'S1: General Sustainability Disclosures',
      description: 'Core content and general requirements for sustainability disclosure',
      estimatedPages: 10,
      mandatory: true,
      subsections: [
        {
          id: 'issb-s1-governance',
          title: 'S1 Governance',
          description: 'Governance processes, controls, and procedures for sustainability',
          estimatedPages: 3,
          mandatory: true
        },
        {
          id: 'issb-s1-strategy',
          title: 'S1 Strategy',
          description: 'Sustainability-related risks and opportunities affecting strategy',
          estimatedPages: 3,
          mandatory: true
        },
        {
          id: 'issb-s1-risk',
          title: 'S1 Risk Management',
          description: 'Processes to identify, assess, and manage sustainability risks',
          estimatedPages: 2,
          mandatory: true
        },
        {
          id: 'issb-s1-metrics',
          title: 'S1 Metrics and Targets',
          description: 'Performance metrics and targets for sustainability',
          estimatedPages: 2,
          mandatory: true
        }
      ],
      regulatoryReferences: ['IFRS S1']
    },
    {
      id: 'issb-s2-climate',
      title: 'S2: Climate-Related Disclosures',
      description: 'Climate-specific disclosures aligned with TCFD',
      estimatedPages: 12,
      mandatory: true,
      subsections: [
        {
          id: 'issb-s2-governance',
          title: 'S2 Governance',
          description: 'Board and management oversight of climate-related risks and opportunities',
          estimatedPages: 2,
          mandatory: true
        },
        {
          id: 'issb-s2-strategy',
          title: 'S2 Strategy',
          description: 'Climate risks, opportunities, transition plan, resilience',
          estimatedPages: 4,
          mandatory: true
        },
        {
          id: 'issb-s2-risk',
          title: 'S2 Risk Management',
          description: 'Climate risk identification, assessment, and management processes',
          estimatedPages: 2,
          mandatory: true
        },
        {
          id: 'issb-s2-metrics',
          title: 'S2 Metrics and Targets',
          description: 'Climate metrics including GHG emissions, climate-related targets',
          estimatedPages: 4,
          mandatory: true
        }
      ],
      regulatoryReferences: ['IFRS S2']
    },
    {
      id: 'issb-ghg-emissions',
      title: 'GHG Emissions (S2 Requirement)',
      description: 'Scope 1, 2, 3 emissions in accordance with GHG Protocol',
      estimatedPages: 8,
      mandatory: true,
      subsections: [
        {
          id: 'issb-scope1',
          title: 'Scope 1 Emissions',
          description: 'Gross global Scope 1 GHG emissions in metric tons CO2e',
          estimatedPages: 2,
          mandatory: true
        },
        {
          id: 'issb-scope2',
          title: 'Scope 2 Emissions',
          description: 'Location-based and market-based Scope 2 emissions',
          estimatedPages: 2,
          mandatory: true
        },
        {
          id: 'issb-scope3',
          title: 'Scope 3 Emissions',
          description: 'All 15 Scope 3 categories (upstream and downstream)',
          estimatedPages: 3,
          mandatory: true
        },
        {
          id: 'issb-ghg-intensity',
          title: 'GHG Intensity',
          description: 'GHG intensity ratios (per revenue, per output unit)',
          estimatedPages: 1,
          mandatory: true
        }
      ],
      regulatoryReferences: ['IFRS S2 Appendix B']
    },
    {
      id: 'issb-industry-metrics',
      title: 'Industry-Based Metrics (SASB)',
      description: 'Industry-specific sustainability metrics based on SASB standards',
      estimatedPages: 6,
      mandatory: true,
      subsections: [
        {
          id: 'issb-sasb-energy',
          title: 'Energy Management',
          description: 'Total energy consumed, percentage renewable (if applicable to industry)',
          estimatedPages: 2,
          mandatory: false
        },
        {
          id: 'issb-sasb-water',
          title: 'Water Management',
          description: 'Water withdrawal, consumption, discharge (if applicable)',
          estimatedPages: 2,
          mandatory: false
        },
        {
          id: 'issb-sasb-waste',
          title: 'Waste & Hazardous Materials',
          description: 'Waste generated, hazardous waste, recycling rates (if applicable)',
          estimatedPages: 2,
          mandatory: false
        }
      ],
      regulatoryReferences: ['SASB Standards by Industry']
    },
    {
      id: 'issb-transition-plan',
      title: 'Climate Transition Plan',
      description: 'Plan for transitioning to a low-carbon economy',
      estimatedPages: 5,
      mandatory: true,
      subsections: [
        {
          id: 'issb-targets',
          title: 'GHG Emission Targets',
          description: 'Short, medium, long-term targets; SBTi alignment',
          estimatedPages: 2,
          mandatory: true
        },
        {
          id: 'issb-levers',
          title: 'Decarbonization Levers',
          description: 'Technologies, processes, business model changes',
          estimatedPages: 2,
          mandatory: true
        },
        {
          id: 'issb-finance',
          title: 'Climate Financing',
          description: 'CapEx, OpEx plans for transition',
          estimatedPages: 1,
          mandatory: true
        }
      ],
      regulatoryReferences: ['IFRS S2.14']
    },
    {
      id: 'issb-scenario-analysis',
      title: 'Climate Scenario Analysis',
      description: 'Resilience analysis under different climate scenarios',
      estimatedPages: 4,
      mandatory: true,
      subsections: [
        {
          id: 'issb-scenarios-used',
          title: 'Scenarios Applied',
          description: 'Description of climate scenarios used (e.g., IEA, NGFS)',
          estimatedPages: 2,
          mandatory: true
        },
        {
          id: 'issb-scenario-results',
          title: 'Scenario Analysis Results',
          description: 'Impacts on strategy and financial position under each scenario',
          estimatedPages: 2,
          mandatory: true
        }
      ],
      regulatoryReferences: ['IFRS S2.22']
    }
  ],

  validationRules: [
    {
      field: 'scope1',
      rule: 'required',
      message: 'IFRS S2 requires Scope 1 GHG emissions'
    },
    {
      field: 'scope2',
      rule: 'required',
      message: 'IFRS S2 requires Scope 2 GHG emissions (location and market-based)'
    },
    {
      field: 'scope3',
      rule: 'required',
      message: 'IFRS S2 requires Scope 3 GHG emissions (all 15 categories)'
    },
    {
      field: 'transitionPlan',
      rule: 'required',
      message: 'IFRS S2 requires disclosure of climate transition plan'
    },
    {
      field: 'scenarioAnalysis',
      rule: 'required',
      message: 'IFRS S2 requires climate scenario analysis'
    },
    {
      field: 'industryMetrics',
      rule: 'custom',
      message: 'IFRS S2 requires disclosure of industry-based metrics (SASB)',
      validator: (data: any) => !!data.sasbMetrics
    }
  ]
};

/**
 * Master configuration object containing all regulatory frameworks
 */
export const REGULATORY_FRAMEWORKS: Record<string, RegulatoryFramework> = {
  'SB-253': SB253_FRAMEWORK,
  'CSRD': CSRD_FRAMEWORK,
  'CDP': CDP_FRAMEWORK,
  'TCFD': TCFD_FRAMEWORK,
  'ISSB': ISSB_FRAMEWORK
};

/**
 * Helper function to get framework by ID
 */
export function getFramework(frameworkId: string): RegulatoryFramework | undefined {
  return REGULATORY_FRAMEWORKS[frameworkId];
}

/**
 * Helper function to get all framework IDs
 */
export function getAllFrameworkIds(): string[] {
  return Object.keys(REGULATORY_FRAMEWORKS);
}

/**
 * Helper function to validate if a framework ID is valid
 */
export function isValidFramework(frameworkId: string): boolean {
  return frameworkId in REGULATORY_FRAMEWORKS;
}

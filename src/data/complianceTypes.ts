export interface ComplianceType {
  id: string;
  name: string;
  shortName: string;
  shortDescription: string;
  jurisdiction: string;
  overview: string;
  whoMustComply: string[];
  reportingScope: {
    title: string;
    items: string[];
  };
  frequency: string;
  keyDeadlines: { date: string; description: string }[];
  officialResources: { name: string; url: string }[];
  scopeBreakdown?: {
    scope1: string;
    scope2: string;
    scope3: string;
  };
}

export const complianceTypes: ComplianceType[] = [
  {
    id: "sb253",
    name: "California Climate Corporate Data Accountability Act",
    shortName: "SB 253",
    shortDescription: "California's landmark climate disclosure law requiring large companies to report Scope 1, 2, and 3 greenhouse gas emissions.",
    jurisdiction: "California, USA",
    overview: "SB 253, also known as the Climate Corporate Data Accountability Act, is a California state law that mandates large companies doing business in California to publicly disclose their greenhouse gas (GHG) emissions. This includes direct emissions (Scope 1), indirect emissions from purchased energy (Scope 2), and value chain emissions (Scope 3). The law aims to increase corporate transparency and accountability in addressing climate change.",
    whoMustComply: [
      "U.S.-based entities (corporations, LLCs, partnerships, etc.) doing business in California",
      "Companies with total annual revenues exceeding $1 billion",
      "Both public and private companies meeting the revenue threshold",
      "Approximately 5,300+ companies are expected to be affected"
    ],
    reportingScope: {
      title: "GHG Emissions Reporting Requirements",
      items: [
        "Scope 1: Direct emissions from owned or controlled sources",
        "Scope 2: Indirect emissions from purchased electricity, steam, heating, and cooling",
        "Scope 3: All other indirect emissions in the value chain (suppliers, transportation, product use, etc.)",
        "Emissions must be reported in accordance with the GHG Protocol standards"
      ]
    },
    frequency: "Annual reporting required",
    keyDeadlines: [
      { date: "2026", description: "First Scope 1 and Scope 2 emissions reports due" },
      { date: "2027", description: "First Scope 3 emissions reports due" },
      { date: "2030", description: "Limited assurance required for Scope 3 emissions" }
    ],
    officialResources: [
      { name: "California Air Resources Board (CARB)", url: "https://ww2.arb.ca.gov/" },
      { name: "SB 253 Full Text", url: "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202320240SB253" },
      { name: "GHG Protocol", url: "https://ghgprotocol.org/" }
    ],
    scopeBreakdown: {
      scope1: "Direct GHG emissions from sources owned or controlled by the company (e.g., company vehicles, on-site fuel combustion)",
      scope2: "Indirect GHG emissions from purchased electricity, steam, heat, or cooling consumed by the company",
      scope3: "All other indirect emissions occurring in the company's value chain, including upstream and downstream activities"
    }
  },
  {
    id: "sb261",
    name: "California Climate-Related Financial Risk Act",
    shortName: "SB 261",
    shortDescription: "Requires large companies to disclose climate-related financial risks following TCFD framework recommendations.",
    jurisdiction: "California, USA",
    overview: "SB 261, the Climate-Related Financial Risk Act, requires large companies doing business in California to prepare and publicly disclose climate-related financial risk reports. The reports must align with the Task Force on Climate-related Financial Disclosures (TCFD) framework, covering governance, strategy, risk management, and metrics related to climate risks and opportunities.",
    whoMustComply: [
      "U.S.-based entities doing business in California",
      "Companies with total annual revenues exceeding $500 million",
      "Both public and private companies meeting the revenue threshold",
      "Estimated 10,000+ companies affected"
    ],
    reportingScope: {
      title: "Climate-Related Financial Risk Disclosures",
      items: [
        "Governance: Board and management oversight of climate-related risks",
        "Strategy: Climate-related risks and opportunities impact on business",
        "Risk Management: Processes for identifying and managing climate risks",
        "Metrics and Targets: Metrics used to assess climate-related risks and opportunities"
      ]
    },
    frequency: "Biennial reporting (every two years)",
    keyDeadlines: [
      { date: "January 1, 2026", description: "First climate risk reports due" },
      { date: "Every 2 years", description: "Subsequent reports due biennially" }
    ],
    officialResources: [
      { name: "California Air Resources Board (CARB)", url: "https://ww2.arb.ca.gov/" },
      { name: "SB 261 Full Text", url: "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202320240SB261" },
      { name: "TCFD Recommendations", url: "https://www.fsb-tcfd.org/recommendations/" }
    ]
  },
  {
    id: "csrd",
    name: "Corporate Sustainability Reporting Directive",
    shortName: "CSRD",
    shortDescription: "EU comprehensive sustainability reporting directive requiring detailed ESG disclosures under European Sustainability Reporting Standards.",
    jurisdiction: "European Union",
    overview: "The Corporate Sustainability Reporting Directive (CSRD) is an EU regulation that significantly expands sustainability reporting requirements for companies operating in Europe. It replaces the Non-Financial Reporting Directive (NFRD) and introduces detailed reporting requirements under the European Sustainability Reporting Standards (ESRS), covering environmental, social, and governance topics with the concept of double materiality.",
    whoMustComply: [
      "Large EU companies meeting 2 of 3 criteria: more than 250 employees, more than 50M EUR revenue, more than 25M EUR assets",
      "All EU-listed companies (except micro-enterprises)",
      "Non-EU companies with more than 150M EUR EU revenue and an EU subsidiary or branch",
      "Small and medium listed companies (with delayed timeline)"
    ],
    reportingScope: {
      title: "European Sustainability Reporting Standards (ESRS)",
      items: [
        "Environmental: Climate change, pollution, water, biodiversity, circular economy",
        "Social: Own workforce, workers in value chain, affected communities, consumers",
        "Governance: Business conduct, corporate governance",
        "Double materiality assessment (impact and financial materiality)",
        "Value chain reporting requirements"
      ]
    },
    frequency: "Annual reporting as part of management report",
    keyDeadlines: [
      { date: "2024 (FY2024)", description: "Large public-interest entities already under NFRD" },
      { date: "2025 (FY2025)", description: "Other large companies meeting size thresholds" },
      { date: "2026 (FY2026)", description: "Listed SMEs (with opt-out until 2028)" },
      { date: "2028 (FY2028)", description: "Non-EU companies with significant EU presence" }
    ],
    officialResources: [
      { name: "European Commission CSRD", url: "https://finance.ec.europa.eu/capital-markets-union-and-financial-markets/company-reporting-and-auditing/company-reporting/corporate-sustainability-reporting_en" },
      { name: "EFRAG ESRS Standards", url: "https://www.efrag.org/lab6" },
      { name: "EU Official Journal", url: "https://eur-lex.europa.eu/" }
    ]
  },
  {
    id: "cdp",
    name: "Carbon Disclosure Project",
    shortName: "CDP",
    shortDescription: "Global environmental disclosure system enabling companies to measure and manage environmental impacts across climate, water, and forests.",
    jurisdiction: "Global",
    overview: "CDP (formerly Carbon Disclosure Project) runs the world's leading environmental disclosure platform. It enables companies, cities, states, and regions to measure, disclose, manage, and share vital environmental information. Over 23,000 companies disclose through CDP, which scores responses and makes data available to investors and purchasers representing over $130 trillion in assets.",
    whoMustComply: [
      "Voluntary disclosure, but increasingly expected by investors and customers",
      "Companies requested by investors through CDP's disclosure request system",
      "Suppliers requested by major purchasers through CDP Supply Chain program",
      "Companies seeking climate leadership recognition (CDP A-List)"
    ],
    reportingScope: {
      title: "CDP Questionnaires",
      items: [
        "Climate Change: GHG emissions, risks, opportunities, governance, strategy",
        "Water Security: Water accounting, risks, governance, value chain engagement",
        "Forests: Commodity-driven deforestation risks and policies",
        "Science-based targets and net-zero commitments",
        "Supply chain environmental performance"
      ]
    },
    frequency: "Annual disclosure cycle (April-July submission window)",
    keyDeadlines: [
      { date: "February", description: "CDP questionnaires released" },
      { date: "April", description: "Disclosure platform opens" },
      { date: "July", description: "Submission deadline" },
      { date: "December", description: "Scores published" }
    ],
    officialResources: [
      { name: "CDP Official Website", url: "https://www.cdp.net/" },
      { name: "CDP Disclosure Platform", url: "https://www.cdp.net/en/companies/reporter-services" },
      { name: "CDP Scoring Methodology", url: "https://www.cdp.net/en/companies/companies-scores" }
    ]
  },
  {
    id: "tcfd",
    name: "Task Force on Climate-related Financial Disclosures",
    shortName: "TCFD",
    shortDescription: "Framework for climate-related financial disclosures covering governance, strategy, risk management, and metrics/targets.",
    jurisdiction: "Global",
    overview: "The Task Force on Climate-related Financial Disclosures (TCFD) was created by the Financial Stability Board to develop recommendations for more effective climate-related disclosures. The framework helps companies provide decision-useful information to investors, lenders, and insurers about climate-related risks and opportunities. TCFD has been widely adopted and forms the basis for many mandatory disclosure requirements.",
    whoMustComply: [
      "Voluntary framework, but increasingly mandated by regulators",
      "Required for UK premium-listed companies and large UK companies",
      "Required for large Japanese companies",
      "Basis for SEC climate disclosure rules (USA)",
      "Integrated into ISSB standards"
    ],
    reportingScope: {
      title: "Four Core Disclosure Areas",
      items: [
        "Governance: Board oversight and management's role in climate risks",
        "Strategy: Climate risks/opportunities and scenario analysis",
        "Risk Management: Processes for identifying and managing climate risks",
        "Metrics and Targets: Metrics, Scope 1/2/3 emissions, and climate targets"
      ]
    },
    frequency: "Annual reporting (integrated into financial filings)",
    keyDeadlines: [
      { date: "Ongoing", description: "Annual reporting aligned with financial reporting cycle" },
      { date: "2024", description: "TCFD disbanded, work transferred to ISSB" }
    ],
    officialResources: [
      { name: "TCFD Official Website", url: "https://www.fsb-tcfd.org/" },
      { name: "TCFD Recommendations", url: "https://www.fsb-tcfd.org/recommendations/" },
      { name: "TCFD Knowledge Hub", url: "https://www.tcfdhub.org/" }
    ],
    scopeBreakdown: {
      scope1: "Direct emissions from owned or controlled sources",
      scope2: "Indirect emissions from purchased energy",
      scope3: "All other indirect emissions in the value chain"
    }
  },
  {
    id: "issb",
    name: "International Sustainability Standards Board S1/S2",
    shortName: "ISSB S1/S2",
    shortDescription: "Global baseline sustainability disclosure standards for capital markets, covering general sustainability and climate-related disclosures.",
    jurisdiction: "Global",
    overview: "The International Sustainability Standards Board (ISSB), under the IFRS Foundation, issued IFRS S1 (General Requirements) and IFRS S2 (Climate-related Disclosures) to create a global baseline for sustainability reporting. These standards consolidate and build upon TCFD, SASB, and other frameworks to provide consistent, comparable sustainability information for investors and capital markets worldwide.",
    whoMustComply: [
      "Adoption varies by jurisdiction (many countries incorporating into law)",
      "UK, Australia, Singapore, Hong Kong, Japan adopting or considering adoption",
      "Voluntary for companies in jurisdictions without mandates",
      "Expected to become de facto global standard for sustainability reporting"
    ],
    reportingScope: {
      title: "IFRS S1 and S2 Requirements",
      items: [
        "IFRS S1: General sustainability-related financial disclosures",
        "IFRS S2: Climate-related disclosures (builds on TCFD)",
        "Industry-specific disclosure requirements (based on SASB)",
        "Scope 1, 2, and 3 GHG emissions disclosure",
        "Transition plans and climate resilience assessments"
      ]
    },
    frequency: "Annual reporting aligned with financial statements",
    keyDeadlines: [
      { date: "January 2024", description: "IFRS S1 and S2 effective date" },
      { date: "2024-2025", description: "Various jurisdictions adopting standards" },
      { date: "First year", description: "Scope 3 and comparatives relief available" }
    ],
    officialResources: [
      { name: "ISSB Official Website", url: "https://www.ifrs.org/groups/international-sustainability-standards-board/" },
      { name: "IFRS S1 Standard", url: "https://www.ifrs.org/issued-standards/ifrs-sustainability-standards-navigator/ifrs-s1-general-requirements/" },
      { name: "IFRS S2 Standard", url: "https://www.ifrs.org/issued-standards/ifrs-sustainability-standards-navigator/ifrs-s2-climate-related-disclosures/" }
    ],
    scopeBreakdown: {
      scope1: "Direct GHG emissions",
      scope2: "Indirect emissions from purchased energy",
      scope3: "All other indirect emissions (required, with first-year relief)"
    }
  }
];

export const getComplianceById = (id: string): ComplianceType | undefined => {
  return complianceTypes.find(c => c.id === id);
};

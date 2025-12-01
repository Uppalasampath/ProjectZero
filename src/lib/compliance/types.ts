/**
 * Type definitions for compliance report generation
 * Following government standards: CARB, EU CSRD, CDP, TCFD, ISSB, GHG Protocol
 */

export type FrameworkType = 'SB-253' | 'CSRD' | 'CDP' | 'TCFD' | 'ISSB';
export type ExportFormat = 'PDF' | 'XBRL' | 'EXCEL' | 'JSON';
export type EmissionScope = 1 | 2 | 3;
export type DataQuality = 'measured' | 'calculated' | 'estimated' | 'supplier-specific' | 'industry-average';

/**
 * Report section structure for each framework
 */
export interface ReportSection {
  id: string;
  title: string;
  description: string;
  estimatedPages: number;
  mandatory: boolean;
  subsections?: ReportSection[];
  validationRules?: ValidationRule[];
  regulatoryReferences?: string[];
}

/**
 * Validation rules for framework-specific requirements
 */
export interface ValidationRule {
  field: string;
  rule: 'required' | 'min' | 'max' | 'format' | 'custom';
  value?: any;
  message: string;
  validator?: (data: any) => boolean;
}

/**
 * Framework configuration
 */
export interface RegulatoryFramework {
  id: FrameworkType;
  name: string;
  fullName: string;
  jurisdiction: string;
  version: string;
  effectiveDate: string;
  sections: ReportSection[];
  requiredScopes: EmissionScope[];
  supportedExportFormats: ExportFormat[];
  regulatoryReferences: RegulatoryReference[];
  validationRules: ValidationRule[];
}

/**
 * Regulatory reference documentation
 */
export interface RegulatoryReference {
  name: string;
  version: string;
  url?: string;
  description: string;
}

/**
 * Activity data for emission calculations
 */
export interface ActivityData {
  scope: EmissionScope;
  category: string;
  subcategory?: string;
  activityAmount: number;
  activityUnit: string;
  timePeriod: {
    start: Date;
    end: Date;
  };
  dataQuality: DataQuality;
  source: string;
  location?: string;
  notes?: string;
}

/**
 * Emission factor from regulatory databases
 */
export interface EmissionFactor {
  id: string;
  name: string;
  source: 'EPA' | 'eGRID' | 'IPCC' | 'DEFRA' | 'IEA' | 'custom';
  version: string;
  scope: EmissionScope;
  category: string;
  factor: number; // kg CO2e per unit
  unit: string;
  gwp: 'AR5' | 'AR6'; // Global Warming Potential standard
  geography?: string;
  applicableYears: number[];
  lastUpdated: Date;
  uncertainty?: number; // percentage
  metadata?: Record<string, any>;
}

/**
 * Calculated emissions result
 */
export interface EmissionResult {
  scope: EmissionScope;
  category: string;
  subcategory?: string;
  activityData: ActivityData;
  emissionFactor: EmissionFactor;
  emissionAmount: number; // tons CO2e
  methodology: string;
  formula: string;
  calculatedAt: Date;
  dataQuality: DataQuality;
  uncertaintyRange?: {
    lower: number;
    upper: number;
  };
  traceability: {
    activityDataId: string;
    emissionFactorId: string;
    calculationMethod: string;
    reviewer?: string;
  };
}

/**
 * Scope 3 Category (15 categories per GHG Protocol)
 */
export type Scope3Category =
  | 'purchased_goods_services'
  | 'capital_goods'
  | 'fuel_energy_related'
  | 'upstream_transportation'
  | 'waste_generated'
  | 'business_travel'
  | 'employee_commuting'
  | 'upstream_leased_assets'
  | 'downstream_transportation'
  | 'processing_sold_products'
  | 'use_sold_products'
  | 'end_of_life'
  | 'downstream_leased_assets'
  | 'franchises'
  | 'investments';

/**
 * Complete emissions inventory
 */
export interface EmissionsInventory {
  reportingPeriod: {
    start: Date;
    end: Date;
  };
  organizationInfo: OrganizationInfo;
  scope1: EmissionResult[];
  scope2: {
    locationBased: EmissionResult[];
    marketBased: EmissionResult[];
  };
  scope3: {
    [K in Scope3Category]?: EmissionResult[];
  };
  totalScope1: number;
  totalScope2LocationBased: number;
  totalScope2MarketBased: number;
  totalScope3: number;
  grandTotal: number;
  yearOverYearComparison?: YearOverYearData;
  methodology: string;
  assuranceLevel?: 'none' | 'limited' | 'reasonable';
  verificationStatement?: string;
}

/**
 * Organization information
 */
export interface OrganizationInfo {
  legalName: string;
  tradingName?: string;
  registrationNumber: string;
  jurisdiction: string;
  headquarters: Address;
  fiscalYearEnd: string;
  industry: string;
  industryCode: string; // NAICS or NACE code
  numberOfEmployees: number;
  revenue: number;
  currency: string;
  consolidationApproach: 'equity-share' | 'financial-control' | 'operational-control';
  organizationalBoundary: string;
  reportingContacts: Contact[];
}

export interface Address {
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface Contact {
  name: string;
  title: string;
  email: string;
  phone?: string;
}

/**
 * Year-over-year comparison data
 */
export interface YearOverYearData {
  previousYear: {
    year: number;
    scope1: number;
    scope2: number;
    scope3: number;
    total: number;
  };
  currentYear: {
    year: number;
    scope1: number;
    scope2: number;
    scope3: number;
    total: number;
  };
  changes: {
    scope1: { absolute: number; percentage: number };
    scope2: { absolute: number; percentage: number };
    scope3: { absolute: number; percentage: number };
    total: { absolute: number; percentage: number };
  };
  explanationOfChanges: string;
}

/**
 * Report generation options
 */
export interface ReportGenerationOptions {
  framework: FrameworkType;
  exportFormat: ExportFormat;
  includeSections?: string[]; // Optional: specific section IDs to include
  excludeSections?: string[]; // Optional: specific section IDs to exclude
  includeAppendices: boolean;
  includeRawData: boolean;
  includeCharts: boolean;
  language: 'en' | 'es' | 'fr' | 'de';
  watermark?: string;
  confidentialityLevel?: 'public' | 'confidential' | 'internal';
}

/**
 * Generated report output
 */
export interface GeneratedReport {
  metadata: {
    framework: FrameworkType;
    generatedAt: Date;
    generatedBy: string;
    version: string;
    reportId: string;
  };
  content: {
    sections: RenderedSection[];
    totalPages: number;
  };
  exportFormat: ExportFormat;
  outputData: Blob | string; // Binary data for PDF/Excel, string for XBRL/JSON
  validationResults: ValidationResult[];
  completeness: number; // percentage
}

/**
 * Rendered section in final report
 */
export interface RenderedSection {
  id: string;
  title: string;
  content: string; // Markdown or HTML
  pageNumber: number;
  pageCount: number;
  subsections?: RenderedSection[];
}

/**
 * Validation result for compliance check
 */
export interface ValidationResult {
  field: string;
  rule: string;
  passed: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

/**
 * XBRL taxonomy tags (ESRS-compliant)
 */
export interface XBRLTag {
  namespace: string;
  element: string;
  value: string | number;
  context: string;
  unit?: string;
  decimals?: number;
  period?: {
    start: Date;
    end: Date;
  };
}

/**
 * Scenario analysis for TCFD reporting
 */
export interface ScenarioAnalysis {
  scenarioName: '1.5C' | '2C' | '3C';
  description: string;
  timeHorizon: number; // years
  assumptions: string[];
  physicalRisks: RiskAssessment[];
  transitionRisks: RiskAssessment[];
  opportunities: OpportunityAssessment[];
  financialImpact: {
    lower: number;
    expected: number;
    upper: number;
    currency: string;
  };
}

export interface RiskAssessment {
  category: string;
  description: string;
  likelihood: 'low' | 'medium' | 'high';
  magnitude: 'low' | 'medium' | 'high';
  timeframe: 'short' | 'medium' | 'long';
  mitigation: string;
}

export interface OpportunityAssessment {
  category: string;
  description: string;
  potential: 'low' | 'medium' | 'high';
  timeframe: 'short' | 'medium' | 'long';
  strategy: string;
}

/**
 * Double materiality assessment for CSRD
 */
export interface DoubleMaterialityAssessment {
  topic: string;
  impactMateriality: {
    score: number; // 1-5
    rationale: string;
    stakeholders: string[];
  };
  financialMateriality: {
    score: number; // 1-5
    rationale: string;
    timeHorizon: 'short' | 'medium' | 'long';
  };
  overallMateriality: 'material' | 'not-material';
  disclosureRequired: boolean;
}

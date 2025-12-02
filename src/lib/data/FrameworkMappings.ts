/**
 * FRAMEWORK MAPPING LAYER
 *
 * Convert unified data model into framework-specific structures
 * Supports: SB-253, CSRD, CDP, TCFD, ISSB S1/S2
 */

import { PrismaClient } from '@prisma/client';
import type {
  EmissionsInventory,
  OrganizationInfo,
  EmissionResult,
  FrameworkType,
  Scope3Category
} from '../compliance/types';

const prisma = new PrismaClient();

// ============================================================================
// UNIFIED TO FRAMEWORK CONVERTERS
// ============================================================================

/**
 * Map unified data to SB-253 format
 */
export async function mapToSB253(
  companyId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<EmissionsInventory> {
  // SB-253 requires:
  // - Scope 1, 2, 3 emissions
  // - Location-based and market-based Scope 2
  // - All 15 Scope 3 categories
  // - Third-party assurance

  const inventory = await buildBaseInventory(companyId, periodStart, periodEnd);

  // SB-253 specific validations
  const sb253Requirements = {
    scope1Required: true,
    scope2Required: true,
    scope3Required: true,
    assuranceRequired: true,
    gwpStandard: 'AR5' // CARB requires IPCC AR5
  };

  // Add SB-253-specific metadata
  return {
    ...inventory,
    methodology: 'GHG Protocol Corporate Accounting and Reporting Standard, in compliance with California SB-253 requirements'
  };
}

/**
 * Map unified data to CSRD (ESRS) format
 */
export async function mapToCSRD(
  companyId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<{
  emissions: EmissionsInventory;
  doubleMateriality: any;
  esrsE1: any;
  esrsE2ToE5: any;
  esrsS1ToS4: any;
  esrsG1: any;
}> {
  // CSRD requires comprehensive ESG disclosure beyond just emissions
  const emissions = await buildBaseInventory(companyId, periodStart, periodEnd);

  // Fetch double materiality assessment
  const materialityAssessment = await prisma.materialityAssessment.findFirst({
    where: {
      companyId,
      assessmentYear: periodStart.getFullYear()
    },
    include: {
      topics: true
    }
  });

  // Fetch additional CSRD-specific data
  const workforceData = await prisma.workforceData.findMany({
    where: {
      companyId,
      periodStart: { gte: periodStart },
      periodEnd: { lte: periodEnd }
    }
  });

  const financialData = await prisma.financialData.findFirst({
    where: {
      companyId,
      fiscalYear: periodStart.getFullYear()
    }
  });

  // ESRS E1: Climate Change
  const esrsE1 = {
    transitionPlan: {
      targets: await getClimateTargets(companyId),
      decarbonizationLevers: [],
      investmentPlan: {
        capex: financialData?.climateRelatedCapex,
        opex: financialData?.climateRelatedOpex
      }
    },
    ghgEmissions: emissions,
    energyConsumption: await getEnergyData(companyId, periodStart, periodEnd),
    carbonPricing: {
      internalCarbonPrice: null,
      exposureToETS: null
    }
  };

  // ESRS E2-E5: Pollution, Water, Biodiversity, Circular Economy
  const esrsE2ToE5 = {
    pollution: {}, // To be populated from additional data sources
    water: {},
    biodiversity: {},
    circularEconomy: {}
  };

  // ESRS S1-S4: Social topics
  const esrsS1ToS4 = {
    ownWorkforce: {
      totalEmployees: workforceData[0]?.totalEmployees || 0,
      demographics: {
        female: workforceData[0]?.femaleEmployees,
        male: workforceData[0]?.maleEmployees
      },
      safetyIncidents: workforceData.reduce((sum, d) => sum + (d.recordableIncidents || 0), 0)
    },
    valueChainWorkers: {},
    affectedCommunities: {},
    consumers: {}
  };

  // ESRS G1: Business Conduct
  const esrsG1 = {
    corporateCulture: {},
    whistleblowing: {},
    antiCorruption: {},
    politicalEngagement: {}
  };

  return {
    emissions,
    doubleMateriality: materialityAssessment,
    esrsE1,
    esrsE2ToE5,
    esrsS1ToS4,
    esrsG1
  };
}

/**
 * Map unified data to CDP format
 */
export async function mapToCDP(
  companyId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<{
  c0_introduction: any;
  c1_governance: any;
  c2_risks_opportunities: any;
  c3_strategy: any;
  c4_targets: any;
  c5_methodology: any;
  c6_emissions: EmissionsInventory;
  c7_energy: any;
  c8_metrics: any;
  c9_verification: any;
}> {
  const emissions = await buildBaseInventory(companyId, periodStart, periodEnd);
  const company = await prisma.company.findUnique({ where: { id: companyId } });

  if (!company) {
    throw new Error('Company not found');
  }

  // CDP questionnaire structure
  return {
    c0_introduction: {
      companyName: company.legalName,
      reportingBoundary: company.consolidationApproach,
      reportingYear: periodStart.getFullYear()
    },
    c1_governance: {
      boardOversight: null, // To be populated from governance data
      managementResponsibility: null
    },
    c2_risks_opportunities: {
      physicalRisks: [],
      transitionRisks: [],
      opportunities: []
    },
    c3_strategy: {
      climatRelatedStrategy: null,
      scenarioAnalysis: null
    },
    c4_targets: {
      emissionReductionTargets: await getClimateTargets(companyId),
      renewableEnergyTargets: null
    },
    c5_methodology: {
      baseYear: null,
      consolidationApproach: company.consolidationApproach,
      standards: ['GHG Protocol Corporate Standard']
    },
    c6_emissions: emissions,
    c7_energy: await getEnergyData(companyId, periodStart, periodEnd),
    c8_metrics: {
      emissionIntensity: emissions.grandTotal / company.revenue,
      energyIntensity: null
    },
    c9_verification: {
      assuranceLevel: emissions.assuranceLevel,
      verificationStatement: emissions.verificationStatement
    }
  };
}

/**
 * Map unified data to TCFD format
 */
export async function mapToTCFD(
  companyId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<{
  governance: any;
  strategy: any;
  riskManagement: any;
  metricsAndTargets: {
    emissions: EmissionsInventory;
    targets: any;
    metrics: any;
  };
}> {
  const emissions = await buildBaseInventory(companyId, periodStart, periodEnd);

  return {
    governance: {
      boardOversight: null,
      managementRole: null
    },
    strategy: {
      climateRisks: [],
      climateOpportunities: [],
      businessImpact: null,
      scenarioAnalysis: {
        scenarios: ['1.5C', '2C', '3C'],
        results: []
      }
    },
    riskManagement: {
      identificationProcess: null,
      assessmentProcess: null,
      ermIntegration: null
    },
    metricsAndTargets: {
      emissions,
      targets: await getClimateTargets(companyId),
      metrics: {
        emissionIntensity: emissions.grandTotal / (await getCompanyRevenue(companyId))
      }
    }
  };
}

/**
 * Map unified data to ISSB S1 & S2 format
 */
export async function mapToISSBS1S2(
  companyId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<{
  s1_generalSustainability: any;
  s2_climate: {
    governance: any;
    strategy: any;
    riskManagement: any;
    metricsAndTargets: {
      emissions: EmissionsInventory;
      targets: any;
    };
  };
  industryMetrics: any; // SASB-based
}> {
  const emissions = await buildBaseInventory(companyId, periodStart, periodEnd);
  const company = await prisma.company.findUnique({ where: { id: companyId } });

  return {
    s1_generalSustainability: {
      governance: null,
      strategy: null,
      riskManagement: null,
      metricsAndTargets: null
    },
    s2_climate: {
      governance: {
        boardOversight: null,
        managementRole: null
      },
      strategy: {
        transitionPlan: null,
        scenarioAnalysis: null,
        resilience: null
      },
      riskManagement: {
        identificationProcess: null,
        assessmentProcess: null,
        managementProcess: null
      },
      metricsAndTargets: {
        emissions,
        targets: await getClimateTargets(companyId)
      }
    },
    industryMetrics: await getSASBMetrics(companyId, company?.industryCode || '')
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Build base emissions inventory from database
 */
async function buildBaseInventory(
  companyId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<EmissionsInventory> {
  // Fetch company info
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: { contacts: true }
  });

  if (!company) {
    throw new Error('Company not found');
  }

  // Fetch calculated emissions
  const emissions = await prisma.calculatedEmission.findMany({
    where: {
      companyId,
      status: 'approved',
      calculatedAt: {
        gte: periodStart,
        lte: periodEnd
      }
    },
    include: {
      activityData: true,
      emissionFactor: true
    }
  });

  // Transform to EmissionResult format
  const emissionResults: EmissionResult[] = emissions.map(e => ({
    scope: e.scope as 1 | 2 | 3,
    category: e.category,
    subcategory: e.subcategory || undefined,
    activityData: {
      scope: e.activityData.scope as 1 | 2 | 3,
      category: e.activityData.category,
      subcategory: e.activityData.subcategory || undefined,
      activityAmount: Number(e.activityData.activityAmount),
      activityUnit: e.activityData.activityUnit,
      timePeriod: {
        start: e.activityData.periodStart,
        end: e.activityData.periodEnd
      },
      dataQuality: e.activityData.dataQuality as any,
      source: e.activityData.source,
      location: e.activityData.location || undefined,
      notes: e.activityData.notes || undefined
    },
    emissionFactor: {
      id: e.emissionFactor.factorId,
      name: e.emissionFactor.name,
      source: e.emissionFactor.source as any,
      version: e.emissionFactor.version,
      scope: e.emissionFactor.scope as 1 | 2 | 3,
      category: e.emissionFactor.category,
      factor: Number(e.emissionFactor.factor),
      unit: e.emissionFactor.unit,
      gwp: e.emissionFactor.gwp as 'AR5' | 'AR6',
      geography: e.emissionFactor.geography || undefined,
      applicableYears: e.emissionFactor.applicableYears,
      lastUpdated: e.emissionFactor.updatedAt,
      uncertainty: e.emissionFactor.uncertainty || undefined,
      metadata: e.emissionFactor.metadata as any
    },
    emissionAmount: Number(e.emissionAmount),
    methodology: e.methodology,
    formula: e.formula,
    calculatedAt: e.calculatedAt,
    dataQuality: e.dataQuality as any,
    uncertaintyRange: e.uncertaintyLower && e.uncertaintyUpper
      ? {
          lower: Number(e.uncertaintyLower),
          upper: Number(e.uncertaintyUpper)
        }
      : undefined,
    traceability: {
      activityDataId: e.activityDataId,
      emissionFactorId: e.emissionFactorId,
      calculationMethod: e.calculationMethod,
      reviewer: e.reviewedBy || undefined
    }
  }));

  // Separate by scope
  const scope1 = emissionResults.filter(e => e.scope === 1);
  const scope2Location = emissionResults.filter(e => e.scope === 2 && e.category.includes('location'));
  const scope2Market = emissionResults.filter(e => e.scope === 2 && (!e.category.includes('location') || e.category.includes('market')));
  const scope3 = emissionResults.filter(e => e.scope === 3);

  // Group Scope 3 by category
  const scope3ByCategory: Partial<Record<Scope3Category, EmissionResult[]>> = {};
  for (const emission of scope3) {
    const cat = emission.category as Scope3Category;
    if (!scope3ByCategory[cat]) {
      scope3ByCategory[cat] = [];
    }
    scope3ByCategory[cat]!.push(emission);
  }

  // Calculate totals
  const totalScope1 = scope1.reduce((sum, e) => sum + e.emissionAmount, 0);
  const totalScope2Location = scope2Location.reduce((sum, e) => sum + e.emissionAmount, 0);
  const totalScope2Market = scope2Market.reduce((sum, e) => sum + e.emissionAmount, 0);
  const totalScope3 = scope3.reduce((sum, e) => sum + e.emissionAmount, 0);
  const grandTotal = totalScope1 + totalScope2Market + totalScope3;

  // Build organization info
  const orgInfo: OrganizationInfo = {
    legalName: company.legalName,
    tradingName: company.tradingName || undefined,
    registrationNumber: company.registrationNumber,
    jurisdiction: company.jurisdiction,
    headquarters: {
      street: company.street,
      city: company.city,
      state: company.state || undefined,
      postalCode: company.postalCode,
      country: company.country
    },
    fiscalYearEnd: company.fiscalYearEnd,
    industry: company.industry,
    industryCode: company.industryCode,
    numberOfEmployees: company.numberOfEmployees,
    revenue: Number(company.revenue),
    currency: company.currency,
    consolidationApproach: company.consolidationApproach as any,
    organizationalBoundary: company.organizationalBoundary,
    reportingContacts: company.contacts.map(c => ({
      name: c.name,
      title: c.title,
      email: c.email,
      phone: c.phone || undefined
    }))
  };

  // Get assurance status
  const assurance = await prisma.assuranceStatus.findFirst({
    where: {
      companyId,
      periodStart: { lte: periodEnd },
      periodEnd: { gte: periodStart }
    },
    orderBy: { createdAt: 'desc' }
  });

  return {
    reportingPeriod: {
      start: periodStart,
      end: periodEnd
    },
    organizationInfo: orgInfo,
    scope1,
    scope2: {
      locationBased: scope2Location,
      marketBased: scope2Market
    },
    scope3: scope3ByCategory,
    totalScope1,
    totalScope2LocationBased: totalScope2Location,
    totalScope2MarketBased: totalScope2Market,
    totalScope3,
    grandTotal,
    methodology: 'GHG Protocol Corporate Standard',
    assuranceLevel: (assurance?.assuranceLevel as any) || 'none',
    verificationStatement: assurance?.statementUrl || undefined
  };
}

/**
 * Get climate targets for company
 */
async function getClimateTargets(companyId: string): Promise<any[]> {
  // In production, this would fetch from a targets table
  // For now, return empty array - to be implemented
  return [];
}

/**
 * Get energy data for company
 */
async function getEnergyData(
  companyId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<any> {
  // Fetch electricity and energy-related activity data
  const energyData = await prisma.activityData.findMany({
    where: {
      companyId,
      scope: 2,
      category: { contains: 'electricity' },
      periodStart: { gte: periodStart },
      periodEnd: { lte: periodEnd }
    }
  });

  const totalElectricity = energyData.reduce(
    (sum, d) => sum + Number(d.activityAmount),
    0
  );

  return {
    totalElectricityMWh: totalElectricity,
    renewablePercentage: 0, // To be calculated from renewable energy certificates
    totalEnergy: totalElectricity // Simplified - would include other energy sources
  };
}

/**
 * Get company revenue
 */
async function getCompanyRevenue(companyId: string): Promise<number> {
  const company = await prisma.company.findUnique({
    where: { id: companyId }
  });
  return Number(company?.revenue || 1); // Avoid division by zero
}

/**
 * Get SASB industry-specific metrics
 */
async function getSASBMetrics(companyId: string, industryCode: string): Promise<any> {
  // SASB metrics vary by industry
  // This would be populated based on the company's NAICS/NACE code
  // For now, return placeholder
  return {
    industryCode,
    metrics: []
  };
}

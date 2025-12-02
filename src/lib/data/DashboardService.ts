/**
 * DASHBOARD DATA SERVICE
 *
 * Provides aggregated data for real-time dashboards
 * Auto-refreshes when underlying data changes
 */

import { PrismaClient } from '@prisma/client';
import type { FrameworkType } from '../compliance/types';

const prisma = new PrismaClient();

// ============================================================================
// DASHBOARD: CARBON EMISSIONS
// ============================================================================

export interface CarbonEmissionsDashboard {
  companyId: string;
  periodStart: Date;
  periodEnd: Date;
  summary: {
    totalEmissions: number;
    scope1: number;
    scope2Location: number;
    scope2Market: number;
    scope3: number;
    yoyChange?: {
      absolute: number;
      percentage: number;
    };
  };
  scopeBreakdown: {
    scope: number;
    category: string;
    emissions: number;
    percentage: number;
    dataQuality: string;
  }[];
  facilityBreakdown: {
    facilityId: string;
    facilityName: string;
    emissions: number;
    percentage: number;
  }[];
  timeSeries: {
    month: string;
    scope1: number;
    scope2: number;
    scope3: number;
    total: number;
  }[];
  emissionIntensity: {
    perRevenue: number; // tons CO2e per million USD
    perEmployee: number; // tons CO2e per employee
    perFloorArea: number; // tons CO2e per sqm
  };
}

export async function getCarbonEmissionsDashboard(
  companyId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<CarbonEmissionsDashboard> {
  // Fetch all approved emissions for period
  const emissions = await prisma.calculatedEmission.findMany({
    where: {
      companyId,
      status: 'approved',
      calculatedAt: { gte: periodStart, lte: periodEnd }
    },
    include: {
      facility: true
    }
  });

  // Calculate totals
  const scope1 = emissions
    .filter(e => e.scope === 1)
    .reduce((sum, e) => sum + Number(e.emissionAmount), 0);

  const scope2Location = emissions
    .filter(e => e.scope === 2 && e.category.includes('location'))
    .reduce((sum, e) => sum + Number(e.emissionAmount), 0);

  const scope2Market = emissions
    .filter(e => e.scope === 2 && !e.category.includes('location'))
    .reduce((sum, e) => sum + Number(e.emissionAmount), 0);

  const scope3 = emissions
    .filter(e => e.scope === 3)
    .reduce((sum, e) => sum + Number(e.emissionAmount), 0);

  const totalEmissions = scope1 + scope2Market + scope3;

  // Scope breakdown
  const scopeMap = new Map<string, { emissions: number; dataQuality: string }>();
  for (const emission of emissions) {
    const key = `${emission.scope}-${emission.category}`;
    const existing = scopeMap.get(key) || { emissions: 0, dataQuality: emission.dataQuality };
    scopeMap.set(key, {
      emissions: existing.emissions + Number(emission.emissionAmount),
      dataQuality: emission.dataQuality
    });
  }

  const scopeBreakdown = Array.from(scopeMap.entries()).map(([key, data]) => {
    const [scope, category] = key.split('-');
    return {
      scope: Number(scope),
      category,
      emissions: data.emissions,
      percentage: (data.emissions / totalEmissions) * 100,
      dataQuality: data.dataQuality
    };
  }).sort((a, b) => b.emissions - a.emissions);

  // Facility breakdown
  const facilityMap = new Map<string, { name: string; emissions: number }>();
  for (const emission of emissions) {
    if (!emission.facilityId) continue;
    const existing = facilityMap.get(emission.facilityId) || {
      name: emission.facility?.name || 'Unknown',
      emissions: 0
    };
    facilityMap.set(emission.facilityId, {
      name: existing.name,
      emissions: existing.emissions + Number(emission.emissionAmount)
    });
  }

  const facilityBreakdown = Array.from(facilityMap.entries()).map(([facilityId, data]) => ({
    facilityId,
    facilityName: data.name,
    emissions: data.emissions,
    percentage: (data.emissions / totalEmissions) * 100
  })).sort((a, b) => b.emissions - a.emissions);

  // Time series (monthly)
  const timeSeries = await getMonthlyTimeSeries(companyId, periodStart, periodEnd);

  // Get company info for intensity calculations
  const company = await prisma.company.findUnique({
    where: { id: companyId }
  });

  const workforce = await prisma.workforceData.findFirst({
    where: {
      companyId,
      periodStart: { gte: periodStart },
      periodEnd: { lte: periodEnd }
    },
    orderBy: { periodStart: 'desc' }
  });

  const facilities = await prisma.facility.findMany({
    where: { companyId }
  });

  const totalFloorArea = facilities.reduce((sum, f) => sum + Number(f.floorArea || 0), 0);

  const emissionIntensity = {
    perRevenue: company ? (totalEmissions / Number(company.revenue)) * 1000000 : 0,
    perEmployee: workforce ? totalEmissions / workforce.totalEmployees : 0,
    perFloorArea: totalFloorArea > 0 ? totalEmissions / totalFloorArea : 0
  };

  return {
    companyId,
    periodStart,
    periodEnd,
    summary: {
      totalEmissions,
      scope1,
      scope2Location,
      scope2Market,
      scope3
    },
    scopeBreakdown,
    facilityBreakdown,
    timeSeries,
    emissionIntensity
  };
}

// ============================================================================
// DASHBOARD: CSRD MATERIALITY
// ============================================================================

export interface CSRDMaterialityDashboard {
  companyId: string;
  assessmentYear: number;
  materialityMatrix: {
    topic: string;
    topicCode: string;
    category: 'Environmental' | 'Social' | 'Governance';
    impactScore: number;
    financialScore: number;
    isMaterial: boolean;
    disclosureRequired: boolean;
  }[];
  esrsStatus: {
    standard: string;
    applicable: boolean;
    completeness: number;
    missingDataPoints: string[];
  }[];
}

export async function getCSRDMaterialityDashboard(
  companyId: string,
  assessmentYear: number
): Promise<CSRDMaterialityDashboard> {
  const assessment = await prisma.materialityAssessment.findFirst({
    where: { companyId, assessmentYear },
    include: { topics: true },
    orderBy: { assessmentDate: 'desc' }
  });

  if (!assessment) {
    return {
      companyId,
      assessmentYear,
      materialityMatrix: [],
      esrsStatus: []
    };
  }

  const materialityMatrix = assessment.topics.map(topic => ({
    topic: topic.topicName,
    topicCode: topic.topicCode || '',
    category: topic.category as any,
    impactScore: topic.impactScore,
    financialScore: topic.financialScore,
    isMaterial: topic.overallMateriality === 'material',
    disclosureRequired: topic.disclosureRequired
  }));

  // ESRS standards status
  const esrsStandards = ['E1', 'E2', 'E3', 'E4', 'E5', 'S1', 'S2', 'S3', 'S4', 'G1'];
  const esrsStatus = esrsStandards.map(standard => ({
    standard: `ESRS ${standard}`,
    applicable: materialityMatrix.some(
      m => m.isMaterial && m.topicCode?.startsWith(standard)
    ),
    completeness: 0, // To be calculated based on data availability
    missingDataPoints: []
  }));

  return {
    companyId,
    assessmentYear,
    materialityMatrix,
    esrsStatus
  };
}

// ============================================================================
// DASHBOARD: COMPLIANCE READINESS
// ============================================================================

export interface ComplianceReadinessDashboard {
  companyId: string;
  frameworks: {
    frameworkId: string;
    name: string;
    applicableTo: string;
    deadlineDate?: Date;
    readinessScore: number; // 0-100
    status: 'not_started' | 'in_progress' | 'ready' | 'submitted';
    missingRequirements: string[];
    latestReport?: {
      reportId: string;
      generatedAt: Date;
      completeness: number;
      validationStatus: string;
    };
  }[];
  overallReadiness: number;
  criticalGaps: string[];
}

export async function getComplianceReadinessDashboard(
  companyId: string
): Promise<ComplianceReadinessDashboard> {
  const company = await prisma.company.findUnique({
    where: { id: companyId }
  });

  if (!company) {
    throw new Error('Company not found');
  }

  // Check which frameworks apply
  const applicableFrameworks = determineApplicableFrameworks(company);

  const frameworks = await Promise.all(
    applicableFrameworks.map(async fw => {
      // Get latest report for this framework
      const latestReport = await prisma.generatedReport.findFirst({
        where: { companyId, frameworkId: fw.id },
        orderBy: { generatedAt: 'desc' }
      });

      // Calculate readiness
      const readiness = await calculateFrameworkReadiness(companyId, fw.id);

      return {
        frameworkId: fw.id,
        name: fw.name,
        applicableTo: fw.applicableTo,
        deadlineDate: fw.deadline,
        readinessScore: readiness.score,
        status: readiness.status,
        missingRequirements: readiness.missingRequirements,
        latestReport: latestReport
          ? {
              reportId: latestReport.id,
              generatedAt: latestReport.generatedAt,
              completeness: Number(latestReport.completeness),
              validationStatus: latestReport.validationStatus
            }
          : undefined
      };
    })
  );

  const overallReadiness =
    frameworks.reduce((sum, fw) => sum + fw.readinessScore, 0) / frameworks.length;

  const criticalGaps = frameworks
    .flatMap(fw => fw.missingRequirements)
    .filter((gap, index, self) => self.indexOf(gap) === index);

  return {
    companyId,
    frameworks,
    overallReadiness,
    criticalGaps
  };
}

// ============================================================================
// DASHBOARD: SUPPLY CHAIN FOOTPRINT
// ============================================================================

export interface SupplyChainDashboard {
  companyId: string;
  periodStart: Date;
  periodEnd: Date;
  totalSuppliers: number;
  totalScope3Emissions: number;
  scope3Breakdown: {
    category: string;
    emissions: number;
    percentage: number;
    dataQuality: string;
  }[];
  topSuppliers: {
    supplierName: string;
    category: string;
    annualSpend: number;
    emissions: number;
    emissionIntensity: number;
    hasSetSBT: boolean;
    cdpScore?: string;
  }[];
  engagementMetrics: {
    suppliersWithSBT: number;
    suppliersWithSBTPercentage: number;
    cdpResponders: number;
    cdpRespondersPercentage: number;
  };
}

export async function getSupplyChainDashboard(
  companyId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<SupplyChainDashboard> {
  const suppliers = await prisma.supplyChainData.findMany({
    where: {
      companyId,
      periodStart: { gte: periodStart },
      periodEnd: { lte: periodEnd }
    }
  });

  const scope3Emissions = await prisma.calculatedEmission.findMany({
    where: {
      companyId,
      scope: 3,
      status: 'approved',
      calculatedAt: { gte: periodStart, lte: periodEnd }
    }
  });

  const totalScope3 = scope3Emissions.reduce(
    (sum, e) => sum + Number(e.emissionAmount),
    0
  );

  // Scope 3 breakdown
  const categoryMap = new Map<string, { emissions: number; dataQuality: string }>();
  for (const emission of scope3Emissions) {
    const existing = categoryMap.get(emission.category) || {
      emissions: 0,
      dataQuality: emission.dataQuality
    };
    categoryMap.set(emission.category, {
      emissions: existing.emissions + Number(emission.emissionAmount),
      dataQuality: emission.dataQuality
    });
  }

  const scope3Breakdown = Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    emissions: data.emissions,
    percentage: (data.emissions / totalScope3) * 100,
    dataQuality: data.dataQuality
  }));

  // Top suppliers
  const topSuppliers = suppliers
    .sort((a, b) => Number(b.supplierEmissions || 0) - Number(a.supplierEmissions || 0))
    .slice(0, 10)
    .map(s => ({
      supplierName: s.supplierName,
      category: s.supplierCategory,
      annualSpend: Number(s.annualSpend || 0),
      emissions: Number(s.supplierEmissions || 0),
      emissionIntensity: Number(s.emissionIntensity || 0),
      hasSetSBT: s.hasSetSbt,
      cdpScore: s.cdpScore || undefined
    }));

  // Engagement metrics
  const suppliersWithSBT = suppliers.filter(s => s.hasSetSbt).length;
  const cdpResponders = suppliers.filter(s => s.cdpScore).length;

  return {
    companyId,
    periodStart,
    periodEnd,
    totalSuppliers: suppliers.length,
    totalScope3Emissions: totalScope3,
    scope3Breakdown,
    topSuppliers,
    engagementMetrics: {
      suppliersWithSBT,
      suppliersWithSBTPercentage: (suppliersWithSBT / suppliers.length) * 100,
      cdpResponders,
      cdpRespondersPercentage: (cdpResponders / suppliers.length) * 100
    }
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function getMonthlyTimeSeries(
  companyId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<Array<{ month: string; scope1: number; scope2: number; scope3: number; total: number }>> {
  const emissions = await prisma.calculatedEmission.findMany({
    where: {
      companyId,
      status: 'approved',
      calculatedAt: { gte: periodStart, lte: periodEnd }
    },
    include: { activityData: true }
  });

  const monthlyData = new Map<string, { scope1: number; scope2: number; scope3: number }>();

  for (const emission of emissions) {
    const month = emission.activityData.periodStart.toISOString().substring(0, 7); // YYYY-MM
    const existing = monthlyData.get(month) || { scope1: 0, scope2: 0, scope3: 0 };

    if (emission.scope === 1) existing.scope1 += Number(emission.emissionAmount);
    else if (emission.scope === 2) existing.scope2 += Number(emission.emissionAmount);
    else if (emission.scope === 3) existing.scope3 += Number(emission.emissionAmount);

    monthlyData.set(month, existing);
  }

  return Array.from(monthlyData.entries())
    .map(([month, data]) => ({
      month,
      scope1: data.scope1,
      scope2: data.scope2,
      scope3: data.scope3,
      total: data.scope1 + data.scope2 + data.scope3
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

function determineApplicableFrameworks(company: any): Array<{
  id: FrameworkType;
  name: string;
  applicableTo: string;
  deadline?: Date;
}> {
  const frameworks: Array<{
    id: FrameworkType;
    name: string;
    applicableTo: string;
    deadline?: Date;
  }> = [];

  // SB-253: California companies with > $1B revenue
  if (
    company.country === 'United States' &&
    company.state === 'California' &&
    Number(company.revenue) > 1000000000
  ) {
    frameworks.push({
      id: 'SB-253',
      name: 'California SB-253',
      applicableTo: 'CA companies > $1B revenue',
      deadline: new Date('2026-06-01') // Scope 1 & 2 deadline
    });
  }

  // CSRD: EU companies or large companies operating in EU
  if (company.country && ['France', 'Germany', 'Netherlands', 'Spain', 'Italy'].includes(company.country)) {
    frameworks.push({
      id: 'CSRD',
      name: 'EU CSRD (ESRS)',
      applicableTo: 'EU companies',
      deadline: new Date('2025-01-01')
    });
  }

  // CDP: Any company can report
  frameworks.push({
    id: 'CDP',
    name: 'CDP Climate Change',
    applicableTo: 'Voluntary disclosure',
    deadline: undefined
  });

  // TCFD: Recommended for public companies
  frameworks.push({
    id: 'TCFD',
    name: 'TCFD',
    applicableTo: 'Public companies',
    deadline: undefined
  });

  // ISSB: Global standard
  frameworks.push({
    id: 'ISSB',
    name: 'ISSB S1 & S2',
    applicableTo: 'Global standard',
    deadline: new Date('2024-01-01')
  });

  return frameworks;
}

async function calculateFrameworkReadiness(
  companyId: string,
  frameworkId: FrameworkType
): Promise<{
  score: number;
  status: 'not_started' | 'in_progress' | 'ready' | 'submitted';
  missingRequirements: string[];
}> {
  const emissions = await prisma.calculatedEmission.findMany({
    where: { companyId, status: 'approved' }
  });

  const hasScope1 = emissions.some(e => e.scope === 1);
  const hasScope2 = emissions.some(e => e.scope === 2);
  const hasScope3 = emissions.some(e => e.scope === 3);

  const assurance = await prisma.assuranceStatus.findFirst({
    where: { companyId },
    orderBy: { createdAt: 'desc' }
  });

  const missingRequirements: string[] = [];
  let score = 0;

  // Framework-specific requirements
  switch (frameworkId) {
    case 'SB-253':
      if (!hasScope1) missingRequirements.push('Scope 1 emissions data');
      else score += 25;
      if (!hasScope2) missingRequirements.push('Scope 2 emissions data (location and market-based)');
      else score += 25;
      if (!hasScope3) missingRequirements.push('Scope 3 emissions data (all 15 categories)');
      else score += 25;
      if (!assurance || assurance.assuranceLevel === 'none')
        missingRequirements.push('Third-party assurance');
      else score += 25;
      break;

    case 'CSRD':
      if (!hasScope1) missingRequirements.push('Scope 1 emissions');
      else score += 20;
      if (!hasScope2) missingRequirements.push('Scope 2 emissions');
      else score += 20;
      if (!hasScope3) missingRequirements.push('Scope 3 emissions');
      else score += 20;

      const materiality = await prisma.materialityAssessment.findFirst({
        where: { companyId }
      });
      if (!materiality) missingRequirements.push('Double materiality assessment');
      else score += 20;

      const workforce = await prisma.workforceData.findFirst({
        where: { companyId }
      });
      if (!workforce) missingRequirements.push('Workforce data (ESRS S1)');
      else score += 20;
      break;

    // Add other frameworks...
    default:
      if (!hasScope1) missingRequirements.push('Scope 1 emissions');
      else score += 33;
      if (!hasScope2) missingRequirements.push('Scope 2 emissions');
      else score += 33;
      if (!hasScope3) missingRequirements.push('Scope 3 emissions');
      else score += 34;
  }

  let status: 'not_started' | 'in_progress' | 'ready' | 'submitted' = 'not_started';
  if (score === 0) status = 'not_started';
  else if (score < 80) status = 'in_progress';
  else status = 'ready';

  // Check if already submitted
  const submittedReport = await prisma.generatedReport.findFirst({
    where: {
      companyId,
      frameworkId,
      status: 'submitted'
    }
  });
  if (submittedReport) status = 'submitted';

  return { score, status, missingRequirements };
}

/**
 * Update all dashboards for a company (called by event system)
 */
export async function updateAllDashboards(companyId: string): Promise<void> {
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);

  // Refresh all dashboards (in production, these would update cache)
  await getCarbonEmissionsDashboard(companyId, yearStart, now);
  await getCSRDMaterialityDashboard(companyId, now.getFullYear());
  await getComplianceReadinessDashboard(companyId);
  await getSupplyChainDashboard(companyId, yearStart, now);

  console.log(`[Dashboard] Updated all dashboards for company ${companyId}`);
}

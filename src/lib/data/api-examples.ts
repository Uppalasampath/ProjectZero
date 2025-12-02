/**
 * API ROUTE EXAMPLES
 *
 * Complete examples for Next.js API routes integration
 * Copy these to your app/api/ directory
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import {
  ingestFromCSV,
  ingestFromAPI,
  ingestManualEntry,
  calculateEmissionsForActivity,
  recalculateAllEmissions
} from './ProjectZeroDataFlow';
import {
  getCarbonEmissionsDashboard,
  getCSRDMaterialityDashboard,
  getComplianceReadinessDashboard,
  getSupplyChainDashboard
} from './DashboardService';
import {
  mapToSB253,
  mapToCSRD,
  mapToCDP,
  mapToTCFD,
  mapToISSBS1S2
} from './FrameworkMappings';
import { generateComplianceReport } from '../compliance/reportGenerator';
import { emitReportRequested } from './EventSystem';

const prisma = new PrismaClient();

// ============================================================================
// ACTIVITY DATA ENDPOINTS
// ============================================================================

/**
 * POST /api/activity-data
 * Create new activity data entry
 */
export async function createActivityData(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, activityData, userId } = body;

    const result = await ingestManualEntry(activityData, {
      sourceType: 'manual',
      sourceId: 'web-ui',
      companyId,
      metadata: { userId }
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      activityDataId: result.activityDataId
    });

  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

/**
 * POST /api/activity-data/upload
 * Upload CSV/Excel file
 */
export async function uploadActivityData(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const companyId = formData.get('companyId') as string;
    const userId = formData.get('userId') as string;

    const result = await ingestFromCSV(file, {
      sourceType: 'csv',
      sourceId: 'file-upload',
      companyId,
      metadata: { uploadedBy: userId }
    });

    return NextResponse.json({
      success: result.success,
      recordsProcessed: result.recordsProcessed,
      recordsAccepted: result.recordsAccepted,
      recordsRejected: result.recordsRejected,
      errors: result.errors.slice(0, 10), // First 10 errors
      batchId: result.batchId
    });

  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

/**
 * GET /api/activity-data
 * List activity data with filters
 */
export async function listActivityData(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId')!;
    const scope = searchParams.get('scope');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = { companyId };
    if (scope) where.scope = parseInt(scope);
    if (category) where.category = category;

    const [data, total] = await Promise.all([
      prisma.activityData.findMany({
        where,
        include: { facility: true },
        orderBy: { periodStart: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.activityData.count({ where })
    ]);

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/activity-data/:id
 * Delete activity data
 */
export async function deleteActivityData(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if emissions exist for this activity data
    const emissions = await prisma.calculatedEmission.findMany({
      where: { activityDataId: params.id }
    });

    if (emissions.length > 0) {
      // Archive emissions first
      await prisma.calculatedEmission.updateMany({
        where: { activityDataId: params.id },
        data: { status: 'archived' }
      });
    }

    await prisma.activityData.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

// ============================================================================
// EMISSIONS CALCULATION ENDPOINTS
// ============================================================================

/**
 * POST /api/emissions/calculate
 * Calculate emissions for activity data
 */
export async function calculateEmissions(request: NextRequest) {
  try {
    const { activityDataId, userId } = await request.json();

    const result = await calculateEmissionsForActivity(activityDataId, {
      autoApprove: false,
      calculatedBy: userId
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      emissionId: result.emissionId,
      emissionAmount: result.emissionAmount
    });

  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

/**
 * POST /api/emissions/recalculate
 * Recalculate all emissions for a company
 */
export async function recalculateEmissions(request: NextRequest) {
  try {
    const { companyId, scope, periodStart, periodEnd } = await request.json();

    const result = await recalculateAllEmissions(companyId, {
      scope: scope ? parseInt(scope) : undefined,
      periodStart: periodStart ? new Date(periodStart) : undefined,
      periodEnd: periodEnd ? new Date(periodEnd) : undefined
    });

    return NextResponse.json({
      success: result.success,
      recalculated: result.recalculated,
      failed: result.failed
    });

  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

/**
 * GET /api/emissions
 * List calculated emissions
 */
export async function listEmissions(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId')!;
    const scope = searchParams.get('scope');
    const status = searchParams.get('status') || 'approved';

    const where: any = { companyId, status };
    if (scope) where.scope = parseInt(scope);

    const emissions = await prisma.calculatedEmission.findMany({
      where,
      include: {
        activityData: true,
        emissionFactor: true,
        facility: true
      },
      orderBy: { calculatedAt: 'desc' },
      take: 100
    });

    const summary = {
      totalScope1: emissions
        .filter(e => e.scope === 1)
        .reduce((sum, e) => sum + Number(e.emissionAmount), 0),
      totalScope2: emissions
        .filter(e => e.scope === 2)
        .reduce((sum, e) => sum + Number(e.emissionAmount), 0),
      totalScope3: emissions
        .filter(e => e.scope === 3)
        .reduce((sum, e) => sum + Number(e.emissionAmount), 0)
    };

    return NextResponse.json({
      emissions,
      summary: {
        ...summary,
        total: summary.totalScope1 + summary.totalScope2 + summary.totalScope3
      }
    });

  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

// ============================================================================
// DASHBOARD ENDPOINTS
// ============================================================================

/**
 * GET /api/dashboards/carbon
 * Get carbon emissions dashboard
 */
export async function getCarbonDashboard(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId')!;
    const start = new Date(searchParams.get('start') || new Date().getFullYear() + '-01-01');
    const end = new Date(searchParams.get('end') || new Date().toISOString());

    const dashboard = await getCarbonEmissionsDashboard(companyId, start, end);

    return NextResponse.json(dashboard);

  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

/**
 * GET /api/dashboards/materiality
 * Get CSRD materiality dashboard
 */
export async function getMaterialityDashboard(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId')!;
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

    const dashboard = await getCSRDMaterialityDashboard(companyId, year);

    return NextResponse.json(dashboard);

  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

/**
 * GET /api/dashboards/compliance
 * Get compliance readiness dashboard
 */
export async function getComplianceDashboard(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId')!;

    const dashboard = await getComplianceReadinessDashboard(companyId);

    return NextResponse.json(dashboard);

  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

/**
 * GET /api/dashboards/supply-chain
 * Get supply chain footprint dashboard
 */
export async function getSupplyChainDashboard_API(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId')!;
    const start = new Date(searchParams.get('start') || new Date().getFullYear() + '-01-01');
    const end = new Date(searchParams.get('end') || new Date().toISOString());

    const dashboard = await getSupplyChainDashboard(companyId, start, end);

    return NextResponse.json(dashboard);

  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

// ============================================================================
// REPORT GENERATION ENDPOINTS
// ============================================================================

/**
 * POST /api/reports/generate
 * Generate compliance report
 */
export async function generateReport(request: NextRequest) {
  try {
    const {
      companyId,
      frameworkId,
      periodStart,
      periodEnd,
      exportFormat,
      userId
    } = await request.json();

    // Emit event to start generation
    emitReportRequested({
      companyId,
      frameworkId,
      periodStart: new Date(periodStart),
      periodEnd: new Date(periodEnd),
      requestedBy: userId
    });

    // Map data to framework
    let emissionsData;
    switch (frameworkId) {
      case 'SB-253':
        emissionsData = await mapToSB253(companyId, new Date(periodStart), new Date(periodEnd));
        break;
      case 'CSRD':
        const csrdData = await mapToCSRD(companyId, new Date(periodStart), new Date(periodEnd));
        emissionsData = csrdData.emissions;
        break;
      case 'CDP':
        const cdpData = await mapToCDP(companyId, new Date(periodStart), new Date(periodEnd));
        emissionsData = cdpData.c6_emissions;
        break;
      case 'TCFD':
        const tcfdData = await mapToTCFD(companyId, new Date(periodStart), new Date(periodEnd));
        emissionsData = tcfdData.metricsAndTargets.emissions;
        break;
      case 'ISSB':
        const issbData = await mapToISSBS1S2(companyId, new Date(periodStart), new Date(periodEnd));
        emissionsData = issbData.s2_climate.metricsAndTargets.emissions;
        break;
      default:
        throw new Error(`Unknown framework: ${frameworkId}`);
    }

    // Generate report
    const report = await generateComplianceReport(
      emissionsData,
      frameworkId,
      exportFormat || 'PDF'
    );

    // Store in database
    const storedReport = await prisma.generatedReport.create({
      data: {
        companyId,
        frameworkId,
        frameworkVersion: '2024',
        reportName: `${frameworkId} Report ${new Date(periodStart).getFullYear()}`,
        reportPeriodStart: new Date(periodStart),
        reportPeriodEnd: new Date(periodEnd),
        reportingYear: new Date(periodStart).getFullYear(),
        exportFormat: exportFormat || 'PDF',
        completeness: report.completeness,
        validationResults: report.validationResults,
        validationStatus: report.validationResults.every(r => r.passed) ? 'passed' : 'failed',
        status: 'draft',
        generatedBy: userId
      }
    });

    return NextResponse.json({
      success: true,
      reportId: storedReport.id,
      completeness: report.completeness,
      validationResults: report.validationResults
    });

  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

/**
 * GET /api/reports
 * List generated reports
 */
export async function listReports(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId')!;
    const frameworkId = searchParams.get('frameworkId');
    const status = searchParams.get('status');

    const where: any = { companyId };
    if (frameworkId) where.frameworkId = frameworkId;
    if (status) where.status = status;

    const reports = await prisma.generatedReport.findMany({
      where,
      orderBy: { generatedAt: 'desc' },
      take: 50
    });

    return NextResponse.json({ reports });

  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

// ============================================================================
// AUDIT LOG ENDPOINTS
// ============================================================================

/**
 * GET /api/audit-logs
 * Get audit logs with filtering
 */
export async function getAuditLogs(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');
    const limit = parseInt(searchParams.get('limit') || '100');

    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit
    });

    return NextResponse.json({ logs });

  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

// ============================================================================
// USAGE EXAMPLE IN NEXT.JS APP ROUTER
// ============================================================================

/*
// app/api/activity-data/route.ts
import { createActivityData, listActivityData } from '@/lib/data/api-examples';

export const POST = createActivityData;
export const GET = listActivityData;

// app/api/activity-data/[id]/route.ts
import { deleteActivityData } from '@/lib/data/api-examples';

export const DELETE = deleteActivityData;

// app/api/emissions/calculate/route.ts
import { calculateEmissions } from '@/lib/data/api-examples';

export const POST = calculateEmissions;

// app/api/dashboards/carbon/route.ts
import { getCarbonDashboard } from '@/lib/data/api-examples';

export const GET = getCarbonDashboard;

// app/api/reports/generate/route.ts
import { generateReport } from '@/lib/data/api-examples';

export const POST = generateReport;
*/

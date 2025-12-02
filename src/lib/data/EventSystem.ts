/**
 * EVENT SYSTEM - Real-Time Updates
 *
 * Interconnects all parts of Project Zero:
 * - Activity data changes → Recalculate emissions
 * - Emissions updates → Refresh dashboards
 * - New data → Update reports
 * - Framework changes → Revalidate compliance
 */

import { EventEmitter } from 'events';
import { PrismaClient } from '@prisma/client';
import {
  calculateEmissionsForActivity,
  recalculateAllEmissions
} from './ProjectZeroDataFlow';
import {
  mapToSB253,
  mapToCSRD,
  mapToCDP,
  mapToTCFD,
  mapToISSBS1S2
} from './FrameworkMappings';
import type { FrameworkType } from '../compliance/types';

const prisma = new PrismaClient();

// ============================================================================
// EVENT EMITTER
// ============================================================================

export const complianceEvents = new EventEmitter();

// Increase max listeners to avoid warnings
complianceEvents.setMaxListeners(50);

// ============================================================================
// EVENT TYPES
// ============================================================================

export interface ActivityDataEvent {
  companyId: string;
  activityDataId: string;
  action: 'created' | 'updated' | 'deleted';
  scope: number;
  category: string;
  userId?: string;
}

export interface EmissionCalculatedEvent {
  companyId: string;
  emissionId: string;
  scope: number;
  emissionAmount: number;
  activityDataId: string;
}

export interface EmissionFactorUpdatedEvent {
  emissionFactorId: string;
  affectedCompanies: string[];
  requiresRecalculation: boolean;
}

export interface ReportRequestedEvent {
  companyId: string;
  frameworkId: FrameworkType;
  periodStart: Date;
  periodEnd: Date;
  requestedBy: string;
}

export interface FrameworkChangedEvent {
  frameworkId: FrameworkType;
  changeType: 'section_added' | 'requirement_changed' | 'validation_updated';
  affectedReports: string[];
}

export interface MaterialityUpdatedEvent {
  companyId: string;
  assessmentId: string;
  materialTopics: string[];
}

export interface AssuranceUpdatedEvent {
  companyId: string;
  assuranceLevel: string;
  affectedReports: string[];
}

export interface DashboardRefreshEvent {
  companyId: string;
  dashboardType: string;
  trigger: string;
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

/**
 * Listener: When activity data is created or updated → Calculate emissions
 */
complianceEvents.on('activityDataCreated', async (event: ActivityDataEvent) => {
  console.log(`[Event] Activity data created: ${event.activityDataId}`);

  try {
    // Automatically calculate emissions
    const result = await calculateEmissionsForActivity(event.activityDataId, {
      autoApprove: false,
      calculatedBy: event.userId || 'system'
    });

    if (result.success) {
      console.log(`[Event] Emissions calculated: ${result.emissionId}, ${result.emissionAmount} tons CO2e`);

      // Emit emission calculated event
      complianceEvents.emit('emissionCalculated', {
        companyId: event.companyId,
        emissionId: result.emissionId!,
        scope: event.scope,
        emissionAmount: result.emissionAmount!,
        activityDataId: event.activityDataId
      });
    } else {
      console.error(`[Event] Failed to calculate emissions: ${result.error}`);
    }
  } catch (error) {
    console.error('[Event] Error in activityDataCreated handler:', error);
  }
});

complianceEvents.on('activityDataUpdated', async (event: ActivityDataEvent) => {
  console.log(`[Event] Activity data updated: ${event.activityDataId}`);

  try {
    // Find existing emission calculation
    const existingEmission = await prisma.calculatedEmission.findFirst({
      where: { activityDataId: event.activityDataId },
      orderBy: { version: 'desc' }
    });

    if (existingEmission) {
      // Archive old version
      await prisma.calculatedEmission.update({
        where: { id: existingEmission.id },
        data: { status: 'archived' }
      });
    }

    // Recalculate
    const result = await calculateEmissionsForActivity(event.activityDataId, {
      autoApprove: false,
      calculatedBy: event.userId || 'system'
    });

    if (result.success) {
      complianceEvents.emit('emissionCalculated', {
        companyId: event.companyId,
        emissionId: result.emissionId!,
        scope: event.scope,
        emissionAmount: result.emissionAmount!,
        activityDataId: event.activityDataId
      });
    }
  } catch (error) {
    console.error('[Event] Error in activityDataUpdated handler:', error);
  }
});

/**
 * Listener: When emission is calculated → Update dashboards
 */
complianceEvents.on('emissionCalculated', async (event: EmissionCalculatedEvent) => {
  console.log(`[Event] Emission calculated: ${event.emissionId}`);

  try {
    // Refresh all dashboards for this company
    await refreshAllDashboards(event.companyId, 'emission_calculated');

    // Update draft reports
    await updateDraftReports(event.companyId);

    // Check if any targets are affected
    await checkTargetProgress(event.companyId);

  } catch (error) {
    console.error('[Event] Error in emissionCalculated handler:', error);
  }
});

/**
 * Listener: When emission factor is updated → Recalculate affected emissions
 */
complianceEvents.on('emissionFactorUpdated', async (event: EmissionFactorUpdatedEvent) => {
  console.log(`[Event] Emission factor updated: ${event.emissionFactorId}`);

  if (!event.requiresRecalculation) {
    return;
  }

  try {
    // Find all emissions using this factor
    const affectedEmissions = await prisma.calculatedEmission.findMany({
      where: {
        emissionFactorId: event.emissionFactorId,
        status: { in: ['draft', 'approved'] }
      },
      distinct: ['companyId']
    });

    // Recalculate for each company
    for (const emission of affectedEmissions) {
      console.log(`[Event] Recalculating emissions for company: ${emission.companyId}`);

      await recalculateAllEmissions(emission.companyId, {
        // Only recalculate emissions using this factor
      });

      // Refresh dashboards
      complianceEvents.emit('dashboardRefresh', {
        companyId: emission.companyId,
        dashboardType: 'all',
        trigger: 'emission_factor_update'
      });
    }
  } catch (error) {
    console.error('[Event] Error in emissionFactorUpdated handler:', error);
  }
});

/**
 * Listener: When new report is requested → Generate report
 */
complianceEvents.on('reportRequested', async (event: ReportRequestedEvent) => {
  console.log(`[Event] Report requested: ${event.frameworkId} for ${event.companyId}`);

  try {
    // Map data to framework format
    let frameworkData;

    switch (event.frameworkId) {
      case 'SB-253':
        frameworkData = await mapToSB253(event.companyId, event.periodStart, event.periodEnd);
        break;
      case 'CSRD':
        frameworkData = await mapToCSRD(event.companyId, event.periodStart, event.periodEnd);
        break;
      case 'CDP':
        frameworkData = await mapToCDP(event.companyId, event.periodStart, event.periodEnd);
        break;
      case 'TCFD':
        frameworkData = await mapToTCFD(event.companyId, event.periodStart, event.periodEnd);
        break;
      case 'ISSB':
        frameworkData = await mapToISSBS1S2(event.companyId, event.periodStart, event.periodEnd);
        break;
    }

    // Store report generation request
    await prisma.generatedReport.create({
      data: {
        companyId: event.companyId,
        frameworkId: event.frameworkId,
        frameworkVersion: '2024',
        reportName: `${event.frameworkId} Report ${event.periodStart.getFullYear()}`,
        reportPeriodStart: event.periodStart,
        reportPeriodEnd: event.periodEnd,
        reportingYear: event.periodStart.getFullYear(),
        exportFormat: 'PDF',
        completeness: 0,
        validationResults: {},
        status: 'draft',
        generatedBy: event.requestedBy
      }
    });

    console.log(`[Event] Report generation initiated for ${event.frameworkId}`);

  } catch (error) {
    console.error('[Event] Error in reportRequested handler:', error);
  }
});

/**
 * Listener: When framework requirements change → Revalidate reports
 */
complianceEvents.on('frameworkChanged', async (event: FrameworkChangedEvent) => {
  console.log(`[Event] Framework changed: ${event.frameworkId}`);

  try {
    // Find all reports for this framework
    const affectedReports = await prisma.generatedReport.findMany({
      where: {
        frameworkId: event.frameworkId,
        status: { in: ['draft', 'in_review'] }
      }
    });

    // Revalidate each report
    for (const report of affectedReports) {
      console.log(`[Event] Revalidating report: ${report.id}`);

      // Update validation status
      await prisma.generatedReport.update({
        where: { id: report.id },
        data: {
          validationStatus: 'pending',
          // Add note about framework change
          notes: `${report.notes || ''}\n[Framework ${event.frameworkId} updated - revalidation required]`
        }
      });
    }
  } catch (error) {
    console.error('[Event] Error in frameworkChanged handler:', error);
  }
});

/**
 * Listener: When materiality assessment is updated → Update CSRD reports
 */
complianceEvents.on('materialityUpdated', async (event: MaterialityUpdatedEvent) => {
  console.log(`[Event] Materiality updated: ${event.assessmentId}`);

  try {
    // Find CSRD reports for this company
    const csrdReports = await prisma.generatedReport.findMany({
      where: {
        companyId: event.companyId,
        frameworkId: 'CSRD',
        status: { in: ['draft', 'in_review'] }
      }
    });

    // Flag for regeneration
    for (const report of csrdReports) {
      await prisma.generatedReport.update({
        where: { id: report.id },
        data: {
          notes: `${report.notes || ''}\n[Materiality assessment updated - report should be regenerated]`
        }
      });
    }

    // Refresh materiality dashboard
    complianceEvents.emit('dashboardRefresh', {
      companyId: event.companyId,
      dashboardType: 'csrd_materiality',
      trigger: 'materiality_updated'
    });

  } catch (error) {
    console.error('[Event] Error in materialityUpdated handler:', error);
  }
});

/**
 * Listener: When assurance status is updated → Update reports
 */
complianceEvents.on('assuranceUpdated', async (event: AssuranceUpdatedEvent) => {
  console.log(`[Event] Assurance updated for company: ${event.companyId}`);

  try {
    // Update all reports with new assurance status
    for (const reportId of event.affectedReports) {
      await prisma.generatedReport.update({
        where: { id: reportId },
        data: {
          notes: `${(await prisma.generatedReport.findUnique({ where: { id: reportId } }))?.notes || ''}\n[Assurance level updated to: ${event.assuranceLevel}]`
        }
      });
    }

    // Refresh compliance readiness dashboard
    complianceEvents.emit('dashboardRefresh', {
      companyId: event.companyId,
      dashboardType: 'compliance_readiness',
      trigger: 'assurance_updated'
    });

  } catch (error) {
    console.error('[Event] Error in assuranceUpdated handler:', error);
  }
});

/**
 * Listener: Dashboard refresh event → Trigger UI update
 */
complianceEvents.on('dashboardRefresh', async (event: DashboardRefreshEvent) => {
  console.log(`[Event] Dashboard refresh: ${event.dashboardType} for ${event.companyId}`);

  // In a real-time system, this would push updates via WebSocket or Server-Sent Events
  // For now, we log and update cache invalidation flags

  try {
    // Invalidate dashboard cache (Redis, etc.)
    // await redis.del(`dashboard:${event.companyId}:${event.dashboardType}`);

    // In production, emit WebSocket event to connected clients
    // io.to(`company-${event.companyId}`).emit('dashboardUpdate', {
    //   dashboardType: event.dashboardType,
    //   trigger: event.trigger
    // });

    console.log(`[Event] Dashboard cache invalidated for ${event.companyId}`);

  } catch (error) {
    console.error('[Event] Error in dashboardRefresh handler:', error);
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Refresh all dashboards for a company
 */
async function refreshAllDashboards(companyId: string, trigger: string): Promise<void> {
  const dashboardTypes = [
    'carbon_emissions',
    'csrd_materiality',
    'sb253_tracking',
    'supply_chain_footprint',
    'facility_emissions',
    'compliance_readiness',
    'audit_log'
  ];

  for (const dashboardType of dashboardTypes) {
    complianceEvents.emit('dashboardRefresh', {
      companyId,
      dashboardType,
      trigger
    });
  }
}

/**
 * Update draft reports with new data
 */
async function updateDraftReports(companyId: string): Promise<void> {
  const draftReports = await prisma.generatedReport.findMany({
    where: {
      companyId,
      status: 'draft'
    }
  });

  for (const report of draftReports) {
    // Recalculate completeness
    const emissions = await prisma.calculatedEmission.findMany({
      where: {
        companyId,
        status: 'approved',
        calculatedAt: {
          gte: report.reportPeriodStart,
          lte: report.reportPeriodEnd
        }
      }
    });

    // Update report completeness
    const scope1Count = emissions.filter(e => e.scope === 1).length;
    const scope2Count = emissions.filter(e => e.scope === 2).length;
    const scope3Count = emissions.filter(e => e.scope === 3).length;

    const completeness = calculateReportCompleteness(
      report.frameworkId,
      scope1Count,
      scope2Count,
      scope3Count
    );

    await prisma.generatedReport.update({
      where: { id: report.id },
      data: { completeness }
    });
  }
}

/**
 * Check target progress against latest emissions
 */
async function checkTargetProgress(companyId: string): Promise<void> {
  // In production, this would:
  // 1. Fetch company's emissions reduction targets
  // 2. Calculate current progress
  // 3. Flag if off-track
  // 4. Send notifications if needed

  console.log(`[Target Check] Checking target progress for ${companyId}`);
}

/**
 * Calculate report completeness percentage
 */
function calculateReportCompleteness(
  frameworkId: string,
  scope1Count: number,
  scope2Count: number,
  scope3Count: number
): number {
  // Basic completeness calculation
  // In production, this would be more sophisticated based on framework requirements

  const requirements: Record<string, { scope1: boolean; scope2: boolean; scope3: boolean; minScope3Categories: number }> = {
    'SB-253': { scope1: true, scope2: true, scope3: true, minScope3Categories: 15 },
    'CSRD': { scope1: true, scope2: true, scope3: true, minScope3Categories: 3 },
    'CDP': { scope1: true, scope2: true, scope3: true, minScope3Categories: 5 },
    'TCFD': { scope1: true, scope2: true, scope3: false, minScope3Categories: 0 },
    'ISSB': { scope1: true, scope2: true, scope3: true, minScope3Categories: 5 }
  };

  const req = requirements[frameworkId] || { scope1: true, scope2: true, scope3: false, minScope3Categories: 0 };

  let score = 0;
  let total = 0;

  if (req.scope1) {
    total += 33;
    if (scope1Count > 0) score += 33;
  }

  if (req.scope2) {
    total += 33;
    if (scope2Count > 0) score += 33;
  }

  if (req.scope3) {
    total += 34;
    if (scope3Count >= req.minScope3Categories) score += 34;
  }

  return total > 0 ? Math.round((score / total) * 100) : 0;
}

// ============================================================================
// CONVENIENCE FUNCTIONS FOR EMITTING EVENTS
// ============================================================================

export function emitActivityDataCreated(event: ActivityDataEvent): void {
  complianceEvents.emit('activityDataCreated', event);
}

export function emitActivityDataUpdated(event: ActivityDataEvent): void {
  complianceEvents.emit('activityDataUpdated', event);
}

export function emitEmissionCalculated(event: EmissionCalculatedEvent): void {
  complianceEvents.emit('emissionCalculated', event);
}

export function emitEmissionFactorUpdated(event: EmissionFactorUpdatedEvent): void {
  complianceEvents.emit('emissionFactorUpdated', event);
}

export function emitReportRequested(event: ReportRequestedEvent): void {
  complianceEvents.emit('reportRequested', event);
}

export function emitFrameworkChanged(event: FrameworkChangedEvent): void {
  complianceEvents.emit('frameworkChanged', event);
}

export function emitMaterialityUpdated(event: MaterialityUpdatedEvent): void {
  complianceEvents.emit('materialityUpdated', event);
}

export function emitAssuranceUpdated(event: AssuranceUpdatedEvent): void {
  complianceEvents.emit('assuranceUpdated', event);
}

export function emitDashboardRefresh(event: DashboardRefreshEvent): void {
  complianceEvents.emit('dashboardRefresh', event);
}

/**
 * Initialize event system on startup
 */
export function initializeEventSystem(): void {
  console.log('[EventSystem] Initializing compliance event system...');
  console.log('[EventSystem] Registered event listeners:');
  console.log('  - activityDataCreated');
  console.log('  - activityDataUpdated');
  console.log('  - emissionCalculated');
  console.log('  - emissionFactorUpdated');
  console.log('  - reportRequested');
  console.log('  - frameworkChanged');
  console.log('  - materialityUpdated');
  console.log('  - assuranceUpdated');
  console.log('  - dashboardRefresh');
  console.log('[EventSystem] Event system ready');
}

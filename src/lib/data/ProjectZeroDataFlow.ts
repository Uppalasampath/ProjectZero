/**
 * PROJECT ZERO DATA FLOW
 *
 * Unified data pipeline for ESG & Sustainability Compliance
 *
 * Architecture:
 * 1. Ingestion Layer - Multi-source data intake
 * 2. Processing Layer - Normalization & validation
 * 3. Calculation Layer - Emissions calculations
 * 4. Framework Mapping Layer - Regulatory framework alignment
 * 5. Dashboard Sync Layer - Real-time UI updates
 * 6. Event System - Triggers and listeners
 */

import { PrismaClient } from '@prisma/client';
import type {
  ActivityData,
  EmissionFactor,
  EmissionResult,
  EmissionsInventory,
  FrameworkType
} from '../compliance/types';
import {
  calculateSingleEmission,
  buildEmissionsInventory,
  initializeEmissionFactors
} from '../compliance/emissionsCalculator';
import { generateComplianceReport } from '../compliance/reportGenerator';
import { EventEmitter } from 'events';

const prisma = new PrismaClient();
const dataFlowEvents = new EventEmitter();

// ============================================================================
// LAYER 1: INGESTION LAYER
// ============================================================================

export interface DataIngestionSource {
  sourceType: 'csv' | 'excel' | 'api' | 'manual' | 'saas_integration' | 'iot';
  sourceId: string;
  companyId: string;
  metadata?: Record<string, any>;
}

export interface IngestionResult {
  success: boolean;
  recordsProcessed: number;
  recordsAccepted: number;
  recordsRejected: number;
  errors: Array<{ row: number; error: string }>;
  batchId: string;
}

/**
 * Ingest activity data from CSV/Excel upload
 */
export async function ingestFromCSV(
  file: File,
  source: DataIngestionSource
): Promise<IngestionResult> {
  const batchId = `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Parse CSV/Excel (using library like papaparse or xlsx)
  const rawData = await parseFile(file);

  const result: IngestionResult = {
    success: true,
    recordsProcessed: rawData.length,
    recordsAccepted: 0,
    recordsRejected: 0,
    errors: [],
    batchId
  };

  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];

    try {
      // Validate row
      const validationErrors = validateActivityDataRow(row);
      if (validationErrors.length > 0) {
        result.recordsRejected++;
        result.errors.push({ row: i + 1, error: validationErrors.join('; ') });
        continue;
      }

      // Transform to ActivityData format
      const activityData = transformToActivityData(row, source);

      // Store in database
      await prisma.activityData.create({
        data: {
          companyId: source.companyId,
          facilityId: row.facilityId || null,
          scope: activityData.scope,
          category: activityData.category,
          subcategory: activityData.subcategory,
          activityAmount: activityData.activityAmount,
          activityUnit: activityData.activityUnit,
          periodStart: activityData.timePeriod.start,
          periodEnd: activityData.timePeriod.end,
          dataQuality: activityData.dataQuality,
          source: activityData.source,
          sourceReference: row.sourceReference,
          location: activityData.location,
          geography: row.geography,
          notes: activityData.notes,
          uploadBatchId: batchId,
          uploadedAt: new Date(),
          uploadedBy: source.metadata?.uploadedBy
        }
      });

      result.recordsAccepted++;

      // Emit event
      dataFlowEvents.emit('activityDataIngested', {
        companyId: source.companyId,
        activityDataId: activityData,
        source: source.sourceType
      });

    } catch (error) {
      result.recordsRejected++;
      result.errors.push({ row: i + 1, error: String(error) });
    }
  }

  // Create audit log
  await createAuditLog({
    companyId: source.companyId,
    eventType: 'data_ingested',
    entityType: 'ActivityData',
    entityId: batchId,
    action: 'CREATE',
    changes: {
      source: source.sourceType,
      recordsAccepted: result.recordsAccepted,
      recordsRejected: result.recordsRejected
    },
    userId: source.metadata?.uploadedBy
  });

  return result;
}

/**
 * Ingest data from API feed (utility bills, ERP systems, etc.)
 */
export async function ingestFromAPI(
  apiEndpoint: string,
  apiConfig: {
    authToken?: string;
    params?: Record<string, any>;
  },
  source: DataIngestionSource
): Promise<IngestionResult> {
  const batchId = `api-batch-${Date.now()}`;

  try {
    // Fetch data from external API
    const response = await fetch(apiEndpoint, {
      headers: {
        'Authorization': `Bearer ${apiConfig.authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();

    // Process API data similar to CSV ingestion
    // Transform based on API provider format
    const transformedData = transformAPIData(data, source);

    // Bulk insert to database
    const created = await prisma.activityData.createMany({
      data: transformedData.map(item => ({
        companyId: source.companyId,
        ...item,
        uploadBatchId: batchId,
        uploadedAt: new Date()
      }))
    });

    dataFlowEvents.emit('apiDataIngested', {
      companyId: source.companyId,
      batchId,
      recordCount: created.count
    });

    return {
      success: true,
      recordsProcessed: created.count,
      recordsAccepted: created.count,
      recordsRejected: 0,
      errors: [],
      batchId
    };

  } catch (error) {
    return {
      success: false,
      recordsProcessed: 0,
      recordsAccepted: 0,
      recordsRejected: 0,
      errors: [{ row: 0, error: String(error) }],
      batchId
    };
  }
}

/**
 * Manual data entry through UI
 */
export async function ingestManualEntry(
  activityData: ActivityData,
  source: DataIngestionSource
): Promise<{ success: boolean; activityDataId?: string; error?: string }> {
  try {
    const created = await prisma.activityData.create({
      data: {
        companyId: source.companyId,
        facilityId: source.metadata?.facilityId,
        scope: activityData.scope,
        category: activityData.category,
        subcategory: activityData.subcategory,
        activityAmount: activityData.activityAmount,
        activityUnit: activityData.activityUnit,
        periodStart: activityData.timePeriod.start,
        periodEnd: activityData.timePeriod.end,
        dataQuality: activityData.dataQuality,
        source: activityData.source,
        location: activityData.location,
        notes: activityData.notes,
        uploadedBy: source.metadata?.userId,
        uploadedAt: new Date()
      }
    });

    dataFlowEvents.emit('activityDataCreated', {
      companyId: source.companyId,
      activityDataId: created.id
    });

    return { success: true, activityDataId: created.id };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// ============================================================================
// LAYER 2: PROCESSING LAYER
// ============================================================================

export interface ProcessingOptions {
  validateData?: boolean;
  normalizeUnits?: boolean;
  mapCategories?: boolean;
  detectAnomalies?: boolean;
}

/**
 * Process raw activity data: normalize, validate, categorize
 */
export async function processActivityData(
  activityDataId: string,
  options: ProcessingOptions = {}
): Promise<{
  success: boolean;
  normalized?: any;
  validationResults?: Array<{ rule: string; passed: boolean; message: string }>;
  errors?: string[];
}> {
  const {
    validateData = true,
    normalizeUnits = true,
    mapCategories = true,
    detectAnomalies = true
  } = options;

  try {
    // Fetch activity data
    const activityData = await prisma.activityData.findUnique({
      where: { id: activityDataId }
    });

    if (!activityData) {
      return { success: false, errors: ['Activity data not found'] };
    }

    const results: any = { success: true, validationResults: [] };

    // Step 1: Validate data
    if (validateData) {
      const validationResults = await validateActivityData(activityData);
      results.validationResults = validationResults;

      // Store validation results
      for (const validation of validationResults) {
        await prisma.dataValidation.create({
          data: {
            entityType: 'ActivityData',
            entityId: activityDataId,
            validationRule: validation.rule,
            validationStatus: validation.passed ? 'passed' : 'failed',
            validationMessage: validation.message,
            severity: validation.passed ? 'info' : 'warning'
          }
        });
      }
    }

    // Step 2: Normalize units
    if (normalizeUnits) {
      const normalized = normalizeActivityDataUnits(activityData);

      if (normalized.converted) {
        await prisma.activityData.update({
          where: { id: activityDataId },
          data: {
            activityAmount: normalized.newAmount,
            activityUnit: normalized.newUnit,
            notes: `${activityData.notes || ''}\n[Auto-converted from ${activityData.activityUnit}]`
          }
        });

        results.normalized = normalized;
      }
    }

    // Step 3: Map to GHG Protocol categories
    if (mapCategories) {
      const mappedCategory = mapToGHGProtocolCategory(
        activityData.scope,
        activityData.category,
        activityData.subcategory
      );

      await prisma.activityData.update({
        where: { id: activityDataId },
        data: {
          category: mappedCategory.category,
          subcategory: mappedCategory.subcategory
        }
      });
    }

    // Step 4: Detect anomalies
    if (detectAnomalies) {
      const anomalies = await detectDataAnomalies(activityData);

      if (anomalies.length > 0) {
        for (const anomaly of anomalies) {
          await prisma.dataValidation.create({
            data: {
              entityType: 'ActivityData',
              entityId: activityDataId,
              validationRule: 'anomaly_detection',
              validationStatus: 'warning',
              validationMessage: anomaly.message,
              severity: 'warning'
            }
          });
        }
        results.anomalies = anomalies;
      }
    }

    dataFlowEvents.emit('activityDataProcessed', {
      activityDataId,
      validationResults: results.validationResults
    });

    return results;

  } catch (error) {
    return { success: false, errors: [String(error)] };
  }
}

/**
 * Normalize units to standard format
 */
function normalizeActivityDataUnits(activityData: any): {
  converted: boolean;
  newAmount: number;
  newUnit: string;
  conversionFactor?: number;
} {
  const unit = activityData.activityUnit.toLowerCase();
  const amount = Number(activityData.activityAmount);

  // Electricity conversions
  if (['kwh', 'kilowatt-hours'].includes(unit)) {
    return {
      converted: true,
      newAmount: amount / 1000,
      newUnit: 'MWh',
      conversionFactor: 0.001
    };
  }

  // Distance conversions
  if (unit === 'km' || unit === 'kilometers') {
    return {
      converted: true,
      newAmount: amount * 0.621371,
      newUnit: 'miles',
      conversionFactor: 0.621371
    };
  }

  // No conversion needed
  return { converted: false, newAmount: amount, newUnit: activityData.activityUnit };
}

/**
 * Validate activity data against business rules
 */
async function validateActivityData(activityData: any): Promise<Array<{
  rule: string;
  passed: boolean;
  message: string;
}>> {
  const results = [];

  // Rule 1: Amount must be positive
  results.push({
    rule: 'positive_amount',
    passed: Number(activityData.activityAmount) > 0,
    message: 'Activity amount must be greater than zero'
  });

  // Rule 2: Period dates must be valid
  const periodStart = new Date(activityData.periodStart);
  const periodEnd = new Date(activityData.periodEnd);
  results.push({
    rule: 'valid_period',
    passed: periodEnd >= periodStart,
    message: 'Period end date must be after or equal to start date'
  });

  // Rule 3: Future data check
  const now = new Date();
  results.push({
    rule: 'not_future_data',
    passed: periodStart <= now,
    message: 'Activity data should not be for future dates'
  });

  // Rule 4: Data quality must be specified
  results.push({
    rule: 'data_quality_specified',
    passed: ['measured', 'calculated', 'estimated', 'supplier-specific', 'industry-average'].includes(activityData.dataQuality),
    message: 'Data quality must be one of: measured, calculated, estimated, supplier-specific, industry-average'
  });

  return results;
}

/**
 * Detect anomalies in activity data
 */
async function detectDataAnomalies(activityData: any): Promise<Array<{
  type: string;
  message: string;
  severity: 'warning' | 'info';
}>> {
  const anomalies = [];

  // Get historical data for comparison
  const historicalData = await prisma.activityData.findMany({
    where: {
      companyId: activityData.companyId,
      facilityId: activityData.facilityId,
      scope: activityData.scope,
      category: activityData.category,
      id: { not: activityData.id }
    },
    orderBy: { periodStart: 'desc' },
    take: 10
  });

  if (historicalData.length > 0) {
    const amounts = historicalData.map(d => Number(d.activityAmount));
    const mean = amounts.reduce((sum, val) => sum + val, 0) / amounts.length;
    const stdDev = Math.sqrt(
      amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length
    );

    const currentAmount = Number(activityData.activityAmount);
    const zScore = Math.abs((currentAmount - mean) / stdDev);

    // If value is > 2 standard deviations from mean
    if (zScore > 2) {
      anomalies.push({
        type: 'statistical_outlier',
        message: `Activity amount (${currentAmount}) is ${zScore.toFixed(1)} standard deviations from historical mean (${mean.toFixed(2)})`,
        severity: 'warning'
      });
    }

    // Check for sudden spike (> 50% increase)
    if (amounts.length > 0) {
      const latestHistorical = amounts[0];
      const percentChange = ((currentAmount - latestHistorical) / latestHistorical) * 100;

      if (Math.abs(percentChange) > 50) {
        anomalies.push({
          type: 'sudden_change',
          message: `${Math.abs(percentChange).toFixed(0)}% change from previous period`,
          severity: 'warning'
        });
      }
    }
  }

  return anomalies;
}

/**
 * Map activity category to standardized GHG Protocol category
 */
function mapToGHGProtocolCategory(
  scope: number,
  category: string,
  subcategory?: string | null
): { category: string; subcategory: string | null } {
  // Standardized category mapping
  const categoryMappings: Record<number, Record<string, string>> = {
    1: {
      'stationary combustion': 'stationary_combustion',
      'stationary': 'stationary_combustion',
      'boilers': 'stationary_combustion',
      'mobile combustion': 'mobile_combustion',
      'mobile': 'mobile_combustion',
      'vehicles': 'mobile_combustion',
      'fleet': 'mobile_combustion',
      'fugitive': 'fugitive_emissions',
      'fugitive emissions': 'fugitive_emissions',
      'refrigerants': 'fugitive_emissions',
      'process': 'process_emissions'
    },
    2: {
      'electricity': 'purchased_electricity',
      'purchased electricity': 'purchased_electricity',
      'steam': 'purchased_steam',
      'heating': 'purchased_heating',
      'cooling': 'purchased_cooling'
    },
    3: {
      'purchased goods': 'purchased_goods_services',
      'capital goods': 'capital_goods',
      'freight': 'upstream_transportation',
      'transportation': 'upstream_transportation',
      'waste': 'waste_generated',
      'business travel': 'business_travel',
      'travel': 'business_travel',
      'commuting': 'employee_commuting',
      'employee commute': 'employee_commuting'
    }
  };

  const lowerCategory = category.toLowerCase();
  const mapped = categoryMappings[scope]?.[lowerCategory] || category;

  return {
    category: mapped,
    subcategory: subcategory || null
  };
}

// ============================================================================
// LAYER 3: EMISSIONS CALCULATION LAYER
// ============================================================================

/**
 * Calculate emissions for new activity data
 */
export async function calculateEmissionsForActivity(
  activityDataId: string,
  options: {
    autoApprove?: boolean;
    calculatedBy?: string;
  } = {}
): Promise<{
  success: boolean;
  emissionId?: string;
  emissionAmount?: number;
  error?: string;
}> {
  try {
    // Fetch activity data
    const activityData = await prisma.activityData.findUnique({
      where: { id: activityDataId },
      include: { company: true, facility: true }
    });

    if (!activityData) {
      return { success: false, error: 'Activity data not found' };
    }

    // Find appropriate emission factor
    const emissionFactor = await findBestEmissionFactor({
      scope: activityData.scope,
      category: activityData.category,
      geography: activityData.geography || activityData.facility?.country || activityData.company.country,
      year: activityData.periodStart.getFullYear()
    });

    if (!emissionFactor) {
      return { success: false, error: 'No suitable emission factor found' };
    }

    // Transform to compliance types
    const activity: ActivityData = {
      scope: activityData.scope as 1 | 2 | 3,
      category: activityData.category,
      subcategory: activityData.subcategory || undefined,
      activityAmount: Number(activityData.activityAmount),
      activityUnit: activityData.activityUnit,
      timePeriod: {
        start: activityData.periodStart,
        end: activityData.periodEnd
      },
      dataQuality: activityData.dataQuality as any,
      source: activityData.source,
      location: activityData.location || undefined,
      notes: activityData.notes || undefined
    };

    const factor: EmissionFactor = {
      id: emissionFactor.factorId,
      name: emissionFactor.name,
      source: emissionFactor.source as any,
      version: emissionFactor.version,
      scope: emissionFactor.scope as 1 | 2 | 3,
      category: emissionFactor.category,
      factor: Number(emissionFactor.factor),
      unit: emissionFactor.unit,
      gwp: emissionFactor.gwp as 'AR5' | 'AR6',
      geography: emissionFactor.geography || undefined,
      applicableYears: emissionFactor.applicableYears,
      lastUpdated: emissionFactor.updatedAt,
      uncertainty: emissionFactor.uncertainty || undefined,
      metadata: emissionFactor.metadata as any
    };

    // Calculate emissions
    const result = calculateSingleEmission(activity, factor);

    // Store result
    const calculatedEmission = await prisma.calculatedEmission.create({
      data: {
        companyId: activityData.companyId,
        facilityId: activityData.facilityId,
        activityDataId: activityData.id,
        emissionFactorId: emissionFactor.id,
        scope: result.scope,
        category: result.category,
        subcategory: result.subcategory,
        emissionAmount: result.emissionAmount,
        emissionUnit: 'tons CO2e',
        uncertaintyLower: result.uncertaintyRange?.lower,
        uncertaintyUpper: result.uncertaintyRange?.upper,
        methodology: result.methodology,
        formula: result.formula,
        calculationMethod: result.traceability.calculationMethod,
        dataQuality: result.dataQuality,
        calculatedAt: result.calculatedAt,
        calculatedBy: options.calculatedBy || 'system',
        status: options.autoApprove ? 'approved' : 'draft'
      }
    });

    // Emit event
    dataFlowEvents.emit('emissionCalculated', {
      companyId: activityData.companyId,
      emissionId: calculatedEmission.id,
      scope: result.scope,
      emissionAmount: result.emissionAmount
    });

    // Create audit log
    await createAuditLog({
      companyId: activityData.companyId,
      eventType: 'calculation_run',
      entityType: 'CalculatedEmission',
      entityId: calculatedEmission.id,
      action: 'CALCULATE',
      changes: {
        activityDataId,
        emissionAmount: result.emissionAmount,
        methodology: result.methodology
      },
      userId: options.calculatedBy
    });

    return {
      success: true,
      emissionId: calculatedEmission.id,
      emissionAmount: result.emissionAmount
    };

  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Recalculate all emissions for a company (e.g., when emission factors update)
 */
export async function recalculateAllEmissions(
  companyId: string,
  options: {
    scope?: number;
    periodStart?: Date;
    periodEnd?: Date;
  } = {}
): Promise<{
  success: boolean;
  recalculated: number;
  failed: number;
}> {
  const whereClause: any = { companyId };
  if (options.scope) whereClause.scope = options.scope;
  if (options.periodStart) whereClause.periodStart = { gte: options.periodStart };
  if (options.periodEnd) whereClause.periodEnd = { lte: options.periodEnd };

  const activityData = await prisma.activityData.findMany({
    where: whereClause
  });

  let recalculated = 0;
  let failed = 0;

  for (const activity of activityData) {
    const result = await calculateEmissionsForActivity(activity.id, {
      autoApprove: false,
      calculatedBy: 'recalculation-job'
    });

    if (result.success) {
      recalculated++;
    } else {
      failed++;
    }
  }

  dataFlowEvents.emit('bulkRecalculationComplete', {
    companyId,
    recalculated,
    failed
  });

  return { success: true, recalculated, failed };
}

/**
 * Find best emission factor for activity data
 */
async function findBestEmissionFactor(criteria: {
  scope: number;
  category: string;
  geography?: string;
  year: number;
}): Promise<any> {
  // Priority order:
  // 1. Exact match (scope + category + geography + applicable year)
  // 2. Scope + category + country match
  // 3. Scope + category + default/global

  // Try exact match with geography
  if (criteria.geography) {
    const exact = await prisma.emissionFactor.findFirst({
      where: {
        scope: criteria.scope,
        category: criteria.category,
        geography: criteria.geography,
        applicableYears: { has: criteria.year },
        isActive: true
      },
      orderBy: { lastReviewedAt: 'desc' }
    });

    if (exact) return exact;
  }

  // Try scope + category match
  const general = await prisma.emissionFactor.findFirst({
    where: {
      scope: criteria.scope,
      category: criteria.category,
      applicableYears: { has: criteria.year },
      isActive: true
    },
    orderBy: { lastReviewedAt: 'desc' }
  });

  return general;
}

// Continued in next file due to length...
export { dataFlowEvents };

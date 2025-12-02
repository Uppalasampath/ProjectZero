/**
 * HELPER FUNCTIONS
 *
 * Utility functions for data pipeline
 */

import type { ActivityData, ValidationRule, ValidationResult } from '../compliance/types';

/**
 * Parse CSV/Excel file
 */
export async function parseFile(file: File): Promise<any[]> {
  // In production, use libraries like papaparse (CSV) or xlsx (Excel)
  // This is a placeholder implementation

  const text = await file.text();
  const lines = text.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());

  const data = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    const values = lines[i].split(',').map(v => v.trim());
    const row: any = {};

    headers.forEach((header, index) => {
      row[header] = values[index];
    });

    data.push(row);
  }

  return data;
}

/**
 * Validate activity data row from CSV
 */
export function validateActivityDataRow(row: any): string[] {
  const errors: string[] = [];

  // Required fields
  if (!row.scope) errors.push('Missing scope');
  if (!row.category) errors.push('Missing category');
  if (!row.activityAmount) errors.push('Missing activity amount');
  if (!row.activityUnit) errors.push('Missing activity unit');
  if (!row.periodStart) errors.push('Missing period start date');
  if (!row.periodEnd) errors.push('Missing period end date');
  if (!row.dataQuality) errors.push('Missing data quality');
  if (!row.source) errors.push('Missing source');

  // Validate scope
  if (row.scope && ![1, 2, 3, '1', '2', '3'].includes(row.scope)) {
    errors.push('Scope must be 1, 2, or 3');
  }

  // Validate amount
  if (row.activityAmount && (isNaN(Number(row.activityAmount)) || Number(row.activityAmount) <= 0)) {
    errors.push('Activity amount must be a positive number');
  }

  // Validate dates
  if (row.periodStart && row.periodEnd) {
    const start = new Date(row.periodStart);
    const end = new Date(row.periodEnd);

    if (isNaN(start.getTime())) {
      errors.push('Invalid period start date');
    }
    if (isNaN(end.getTime())) {
      errors.push('Invalid period end date');
    }
    if (start > end) {
      errors.push('Period start must be before period end');
    }
  }

  // Validate data quality
  const validQualities = ['measured', 'calculated', 'estimated', 'supplier-specific', 'industry-average'];
  if (row.dataQuality && !validQualities.includes(row.dataQuality.toLowerCase())) {
    errors.push(`Data quality must be one of: ${validQualities.join(', ')}`);
  }

  return errors;
}

/**
 * Transform CSV row to ActivityData format
 */
export function transformToActivityData(row: any, source: any): ActivityData {
  return {
    scope: Number(row.scope) as 1 | 2 | 3,
    category: row.category,
    subcategory: row.subcategory || undefined,
    activityAmount: Number(row.activityAmount),
    activityUnit: row.activityUnit,
    timePeriod: {
      start: new Date(row.periodStart),
      end: new Date(row.periodEnd)
    },
    dataQuality: row.dataQuality.toLowerCase() as any,
    source: row.source,
    location: row.location || undefined,
    notes: row.notes || undefined
  };
}

/**
 * Transform API data to internal format
 */
export function transformAPIData(apiData: any, source: any): any[] {
  // Transform based on API provider format
  // This is provider-specific and would be configured per integration

  if (!Array.isArray(apiData)) {
    return [];
  }

  return apiData.map(item => ({
    scope: item.emissionScope || item.scope,
    category: item.category || item.activityCategory,
    activityAmount: item.amount || item.quantity,
    activityUnit: item.unit,
    periodStart: new Date(item.startDate || item.periodStart),
    periodEnd: new Date(item.endDate || item.periodEnd),
    dataQuality: item.dataQuality || 'calculated',
    source: `API: ${source.sourceId}`,
    location: item.location || item.facility
  }));
}

/**
 * Create audit log entry
 */
export async function createAuditLog(params: {
  companyId?: string;
  eventType: string;
  entityType: string;
  entityId: string;
  action: string;
  changes?: any;
  userId?: string;
  userName?: string;
  userEmail?: string;
  ipAddress?: string;
  source?: string;
  sourceReference?: string;
}): Promise<void> {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  await prisma.auditLog.create({
    data: {
      companyId: params.companyId || null,
      eventType: params.eventType,
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      changes: params.changes || {},
      userId: params.userId,
      userName: params.userName,
      userEmail: params.userEmail,
      ipAddress: params.ipAddress,
      source: params.source,
      sourceReference: params.sourceReference,
      timestamp: new Date()
    }
  });

  await prisma.$disconnect();
}

/**
 * Validate report data
 */
export function validateReportData(
  data: any,
  frameworkId: string,
  validationRules: ValidationRule[]
): ValidationResult[] {
  const results: ValidationResult[] = [];

  for (const rule of validationRules) {
    const result: ValidationResult = {
      field: rule.field,
      rule: rule.rule,
      passed: true,
      message: rule.message,
      severity: 'error'
    };

    switch (rule.rule) {
      case 'required':
        if (!data || !data[rule.field]) {
          result.passed = false;
        }
        break;

      case 'min':
        if (data[rule.field] < rule.value) {
          result.passed = false;
        }
        break;

      case 'max':
        if (data[rule.field] > rule.value) {
          result.passed = false;
        }
        break;

      case 'custom':
        if (rule.validator) {
          result.passed = rule.validator(data);
        }
        break;
    }

    results.push(result);
  }

  return results;
}

/**
 * Format category name for display
 */
export function formatCategoryName(category: string): string {
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Calculate year-over-year change
 */
export function calculateYoYChange(current: number, previous: number): { absolute: number; percentage: number } {
  const absolute = current - previous;
  const percentage = previous !== 0 ? (absolute / previous) * 100 : 0;

  return { absolute, percentage };
}

/**
 * Group emissions by category
 */
export function groupEmissionsByCategory(emissions: any[]): Record<string, any[]> {
  const grouped: Record<string, any[]> = {};

  for (const emission of emissions) {
    const category = emission.category;
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(emission);
  }

  return grouped;
}

/**
 * Calculate emission intensity
 */
export function calculateEmissionIntensity(
  totalEmissions: number,
  metric: number,
  metricType: 'revenue' | 'employees' | 'floor_area' | 'production'
): number {
  if (metric === 0) return 0;

  switch (metricType) {
    case 'revenue':
      // tons CO2e per million USD
      return (totalEmissions / metric) * 1000000;
    case 'employees':
      // tons CO2e per employee
      return totalEmissions / metric;
    case 'floor_area':
      // tons CO2e per square meter
      return totalEmissions / metric;
    case 'production':
      // tons CO2e per unit produced
      return totalEmissions / metric;
    default:
      return 0;
  }
}

/**
 * Format number with units
 */
export function formatWithUnits(value: number, unit: string, decimals: number = 2): string {
  return `${value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })} ${unit}`;
}

/**
 * Determine data quality tier
 */
export function getDataQualityTier(dataQuality: string): 'high' | 'medium' | 'low' {
  switch (dataQuality.toLowerCase()) {
    case 'measured':
      return 'high';
    case 'calculated':
    case 'supplier-specific':
      return 'medium';
    case 'estimated':
    case 'industry-average':
      return 'low';
    default:
      return 'low';
  }
}

/**
 * Generate report ID
 */
export function generateReportId(frameworkId: string, companyId: string, year: number): string {
  const timestamp = Date.now();
  return `${frameworkId}-${companyId.substring(0, 8)}-${year}-${timestamp}`;
}

/**
 * Check if date is in reporting period
 */
export function isInReportingPeriod(date: Date, periodStart: Date, periodEnd: Date): boolean {
  return date >= periodStart && date <= periodEnd;
}

/**
 * Get fiscal year from date
 */
export function getFiscalYear(date: Date, fiscalYearEnd: string): number {
  // fiscalYearEnd format: "MM-DD" (e.g., "12-31", "06-30")
  const [month, day] = fiscalYearEnd.split('-').map(Number);
  const fiscalYearEndDate = new Date(date.getFullYear(), month - 1, day);

  if (date <= fiscalYearEndDate) {
    return date.getFullYear();
  } else {
    return date.getFullYear() + 1;
  }
}

/**
 * Chunk array for batch processing
 */
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries) {
        const delay = initialDelay * Math.pow(2, attempt);
        console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Deep merge objects
 */
export function deepMerge(target: any, source: any): any {
  const output = { ...target };

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }

  return output;
}

function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}

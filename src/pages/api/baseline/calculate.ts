/**
 * POST /api/baseline/calculate
 *
 * Calculate carbon baseline using ML or historical data
 *
 * Request body:
 * {
 *   companyId: string,
 *   method: 'historical' | 'ml' | 'hybrid' | 'industry_average',
 *   companyData?: {
 *     revenue: number,
 *     employees: number,
 *     energy_spend: number,
 *     facility_sqft: number,
 *     industry: string,
 *     region: string
 *   }
 * }
 *
 * Response:
 * {
 *   baseline_emissions: number,
 *   method: string,
 *   scope1_estimate?: number,
 *   scope2_estimate?: number,
 *   scope3_estimate?: number,
 *   confidence_interval?: [number, number],
 *   data_quality: string
 * }
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Industry emission intensity benchmarks (tons CO2e per million USD revenue)
const INDUSTRY_BENCHMARKS: Record<string, number> = {
  'manufacturing_heavy': 450,
  'manufacturing_light': 120,
  'energy_utilities': 2500,
  'transportation': 380,
  'retail': 45,
  'technology': 25,
  'financial_services': 15,
  'healthcare': 65,
  'hospitality': 85,
  'construction': 180,
  'agriculture': 220,
  'real_estate': 55,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { companyId, method = 'hybrid', companyData } = req.body;

    if (!companyId) {
      return res.status(400).json({ error: 'companyId is required' });
    }

    // Fetch historical emissions data
    const { data: historicalData, error } = await supabase
      .from('carbon_emissions')
      .select('reporting_period_end, scope_1_total, scope_2_total, scope_3_total')
      .eq('user_id', companyId)
      .order('reporting_period_end', { ascending: true });

    if (error) throw error;

    const monthsOfData = historicalData?.length || 0;

    // Calculate baseline based on method and data availability
    let result: any;

    if (method === 'historical' || (monthsOfData >= 12 && method === 'hybrid')) {
      // Historical average (first 12 months)
      if (monthsOfData >= 12) {
        const first12Months = historicalData.slice(0, 12);
        const totalEmissions = first12Months.reduce((sum, record) =>
          sum + (record.scope_1_total || 0) + (record.scope_2_total || 0) + (record.scope_3_total || 0), 0
        );
        const annualBaseline = totalEmissions; // Already annualized

        result = {
          baseline_emissions: Math.round(annualBaseline * 100) / 100,
          method: 'historical_average',
          data_quality: 'measured',
          months_of_data: 12,
          note: 'Baseline calculated from first 12 months of historical data'
        };

      } else if (monthsOfData >= 6) {
        // Hybrid: blend historical with estimates
        const avgMonthly = historicalData.reduce((sum, record) =>
          sum + (record.scope_1_total || 0) + (record.scope_2_total || 0) + (record.scope_3_total || 0), 0
        ) / monthsOfData;

        const annualFromHistorical = avgMonthly * 12;

        // Get ML estimate
        const mlEstimate = calculateMLEstimate(companyData);

        // Weighted blend: more historical data = higher weight
        const weightHistorical = monthsOfData / 12;
        const weightML = 1 - weightHistorical;

        const baseline = (annualFromHistorical * weightHistorical) + (mlEstimate.total * weightML);

        result = {
          baseline_emissions: Math.round(baseline * 100) / 100,
          method: 'hybrid_historical_ml',
          data_quality: 'calculated',
          months_of_data: monthsOfData,
          ml_contribution_pct: Math.round(weightML * 100),
          note: `Blended estimate using ${monthsOfData} months of data and ML`
        };

      } else {
        // Fallback to ML/industry average
        result = calculateMLEstimate(companyData);
        result.months_of_data = monthsOfData;
        result.note = 'Insufficient historical data. Using ML-based estimation.';
      }

    } else if (method === 'ml') {
      // ML-based estimation
      result = calculateMLEstimate(companyData);
      result.months_of_data = monthsOfData;

    } else if (method === 'industry_average') {
      // Simple industry average
      result = calculateIndustryAverage(companyData);
      result.months_of_data = monthsOfData;

    } else {
      // Auto-detect best method
      if (monthsOfData >= 12) {
        result = await handler({ ...req, body: { ...req.body, method: 'historical' } } as any, res);
        return;
      } else if (monthsOfData >= 6) {
        result = await handler({ ...req, body: { ...req.body, method: 'hybrid' } } as any, res);
        return;
      } else {
        result = calculateMLEstimate(companyData);
      }
    }

    result.calculated_at = new Date().toISOString();

    return res.status(200).json(result);

  } catch (error: any) {
    console.error('Error calculating baseline:', error);
    return res.status(500).json({
      error: 'Failed to calculate baseline',
      details: error.message
    });
  }
}

function calculateMLEstimate(companyData: any): any {
  if (!companyData || !companyData.revenue || !companyData.industry) {
    return {
      baseline_emissions: 0,
      method: 'insufficient_data',
      data_quality: 'unknown',
      error: 'Insufficient company data for ML estimation'
    };
  }

  // Simplified ML estimation (in production, this would call Python ML model)
  const { revenue, employees = 100, energy_spend = 0, facility_sqft = 0, industry = 'technology', region = 'us' } = companyData;

  // Get industry intensity
  const intensity = INDUSTRY_BENCHMARKS[industry] || INDUSTRY_BENCHMARKS['technology'];

  // Base calculation: revenue × intensity
  let totalEmissions = (revenue / 1_000_000) * intensity;

  // Adjust based on energy spend (energy spend suggests higher direct emissions)
  if (energy_spend > 0) {
    const energyFactor = energy_spend / revenue;
    totalEmissions *= (1 + energyFactor * 2); // Higher energy spend = higher emissions
  }

  // Regional grid factor (simplified)
  const regionalFactors: Record<string, number> = {
    'northeast': 0.9,
    'west': 0.85,
    'midwest': 1.15,
    'south': 1.05,
  };
  const regionalAdjustment = regionalFactors[region] || 1.0;
  totalEmissions *= regionalAdjustment;

  // Estimate scope breakdown
  let scope1Pct, scope2Pct;
  if (industry.includes('manufacturing')) {
    scope1Pct = 0.3;
    scope2Pct = 0.4;
  } else if (industry.includes('transportation')) {
    scope1Pct = 0.4;
    scope2Pct = 0.2;
  } else {
    scope1Pct = 0.1;
    scope2Pct = 0.4;
  }
  const scope3Pct = 1 - scope1Pct - scope2Pct;

  // Estimate confidence interval (±30% for ML estimates)
  const uncertainty = 0.3;
  const lowerBound = totalEmissions * (1 - uncertainty);
  const upperBound = totalEmissions * (1 + uncertainty);

  return {
    baseline_emissions: Math.round(totalEmissions * 100) / 100,
    scope1_estimate: Math.round(totalEmissions * scope1Pct * 100) / 100,
    scope2_estimate: Math.round(totalEmissions * scope2Pct * 100) / 100,
    scope3_estimate: Math.round(totalEmissions * scope3Pct * 100) / 100,
    confidence_interval: [
      Math.round(lowerBound * 100) / 100,
      Math.round(upperBound * 100) / 100
    ],
    uncertainty_pct: Math.round(uncertainty * 100),
    method: 'ml_estimation',
    data_quality: 'estimated',
    note: 'Estimated using industry benchmarks and company profile'
  };
}

function calculateIndustryAverage(companyData: any): any {
  if (!companyData || !companyData.revenue || !companyData.industry) {
    return {
      baseline_emissions: 0,
      method: 'insufficient_data',
      data_quality: 'unknown'
    };
  }

  const { revenue, industry } = companyData;
  const intensity = INDUSTRY_BENCHMARKS[industry] || INDUSTRY_BENCHMARKS['technology'];
  const baseline = (revenue / 1_000_000) * intensity;

  return {
    baseline_emissions: Math.round(baseline * 100) / 100,
    method: 'industry_average',
    data_quality: 'estimated',
    industry_intensity: intensity,
    note: 'Simple calculation using industry average emission intensity'
  };
}

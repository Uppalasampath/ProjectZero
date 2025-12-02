/**
 * GET /api/emissions/sources/scope2
 *
 * Fetch all Scope 2 emission sources with detailed breakdown
 * Includes both location-based and market-based methods
 *
 * Query params:
 * - companyId: string (required)
 * - periodStart?: string (ISO date)
 * - periodEnd?: string (ISO date)
 * - method?: 'location_based' | 'market_based' | 'both'
 *
 * Response:
 * {
 *   sources: [
 *     {
 *       id: string,
 *       category: string,
 *       subcategory: string,
 *       activityAmount: number,
 *       activityUnit: string,
 *       emissionFactor: number,
 *       emissionFactorUnit: string,
 *       emissionFactorSource: 'eGRID' | 'IEA' | 'supplier',
 *       calculationMethod: 'location_based' | 'market_based',
 *       gridRegion?: string,
 *       totalCO2e: number,
 *       location?: string,
 *       description?: string,
 *       dataQuality: string,
 *       renewablePercentage?: number,
 *       periodStart: string,
 *       periodEnd: string
 *     }
 *   ],
 *   locationBasedTotal: number,
 *   marketBasedTotal: number,
 *   total: number,
 *   count: number
 * }
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { companyId, periodStart, periodEnd, method = 'both' } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: 'companyId is required' });
    }

    // Build query
    let query = supabase
      .from('emission_sources')
      .select('*')
      .eq('user_id', companyId)
      .eq('scope', 2)
      .order('category', { ascending: true })
      .order('created_at', { ascending: false });

    // Add date filters if provided
    if (periodStart) {
      query = query.gte('period_start', periodStart);
    }
    if (periodEnd) {
      query = query.lte('period_end', periodEnd);
    }

    // Filter by calculation method if specified
    if (method !== 'both') {
      query = query.eq('calculation_method', method);
    }

    const { data: sourcesData, error } = await query;

    if (error) throw error;

    // Transform to detailed response format
    const sources = sourcesData?.map(source => ({
      id: source.id,
      category: source.category_name || source.category || 'Purchased Electricity',
      subcategory: source.subcategory || '',
      activityAmount: Number(source.activity_amount),
      activityUnit: source.activity_unit || 'MWh',
      emissionFactor: Number(source.emission_factor),
      emissionFactorUnit: source.emission_factor_unit || 'kg CO2e per MWh',
      emissionFactorSource: source.emission_factor_source || 'eGRID',
      calculationMethod: source.calculation_method || 'location_based',
      gridRegion: source.grid_region || source.location,
      totalCO2e: Number(source.emission_amount),
      location: source.location,
      description: source.description,
      dataQuality: source.data_quality || 'calculated',
      renewablePercentage: source.renewable_percentage ? Number(source.renewable_percentage) : undefined,
      periodStart: source.period_start,
      periodEnd: source.period_end,
      createdAt: source.created_at,
      updatedAt: source.updated_at
    })) || [];

    // Calculate totals by method
    const locationBasedSources = sources.filter(s => s.calculationMethod === 'location_based');
    const marketBasedSources = sources.filter(s => s.calculationMethod === 'market_based');

    const locationBasedTotal = locationBasedSources.reduce((sum, source) => sum + source.totalCO2e, 0);
    const marketBasedTotal = marketBasedSources.reduce((sum, source) => sum + source.totalCO2e, 0);

    // Total uses market-based by default (GHG Protocol recommendation)
    const total = marketBasedTotal > 0 ? marketBasedTotal : locationBasedTotal;

    return res.status(200).json({
      sources,
      locationBasedTotal: Math.round(locationBasedTotal * 100) / 100,
      marketBasedTotal: Math.round(marketBasedTotal * 100) / 100,
      total: Math.round(total * 100) / 100,
      count: sources.length,
      scope: 2,
      breakdown: {
        locationBased: {
          count: locationBasedSources.length,
          total: locationBasedTotal
        },
        marketBased: {
          count: marketBasedSources.length,
          total: marketBasedTotal
        }
      }
    });

  } catch (error: any) {
    console.error('Error fetching Scope 2 sources:', error);
    return res.status(500).json({
      error: 'Failed to fetch Scope 2 sources',
      details: error.message
    });
  }
}

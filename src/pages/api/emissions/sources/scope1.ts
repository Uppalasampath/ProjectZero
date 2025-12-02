/**
 * GET /api/emissions/sources/scope1
 *
 * Fetch all Scope 1 emission sources with detailed breakdown
 *
 * Query params:
 * - companyId: string (required)
 * - periodStart?: string (ISO date)
 * - periodEnd?: string (ISO date)
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
 *       emissionFactorSource: 'EPA' | 'DEFRA' | 'IPCC',
 *       calculationMethod: string,
 *       totalCO2e: number,
 *       location?: string,
 *       description?: string,
 *       dataQuality: string,
 *       periodStart: string,
 *       periodEnd: string
 *     }
 *   ],
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
    const { companyId, periodStart, periodEnd } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: 'companyId is required' });
    }

    // Build query
    let query = supabase
      .from('emission_sources')
      .select('*')
      .eq('user_id', companyId)
      .eq('scope', 1)
      .order('category', { ascending: true })
      .order('created_at', { ascending: false });

    // Add date filters if provided
    if (periodStart) {
      query = query.gte('period_start', periodStart);
    }
    if (periodEnd) {
      query = query.lte('period_end', periodEnd);
    }

    const { data: sourcesData, error } = await query;

    if (error) throw error;

    // Transform to detailed response format
    const sources = sourcesData?.map(source => ({
      id: source.id,
      category: source.category_name || source.category,
      subcategory: source.subcategory || '',
      activityAmount: Number(source.activity_amount),
      activityUnit: source.activity_unit,
      emissionFactor: Number(source.emission_factor),
      emissionFactorUnit: source.emission_factor_unit || 'kg CO2e per unit',
      emissionFactorSource: source.emission_factor_source || 'EPA',
      calculationMethod: source.calculation_method || 'activity_data × emission_factor',
      totalCO2e: Number(source.emission_amount),
      location: source.location,
      description: source.description,
      dataQuality: source.data_quality || 'calculated',
      periodStart: source.period_start,
      periodEnd: source.period_end,
      createdAt: source.created_at,
      updatedAt: source.updated_at
    })) || [];

    // Calculate total
    const total = sources.reduce((sum, source) => sum + source.totalCO2e, 0);

    return res.status(200).json({
      sources,
      total: Math.round(total * 100) / 100,
      count: sources.length,
      scope: 1
    });

  } catch (error: any) {
    console.error('Error fetching Scope 1 sources:', error);
    return res.status(500).json({
      error: 'Failed to fetch Scope 1 sources',
      details: error.message
    });
  }
}

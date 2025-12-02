/**
 * GET /api/emissions/summary
 *
 * Returns emissions summary by scope with market/location-based breakdown
 *
 * Query params:
 * - companyId: string
 * - periodStart: ISO date string
 * - periodEnd: ISO date string
 *
 * Response:
 * {
 *   scope1: { total: number, breakdown: [...] },
 *   scope2: { market_based: number, location_based: number },
 *   scope3: { total: number, categories: [...] },
 *   grand_total: number
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

    // Fetch Scope 1 emissions
    const { data: scope1Data, error: scope1Error } = await supabase
      .from('emission_sources')
      .select('*')
      .eq('user_id', companyId)
      .eq('scope', 1);

    if (scope1Error) throw scope1Error;

    const scope1Total = scope1Data?.reduce((sum, item) => sum + (item.emission_amount || 0), 0) || 0;

    // Fetch Scope 2 emissions (both methods)
    const { data: scope2Data, error: scope2Error } = await supabase
      .from('emission_sources')
      .select('*')
      .eq('user_id', companyId)
      .eq('scope', 2);

    if (scope2Error) throw scope2Error;

    // Separate market-based and location-based
    const scope2Market = scope2Data
      ?.filter(item => item.calculation_method === 'market_based')
      .reduce((sum, item) => sum + (item.emission_amount || 0), 0) || 0;

    const scope2Location = scope2Data
      ?.filter(item => item.calculation_method === 'location_based' || !item.calculation_method)
      .reduce((sum, item) => sum + (item.emission_amount || 0), 0) || 0;

    // Fetch Scope 3 emissions
    const { data: scope3Data, error: scope3Error } = await supabase
      .from('emission_sources')
      .select('*')
      .eq('user_id', companyId)
      .eq('scope', 3);

    if (scope3Error) throw scope3Error;

    const scope3Total = scope3Data?.reduce((sum, item) => sum + (item.emission_amount || 0), 0) || 0;

    // Group Scope 3 by category (15 GHG Protocol categories)
    const scope3ByCategory = scope3Data?.reduce((acc: any, item) => {
      const category = item.category_name || 'other';
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += item.emission_amount || 0;
      return acc;
    }, {});

    const scope3Categories = Object.entries(scope3ByCategory || {}).map(([name, emissions]) => ({
      name,
      emissions: Number(emissions)
    }));

    // Calculate grand total (using market-based Scope 2 per GHG Protocol)
    const grandTotal = scope1Total + scope2Market + scope3Total;

    return res.status(200).json({
      scope1: {
        total: scope1Total,
        breakdown: scope1Data
      },
      scope2: {
        market_based: scope2Market,
        location_based: scope2Location,
        note: "Market-based method uses supplier-specific factors; Location-based uses regional grid averages"
      },
      scope3: {
        total: scope3Total,
        categories: scope3Categories
      },
      grand_total: grandTotal,
      reporting_period: {
        start: periodStart || null,
        end: periodEnd || null
      },
      generated_at: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error fetching emissions summary:', error);
    return res.status(500).json({
      error: 'Failed to fetch emissions summary',
      details: error.message
    });
  }
}

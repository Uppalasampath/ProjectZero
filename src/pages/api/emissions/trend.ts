/**
 * GET /api/emissions/trend
 *
 * Returns time-series emissions data for charts
 *
 * Query params:
 * - companyId: string
 * - period: 'monthly' | 'quarterly' | 'annual'
 * - startDate: ISO date string
 * - endDate: ISO date string
 *
 * Response:
 * {
 *   data: [
 *     { period: '2024-01', scope1: number, scope2: number, scope3: number, total: number },
 *     ...
 *   ]
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
    const { companyId, period = 'monthly', startDate, endDate } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: 'companyId is required' });
    }

    // Fetch emissions history
    let query = supabase
      .from('carbon_emissions')
      .select('reporting_period_end, scope_1_total, scope_2_total, scope_3_total')
      .eq('user_id', companyId)
      .order('reporting_period_end', { ascending: true });

    if (startDate) {
      query = query.gte('reporting_period_end', startDate);
    }

    if (endDate) {
      query = query.lte('reporting_period_end', endDate);
    }

    const { data: emissionsHistory, error } = await query;

    if (error) throw error;

    if (!emissionsHistory || emissionsHistory.length === 0) {
      return res.status(200).json({
        data: [],
        period,
        message: 'No historical data available'
      });
    }

    // Format data based on period
    const formattedData = emissionsHistory.map(record => {
      const date = new Date(record.reporting_period_end);
      let periodLabel: string;

      if (period === 'monthly') {
        periodLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      } else if (period === 'quarterly') {
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        periodLabel = `Q${quarter} ${date.getFullYear()}`;
      } else {
        periodLabel = date.getFullYear().toString();
      }

      return {
        period: periodLabel,
        scope1: record.scope_1_total || 0,
        scope2: record.scope_2_total || 0,
        scope3: record.scope_3_total || 0,
        total: (record.scope_1_total || 0) + (record.scope_2_total || 0) + (record.scope_3_total || 0)
      };
    });

    // If quarterly or annual, aggregate data
    let aggregatedData = formattedData;

    if (period === 'quarterly' || period === 'annual') {
      const grouped = formattedData.reduce((acc: any, item) => {
        if (!acc[item.period]) {
          acc[item.period] = { period: item.period, scope1: 0, scope2: 0, scope3: 0, total: 0 };
        }
        acc[item.period].scope1 += item.scope1;
        acc[item.period].scope2 += item.scope2;
        acc[item.period].scope3 += item.scope3;
        acc[item.period].total += item.total;
        return acc;
      }, {});

      aggregatedData = Object.values(grouped);
    }

    return res.status(200).json({
      data: aggregatedData,
      period,
      record_count: aggregatedData.length,
      generated_at: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error fetching emissions trend:', error);
    return res.status(500).json({
      error: 'Failed to fetch emissions trend',
      details: error.message
    });
  }
}

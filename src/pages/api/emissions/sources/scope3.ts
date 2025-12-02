/**
 * GET /api/emissions/sources/scope3
 *
 * Fetch all Scope 3 emission sources with detailed breakdown
 * Includes all 15 GHG Protocol Scope 3 categories
 *
 * Query params:
 * - companyId: string (required)
 * - periodStart?: string (ISO date)
 * - periodEnd?: string (ISO date)
 * - category?: string (filter by specific category)
 *
 * Response:
 * {
 *   sources: [...],
 *   byCategory: {
 *     'cat1_purchased_goods': { total: number, count: number, sources: [...] },
 *     'cat2_capital_goods': { total: number, count: number, sources: [...] },
 *     ...
 *   },
 *   total: number,
 *   count: number,
 *   categoriesWithData: string[]
 * }
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GHG Protocol Scope 3 Categories
const SCOPE3_CATEGORIES = [
  { id: 'cat1_purchased_goods', name: 'Category 1: Purchased Goods and Services' },
  { id: 'cat2_capital_goods', name: 'Category 2: Capital Goods' },
  { id: 'cat3_fuel_energy', name: 'Category 3: Fuel and Energy Related Activities' },
  { id: 'cat4_upstream_transport', name: 'Category 4: Upstream Transportation and Distribution' },
  { id: 'cat5_waste', name: 'Category 5: Waste Generated in Operations' },
  { id: 'cat6_business_travel', name: 'Category 6: Business Travel' },
  { id: 'cat7_employee_commuting', name: 'Category 7: Employee Commuting' },
  { id: 'cat8_upstream_leased', name: 'Category 8: Upstream Leased Assets' },
  { id: 'cat9_downstream_transport', name: 'Category 9: Downstream Transportation and Distribution' },
  { id: 'cat10_processing', name: 'Category 10: Processing of Sold Products' },
  { id: 'cat11_use_of_products', name: 'Category 11: Use of Sold Products' },
  { id: 'cat12_end_of_life', name: 'Category 12: End-of-Life Treatment of Sold Products' },
  { id: 'cat13_downstream_leased', name: 'Category 13: Downstream Leased Assets' },
  { id: 'cat14_franchises', name: 'Category 14: Franchises' },
  { id: 'cat15_investments', name: 'Category 15: Investments' }
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { companyId, periodStart, periodEnd, category } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: 'companyId is required' });
    }

    // Build query
    let query = supabase
      .from('emission_sources')
      .select('*')
      .eq('user_id', companyId)
      .eq('scope', 3)
      .order('category', { ascending: true })
      .order('created_at', { ascending: false });

    // Add date filters if provided
    if (periodStart) {
      query = query.gte('period_start', periodStart);
    }
    if (periodEnd) {
      query = query.lte('period_end', periodEnd);
    }

    // Filter by category if specified
    if (category) {
      query = query.eq('category', category);
    }

    const { data: sourcesData, error } = await query;

    if (error) throw error;

    // Transform to detailed response format
    const sources = sourcesData?.map(source => ({
      id: source.id,
      category: source.category,
      categoryName: getCategoryName(source.category),
      subcategory: source.subcategory || '',
      activityAmount: Number(source.activity_amount),
      activityUnit: source.activity_unit,
      emissionFactor: Number(source.emission_factor),
      emissionFactorUnit: source.emission_factor_unit || 'kg CO2e per unit',
      emissionFactorSource: source.emission_factor_source || 'DEFRA',
      calculationMethod: source.calculation_method || 'activity_data × emission_factor',
      totalCO2e: Number(source.emission_amount),
      location: source.location,
      description: source.description,
      dataQuality: source.data_quality || 'estimated',
      supplier: source.supplier,
      vendorName: source.vendor_name,
      periodStart: source.period_start,
      periodEnd: source.period_end,
      createdAt: source.created_at,
      updatedAt: source.updated_at
    })) || [];

    // Group by category
    const byCategory: Record<string, any> = {};
    const categoriesWithData: string[] = [];

    SCOPE3_CATEGORIES.forEach(cat => {
      const categorySources = sources.filter(s =>
        s.category === cat.id ||
        s.category.includes(cat.id.replace('cat', '').replace('_', ''))
      );

      if (categorySources.length > 0) {
        categoriesWithData.push(cat.id);
      }

      const categoryTotal = categorySources.reduce((sum, s) => sum + s.totalCO2e, 0);

      byCategory[cat.id] = {
        name: cat.name,
        total: Math.round(categoryTotal * 100) / 100,
        count: categorySources.length,
        sources: categorySources
      };
    });

    // Calculate grand total
    const total = sources.reduce((sum, source) => sum + source.totalCO2e, 0);

    return res.status(200).json({
      sources,
      byCategory,
      total: Math.round(total * 100) / 100,
      count: sources.length,
      scope: 3,
      categoriesWithData,
      categoriesReported: categoriesWithData.length,
      categoriesTotal: 15,
      completeness: Math.round((categoriesWithData.length / 15) * 100)
    });

  } catch (error: any) {
    console.error('Error fetching Scope 3 sources:', error);
    return res.status(500).json({
      error: 'Failed to fetch Scope 3 sources',
      details: error.message
    });
  }
}

/**
 * Get human-readable category name
 */
function getCategoryName(categoryId: string): string {
  const category = SCOPE3_CATEGORIES.find(cat =>
    cat.id === categoryId ||
    categoryId.includes(cat.id.replace('cat', '').replace('_', ''))
  );
  return category?.name || categoryId;
}

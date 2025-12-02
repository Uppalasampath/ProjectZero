/**
 * POST /api/integrations/map
 *
 * Configure field mappings between ERP system and emissions categories
 * Maps GL accounts, expense categories, or transaction types to emission sources
 *
 * Request body:
 * {
 *   companyId: string,
 *   integrationId: string,
 *   mappings: [
 *     {
 *       erpField: string,        // GL account number, expense category, etc.
 *       erpFieldType: 'gl_account' | 'expense_category' | 'vendor' | 'cost_center',
 *       erpFieldValue: string,   // e.g., "500100", "Fuel & Gas", etc.
 *       emissionScope: 1 | 2 | 3,
 *       emissionCategory: string,
 *       emissionSubcategory?: string,
 *       defaultUnit?: string,
 *       conversionFactor?: number,  // e.g., USD to gallons
 *       notes?: string
 *     }
 *   ]
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   mappingsCreated: number,
 *   mappings: any[]
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
  if (req.method === 'POST') {
    return handleCreateMappings(req, res);
  } else if (req.method === 'GET') {
    return handleGetMappings(req, res);
  } else if (req.method === 'DELETE') {
    return handleDeleteMapping(req, res);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

/**
 * Create or update field mappings
 */
async function handleCreateMappings(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { companyId, integrationId, mappings } = req.body;

    if (!companyId || !integrationId || !mappings || !Array.isArray(mappings)) {
      return res.status(400).json({
        error: 'Missing required fields: companyId, integrationId, mappings (array)'
      });
    }

    // Validate integration exists
    const { data: integration, error: integrationError } = await supabase
      .from('erp_integrations')
      .select('id, system_type')
      .eq('id', integrationId)
      .eq('company_id', companyId)
      .single();

    if (integrationError || !integration) {
      throw new Error('Integration not found or unauthorized');
    }

    // Validate and prepare mappings
    const mappingRecords = mappings.map(mapping => {
      if (!mapping.erpField || !mapping.emissionScope || !mapping.emissionCategory) {
        throw new Error('Each mapping must have erpField, emissionScope, and emissionCategory');
      }

      return {
        company_id: companyId,
        integration_id: integrationId,
        erp_field: mapping.erpField,
        erp_field_type: mapping.erpFieldType || 'gl_account',
        erp_field_value: mapping.erpFieldValue,
        emission_scope: mapping.emissionScope,
        emission_category: mapping.emissionCategory,
        emission_subcategory: mapping.emissionSubcategory,
        default_unit: mapping.defaultUnit,
        conversion_factor: mapping.conversionFactor,
        notes: mapping.notes,
        active: true,
        created_at: new Date().toISOString()
      };
    });

    // Upsert mappings (update if exists, insert if not)
    const { data: createdMappings, error: mappingError } = await supabase
      .from('erp_field_mappings')
      .upsert(mappingRecords, {
        onConflict: 'integration_id,erp_field,erp_field_value'
      })
      .select();

    if (mappingError) throw mappingError;

    return res.status(200).json({
      success: true,
      mappingsCreated: createdMappings?.length || 0,
      mappings: createdMappings
    });

  } catch (error: any) {
    console.error('Error creating field mappings:', error);
    return res.status(500).json({
      error: 'Failed to create field mappings',
      details: error.message
    });
  }
}

/**
 * Get existing field mappings
 */
async function handleGetMappings(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { companyId, integrationId } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: 'companyId is required' });
    }

    let query = supabase
      .from('erp_field_mappings')
      .select('*')
      .eq('company_id', companyId)
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (integrationId) {
      query = query.eq('integration_id', integrationId);
    }

    const { data: mappings, error } = await query;

    if (error) throw error;

    // Group by integration
    const byIntegration: Record<string, any[]> = {};
    mappings?.forEach(mapping => {
      if (!byIntegration[mapping.integration_id]) {
        byIntegration[mapping.integration_id] = [];
      }
      byIntegration[mapping.integration_id].push(mapping);
    });

    return res.status(200).json({
      mappings: mappings || [],
      count: mappings?.length || 0,
      byIntegration
    });

  } catch (error: any) {
    console.error('Error fetching field mappings:', error);
    return res.status(500).json({
      error: 'Failed to fetch field mappings',
      details: error.message
    });
  }
}

/**
 * Delete a field mapping
 */
async function handleDeleteMapping(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { mappingId, companyId } = req.query;

    if (!mappingId || !companyId) {
      return res.status(400).json({ error: 'mappingId and companyId are required' });
    }

    // Soft delete (set active = false)
    const { error } = await supabase
      .from('erp_field_mappings')
      .update({ active: false })
      .eq('id', mappingId)
      .eq('company_id', companyId);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: 'Mapping deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting field mapping:', error);
    return res.status(500).json({
      error: 'Failed to delete field mapping',
      details: error.message
    });
  }
}

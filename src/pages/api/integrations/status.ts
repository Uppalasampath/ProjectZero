/**
 * GET /api/integrations/status
 *
 * Get status of all ERP/Financial integrations for a company
 *
 * Query params:
 * - companyId: string (required)
 * - integrationId?: string (optional - get specific integration)
 *
 * Response:
 * {
 *   integrations: [
 *     {
 *       id: string,
 *       systemType: string,
 *       status: 'connected' | 'disconnected' | 'error' | 'expired',
 *       connectedAt: string,
 *       lastSyncAt?: string,
 *       lastSyncStatus?: 'success' | 'failed',
 *       lastSyncRecords?: number,
 *       tokenExpiresAt?: string,
 *       isExpired: boolean,
 *       health: 'healthy' | 'warning' | 'critical',
 *       mappingsCount: number,
 *       totalRecordsSynced: number
 *     }
 *   ],
 *   summary: {
 *     total: number,
 *     connected: number,
 *     disconnected: number,
 *     errors: number
 *   }
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
    const { companyId, integrationId } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: 'companyId is required' });
    }

    // Build query
    let query = supabase
      .from('erp_integrations')
      .select('*')
      .eq('company_id', companyId)
      .order('connected_at', { ascending: false });

    if (integrationId) {
      query = query.eq('id', integrationId);
    }

    const { data: integrations, error } = await query;

    if (error) throw error;

    if (!integrations || integrations.length === 0) {
      return res.status(200).json({
        integrations: [],
        summary: {
          total: 0,
          connected: 0,
          disconnected: 0,
          errors: 0
        }
      });
    }

    // Enrich each integration with status details
    const enrichedIntegrations = await Promise.all(
      integrations.map(async (integration) => {
        // Get last sync log
        const { data: lastSync } = await supabase
          .from('erp_sync_logs')
          .select('*')
          .eq('integration_id', integration.id)
          .order('started_at', { ascending: false })
          .limit(1)
          .single();

        // Get mappings count
        const { count: mappingsCount } = await supabase
          .from('erp_field_mappings')
          .select('*', { count: 'exact', head: true })
          .eq('integration_id', integration.id)
          .eq('active', true);

        // Get total records synced
        const { data: allSyncs } = await supabase
          .from('erp_sync_logs')
          .select('records_imported')
          .eq('integration_id', integration.id)
          .eq('status', 'completed');

        const totalRecordsSynced = allSyncs?.reduce(
          (sum, sync) => sum + (sync.records_imported || 0),
          0
        ) || 0;

        // Check if token is expired
        const isExpired = integration.token_expires_at
          ? new Date(integration.token_expires_at) < new Date()
          : false;

        // Determine health status
        let health: 'healthy' | 'warning' | 'critical' = 'healthy';

        if (integration.status !== 'connected') {
          health = 'critical';
        } else if (isExpired) {
          health = 'critical';
        } else if (lastSync?.status === 'failed') {
          health = 'warning';
        } else if (integration.last_sync_at) {
          // Check if last sync was more than 7 days ago
          const daysSinceSync = Math.floor(
            (Date.now() - new Date(integration.last_sync_at).getTime()) /
            (1000 * 60 * 60 * 24)
          );
          if (daysSinceSync > 7) {
            health = 'warning';
          }
        }

        return {
          id: integration.id,
          systemType: integration.system_type,
          systemName: getSystemName(integration.system_type),
          status: isExpired ? 'expired' : integration.status,
          connectedAt: integration.connected_at,
          lastSyncAt: integration.last_sync_at,
          lastSyncStatus: lastSync?.status,
          lastSyncRecords: lastSync?.records_imported,
          lastSyncErrors: lastSync?.errors,
          tokenExpiresAt: integration.token_expires_at,
          isExpired,
          health,
          mappingsCount: mappingsCount || 0,
          totalRecordsSynced,
          authMethod: integration.auth_method,
          baseUrl: integration.base_url,
          metadata: integration.metadata
        };
      })
    );

    // Calculate summary
    const summary = {
      total: enrichedIntegrations.length,
      connected: enrichedIntegrations.filter(i => i.status === 'connected' && !i.isExpired).length,
      disconnected: enrichedIntegrations.filter(i => i.status === 'disconnected').length,
      expired: enrichedIntegrations.filter(i => i.isExpired).length,
      errors: enrichedIntegrations.filter(i => i.health === 'critical').length,
      warnings: enrichedIntegrations.filter(i => i.health === 'warning').length,
      healthy: enrichedIntegrations.filter(i => i.health === 'healthy').length
    };

    return res.status(200).json({
      integrations: enrichedIntegrations,
      summary
    });

  } catch (error: any) {
    console.error('Error fetching integration status:', error);
    return res.status(500).json({
      error: 'Failed to fetch integration status',
      details: error.message
    });
  }
}

/**
 * Get human-readable system name
 */
function getSystemName(systemType: string): string {
  const names: Record<string, string> = {
    'sap': 'SAP ERP',
    'oracle': 'Oracle Cloud ERP',
    'netsuite': 'NetSuite',
    'quickbooks': 'QuickBooks Online',
    'workday': 'Workday',
    'dynamics365': 'Microsoft Dynamics 365'
  };
  return names[systemType] || systemType;
}

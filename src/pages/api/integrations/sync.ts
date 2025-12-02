/**
 * POST /api/integrations/sync
 *
 * Sync activity data from connected ERP/Financial systems
 * Pulls fuel purchases, utility bills, travel expenses, procurement data
 *
 * Request body:
 * {
 *   companyId: string,
 *   integrationId: string,
 *   syncType: 'full' | 'incremental',
 *   dateRange: {
 *     start: string,  // ISO date
 *     end: string     // ISO date
 *   },
 *   dataTypes?: string[]  // ['fuel', 'electricity', 'travel', 'procurement', 'waste']
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   syncId: string,
 *   recordsImported: number,
 *   breakdown: {
 *     fuel: number,
 *     electricity: number,
 *     travel: number,
 *     procurement: number,
 *     waste: number
 *   },
 *   errors: any[],
 *   syncedAt: string
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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      companyId,
      integrationId,
      syncType = 'incremental',
      dateRange,
      dataTypes = ['fuel', 'electricity', 'travel', 'procurement', 'waste']
    } = req.body;

    if (!companyId || !integrationId) {
      return res.status(400).json({
        error: 'Missing required fields: companyId, integrationId'
      });
    }

    // Fetch integration credentials
    const { data: integration, error: integrationError } = await supabase
      .from('erp_integrations')
      .select('*')
      .eq('id', integrationId)
      .eq('company_id', companyId)
      .single();

    if (integrationError || !integration) {
      throw new Error('Integration not found or unauthorized');
    }

    if (integration.status !== 'connected') {
      throw new Error('Integration is not connected. Please reconnect.');
    }

    // Create sync record
    const { data: syncRecord, error: syncError } = await supabase
      .from('erp_sync_logs')
      .insert({
        company_id: companyId,
        integration_id: integrationId,
        sync_type: syncType,
        status: 'in_progress',
        started_at: new Date().toISOString(),
        date_range_start: dateRange?.start,
        date_range_end: dateRange?.end
      })
      .select()
      .single();

    if (syncError) throw syncError;

    const syncId = syncRecord.id;

    // Perform sync based on system type
    let syncResults: any;
    const errors: any[] = [];

    try {
      switch (integration.system_type) {
        case 'sap':
          syncResults = await syncFromSAP(integration, dateRange, dataTypes);
          break;
        case 'oracle':
          syncResults = await syncFromOracle(integration, dateRange, dataTypes);
          break;
        case 'netsuite':
          syncResults = await syncFromNetSuite(integration, dateRange, dataTypes);
          break;
        case 'quickbooks':
          syncResults = await syncFromQuickBooks(integration, dateRange, dataTypes);
          break;
        case 'workday':
          syncResults = await syncFromWorkday(integration, dateRange, dataTypes);
          break;
        case 'dynamics365':
          syncResults = await syncFromDynamics365(integration, dateRange, dataTypes);
          break;
        default:
          throw new Error(`Unsupported system type: ${integration.system_type}`);
      }

      // Import records into emission_sources table
      const importedRecords = await importActivityData(
        companyId,
        syncId,
        syncResults.records
      );

      // Update sync record
      await supabase
        .from('erp_sync_logs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          records_imported: importedRecords.count,
          breakdown: importedRecords.breakdown,
          errors: errors.length > 0 ? errors : null
        })
        .eq('id', syncId);

      // Update integration last sync time
      await supabase
        .from('erp_integrations')
        .update({
          last_sync_at: new Date().toISOString()
        })
        .eq('id', integrationId);

      return res.status(200).json({
        success: true,
        syncId,
        recordsImported: importedRecords.count,
        breakdown: importedRecords.breakdown,
        errors: errors.length > 0 ? errors : [],
        syncedAt: new Date().toISOString()
      });

    } catch (syncError: any) {
      // Mark sync as failed
      await supabase
        .from('erp_sync_logs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          errors: [{ message: syncError.message, timestamp: new Date().toISOString() }]
        })
        .eq('id', syncId);

      throw syncError;
    }

  } catch (error: any) {
    console.error('Error syncing data from ERP:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to sync data from ERP system',
      details: error.message
    });
  }
}

/**
 * Sync from SAP
 */
async function syncFromSAP(integration: any, dateRange: any, dataTypes: string[]): Promise<any> {
  const records: any[] = [];
  const credentials = integration.credentials;

  const headers = {
    'Authorization': `Bearer ${integration.access_token}`,
    'Accept': 'application/json'
  };

  // Fuel purchases (GL Account 500100)
  if (dataTypes.includes('fuel')) {
    const fuelResponse = await fetch(
      `${credentials.baseUrl}/sap/opu/odata/sap/API_JOURNALENTRY_SRV/A_JournalEntry?$filter=PostingDate ge '${dateRange.start}' and PostingDate le '${dateRange.end}' and GLAccount eq '500100'`,
      { headers }
    );

    if (fuelResponse.ok) {
      const fuelData = await fuelResponse.json();
      fuelData.d?.results?.forEach((entry: any) => {
        records.push({
          type: 'fuel',
          scope: 1,
          category: 'stationary_combustion',
          activityAmount: parseFloat(entry.AmountInTransactionCurrency),
          activityUnit: 'USD',
          date: entry.PostingDate,
          description: entry.DocumentItemText,
          sourceReference: entry.AccountingDocument
        });
      });
    }
  }

  // Electricity bills (GL Account 520200)
  if (dataTypes.includes('electricity')) {
    const electricityResponse = await fetch(
      `${credentials.baseUrl}/sap/opu/odata/sap/API_JOURNALENTRY_SRV/A_JournalEntry?$filter=PostingDate ge '${dateRange.start}' and PostingDate le '${dateRange.end}' and GLAccount eq '520200'`,
      { headers }
    );

    if (electricityResponse.ok) {
      const electricityData = await electricityResponse.json();
      electricityData.d?.results?.forEach((entry: any) => {
        records.push({
          type: 'electricity',
          scope: 2,
          category: 'purchased_electricity',
          activityAmount: parseFloat(entry.AmountInTransactionCurrency),
          activityUnit: 'USD',
          date: entry.PostingDate,
          description: entry.DocumentItemText,
          sourceReference: entry.AccountingDocument
        });
      });
    }
  }

  // Business travel (GL Account 660100)
  if (dataTypes.includes('travel')) {
    const travelResponse = await fetch(
      `${credentials.baseUrl}/sap/opu/odata/sap/API_JOURNALENTRY_SRV/A_JournalEntry?$filter=PostingDate ge '${dateRange.start}' and PostingDate le '${dateRange.end}' and GLAccount eq '660100'`,
      { headers }
    );

    if (travelResponse.ok) {
      const travelData = await travelResponse.json();
      travelData.d?.results?.forEach((entry: any) => {
        records.push({
          type: 'travel',
          scope: 3,
          category: 'cat6_business_travel',
          activityAmount: parseFloat(entry.AmountInTransactionCurrency),
          activityUnit: 'USD',
          date: entry.PostingDate,
          description: entry.DocumentItemText,
          sourceReference: entry.AccountingDocument
        });
      });
    }
  }

  return { records };
}

/**
 * Sync from Oracle
 */
async function syncFromOracle(integration: any, dateRange: any, dataTypes: string[]): Promise<any> {
  const records: any[] = [];
  // Similar implementation to SAP using Oracle REST API
  // Placeholder for now
  return { records };
}

/**
 * Sync from NetSuite
 */
async function syncFromNetSuite(integration: any, dateRange: any, dataTypes: string[]): Promise<any> {
  const records: any[] = [];
  // NetSuite SuiteCloud Platform REST API implementation
  // Placeholder for now
  return { records };
}

/**
 * Sync from QuickBooks
 */
async function syncFromQuickBooks(integration: any, dateRange: any, dataTypes: string[]): Promise<any> {
  const records: any[] = [];
  const credentials = integration.credentials;

  const headers = {
    'Authorization': `Bearer ${integration.access_token}`,
    'Accept': 'application/json'
  };

  const baseUrl = `https://quickbooks.api.intuit.com/v3/company/${credentials.realmId}`;

  // Query expenses by category
  if (dataTypes.includes('fuel') || dataTypes.includes('electricity') || dataTypes.includes('travel')) {
    const query = `SELECT * FROM Purchase WHERE TxnDate >= '${dateRange.start}' AND TxnDate <= '${dateRange.end}'`;
    const response = await fetch(
      `${baseUrl}/query?query=${encodeURIComponent(query)}`,
      { headers }
    );

    if (response.ok) {
      const data = await response.json();
      data.QueryResponse?.Purchase?.forEach((purchase: any) => {
        // Categorize based on expense category
        const category = purchase.Line?.[0]?.AccountRef?.name?.toLowerCase() || '';

        if (category.includes('fuel') && dataTypes.includes('fuel')) {
          records.push({
            type: 'fuel',
            scope: 1,
            category: 'mobile_combustion',
            activityAmount: parseFloat(purchase.TotalAmt),
            activityUnit: 'USD',
            date: purchase.TxnDate,
            description: purchase.PrivateNote || 'Fuel purchase',
            sourceReference: purchase.Id
          });
        } else if (category.includes('electric') && dataTypes.includes('electricity')) {
          records.push({
            type: 'electricity',
            scope: 2,
            category: 'purchased_electricity',
            activityAmount: parseFloat(purchase.TotalAmt),
            activityUnit: 'USD',
            date: purchase.TxnDate,
            description: purchase.PrivateNote || 'Electricity bill',
            sourceReference: purchase.Id
          });
        } else if (category.includes('travel') && dataTypes.includes('travel')) {
          records.push({
            type: 'travel',
            scope: 3,
            category: 'cat6_business_travel',
            activityAmount: parseFloat(purchase.TotalAmt),
            activityUnit: 'USD',
            date: purchase.TxnDate,
            description: purchase.PrivateNote || 'Business travel',
            sourceReference: purchase.Id
          });
        }
      });
    }
  }

  return { records };
}

/**
 * Sync from Workday
 */
async function syncFromWorkday(integration: any, dateRange: any, dataTypes: string[]): Promise<any> {
  const records: any[] = [];
  // Workday Financial Management API implementation
  // Placeholder for now
  return { records };
}

/**
 * Sync from Dynamics 365
 */
async function syncFromDynamics365(integration: any, dateRange: any, dataTypes: string[]): Promise<any> {
  const records: any[] = [];
  // Microsoft Dynamics 365 Web API implementation
  // Placeholder for now
  return { records };
}

/**
 * Import activity data into emission_sources table
 */
async function importActivityData(
  companyId: string,
  syncId: string,
  records: any[]
): Promise<{ count: number; breakdown: any }> {
  const breakdown = {
    fuel: 0,
    electricity: 0,
    travel: 0,
    procurement: 0,
    waste: 0
  };

  // Transform ERP records into emission sources
  const emissionSources = records.map(record => {
    // Count by type
    if (record.type in breakdown) {
      breakdown[record.type as keyof typeof breakdown]++;
    }

    return {
      user_id: companyId,
      scope: record.scope,
      category: record.category,
      subcategory: record.subcategory,
      activity_amount: record.activityAmount,
      activity_unit: record.activityUnit,
      period_start: record.date,
      period_end: record.date,
      description: record.description,
      source: 'ERP Integration',
      source_reference: record.sourceReference,
      sync_id: syncId,
      data_quality: 'calculated',
      status: 'pending_calculation',  // Needs emission factor calculation
      created_at: new Date().toISOString()
    };
  });

  // Batch insert
  if (emissionSources.length > 0) {
    const { error } = await supabase
      .from('emission_sources')
      .insert(emissionSources);

    if (error) throw error;
  }

  return {
    count: emissionSources.length,
    breakdown
  };
}

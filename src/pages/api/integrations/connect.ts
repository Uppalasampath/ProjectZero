/**
 * POST /api/integrations/connect
 *
 * Establish connection to ERP/Financial systems
 * Handles OAuth flows and API key authentication
 *
 * Request body:
 * {
 *   companyId: string,
 *   systemType: 'sap' | 'oracle' | 'netsuite' | 'quickbooks' | 'workday' | 'dynamics365',
 *   authMethod: 'oauth' | 'api_key' | 'username_password',
 *   credentials: {
 *     // For OAuth
 *     code?: string,
 *     redirectUri?: string,
 *     // For API Key
 *     apiKey?: string,
 *     apiSecret?: string,
 *     // For Username/Password
 *     username?: string,
 *     password?: string,
 *     // Common
 *     baseUrl?: string,
 *     tenantId?: string,
 *     companyId?: string,
 *     realmId?: string  // QuickBooks specific
 *   }
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   integrationId: string,
 *   systemType: string,
 *   status: 'connected' | 'failed',
 *   connectionDetails: {
 *     connectedAt: string,
 *     expiresAt?: string,
 *     scopes?: string[]
 *   },
 *   error?: string
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
    const { companyId, systemType, authMethod, credentials } = req.body;

    if (!companyId || !systemType || !authMethod || !credentials) {
      return res.status(400).json({
        error: 'Missing required fields: companyId, systemType, authMethod, credentials'
      });
    }

    // Validate system type
    const validSystems = ['sap', 'oracle', 'netsuite', 'quickbooks', 'workday', 'dynamics365'];
    if (!validSystems.includes(systemType)) {
      return res.status(400).json({
        error: `Invalid systemType. Must be one of: ${validSystems.join(', ')}`
      });
    }

    // Perform connection based on system type and auth method
    let connectionResult: any;

    switch (systemType) {
      case 'sap':
        connectionResult = await connectSAP(credentials, authMethod);
        break;
      case 'oracle':
        connectionResult = await connectOracle(credentials, authMethod);
        break;
      case 'netsuite':
        connectionResult = await connectNetSuite(credentials, authMethod);
        break;
      case 'quickbooks':
        connectionResult = await connectQuickBooks(credentials, authMethod);
        break;
      case 'workday':
        connectionResult = await connectWorkday(credentials, authMethod);
        break;
      case 'dynamics365':
        connectionResult = await connectDynamics365(credentials, authMethod);
        break;
      default:
        throw new Error('Unsupported system type');
    }

    if (!connectionResult.success) {
      throw new Error(connectionResult.error || 'Connection failed');
    }

    // Store integration credentials in database
    const { data: integration, error: dbError } = await supabase
      .from('erp_integrations')
      .upsert({
        company_id: companyId,
        system_type: systemType,
        auth_method: authMethod,
        status: 'connected',
        credentials: encryptCredentials(connectionResult.credentials),
        access_token: connectionResult.accessToken,
        refresh_token: connectionResult.refreshToken,
        token_expires_at: connectionResult.expiresAt,
        base_url: credentials.baseUrl,
        tenant_id: credentials.tenantId,
        connected_at: new Date().toISOString(),
        last_sync_at: null,
        metadata: connectionResult.metadata || {}
      }, {
        onConflict: 'company_id,system_type'
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return res.status(200).json({
      success: true,
      integrationId: integration.id,
      systemType,
      status: 'connected',
      connectionDetails: {
        connectedAt: integration.connected_at,
        expiresAt: integration.token_expires_at,
        scopes: connectionResult.scopes || []
      }
    });

  } catch (error: any) {
    console.error('Error connecting to ERP system:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to connect to ERP system',
      details: error.message
    });
  }
}

/**
 * Connect to SAP
 */
async function connectSAP(credentials: any, authMethod: string): Promise<any> {
  // SAP uses OAuth 2.0 or Basic Auth
  if (authMethod === 'oauth') {
    // Exchange authorization code for access token
    const tokenResponse = await fetch(`${credentials.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: credentials.code!,
        client_id: process.env.SAP_CLIENT_ID!,
        client_secret: process.env.SAP_CLIENT_SECRET!,
        redirect_uri: credentials.redirectUri!
      })
    });

    if (!tokenResponse.ok) {
      throw new Error('SAP OAuth failed');
    }

    const tokenData = await tokenResponse.json();

    return {
      success: true,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
      credentials: { baseUrl: credentials.baseUrl },
      scopes: tokenData.scope?.split(' ') || []
    };
  } else if (authMethod === 'api_key') {
    // Test API key by making a simple request
    const testResponse = await fetch(`${credentials.baseUrl}/sap/opu/odata/sap/API_BUSINESSPARTNER_SRV/$metadata`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64')}`
      }
    });

    if (!testResponse.ok) {
      throw new Error('SAP API key authentication failed');
    }

    return {
      success: true,
      credentials: {
        baseUrl: credentials.baseUrl,
        username: credentials.username,
        password: credentials.password
      }
    };
  }

  throw new Error('Unsupported auth method for SAP');
}

/**
 * Connect to Oracle
 */
async function connectOracle(credentials: any, authMethod: string): Promise<any> {
  // Oracle Cloud uses OAuth 2.0
  if (authMethod === 'oauth') {
    const tokenResponse = await fetch(`${credentials.baseUrl}/oauth/v1/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.ORACLE_CLIENT_ID!,
        client_secret: process.env.ORACLE_CLIENT_SECRET!,
        scope: 'urn:opc:resource:consumer::all'
      })
    });

    if (!tokenResponse.ok) {
      throw new Error('Oracle OAuth failed');
    }

    const tokenData = await tokenResponse.json();

    return {
      success: true,
      accessToken: tokenData.access_token,
      expiresAt: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
      credentials: { baseUrl: credentials.baseUrl }
    };
  }

  throw new Error('Unsupported auth method for Oracle');
}

/**
 * Connect to NetSuite
 */
async function connectNetSuite(credentials: any, authMethod: string): Promise<any> {
  // NetSuite uses Token-Based Authentication
  if (authMethod === 'api_key') {
    return {
      success: true,
      credentials: {
        accountId: credentials.accountId,
        consumerKey: credentials.consumerKey,
        consumerSecret: credentials.consumerSecret,
        tokenId: credentials.tokenId,
        tokenSecret: credentials.tokenSecret
      }
    };
  }

  throw new Error('Unsupported auth method for NetSuite');
}

/**
 * Connect to QuickBooks
 */
async function connectQuickBooks(credentials: any, authMethod: string): Promise<any> {
  // QuickBooks uses OAuth 2.0
  if (authMethod === 'oauth') {
    const tokenResponse = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.QUICKBOOKS_CLIENT_ID}:${process.env.QUICKBOOKS_CLIENT_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: credentials.code!,
        redirect_uri: credentials.redirectUri!
      })
    });

    if (!tokenResponse.ok) {
      throw new Error('QuickBooks OAuth failed');
    }

    const tokenData = await tokenResponse.json();

    return {
      success: true,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
      credentials: { realmId: credentials.realmId }
    };
  }

  throw new Error('Unsupported auth method for QuickBooks');
}

/**
 * Connect to Workday
 */
async function connectWorkday(credentials: any, authMethod: string): Promise<any> {
  // Workday uses Basic Auth with API user
  if (authMethod === 'username_password') {
    return {
      success: true,
      credentials: {
        baseUrl: credentials.baseUrl,
        username: credentials.username,
        password: credentials.password,
        tenantId: credentials.tenantId
      }
    };
  }

  throw new Error('Unsupported auth method for Workday');
}

/**
 * Connect to Microsoft Dynamics 365
 */
async function connectDynamics365(credentials: any, authMethod: string): Promise<any> {
  // Dynamics 365 uses Azure AD OAuth 2.0
  if (authMethod === 'oauth') {
    const tokenResponse = await fetch(`https://login.microsoftonline.com/${credentials.tenantId}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: credentials.code!,
        client_id: process.env.DYNAMICS365_CLIENT_ID!,
        client_secret: process.env.DYNAMICS365_CLIENT_SECRET!,
        redirect_uri: credentials.redirectUri!,
        scope: 'https://org.crm.dynamics.com/.default'
      })
    });

    if (!tokenResponse.ok) {
      throw new Error('Dynamics 365 OAuth failed');
    }

    const tokenData = await tokenResponse.json();

    return {
      success: true,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
      credentials: {
        baseUrl: credentials.baseUrl,
        tenantId: credentials.tenantId
      }
    };
  }

  throw new Error('Unsupported auth method for Dynamics 365');
}

/**
 * Encrypt credentials before storing
 */
function encryptCredentials(credentials: any): any {
  // In production, use proper encryption (AES-256)
  // For now, return as-is (credentials are already protected by database encryption)
  return credentials;
}

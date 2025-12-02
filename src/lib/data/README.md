# Project Zero - Unified ESG Data Architecture

## 🏗️ Architecture Overview

Project Zero is now a **fully dynamic, interconnected, real-time compliance platform** where all ESG and sustainability data flows through a unified backend and automatically updates dashboards, charts, emissions calculators, compliance reports, and regulatory outputs.

### Core Principles

✅ **Single Source of Truth** - All data stored in `UnifiedComplianceModel`
✅ **Real-Time Updates** - Event-driven architecture with automatic propagation
✅ **Full Traceability** - Complete audit trail for every data change
✅ **Framework Agnostic** - Supports 5 major regulatory frameworks
✅ **Production Ready** - Enterprise-grade validation, error handling, security

---

## 📊 System Components

### 1. **UnifiedComplianceModel** (Database Layer)

**Files:**
- `prisma/schema.prisma` - Prisma ORM schema (20+ entities)
- `src/lib/data/UnifiedComplianceModel.sql` - Raw SQL schema

**Core Entities:**

| Entity | Purpose | Key Relationships |
|--------|---------|-------------------|
| `Company` | Organization profile | → Facilities, ActivityData, Reports |
| `Facility` | Physical locations | → ActivityData, Emissions |
| `ActivityData` | Source data (fuel, electricity, etc.) | → CalculatedEmissions |
| `EmissionFactor` | Regulatory factors (EPA, eGRID, etc.) | → CalculatedEmissions |
| `CalculatedEmission` | Computed emissions results | → ActivityData, EmissionFactor |
| `SupplyChainData` | Supplier information & Scope 3 | → Company |
| `WorkforceData` | Employee data for CSRD S1 | → Company, Facility |
| `FinancialData` | Revenue, climate CapEx/OpEx | → Company |
| `MaterialityAssessment` | CSRD double materiality | → MaterialityTopics |
| `GeneratedReport` | Compliance reports | → Company |
| `AuditLog` | Change tracking & lineage | → All entities |
| `AssuranceStatus` | Third-party verification | → Company |

**Setup:**

```bash
# Install Prisma
npm install @prisma/client prisma

# Generate Prisma client
npx prisma generate

# Create database
createdb project_zero

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed emission factors
npx prisma db seed
```

---

### 2. **ProjectZeroDataFlow** (Data Pipeline)

**File:** `src/lib/data/ProjectZeroDataFlow.ts`

**Pipeline Layers:**

```
┌─────────────────────────────────────────────────────────────────┐
│                      INGESTION LAYER                             │
│  • CSV/Excel Upload  • API Feeds  • Manual Entry  • IoT Sensors │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                     PROCESSING LAYER                             │
│  • Unit Normalization  • Data Validation  • Anomaly Detection   │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                   CALCULATION LAYER                              │
│  • Match Emission Factors  • Calculate CO2e  • Store Results    │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                  FRAMEWORK MAPPING LAYER                         │
│  • SB-253  • CSRD  • CDP  • TCFD  • ISSB                        │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                   DASHBOARD SYNC LAYER                           │
│  • Carbon Emissions  • Materiality  • Compliance  • Supply Chain│
└─────────────────────────────────────────────────────────────────┘
```

**Usage Examples:**

#### Ingest CSV Data

```typescript
import { ingestFromCSV } from '@/lib/data/ProjectZeroDataFlow';

const result = await ingestFromCSV(file, {
  sourceType: 'csv',
  sourceId: 'monthly-utility-bills',
  companyId: 'company-uuid',
  metadata: {
    uploadedBy: 'user@company.com'
  }
});

console.log(`Accepted: ${result.recordsAccepted}, Rejected: ${result.recordsRejected}`);
```

#### Ingest from API

```typescript
import { ingestFromAPI } from '@/lib/data/ProjectZeroDataFlow';

const result = await ingestFromAPI(
  'https://api.utility-provider.com/usage',
  {
    authToken: process.env.UTILITY_API_TOKEN,
    params: { period: '2024-01' }
  },
  {
    sourceType: 'api',
    sourceId: 'utility-api',
    companyId: 'company-uuid'
  }
);
```

#### Manual Entry

```typescript
import { ingestManualEntry } from '@/lib/data/ProjectZeroDataFlow';

const result = await ingestManualEntry(
  {
    scope: 1,
    category: 'mobile_combustion',
    activityAmount: 1500,
    activityUnit: 'gallons',
    timePeriod: {
      start: new Date('2024-01-01'),
      end: new Date('2024-01-31')
    },
    dataQuality: 'measured',
    source: 'Fleet fuel cards'
  },
  { sourceType: 'manual', sourceId: 'web-ui', companyId: 'company-uuid' }
);
```

#### Process Activity Data

```typescript
import { processActivityData } from '@/lib/data/ProjectZeroDataFlow';

const result = await processActivityData(activityDataId, {
  validateData: true,
  normalizeUnits: true,
  mapCategories: true,
  detectAnomalies: true
});

console.log('Validation results:', result.validationResults);
```

#### Calculate Emissions

```typescript
import { calculateEmissionsForActivity } from '@/lib/data/ProjectZeroDataFlow';

const result = await calculateEmissionsForActivity(activityDataId, {
  autoApprove: false,
  calculatedBy: 'user@company.com'
});

console.log(`Calculated: ${result.emissionAmount} tons CO2e`);
```

---

### 3. **FrameworkMappings** (Regulatory Conversion)

**File:** `src/lib/data/FrameworkMappings.ts`

Converts unified data model into framework-specific structures.

**Available Mappings:**

```typescript
import {
  mapToSB253,
  mapToCSRD,
  mapToCDP,
  mapToTCFD,
  mapToISSBS1S2
} from '@/lib/data/FrameworkMappings';

// California SB-253
const sb253Data = await mapToSB253(
  companyId,
  new Date('2024-01-01'),
  new Date('2024-12-31')
);

// EU CSRD (full ESRS disclosure)
const csrdData = await mapToCSRD(companyId, periodStart, periodEnd);
// Returns: { emissions, doubleMateriality, esrsE1, esrsE2ToE5, esrsS1ToS4, esrsG1 }

// CDP Climate Change Questionnaire
const cdpData = await mapToCDP(companyId, periodStart, periodEnd);
// Returns: { c0_introduction, c1_governance, c2_risks, ..., c9_verification }

// TCFD (4 Pillars)
const tcfdData = await mapToTCFD(companyId, periodStart, periodEnd);
// Returns: { governance, strategy, riskManagement, metricsAndTargets }

// ISSB S1 & S2
const issbData = await mapToISSBS1S2(companyId, periodStart, periodEnd);
// Returns: { s1_generalSustainability, s2_climate, industryMetrics }
```

**Framework Comparison:**

| Framework | Scope 1/2/3 Required | Assurance | Special Requirements |
|-----------|---------------------|-----------|---------------------|
| **SB-253** | ✅ All | ✅ Mandatory | IPCC AR5 GWPs |
| **CSRD** | ✅ All | ✅ Recommended | Double materiality, XBRL |
| **CDP** | ✅ All | ⚠️ Optional | Scenario analysis |
| **TCFD** | ✅ Scope 1/2, ⚠️ Scope 3 | ⚠️ Optional | Climate scenarios (1.5°C, 2°C, 3°C) |
| **ISSB** | ✅ All | ⚠️ Recommended | SASB industry metrics |

---

### 4. **EventSystem** (Real-Time Updates)

**File:** `src/lib/data/EventSystem.ts`

Event-driven architecture that auto-updates all interconnected components.

**Event Flow:**

```
Activity Data Created
        │
        ▼
Calculate Emissions
        │
        ▼
Update Dashboards
        │
        ▼
Refresh Draft Reports
        │
        ▼
Check Target Progress
```

**Available Events:**

| Event | Trigger | Actions |
|-------|---------|---------|
| `activityDataCreated` | New data ingested | → Auto-calculate emissions |
| `activityDataUpdated` | Data modified | → Recalculate emissions |
| `emissionCalculated` | Calculation complete | → Refresh dashboards, Update reports |
| `emissionFactorUpdated` | EPA/eGRID update | → Recalculate all affected emissions |
| `reportRequested` | User requests report | → Map to framework, Generate output |
| `frameworkChanged` | Regulation updated | → Revalidate existing reports |
| `materialityUpdated` | CSRD assessment | → Update CSRD reports |
| `assuranceUpdated` | Verification obtained | → Update compliance status |
| `dashboardRefresh` | Any data change | → Invalidate cache, Push to UI |

**Usage:**

```typescript
import {
  initializeEventSystem,
  emitActivityDataCreated,
  complianceEvents
} from '@/lib/data/EventSystem';

// Initialize on startup
initializeEventSystem();

// Emit events
emitActivityDataCreated({
  companyId: 'company-uuid',
  activityDataId: 'activity-uuid',
  action: 'created',
  scope: 1,
  category: 'mobile_combustion',
  userId: 'user@company.com'
});

// Listen to events
complianceEvents.on('emissionCalculated', (event) => {
  console.log(`New emission: ${event.emissionAmount} tons CO2e`);
  // Trigger WebSocket push to UI
  io.to(`company-${event.companyId}`).emit('dashboardUpdate', event);
});
```

---

### 5. **DashboardService** (Data Aggregation)

**File:** `src/lib/data/DashboardService.ts`

Provides pre-aggregated data for real-time dashboards.

**Available Dashboards:**

#### Carbon Emissions Dashboard

```typescript
import { getCarbonEmissionsDashboard } from '@/lib/data/DashboardService';

const dashboard = await getCarbonEmissionsDashboard(
  companyId,
  new Date('2024-01-01'),
  new Date('2024-12-31')
);

// Returns:
{
  summary: {
    totalEmissions: 12500.45,
    scope1: 3200.12,
    scope2Market: 5400.33,
    scope3: 3900.00
  },
  scopeBreakdown: [
    { scope: 1, category: 'mobile_combustion', emissions: 2100, percentage: 16.8 },
    { scope: 2, category: 'purchased_electricity', emissions: 5400, percentage: 43.2 },
    ...
  ],
  facilityBreakdown: [...],
  timeSeries: [
    { month: '2024-01', scope1: 280, scope2: 450, scope3: 320, total: 1050 },
    { month: '2024-02', scope1: 290, scope2: 455, scope3: 325, total: 1070 },
    ...
  ],
  emissionIntensity: {
    perRevenue: 125.5, // tons CO2e per million USD
    perEmployee: 2.8,   // tons CO2e per employee
    perFloorArea: 0.05  // tons CO2e per sqm
  }
}
```

#### CSRD Materiality Dashboard

```typescript
import { getCSRDMaterialityDashboard } from '@/lib/data/DashboardService';

const dashboard = await getCSRDMaterialityDashboard(companyId, 2024);

// Returns materiality matrix and ESRS status
```

#### Compliance Readiness Dashboard

```typescript
import { getComplianceReadinessDashboard } from '@/lib/data/DashboardService';

const dashboard = await getComplianceReadinessDashboard(companyId);

// Returns:
{
  frameworks: [
    {
      frameworkId: 'SB-253',
      readinessScore: 75,
      status: 'in_progress',
      missingRequirements: ['Third-party assurance'],
      latestReport: { ... }
    },
    ...
  ],
  overallReadiness: 68,
  criticalGaps: ['Scope 3 Category 15 data', 'Double materiality assessment']
}
```

#### Supply Chain Footprint Dashboard

```typescript
import { getSupplyChainDashboard } from '@/lib/data/DashboardService';

const dashboard = await getSupplyChainDashboard(companyId, periodStart, periodEnd);

// Returns supplier emissions, engagement metrics, Scope 3 breakdown
```

---

## 🔌 API Endpoints

### Recommended API Structure

```typescript
// app/api/activity-data/route.ts
import { ingestManualEntry } from '@/lib/data/ProjectZeroDataFlow';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();

  const result = await ingestManualEntry(body.activityData, {
    sourceType: 'api',
    sourceId: 'rest-api',
    companyId: body.companyId,
    metadata: { userId: body.userId }
  });

  return NextResponse.json(result);
}

// app/api/emissions/calculate/route.ts
import { calculateEmissionsForActivity } from '@/lib/data/ProjectZeroDataFlow';

export async function POST(request: Request) {
  const { activityDataId } = await request.json();

  const result = await calculateEmissionsForActivity(activityDataId, {
    autoApprove: false,
    calculatedBy: 'api-user'
  });

  return NextResponse.json(result);
}

// app/api/dashboards/carbon/route.ts
import { getCarbonEmissionsDashboard } from '@/lib/data/DashboardService';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId')!;

  const dashboard = await getCarbonEmissionsDashboard(
    companyId,
    new Date(searchParams.get('start')!),
    new Date(searchParams.get('end')!)
  );

  return NextResponse.json(dashboard);
}

// app/api/reports/generate/route.ts
import { generateComplianceReport } from '@/lib/compliance/reportGenerator';
import { mapToSB253 } from '@/lib/data/FrameworkMappings';

export async function POST(request: Request) {
  const { companyId, frameworkId, periodStart, periodEnd } = await request.json();

  const emissionsData = await mapToSB253(companyId, periodStart, periodEnd);

  const report = await generateComplianceReport(
    emissionsData,
    frameworkId,
    'PDF'
  );

  return NextResponse.json({ reportId: report.metadata.reportId });
}
```

---

## 📱 React Dashboard Components

### Carbon Emissions Dashboard

```tsx
'use client';

import { useEffect, useState } from 'react';
import { getCarbonEmissionsDashboard } from '@/lib/data/DashboardService';
import type { CarbonEmissionsDashboard } from '@/lib/data/DashboardService';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export function CarbonDashboard({ companyId }: { companyId: string }) {
  const [data, setData] = useState<CarbonEmissionsDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      const yearStart = new Date(new Date().getFullYear(), 0, 1);
      const now = new Date();

      const dashboard = await getCarbonEmissionsDashboard(companyId, yearStart, now);
      setData(dashboard);
      setLoading(false);
    }

    loadDashboard();

    // Set up real-time updates via WebSocket
    const socket = io();
    socket.on(`dashboard-update-${companyId}`, () => {
      loadDashboard(); // Refresh on server event
    });

    return () => {
      socket.disconnect();
    };
  }, [companyId]);

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>No data available</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Summary Cards */}
      <Card>
        <CardHeader>
          <CardTitle>Total Emissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {data.summary.totalEmissions.toLocaleString()} tons CO2e
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scope 1</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">
            {data.summary.scope1.toLocaleString()} tons CO2e
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Emission Intensity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl">
            {data.emissionIntensity.perRevenue.toFixed(2)} tons/M$
          </div>
          <div className="text-sm text-gray-600">
            {data.emissionIntensity.perEmployee.toFixed(2)} tons/employee
          </div>
        </CardContent>
      </Card>

      {/* Scope Breakdown Chart */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Emissions by Scope & Category</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart width={600} height={300} data={data.scopeBreakdown}>
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="emissions" fill="#8884d8" />
          </BarChart>
        </CardContent>
      </Card>

      {/* Time Series */}
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Monthly Emissions Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart width={900} height={300} data={data.timeSeries}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="scope1" stroke="#ff7300" name="Scope 1" />
            <Line type="monotone" dataKey="scope2" stroke="#387908" name="Scope 2" />
            <Line type="monotone" dataKey="scope3" stroke="#8884d8" name="Scope 3" />
          </LineChart>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 🚀 Getting Started

### 1. Database Setup

```bash
# Create PostgreSQL database
createdb project_zero

# Set environment variable
echo "DATABASE_URL=postgresql://user:password@localhost:5432/project_zero" > .env

# Run Prisma migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

### 2. Initialize Event System

```typescript
// app/layout.tsx or server startup
import { initializeEventSystem } from '@/lib/data/EventSystem';

initializeEventSystem();
```

### 3. Seed Emission Factors

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import {
  EPA_STATIONARY_COMBUSTION_FACTORS,
  EGRID_2023_FACTORS,
  DEFRA_2024_FACTORS,
  SCOPE3_DEFAULT_FACTORS
} from '../src/lib/compliance/emissionsCalculator';

const prisma = new PrismaClient();

async function main() {
  // Seed EPA factors
  for (const [key, factor] of Object.entries(EPA_STATIONARY_COMBUSTION_FACTORS)) {
    await prisma.emissionFactor.create({
      data: {
        factorId: factor.id,
        name: factor.name,
        source: factor.source,
        version: factor.version,
        scope: factor.scope,
        category: factor.category,
        factor: factor.factor,
        unit: factor.unit,
        gwp: factor.gwp,
        applicableYears: factor.applicableYears,
        isActive: true
      }
    });
  }

  // Repeat for eGRID, DEFRA, Scope 3 factors...
  console.log('Emission factors seeded successfully');
}

main();
```

### 4. Create Your First Company

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const company = await prisma.company.create({
  data: {
    legalName: 'Acme Corporation',
    registrationNumber: 'US-123456',
    jurisdiction: 'Delaware',
    industry: 'Technology',
    industryCode: '5112',
    numberOfEmployees: 500,
    revenue: 50000000,
    currency: 'USD',
    fiscalYearEnd: '12-31',
    consolidationApproach: 'operational-control',
    organizationalBoundary: 'All subsidiaries under operational control',
    street: '123 Main St',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94105',
    country: 'United States'
  }
});

console.log('Company created:', company.id);
```

---

## 📖 Complete Workflow Example

```typescript
// 1. Ingest activity data
const ingestionResult = await ingestFromCSV(file, {
  sourceType: 'csv',
  sourceId: 'monthly-bills',
  companyId: company.id
});

// 2. Process data (automatic via event listener)
// Event: activityDataCreated → processActivityData → calculateEmissionsForActivity

// 3. View dashboard
const dashboard = await getCarbonEmissionsDashboard(
  company.id,
  new Date('2024-01-01'),
  new Date('2024-12-31')
);

console.log(`Total emissions: ${dashboard.summary.totalEmissions} tons CO2e`);

// 4. Generate SB-253 report
const sb253Data = await mapToSB253(
  company.id,
  new Date('2024-01-01'),
  new Date('2024-12-31')
);

const report = await generateComplianceReport(
  sb253Data,
  'SB-253',
  'PDF'
);

console.log(`Report generated: ${report.metadata.reportId}`);
console.log(`Completeness: ${report.completeness}%`);
```

---

## 🔒 Security & Best Practices

1. **Authentication**: Implement row-level security (RLS) in PostgreSQL
2. **Authorization**: Check user permissions before data access
3. **Data Validation**: All inputs validated before database insertion
4. **Audit Logging**: Every change tracked with user, timestamp, IP
5. **Rate Limiting**: Protect API endpoints from abuse
6. **Encryption**: Encrypt sensitive data at rest and in transit
7. **Backup**: Regular database backups with point-in-time recovery

---

## 📊 Performance Optimization

1. **Database Indexes**: Already included in schema (company_id, scope, period)
2. **Caching**: Use Redis for dashboard data (TTL: 5 minutes)
3. **Background Jobs**: Queue bulk calculations with Bull/BullMQ
4. **Pagination**: Limit query results with `take` and `skip`
5. **Connection Pooling**: Use Prisma's built-in pooling
6. **WebSocket**: Real-time updates without polling

---

## 🧪 Testing

```typescript
// tests/data-pipeline.test.ts
import { describe, test, expect } from 'vitest';
import { calculateEmissionsForActivity } from '@/lib/data/ProjectZeroDataFlow';

describe('Emissions Calculation', () => {
  test('calculates Scope 1 mobile combustion correctly', async () => {
    const result = await calculateEmissionsForActivity(activityDataId);

    expect(result.success).toBe(true);
    expect(result.emissionAmount).toBeGreaterThan(0);
  });
});
```

---

## 📚 Additional Resources

- [GHG Protocol Corporate Standard](https://ghgprotocol.org/corporate-standard)
- [CARB SB-253 Regulations](https://ww2.arb.ca.gov/our-work/programs/ab-1305-ghg-reporting)
- [EU CSRD (ESRS)](https://www.efrag.org/lab6)
- [CDP Climate Change Guidance](https://www.cdp.net/en/guidance/guidance-for-companies)
- [TCFD Recommendations](https://www.fsb-tcfd.org/)
- [IFRS Sustainability Standards](https://www.ifrs.org/issued-standards/)

---

## 🤝 Support

For questions or issues:
- Review this documentation
- Check existing compliance types in `src/lib/compliance/types.ts`
- Examine framework configurations in `src/lib/compliance/frameworks.ts`
- Explore emission factors in `src/lib/compliance/emissionsCalculator.ts`

---

**Built with:**
Prisma • PostgreSQL • TypeScript • Next.js • Event-Driven Architecture

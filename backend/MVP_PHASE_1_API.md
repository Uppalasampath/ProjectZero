# MVP Phase 1 API Documentation

Complete API implementation for Zero emissions tracking platform MVP Phase 1.

## Overview

The MVP Phase 1 API provides three core capabilities:

1. **Data Entry** - Manual data entry and bulk import via CSV/Excel
2. **Data Display** - Dashboards and analytics for emissions data
3. **Report Generation** - Customizable regulatory-compliant reports

## Base URL

```
http://localhost:8000/api/v1
```

## Interactive Documentation

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## 1. Data Entry APIs

### Companies

Manage company/organization information.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/companies` | Create new company |
| `GET` | `/companies` | List all companies (with filters) |
| `GET` | `/companies/{id}` | Get specific company |
| `PUT` | `/companies/{id}` | Update company |
| `DELETE` | `/companies/{id}` | Delete company |

**Example: Create Company**
```json
POST /api/v1/companies
{
  "company_name": "Acme Manufacturing Corp",
  "naics_code": "332710",
  "country": "United States",
  "total_revenue": 5000000000,
  "california_revenue": 800000000,
  "consolidation_approach": "Operational Control",
  "environmental_contact_email": "sustainability@acme.com"
}
```

### Facilities

Manage facility/location information.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/facilities` | Create new facility |
| `GET` | `/facilities` | List all facilities (with filters) |
| `GET` | `/facilities/{id}` | Get specific facility |
| `PUT` | `/facilities/{id}` | Update facility |
| `DELETE` | `/facilities/{id}` | Delete facility |

**Example: Create Facility**
```json
POST /api/v1/facilities
{
  "company_id": 1,
  "facility_name": "Main Manufacturing Plant",
  "facility_type": "manufacturing",
  "country": "United States",
  "city": "Detroit",
  "state_province": "Michigan",
  "operational_status": "active",
  "operational_months": 12,
  "number_of_employees": 500
}
```

### Emissions Data

Manage emissions and activity data.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/emissions` | Create emissions record |
| `GET` | `/emissions` | List emissions data (with filters) |
| `GET` | `/emissions/{id}` | Get specific emissions record |
| `PUT` | `/emissions/{id}` | Update emissions record |
| `DELETE` | `/emissions/{id}` | Delete emissions record |
| `POST` | `/emissions/activity` | Create activity data (fuel, electricity, etc.) |
| `GET` | `/emissions/activity` | List activity data |

**Example: Create Emissions Data**
```json
POST /api/v1/emissions
{
  "facility_id": 1,
  "scope": "scope_1",
  "category": "stationary_combustion",
  "reporting_period_start": "2024-01-01",
  "reporting_period_end": "2024-12-31",
  "co2e_kg": 1500000.0,
  "co2_kg": 1485000.0,
  "ch4_kg": 10000.0,
  "n2o_kg": 5000.0,
  "data_quality": "tier_1",
  "estimated": false,
  "notes": "Natural gas combustion from boilers"
}
```

### Bulk Import

Upload CSV or Excel files with emissions data.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/emissions/bulk/upload-csv` | Import from CSV file |
| `POST` | `/emissions/bulk/upload-excel` | Import from Excel file |
| `GET` | `/emissions/bulk/template/csv` | Download CSV template |
| `GET` | `/emissions/bulk/template/excel` | Download Excel template |

**Example: CSV Format**
```csv
facility_id,scope,category,reporting_period_start,reporting_period_end,co2e_kg,data_quality
1,scope_1,stationary_combustion,2024-01-01,2024-12-31,1500000.0,tier_1
1,scope_2,electricity,2024-01-01,2024-12-31,2300000.0,tier_1
1,scope_3,purchased_goods,2024-01-01,2024-12-31,3200000.0,tier_2
```

**Example: Bulk Upload**
```bash
curl -X POST "http://localhost:8000/api/v1/emissions/bulk/upload-csv" \
  -F "file=@emissions_data.csv" \
  -F "facility_id=1"
```

---

## 2. Dashboard & Analytics APIs

### Dashboard Summary

Get comprehensive dashboard data for a company.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/dashboard/summary` | Complete dashboard summary |
| `GET` | `/dashboard/emissions/by-scope` | Emissions by scope (1, 2, 3) |
| `GET` | `/dashboard/emissions/by-facility` | Emissions by facility |
| `GET` | `/dashboard/emissions/by-category` | Emissions by category |
| `GET` | `/dashboard/emissions/by-gas` | Emissions by gas type (CO2, CH4, N2O) |
| `GET` | `/dashboard/emissions/trend` | Emissions trend over time |
| `GET` | `/dashboard/data-quality` | Data quality summary |
| `GET` | `/dashboard/carbon-engine/metrics` | Carbon engine metrics |

**Example: Dashboard Summary**
```
GET /api/v1/dashboard/summary?company_id=1&start_date=2024-01-01&end_date=2024-12-31
```

**Response:**
```json
{
  "company_id": 1,
  "company_name": "Acme Corp",
  "reporting_period_start": "2024-01-01",
  "reporting_period_end": "2024-12-31",
  "emissions_by_scope": {
    "scope_1": 1500.5,
    "scope_2": 2300.2,
    "scope_3": 3200.8,
    "total": 7001.5
  },
  "emissions_by_facility": [...],
  "emissions_by_gas": {
    "co2": 6500.0,
    "ch4": 350.0,
    "n2o": 100.0,
    "f_gases": 51.5,
    "total_co2e": 7001.5
  },
  "data_quality": {
    "tier_1_pct": 45.0,
    "tier_2_pct": 35.0,
    "tier_3_pct": 15.0,
    "tier_4_pct": 5.0,
    "overall_quality_score": 3.8
  },
  "total_facilities": 5,
  "total_emissions_tons": 7001.5
}
```

### Carbon Engine

Trigger emissions calculations.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/dashboard/calculate` | Trigger emissions calculation |

**Example: Trigger Calculation**
```
POST /api/v1/dashboard/calculate?company_id=1&start_date=2024-01-01&end_date=2024-12-31&recalculate=false
```

---

## 3. Report Configuration & Generation APIs

### Report Configuration

Save and manage report configurations for reuse.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/reports/config` | Create report configuration |
| `GET` | `/reports/config` | List all configurations |
| `GET` | `/reports/config/{id}` | Get specific configuration |
| `PUT` | `/reports/config/{id}` | Update configuration |
| `DELETE` | `/reports/config/{id}` | Delete configuration |

**Example: Create Report Configuration**
```json
POST /api/v1/reports/config
{
  "company_id": 1,
  "report_type": "ghg_protocol",
  "report_format": "pdf",
  "reporting_period_start": "2024-01-01",
  "reporting_period_end": "2024-12-31",
  "sections": [
    "company_info",
    "scope_1_detail",
    "scope_2_detail",
    "scope_3_detail",
    "facility_emissions",
    "verification"
  ],
  "authorized_by_name": "John Smith",
  "authorized_by_title": "Chief Sustainability Officer",
  "assurance_level": "limited",
  "verifier_name": "EcoVerify International",
  "verifier_accreditation": "ISO 14065",
  "include_facility_breakdown": true,
  "include_category_breakdown": true,
  "include_gas_breakdown": true,
  "include_charts": true
}
```

### Report Generation

Generate custom reports.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/reports/generate-custom` | Generate custom report |
| `GET` | `/reports/{id}` | Get report metadata |
| `GET` | `/reports/{id}/download` | Download report file |
| `GET` | `/reports` | List all generated reports |

**Example: Generate Custom Report**
```json
POST /api/v1/reports/generate-custom
{
  "config_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "report_id": 123,
  "report_type": "ghg_protocol",
  "report_format": "pdf",
  "file_size_bytes": 524288,
  "download_url": "/api/v1/reports/123/download",
  "message": "Report generated successfully"
}
```

**Download Report:**
```
GET /api/v1/reports/123/download
```

Returns PDF file for download.

---

## 4. External Service Connectors

Integrate with external systems for automated data import.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/connectors` | Create connector |
| `GET` | `/connectors` | List all connectors |
| `GET` | `/connectors/{id}` | Get specific connector |
| `PUT` | `/connectors/{id}` | Update connector |
| `DELETE` | `/connectors/{id}` | Delete connector |
| `POST` | `/connectors/{id}/sync` | Trigger manual sync |
| `GET` | `/connectors/{id}/test-connection` | Test connection |
| `GET` | `/connectors/{id}/sync-history` | Get sync history |

**Example: Create ERP Connector**
```json
POST /api/v1/connectors?company_id=1
{
  "service_name": "SAP ERP",
  "service_type": "erp",
  "api_endpoint": "https://api.sap.com/v1/emissions",
  "api_key": "your-encrypted-api-key",
  "auth_type": "oauth2",
  "enabled": true,
  "sync_frequency": "daily",
  "mapping_config": {
    "electricity_field": "energy_consumption_kwh",
    "natural_gas_field": "gas_consumption_therms",
    "facility_id_field": "plant_code"
  }
}
```

**Supported Service Types:**
- `erp` - ERP systems (SAP, Oracle, NetSuite)
- `utility` - Utility management platforms
- `travel` - Travel management systems (Concur, Egencia)
- `fleet` - Fleet management systems (Geotab)
- `waste_management` - Waste management platforms
- `carbon_accounting` - Other carbon accounting software

---

## Query Parameters

### Common Pagination

Most list endpoints support pagination:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `skip` | int | 0 | Number of records to skip |
| `limit` | int | 100 | Maximum records to return (max: 1000) |

### Common Filters

| Parameter | Type | Description |
|-----------|------|-------------|
| `company_id` | int | Filter by company |
| `facility_id` | int | Filter by facility |
| `start_date` | date | Filter by start date (YYYY-MM-DD) |
| `end_date` | date | Filter by end date (YYYY-MM-DD) |
| `scope` | string | Filter by scope (scope_1, scope_2, scope_3) |
| `category` | string | Filter by category |
| `data_quality` | string | Filter by quality tier |

---

## Data Models

### Scopes

- `scope_1` - Direct emissions (combustion, fugitive, process)
- `scope_2` - Indirect energy emissions (electricity, steam, heat)
- `scope_3` - Value chain emissions (15 categories)

### Data Quality Tiers

- `tier_1` - Supplier/metered data (highest quality)
- `tier_2` - Regional averages
- `tier_3` - Industry averages
- `tier_4` - Estimates (lowest quality)

### Report Types

- `ghg_protocol` - GHG Protocol Corporate Standard
- `sb253` - California SB253 Climate Disclosure
- `cdp` - Carbon Disclosure Project (coming soon)
- `tcfd` - Task Force on Climate-related Financial Disclosures (coming soon)
- `custom` - Custom report

### Report Formats

- `pdf` - PDF document
- `excel` - Excel spreadsheet (coming soon)
- `json` - JSON data export

### Report Sections

Available sections for custom reports:

- `executive_summary` - Executive summary
- `company_info` - Company information
- `organizational_boundary` - Organizational boundary description
- `reporting_period` - Reporting period details
- `ghg_breakdown` - GHG breakdown by gas type
- `scope_1_detail` - Scope 1 details with methodology
- `scope_2_detail` - Scope 2 details (location & market-based)
- `scope_3_detail` - Scope 3 details (all 15 categories)
- `facility_emissions` - Facility-level emissions breakdown
- `emissions_trend` - Historical emissions trend
- `data_quality` - Data quality assessment
- `methodology` - Calculation methodology
- `base_year` - Base year information
- `carbon_offsets` - Carbon offsets and neutrality claims
- `reduction_targets` - Emissions reduction targets
- `verification` - Third-party verification statement
- `appendix` - Additional data and notes

---

## Error Handling

All endpoints return standard HTTP status codes:

| Code | Description |
|------|-------------|
| `200` | Success |
| `201` | Created |
| `204` | No Content (successful deletion) |
| `400` | Bad Request (validation error) |
| `404` | Not Found |
| `500` | Internal Server Error |

**Error Response Format:**
```json
{
  "detail": "Error message describing what went wrong"
}
```

---

## Authentication

**Status:** Not yet implemented

Future authentication will use JWT tokens:

```
Authorization: Bearer <jwt_token>
```

---

## Rate Limiting

**Status:** Not yet implemented

Future rate limits will be:
- 1000 requests per hour per API key
- 100 requests per minute per API key

---

## Webhooks

**Status:** Not yet implemented

Future webhook support for:
- Report generation completed
- Bulk import completed
- Connector sync completed
- Calculation completed

---

## Examples

### Complete Workflow Example

1. **Create Company**
```bash
curl -X POST "http://localhost:8000/api/v1/companies" \
  -H "Content-Type: application/json" \
  -d '{"company_name": "Acme Corp", "country": "United States"}'
```

2. **Create Facility**
```bash
curl -X POST "http://localhost:8000/api/v1/facilities" \
  -H "Content-Type: application/json" \
  -d '{"company_id": 1, "facility_name": "Main Plant", "country": "United States"}'
```

3. **Upload Emissions Data (CSV)**
```bash
curl -X POST "http://localhost:8000/api/v1/emissions/bulk/upload-csv" \
  -F "file=@emissions.csv"
```

4. **View Dashboard**
```bash
curl "http://localhost:8000/api/v1/dashboard/summary?company_id=1&start_date=2024-01-01&end_date=2024-12-31"
```

5. **Create Report Configuration**
```bash
curl -X POST "http://localhost:8000/api/v1/reports/config" \
  -H "Content-Type: application/json" \
  -d '{"company_id": 1, "report_type": "ghg_protocol", ...}'
```

6. **Generate Report**
```bash
curl -X POST "http://localhost:8000/api/v1/reports/generate-custom" \
  -H "Content-Type: application/json" \
  -d '{"config_id": 1}'
```

7. **Download Report**
```bash
curl "http://localhost:8000/api/v1/reports/123/download" -O
```

---

## Next Steps

After MVP Phase 1, the following features will be implemented:

**Phase 2:**
- Database implementation (currently using mocks)
- Complete bulk import logic (CSV/Excel processing)
- External connector integrations (SAP, Oracle, etc.)
- Full calculation engine integration

**Phase 3:**
- User authentication & authorization
- Multi-tenancy support
- Rate limiting
- Webhooks
- Additional report formats (Excel, XBRL)

**Phase 4:**
- Advanced analytics and forecasting
- Mobile app support
- Real-time data streaming
- AI-powered data validation

---

## Support

For API support:
- Interactive docs: `http://localhost:8000/docs`
- Backend README: `backend/README.md`
- Data checklist: `EMISSIONS_DATA_CHECKLIST.md`

---

**MVP Phase 1 Complete** ✅

All endpoints are ready for frontend integration. Database implementation will be added in Phase 2.

# PDF Report Generation Guide

Professional, audit-ready GHG Protocol emissions reports generated from your data.

---

## Overview

The ZERO platform generates **government-quality PDF reports** that comply with:
- ✅ GHG Protocol Corporate Accounting and Reporting Standard
- ✅ ISO 14064-1 Greenhouse Gas Inventories
- ✅ Third-party audit requirements
- ✅ Regulatory submission standards

---

## Features

### Report Contents

1. **Cover Page**
   - Company branding
   - Report title and period
   - Generation date

2. **Table of Contents**
   - Auto-generated with page numbers

3. **Executive Summary**
   - Key findings and metrics
   - Emissions by scope (pie chart)
   - High-level overview

4. **Organizational Boundaries**
   - Consolidation approach
   - Operational control method

5. **Operational Boundaries**
   - Scope 1, 2, 3 definitions
   - Categories included

6. **Emissions Summary**
   - Total emissions table
   - Breakdown by scope
   - Top emission sources

7. **Scope 1: Direct Emissions**
   - Detailed breakdown
   - Source categories
   - Methodology

8. **Scope 2: Indirect Energy Emissions**
   - Location-based method
   - Market-based method
   - Renewable energy certificates

9. **Scope 3: Value Chain Emissions**
   - All 15 categories
   - Category breakdown table
   - Top categories bar chart

10. **Progress Toward Targets**
    - Base year comparison
    - Reduction achieved
    - Annual reduction needed

11. **Methodology**
    - Calculation approach
    - Emission factors sources (EPA, DEFRA, IEA)
    - Global Warming Potentials

12. **Data Quality Assessment**
    - Quality tier classification
    - Data quality score
    - Confidence levels

13. **Verification Statement**
    - Third-party verification
    - ISO 14064-3 compliance
    - Verifier opinion

14. **Appendices**
    - GHG Protocol principles
    - Abbreviations and acronyms
    - Report metadata

---

## Quick Start

### 1. Test Report Generation (Without Database)

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run test script
python test_report_generation.py
```

This generates a sample PDF in `backend/output/` folder.

### 2. Generate Report via API

```bash
# Start the API server
uvicorn app.main:app --reload

# Open API docs
# http://localhost:8000/docs

# Generate report (POST /api/v1/reports/generate)
curl -X POST "http://localhost:8000/api/v1/reports/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "inventory_id": "your-inventory-id",
    "report_type": "GHG_PROTOCOL",
    "report_format": "PDF"
  }'

# Download report (GET /api/v1/reports/{report_id}/download)
curl "http://localhost:8000/api/v1/reports/{report_id}/download" \
  --output report.pdf
```

---

## API Endpoints

### Generate Report

**POST** `/api/v1/reports/generate`

Request:
```json
{
  "inventory_id": "uuid",
  "report_type": "GHG_PROTOCOL",
  "report_format": "PDF"
}
```

Response:
```json
{
  "report_id": "uuid",
  "status": "success",
  "message": "GHG Protocol report generated successfully",
  "file_url": "/api/v1/reports/{report_id}/download",
  "generation_duration_ms": 1234
}
```

### Download Report

**GET** `/api/v1/reports/{report_id}/download`

Returns PDF file as `application/pdf`.

### Get Report Metadata

**GET** `/api/v1/reports/{report_id}`

Response:
```json
{
  "id": "uuid",
  "report_type": "GHG_PROTOCOL",
  "report_format": "PDF",
  "report_title": "GHG Emissions Inventory Report",
  "reporting_period_start": "2024-01-01T00:00:00",
  "reporting_period_end": "2024-12-31T00:00:00",
  "generated_at": "2024-12-15T10:30:00",
  "file_size_bytes": 245760,
  "download_count": 5
}
```

### List Reports

**GET** `/api/v1/reports/?organization_id={uuid}&report_type=GHG_PROTOCOL&limit=50`

Returns list of reports for organization.

---

## Programmatic Usage

### Python Example

```python
from app.services.reports import GHGProtocolReportGenerator, GHGProtocolReportData
from datetime import date
from decimal import Decimal

# Prepare data
report_data = GHGProtocolReportData(
    company_name="Your Company",
    reporting_period_start=date(2024, 1, 1),
    reporting_period_end=date(2024, 12, 31),
    scope_1_total=Decimal("45.8"),
    scope_2_total=Decimal("78.3"),
    scope_3_total=Decimal("125.6"),
    # ... more fields
)

# Generate report
generator = GHGProtocolReportGenerator(report_data)
pdf_bytes = generator.generate()

# Save to file
with open("report.pdf", "wb") as f:
    f.write(pdf_bytes)
```

---

## Report Customization

### Company Branding

The report automatically includes:
- Company name on every page header
- Report title and period
- Professional color scheme (customizable)

To customize colors:

```python
# app/services/reports/base.py

class ReportColors:
    PRIMARY = colors.HexColor('#10b981')  # Your brand color
    SECONDARY = colors.HexColor('#3b82f6')
    # ... more colors
```

### Report Sections

To add/remove sections, edit:

```python
# app/services/reports/ghg_protocol.py

class GHGProtocolReportGenerator:
    def generate(self):
        # Add your custom sections here
        self._add_custom_section()
```

---

## Sample Output

### Report Statistics (Typical)

- **Pages**: 15-25 pages
- **File Size**: 200-400 KB
- **Generation Time**: 1-3 seconds
- **Format**: PDF/A (archival quality)

### Visual Elements

- ✅ **Pie Charts**: Emissions by scope
- ✅ **Bar Charts**: Top Scope 3 categories
- ✅ **Tables**: Professional formatting with alternating row colors
- ✅ **Typography**: Clean, readable Helvetica font
- ✅ **Page Numbers**: Automatic on all pages
- ✅ **Headers/Footers**: Company name, report title, generation date

---

## Data Requirements

### Minimum Data Needed

```python
{
    "company_name": str,
    "reporting_period_start": date,
    "reporting_period_end": date,
    "scope_1_total": Decimal,
    "scope_2_total": Decimal,
    "scope_3_total": Decimal
}
```

### Optional Enhancements

```python
{
    "scope_2_location_based": Decimal,     # Adds dual reporting
    "scope_2_market_based": Decimal,
    "scope_3_breakdown": Dict[int, Decimal],  # Adds category detail
    "base_year": int,                      # Adds progress tracking
    "base_year_emissions": Decimal,
    "net_zero_target_year": int,
    "data_quality_score": Decimal,         # Adds quality assessment
    "verification_status": str,            # Adds verification section
    "verified_by": str,
    "top_emission_sources": List[Dict],    # Adds source analysis
    "offsets_purchased": Decimal,          # Adds carbon offsets
    "calculation_count": int               # Shows data points
}
```

---

## Frontend Integration

### React Example

```typescript
// Generate report
const generateReport = async (inventoryId: string) => {
  const response = await fetch('http://localhost:8000/api/v1/reports/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      inventory_id: inventoryId,
      report_type: 'GHG_PROTOCOL',
      report_format: 'PDF'
    })
  })

  const data = await response.json()
  return data.report_id
}

// Download report
const downloadReport = async (reportId: string) => {
  const response = await fetch(
    `http://localhost:8000/api/v1/reports/${reportId}/download`
  )

  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = 'GHG_Protocol_Report.pdf'
  a.click()
}

// Use in component
const handleGenerateReport = async () => {
  setLoading(true)
  try {
    const reportId = await generateReport(inventoryId)
    await downloadReport(reportId)
    toast.success('Report generated successfully!')
  } catch (error) {
    toast.error('Report generation failed')
  } finally {
    setLoading(false)
  }
}
```

---

## Performance

### Benchmarks

| Data Points | Generation Time | File Size |
|------------|----------------|-----------|
| 50         | ~1.2s          | 180 KB    |
| 100        | ~1.5s          | 220 KB    |
| 500        | ~2.8s          | 350 KB    |
| 1000       | ~4.5s          | 480 KB    |

### Optimization Tips

1. **Background Processing**: Use Celery for async generation
2. **Caching**: Cache emission factors and calculations
3. **Batch Generation**: Generate multiple reports in parallel
4. **CDN Storage**: Store reports on S3/CDN for fast downloads

---

## Troubleshooting

### Common Issues

**1. "Report generation failed"**
- Check database connection
- Verify inventory ID exists
- Check emission factors are loaded

**2. "File not found"**
- Check `REPORTS_STORAGE_PATH` in `.env`
- Verify directory permissions
- Ensure disk space available

**3. "Charts not rendering"**
- Check reportlab installation
- Verify pillow library installed
- Check data format (must be numeric)

**4. "Font errors"**
- ReportLab uses built-in fonts
- No additional font installation needed

---

## Future Enhancements

### Planned Report Types

- ✅ **GHG Protocol** (implemented)
- ⏳ **CSRD** (EU Corporate Sustainability Reporting Directive)
- ⏳ **CDP** (Carbon Disclosure Project)
- ⏳ **TCFD** (Climate-related Financial Disclosures)
- ⏳ **ISSB** (International Sustainability Standards Board)

### Planned Features

- 📊 Excel export with data tables
- 📄 XBRL format for regulatory submission
- 🎨 Custom branding (logo, colors)
- 📧 Email delivery of reports
- 🔐 Digital signatures
- 📱 Mobile-optimized PDFs
- 🌍 Multi-language support

---

## Examples

See `backend/test_report_generation.py` for complete working examples.

---

## Support

For issues or questions:
- Check API docs: `http://localhost:8000/docs`
- Review logs in `backend/logs/`
- Test with sample data first

---

## License

Part of the ZERO Emissions Tracking Platform.

---

*Built with ❤️ for a sustainable future*

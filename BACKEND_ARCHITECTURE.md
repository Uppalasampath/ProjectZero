# Backend Architecture: Emissions Tracking & Audit-Ready Reporting

## Overview

This document outlines the production-grade Python backend for ZERO's core functionality: **GHG Protocol-compliant emissions tracking** and **government-level audit-ready report generation**.

---

## System Requirements

### Functional Requirements

1. **Emissions Data Collection**
   - Manual data entry (validated forms)
   - Bulk CSV/Excel upload with validation
   - API integrations (utility providers, ERP systems)
   - Historical data import

2. **GHG Protocol Calculations**
   - **Scope 1**: Direct emissions from owned/controlled sources
   - **Scope 2**: Indirect emissions from purchased electricity/heat
   - **Scope 3**: All 15 value chain categories
   - Multiple calculation methodologies (spend-based, activity-based, average-data, supplier-specific)

3. **Audit Trail & Compliance**
   - Complete data lineage (source → calculation → report)
   - Version control for all data changes
   - User action logging
   - Document attachments (invoices, bills, certificates)
   - Timestamp and digital signature support

4. **Report Generation**
   - **CSRD** (EU Corporate Sustainability Reporting Directive)
   - **CDP** (Carbon Disclosure Project)
   - **GHG Protocol Corporate Standard**
   - **TCFD** (Task Force on Climate-related Financial Disclosures)
   - **ISO 14064-1** (Greenhouse gas inventories)
   - Custom formats (PDF, Excel, XBRL)

### Non-Functional Requirements

- **Accuracy**: 99.9% calculation accuracy (critical for audits)
- **Auditability**: Complete traceability of all calculations
- **Performance**: Generate reports in <30 seconds
- **Scalability**: Support enterprises with 10,000+ data points
- **Security**: SOC 2 Type II compliance-ready
- **Availability**: 99.9% uptime SLA

---

## Technology Stack

### Backend Framework
- **FastAPI** (Python 3.11+)
  - High performance (async/await)
  - Automatic API documentation (OpenAPI/Swagger)
  - Type safety with Pydantic
  - Easy testing

### Database
- **PostgreSQL 15+**
  - JSONB for flexible emission factors
  - Full-text search for reports
  - Row-level security for multi-tenancy
  - Time-series optimization

### Key Libraries

**Emissions Calculations:**
- `pandas` - Data manipulation and calculations
- `numpy` - Numerical operations
- `pint` - Unit conversions (kg to tons, kWh to MWh, etc.)

**Report Generation:**
- `reportlab` - Professional PDF generation
- `openpyxl` - Excel report generation
- `jinja2` - Template-based document generation
- `weasyprint` - HTML to PDF with CSS styling

**Data Validation:**
- `pydantic` - Schema validation
- `pandera` - DataFrame validation
- `great_expectations` - Data quality framework

**Background Jobs:**
- `celery` - Asynchronous task queue
- `redis` - Message broker and caching
- `beat` - Periodic task scheduling

**API & Integration:**
- `httpx` - Async HTTP client
- `sqlalchemy` - ORM for database
- `alembic` - Database migrations

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                        │
│  Dashboard | Carbon Tracking | Report Generation | Compliance  │
└──────────────────────────┬──────────────────────────────────────┘
                           │ REST API
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FASTAPI BACKEND                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │   API Routes     │  │  Services Layer  │  │   Workers    │ │
│  ├──────────────────┤  ├──────────────────┤  ├──────────────┤ │
│  │ /emissions/*     │  │ EmissionsService │  │ Celery Tasks │ │
│  │ /calculations/*  │  │ CalculationSvc   │  │ - Reports    │ │
│  │ /reports/*       │  │ ReportService    │  │ - Imports    │ │
│  │ /data-import/*   │  │ ValidationSvc    │  │ - Exports    │ │
│  │ /factors/*       │  │ FactorService    │  │ - Sync Jobs  │ │
│  └──────────────────┘  └──────────────────┘  └──────────────┘ │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Calculation Engine (Core)                   │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ • GHGProtocolCalculator                                  │  │
│  │ • Scope1Calculator (stationary, mobile, fugitive, etc.)  │  │
│  │ • Scope2Calculator (location-based, market-based)        │  │
│  │ • Scope3Calculator (15 categories)                       │  │
│  │ • EmissionFactorMatcher (auto-match factors to data)     │  │
│  │ • UncertaintyAnalysis (confidence intervals)             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Report Generation Engine                    │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ • CSRDReportGenerator                                    │  │
│  │ • CDPReportGenerator                                     │  │
│  │ • GHGProtocolReportGenerator                             │  │
│  │ • TCFDReportGenerator                                    │  │
│  │ • CustomReportBuilder                                    │  │
│  │ • PDFRenderer, ExcelRenderer, XBRLRenderer               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└────────────────┬────────────────────────────────┬───────────────┘
                 │                                │
                 ▼                                ▼
┌──────────────────────────────┐   ┌─────────────────────────────┐
│   PostgreSQL Database        │   │   Redis Cache & Queue       │
├──────────────────────────────┤   ├─────────────────────────────┤
│ • emission_data              │   │ • Calculation results cache │
│ • emission_factors           │   │ • Background job queue      │
│ • calculations               │   │ • Session storage           │
│ • reports                    │   │ • Rate limiting             │
│ • audit_logs                 │   └─────────────────────────────┘
│ • data_sources               │
│ • user_organizations         │
└──────────────────────────────┘

                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                   External Integrations                         │
├─────────────────────────────────────────────────────────────────┤
│ • EPA Emission Factors API                                      │
│ • DEFRA Conversion Factors (UK Gov)                             │
│ • IEA Electricity Grid Factors                                  │
│ • Utility Provider APIs (electricity, gas, water)               │
│ • ERP Systems (SAP, Oracle) for procurement data                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Core Tables

#### 1. **emission_data_sources**
Stores raw input data with complete audit trail
```sql
CREATE TABLE emission_data_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    user_id UUID NOT NULL REFERENCES users(id),

    -- Data classification
    scope INT NOT NULL CHECK (scope IN (1, 2, 3)),
    scope_3_category INT CHECK (scope_3_category BETWEEN 1 AND 15),
    category TEXT NOT NULL, -- e.g., "stationary_combustion", "electricity"
    subcategory TEXT, -- e.g., "natural_gas", "diesel"

    -- Time period
    reporting_period_start DATE NOT NULL,
    reporting_period_end DATE NOT NULL,

    -- Activity data (the raw input)
    activity_amount DECIMAL(20, 4) NOT NULL,
    activity_unit TEXT NOT NULL, -- e.g., "kWh", "liters", "USD"

    -- Source documentation
    data_source TEXT NOT NULL, -- e.g., "utility_bill", "fuel_receipt", "manual_entry"
    source_reference TEXT, -- e.g., "Invoice #12345"
    document_url TEXT, -- Link to uploaded document
    data_quality_score INT CHECK (data_quality_score BETWEEN 1 AND 5),

    -- Metadata
    imported_at TIMESTAMPTZ DEFAULT NOW(),
    import_method TEXT, -- "manual", "csv", "api"
    notes TEXT,

    -- Audit trail
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    version INT DEFAULT 1,

    -- Soft delete
    deleted_at TIMESTAMPTZ,

    CONSTRAINT valid_period CHECK (reporting_period_end > reporting_period_start)
);

CREATE INDEX idx_emission_sources_org_period ON emission_data_sources(organization_id, reporting_period_start, reporting_period_end);
CREATE INDEX idx_emission_sources_scope ON emission_data_sources(scope, scope_3_category);
```

#### 2. **emission_factors**
Comprehensive emission factor database
```sql
CREATE TABLE emission_factors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Classification
    scope INT NOT NULL CHECK (scope IN (1, 2, 3)),
    category TEXT NOT NULL,
    subcategory TEXT,

    -- Geographic applicability
    region TEXT NOT NULL, -- "global", "US", "EU", "UK", etc.
    country_code TEXT, -- ISO 3166-1 alpha-2

    -- Factor details
    factor_value DECIMAL(20, 10) NOT NULL, -- e.g., 0.233 (kg CO2e per kWh)
    factor_unit TEXT NOT NULL, -- e.g., "kg_co2e_per_kwh"
    gas_breakdown JSONB, -- {"co2": 0.22, "ch4": 0.01, "n2o": 0.003}

    -- Source and validity
    source TEXT NOT NULL, -- "EPA", "DEFRA", "IEA", "Custom"
    source_year INT NOT NULL,
    publication_date DATE,
    valid_from DATE NOT NULL,
    valid_to DATE,

    -- Quality metadata
    data_quality_tier INT CHECK (data_quality_tier BETWEEN 1 AND 5),
    methodology TEXT, -- Calculation methodology description
    uncertainty_percentage DECIMAL(5, 2),

    -- Additional details
    description TEXT,
    notes TEXT,
    reference_url TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    is_custom BOOLEAN DEFAULT FALSE, -- User-defined vs. standard
    organization_id UUID REFERENCES organizations(id) -- NULL for global factors
);

CREATE INDEX idx_factors_category ON emission_factors(scope, category, subcategory);
CREATE INDEX idx_factors_region ON emission_factors(region, country_code);
CREATE INDEX idx_factors_validity ON emission_factors(valid_from, valid_to);
```

#### 3. **calculations**
Stores calculated emissions with full traceability
```sql
CREATE TABLE calculations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),

    -- Links to source data
    data_source_id UUID NOT NULL REFERENCES emission_data_sources(id),
    emission_factor_id UUID NOT NULL REFERENCES emission_factors(id),

    -- Calculation inputs (snapshot for audit trail)
    activity_amount DECIMAL(20, 4) NOT NULL,
    activity_unit TEXT NOT NULL,
    emission_factor DECIMAL(20, 10) NOT NULL,
    emission_factor_unit TEXT NOT NULL,

    -- Calculation results
    co2e_kg DECIMAL(20, 4) NOT NULL, -- Always store in kg CO2e
    co2_kg DECIMAL(20, 4),
    ch4_kg DECIMAL(20, 4),
    n2o_kg DECIMAL(20, 4),

    -- Uncertainty
    uncertainty_percentage DECIMAL(5, 2),
    confidence_interval_lower DECIMAL(20, 4),
    confidence_interval_upper DECIMAL(20, 4),

    -- Calculation metadata
    calculation_method TEXT NOT NULL, -- "direct_measurement", "activity_based", "spend_based"
    calculation_formula TEXT, -- For transparency
    calculation_timestamp TIMESTAMPTZ DEFAULT NOW(),
    calculation_version TEXT, -- Engine version for reproducibility

    -- Status
    status TEXT DEFAULT 'calculated', -- calculated, verified, audited
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_calculations_org ON calculations(organization_id);
CREATE INDEX idx_calculations_source ON calculations(data_source_id);
CREATE INDEX idx_calculations_timestamp ON calculations(calculation_timestamp);
```

#### 4. **emission_inventories**
Aggregated emissions by reporting period
```sql
CREATE TABLE emission_inventories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),

    -- Reporting period
    reporting_period_start DATE NOT NULL,
    reporting_period_end DATE NOT NULL,
    fiscal_year INT,

    -- Scope totals (in tons CO2e)
    scope_1_total DECIMAL(20, 4) DEFAULT 0,
    scope_2_total DECIMAL(20, 4) DEFAULT 0,
    scope_2_location_based DECIMAL(20, 4) DEFAULT 0,
    scope_2_market_based DECIMAL(20, 4) DEFAULT 0,
    scope_3_total DECIMAL(20, 4) DEFAULT 0,

    -- Scope 3 category breakdown
    scope_3_breakdown JSONB, -- {1: 100.5, 2: 50.3, ...}

    -- Total emissions
    total_emissions DECIMAL(20, 4) GENERATED ALWAYS AS (
        scope_1_total +
        COALESCE(scope_2_market_based, scope_2_location_based, 0) +
        scope_3_total
    ) STORED,

    -- Offsets
    carbon_offsets_purchased DECIMAL(20, 4) DEFAULT 0,
    carbon_credits_from_marketplace DECIMAL(20, 4) DEFAULT 0,

    -- Net emissions
    net_emissions DECIMAL(20, 4) GENERATED ALWAYS AS (
        scope_1_total +
        COALESCE(scope_2_market_based, scope_2_location_based, 0) +
        scope_3_total -
        carbon_offsets_purchased -
        carbon_credits_from_marketplace
    ) STORED,

    -- Metadata
    calculation_count INT DEFAULT 0, -- Number of source data points
    data_quality_score DECIMAL(3, 2), -- Weighted average

    -- Status
    status TEXT DEFAULT 'draft', -- draft, finalized, verified, audited
    finalized_at TIMESTAMPTZ,
    finalized_by UUID REFERENCES users(id),

    -- Verification
    verification_status TEXT, -- pending, verified, rejected
    verified_by_organization TEXT, -- Third-party verifier name
    verification_certificate_url TEXT,
    verified_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT valid_inventory_period CHECK (reporting_period_end > reporting_period_start),
    CONSTRAINT unique_org_period UNIQUE (organization_id, reporting_period_start, reporting_period_end)
);

CREATE INDEX idx_inventories_org_period ON emission_inventories(organization_id, reporting_period_start);
```

#### 5. **generated_reports**
Audit trail for all reports
```sql
CREATE TABLE generated_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    inventory_id UUID REFERENCES emission_inventories(id),

    -- Report details
    report_type TEXT NOT NULL, -- "CSRD", "CDP", "GHG_PROTOCOL", "TCFD", "CUSTOM"
    report_format TEXT NOT NULL, -- "PDF", "EXCEL", "XBRL"
    reporting_period_start DATE NOT NULL,
    reporting_period_end DATE NOT NULL,

    -- File storage
    file_url TEXT NOT NULL,
    file_size_bytes BIGINT,
    file_hash TEXT, -- SHA256 for integrity verification

    -- Report metadata
    report_title TEXT,
    report_version TEXT,
    template_version TEXT,

    -- Generation details
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    generated_by UUID NOT NULL REFERENCES users(id),
    generation_duration_ms INT,

    -- Submission tracking
    submitted_to TEXT, -- Regulatory body
    submitted_at TIMESTAMPTZ,
    submission_reference TEXT,
    submission_status TEXT, -- pending, accepted, rejected

    -- Access log
    download_count INT DEFAULT 0,
    last_downloaded_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reports_org ON generated_reports(organization_id);
CREATE INDEX idx_reports_type ON generated_reports(report_type);
CREATE INDEX idx_reports_inventory ON generated_reports(inventory_id);
```

#### 6. **audit_logs**
Complete audit trail of all system actions
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Who
    user_id UUID REFERENCES users(id),
    user_email TEXT,
    organization_id UUID REFERENCES organizations(id),

    -- What
    action TEXT NOT NULL, -- "CREATE", "UPDATE", "DELETE", "CALCULATE", "EXPORT", "SUBMIT"
    resource_type TEXT NOT NULL, -- "emission_data", "calculation", "report", etc.
    resource_id UUID,

    -- Details
    changes JSONB, -- Before/after values
    metadata JSONB, -- Additional context

    -- When & Where
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,

    -- Result
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT
);

CREATE INDEX idx_audit_org_time ON audit_logs(organization_id, timestamp DESC);
CREATE INDEX idx_audit_user ON audit_logs(user_id, timestamp DESC);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
```

---

## Calculation Engine Architecture

### Core Classes

#### 1. **GHGProtocolCalculator**
Main calculation orchestrator

```python
class GHGProtocolCalculator:
    """
    Main calculation engine implementing GHG Protocol Corporate Standard
    """

    def __init__(self, organization_id: UUID, reporting_period: DateRange):
        self.organization_id = organization_id
        self.reporting_period = reporting_period
        self.scope_1_calc = Scope1Calculator()
        self.scope_2_calc = Scope2Calculator()
        self.scope_3_calc = Scope3Calculator()

    async def calculate_full_inventory(self) -> EmissionInventory:
        """
        Calculate complete GHG inventory for the reporting period
        """
        # Fetch all emission data sources
        sources = await self.fetch_emission_sources()

        # Calculate each scope in parallel
        scope_1 = await self.scope_1_calc.calculate(sources)
        scope_2 = await self.scope_2_calc.calculate(sources)
        scope_3 = await self.scope_3_calc.calculate(sources)

        # Create inventory
        inventory = EmissionInventory(
            organization_id=self.organization_id,
            reporting_period=self.reporting_period,
            scope_1_total=scope_1.total,
            scope_2_total=scope_2.total,
            scope_3_total=scope_3.total,
            scope_3_breakdown=scope_3.category_breakdown
        )

        return inventory
```

#### 2. **Scope1Calculator**
Direct emissions calculations

```python
class Scope1Calculator:
    """
    Scope 1: Direct GHG emissions from sources owned/controlled by the company

    Categories:
    - Stationary Combustion (boilers, furnaces, generators)
    - Mobile Combustion (company vehicles, equipment)
    - Process Emissions (chemical reactions, industrial processes)
    - Fugitive Emissions (refrigerants, HVAC leaks, natural gas leaks)
    """

    async def calculate(self, sources: List[EmissionDataSource]) -> Scope1Result:
        results = []

        for source in sources:
            if source.scope != 1:
                continue

            # Match appropriate emission factor
            factor = await self.match_emission_factor(source)

            # Perform calculation
            emission = self.calculate_emission(
                activity_amount=source.activity_amount,
                activity_unit=source.activity_unit,
                emission_factor=factor.factor_value,
                factor_unit=factor.factor_unit
            )

            # Store calculation with audit trail
            calc = await self.store_calculation(source, factor, emission)
            results.append(calc)

        return Scope1Result(
            calculations=results,
            total=sum(r.co2e_kg for r in results) / 1000  # Convert to tons
        )

    def calculate_emission(
        self,
        activity_amount: Decimal,
        activity_unit: str,
        emission_factor: Decimal,
        factor_unit: str
    ) -> EmissionResult:
        """
        Core calculation logic with unit conversion

        Example:
        - activity_amount = 1000 (liters of diesel)
        - activity_unit = "liters"
        - emission_factor = 2.68 (kg CO2e per liter)
        - Result = 2680 kg CO2e
        """
        # Convert units if needed
        standardized_amount = self.convert_to_standard_unit(
            activity_amount,
            activity_unit
        )

        # Calculate emissions
        co2e_kg = standardized_amount * emission_factor

        return EmissionResult(
            co2e_kg=co2e_kg,
            calculation_formula=f"{activity_amount} {activity_unit} × {emission_factor} {factor_unit}"
        )
```

#### 3. **Scope2Calculator**
Indirect emissions from purchased energy

```python
class Scope2Calculator:
    """
    Scope 2: Indirect emissions from purchased electricity, heat, steam, cooling

    Two methods:
    - Location-based: Grid average emission factor
    - Market-based: Supplier-specific or contractual instruments (RECs)
    """

    async def calculate(self, sources: List[EmissionDataSource]) -> Scope2Result:
        location_based = await self.calculate_location_based(sources)
        market_based = await self.calculate_market_based(sources)

        return Scope2Result(
            location_based_total=location_based,
            market_based_total=market_based,
            total=market_based or location_based  # Use market-based if available
        )

    async def calculate_location_based(
        self,
        sources: List[EmissionDataSource]
    ) -> Decimal:
        """
        Location-based method: Uses grid average emission factors
        """
        total = Decimal(0)

        for source in sources:
            if source.category != "electricity":
                continue

            # Get grid emission factor for location
            factor = await self.get_grid_factor(
                country=source.location_country,
                region=source.location_region,
                year=source.reporting_period_start.year
            )

            # Calculate
            kwh = source.activity_amount
            co2e_kg = kwh * factor.factor_value

            await self.store_calculation(source, factor, co2e_kg)
            total += co2e_kg

        return total / 1000  # Convert to tons

    async def calculate_market_based(
        self,
        sources: List[EmissionDataSource]
    ) -> Decimal:
        """
        Market-based method: Uses supplier-specific factors or contractual instruments
        """
        # Check if organization has renewable energy certificates (RECs)
        recs = await self.get_renewable_certificates()

        # Apply RECs to reduce emissions
        # Implementation details...
        pass
```

#### 4. **Scope3Calculator**
Value chain emissions (15 categories)

```python
class Scope3Calculator:
    """
    Scope 3: All indirect emissions in value chain (15 categories)

    Upstream:
    1. Purchased goods and services
    2. Capital goods
    3. Fuel- and energy-related activities
    4. Upstream transportation and distribution
    5. Waste generated in operations
    6. Business travel
    7. Employee commuting
    8. Upstream leased assets

    Downstream:
    9. Downstream transportation and distribution
    10. Processing of sold products
    11. Use of sold products
    12. End-of-life treatment of sold products
    13. Downstream leased assets
    14. Franchises
    15. Investments
    """

    async def calculate(self, sources: List[EmissionDataSource]) -> Scope3Result:
        category_results = {}

        for category_num in range(1, 16):
            category_sources = [s for s in sources if s.scope_3_category == category_num]

            if not category_sources:
                continue

            # Use appropriate methodology for each category
            calculator = self.get_category_calculator(category_num)
            result = await calculator.calculate(category_sources)

            category_results[category_num] = result

        return Scope3Result(
            category_breakdown=category_results,
            total=sum(r.total for r in category_results.values())
        )

    def get_category_calculator(self, category: int):
        """
        Each category has specific calculation methodology
        """
        calculators = {
            1: PurchasedGoodsCalculator(),  # Spend-based or supplier-specific
            2: CapitalGoodsCalculator(),    # Spend-based
            5: WasteCalculator(),            # Waste-type-specific
            6: BusinessTravelCalculator(),   # Distance-based
            7: CommuteCalculator(),          # Employee survey + distance
            # ... more categories
        }
        return calculators.get(category)
```

---

## Report Generation Architecture

### Report Templates

Each regulatory framework has specific requirements:

#### CSRD (Corporate Sustainability Reporting Directive)
```python
class CSRDReportGenerator:
    """
    EU CSRD compliance report generator

    Required disclosures:
    - ESRS E1: Climate change
    - ESRS E2: Pollution
    - ESRS E3: Water and marine resources
    - ESRS E4: Biodiversity and ecosystems
    - ESRS E5: Resource use and circular economy
    """

    async def generate(
        self,
        inventory: EmissionInventory,
        organization: Organization
    ) -> Report:

        # E1: Climate Change section
        e1_section = await self.generate_e1_climate(inventory)

        # E5: Circular Economy (uses marketplace data)
        e5_section = await self.generate_e5_circular_economy(organization)

        # Compile full report
        report = CSRDReport(
            organization=organization,
            reporting_period=inventory.reporting_period,
            sections={
                "E1": e1_section,
                "E5": e5_section,
                # ... other sections
            }
        )

        # Render to PDF
        pdf = await self.render_pdf(report)

        return pdf
```

#### GHG Protocol Corporate Standard
```python
class GHGProtocolReportGenerator:
    """
    Standard GHG inventory report

    Required sections:
    1. Organizational boundaries
    2. Operational boundaries
    3. Scope 1 emissions
    4. Scope 2 emissions
    5. Scope 3 emissions (if applicable)
    6. Base year
    7. Methodology and assumptions
    8. Verification statement
    """

    async def generate(self, inventory: EmissionInventory) -> Report:
        template = self.load_template("ghg_protocol_standard.html")

        context = {
            "organization": inventory.organization,
            "reporting_period": inventory.reporting_period,
            "scope_1": self.format_scope_1(inventory),
            "scope_2": self.format_scope_2(inventory),
            "scope_3": self.format_scope_3(inventory),
            "total_emissions": inventory.total_emissions,
            "methodology": self.get_methodology_description(inventory),
            "data_quality": self.assess_data_quality(inventory),
            "verification_status": inventory.verification_status
        }

        # Render HTML with data
        html = template.render(context)

        # Convert to professional PDF
        pdf = await self.html_to_pdf(html)

        return pdf
```

---

## API Endpoints

### Emissions Data Management

```python
# POST /api/v1/emissions/data
# Upload emission data (manual or bulk)
@router.post("/data")
async def create_emission_data(
    data: EmissionDataInput,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Create new emission data source"""
    pass

# POST /api/v1/emissions/import/csv
# Bulk import from CSV
@router.post("/import/csv")
async def import_csv(
    file: UploadFile,
    db: Session = Depends(get_db)
):
    """Import emissions data from CSV file"""
    pass

# GET /api/v1/emissions/data?period=2024-01-01,2024-12-31
# Fetch emission data for period
@router.get("/data")
async def get_emission_data(
    period_start: date,
    period_end: date,
    scope: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get emission data sources for reporting period"""
    pass
```

### Calculations

```python
# POST /api/v1/calculations/calculate
# Trigger calculation for reporting period
@router.post("/calculate")
async def calculate_inventory(
    request: CalculationRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Calculate GHG inventory for reporting period
    Returns calculation job ID for status tracking
    """
    job = background_tasks.add_task(
        calculate_full_inventory,
        organization_id=request.organization_id,
        reporting_period=request.reporting_period
    )
    return {"job_id": job.id}

# GET /api/v1/calculations/{calculation_id}
# Get calculation results
@router.get("/calculations/{calculation_id}")
async def get_calculation(calculation_id: UUID):
    """Get calculation details and results"""
    pass

# GET /api/v1/inventories/{inventory_id}
# Get aggregated inventory
@router.get("/inventories/{inventory_id}")
async def get_inventory(inventory_id: UUID):
    """Get emission inventory summary"""
    pass
```

### Report Generation

```python
# POST /api/v1/reports/generate
# Generate audit-ready report
@router.post("/generate")
async def generate_report(
    request: ReportRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Generate regulatory report

    Request:
    {
        "inventory_id": "uuid",
        "report_type": "CSRD" | "CDP" | "GHG_PROTOCOL" | "TCFD",
        "format": "PDF" | "EXCEL" | "XBRL",
        "options": {
            "include_verification": true,
            "include_data_tables": true,
            "language": "en"
        }
    }

    Returns: job_id for status tracking
    """
    job = background_tasks.add_task(
        generate_report_task,
        request=request
    )
    return {"job_id": job.id, "status": "processing"}

# GET /api/v1/reports/{report_id}/download
# Download generated report
@router.get("/{report_id}/download")
async def download_report(report_id: UUID):
    """Download generated report file"""
    report = await get_report(report_id)
    return FileResponse(
        path=report.file_url,
        filename=f"{report.report_type}_{report.reporting_period_start}.pdf",
        media_type="application/pdf"
    )

# POST /api/v1/reports/{report_id}/submit
# Submit report to regulator
@router.post("/{report_id}/submit")
async def submit_report(
    report_id: UUID,
    submission: SubmissionRequest
):
    """
    Submit report to regulatory body
    Tracks submission status
    """
    pass
```

### Emission Factors

```python
# GET /api/v1/factors/search
# Search emission factors database
@router.get("/factors/search")
async def search_factors(
    scope: int,
    category: str,
    region: str,
    year: int,
    db: Session = Depends(get_db)
):
    """Search for appropriate emission factors"""
    pass

# POST /api/v1/factors/custom
# Create custom emission factor
@router.post("/factors/custom")
async def create_custom_factor(
    factor: CustomEmissionFactor,
    db: Session = Depends(get_db)
):
    """Create organization-specific emission factor"""
    pass
```

---

## Data Quality & Validation

### Validation Rules

```python
class EmissionDataValidator:
    """
    Validates emission data quality and completeness
    """

    rules = {
        "activity_amount": {
            "required": True,
            "type": "decimal",
            "min": 0,
            "max": 1e12
        },
        "activity_unit": {
            "required": True,
            "allowed": ["kWh", "liters", "kg", "tons", "km", "USD", ...]
        },
        "reporting_period": {
            "required": True,
            "max_duration_days": 366,
            "must_not_be_future": True
        },
        "data_source": {
            "required": True,
            "allowed": ["utility_bill", "fuel_receipt", "invoice", "meter_reading", ...]
        }
    }

    def validate(self, data: EmissionDataInput) -> ValidationResult:
        """Run all validation rules"""
        errors = []
        warnings = []

        # Required field checks
        # Type validation
        # Range validation
        # Business logic validation

        return ValidationResult(
            valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
            data_quality_score=self.calculate_quality_score(data)
        )

    def calculate_quality_score(self, data: EmissionDataInput) -> int:
        """
        Data quality tier (1-5)

        Tier 1: Primary data, directly measured, supplier-specific
        Tier 2: Secondary data, region-specific
        Tier 3: Industry average data
        Tier 4: Spend-based estimation
        Tier 5: Proxy data, highly uncertain
        """
        score = 5  # Start at lowest

        if data.data_source in ["meter_reading", "utility_bill"]:
            score = 1
        elif data.data_source in ["supplier_invoice", "fuel_receipt"]:
            score = 2
        elif data.calculation_method == "activity_based":
            score = 3
        elif data.calculation_method == "spend_based":
            score = 4

        return score
```

---

## Deployment Architecture

### Production Environment

```yaml
# docker-compose.yml for production

services:
  backend:
    build: ./backend
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - EPA_API_KEY=${EPA_API_KEY}
    ports:
      - "8000:8000"
    depends_on:
      - postgres
      - redis
    restart: always

  celery_worker:
    build: ./backend
    command: celery -A app.tasks worker --loglevel=info
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - redis
      - postgres
    restart: always

  celery_beat:
    build: ./backend
    command: celery -A app.tasks beat --loglevel=info
    environment:
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - redis
    restart: always

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=zero_emissions
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always

  redis:
    image: redis:7-alpine
    restart: always

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
    restart: always

volumes:
  postgres_data:
```

---

## Next Steps

### Implementation Phases

**Phase 1: Core Calculation Engine** (Week 1)
- Database schema setup
- Emission factor database
- Scope 1 & 2 calculators
- Basic API endpoints

**Phase 2: Scope 3 & Advanced Calculations** (Week 2)
- All 15 Scope 3 categories
- Data import system
- Validation framework
- Audit trail

**Phase 3: Report Generation** (Week 3)
- GHG Protocol report generator
- PDF rendering
- Excel export
- Basic CSRD support

**Phase 4: Polish & Production** (Week 4)
- CDP report generator
- XBRL export
- Submission tracking
- Performance optimization
- Security hardening

---

## Success Criteria

✅ **Calculation Accuracy**: 99.9% match with manual calculations
✅ **Audit Compliance**: Reports pass third-party audit
✅ **Data Traceability**: Complete audit trail from source → calculation → report
✅ **Performance**: Generate reports in <30 seconds
✅ **Regulatory Acceptance**: Reports accepted by regulatory bodies
✅ **Data Quality**: Automated quality scoring and validation

---

*This architecture document is version-controlled and will be updated as implementation progresses.*

# ZERO Backend - GHG Emissions Tracking & Reporting API

Production-grade Python backend for comprehensive greenhouse gas emissions tracking, calculations, and regulatory-compliant reporting.

## 🏗️ Architecture

### Technology Stack

- **Framework**: FastAPI 0.109+ (async, high-performance)
- **Database**: PostgreSQL via Supabase (managed)
- **ORM**: SQLAlchemy 2.0+ with Alembic migrations
- **Calculations**: Custom GHG Protocol engine with Pint for unit conversions
- **Reports**: ReportLab (PDF), OpenPyXL (Excel)
- **Validation**: Pydantic v2, Pandera
- **Background Tasks**: Celery + Redis
- **Auth**: JWT with python-jose

### Architecture Pattern

```
Hybrid Architecture:
├── Supabase: Managed PostgreSQL database
└── Python Backend: All business logic, calculations, and reports
```

**Rationale**: Best of both worlds - managed database infrastructure with full control over carbon accounting logic.

## 📁 Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                      # FastAPI application entry point
│   │
│   ├── api/                         # API layer
│   │   ├── v1/
│   │   │   ├── endpoints/           # API route handlers
│   │   │   │   └── reports.py       # Report generation endpoints
│   │   │   └── router.py            # API router configuration
│   │   └── __init__.py
│   │
│   ├── core/                        # Core business logic
│   │   ├── calculations/
│   │   │   ├── ghg_calculator.py    # GHG Protocol calculation engine
│   │   │   └── __init__.py
│   │   └── config.py                # Application configuration
│   │
│   ├── data/                        # Reference data
│   │   ├── emission_factors/        # Emission factor databases
│   │   │   ├── electricity_grid_factors.json
│   │   │   ├── fuel_combustion_factors.json
│   │   │   ├── refrigerant_gwp.json
│   │   │   └── transportation_factors.json
│   │   └── README.md
│   │
│   ├── db/                          # Database configuration
│   │   ├── base.py                  # SQLAlchemy base
│   │   └── __init__.py
│   │
│   ├── models/                      # SQLAlchemy ORM models
│   │   ├── emission_data.py         # Emissions data models
│   │   └── __init__.py
│   │
│   ├── schemas/                     # Pydantic schemas (for API validation)
│   │   └── __init__.py
│   │
│   ├── services/                    # Business logic services
│   │   ├── reports/                 # Report generation
│   │   │   ├── base.py              # Base report utilities
│   │   │   ├── ghg_protocol.py      # GHG Protocol Corporate Standard
│   │   │   ├── sb253.py             # California SB253 reports
│   │   │   └── __init__.py
│   │   ├── report_service.py        # Report orchestration
│   │   └── __init__.py
│   │
│   └── tasks/                       # Background tasks (Celery)
│       └── __init__.py
│
├── tests/                           # Test suite (pytest)
│
├── .env                             # Environment variables (gitignored)
├── .gitignore
├── requirements.txt                 # Python dependencies
└── README.md                        # This file
```

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- PostgreSQL 14+ (or Supabase account)
- Redis (for background tasks)

### Installation

1. **Clone and navigate**:
   ```bash
   cd backend
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Set up database**:
   ```bash
   # Run migrations
   alembic upgrade head

   # Load emission factors (optional)
   python -m app.data.loaders
   ```

### Running the Server

**Development**:
```bash
uvicorn app.main:app --reload --port 8000
```

**Production**:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

API will be available at `http://localhost:8000`
- Interactive docs: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 🧮 GHG Calculation Engine

### Scope 1: Direct Emissions

```python
from app.core.calculations import Scope1Calculator
from decimal import Decimal

# Stationary combustion
result = Scope1Calculator.calculate_stationary_combustion(
    fuel_type="Natural Gas",
    fuel_amount=Decimal("1000"),
    fuel_unit="therms",
    emission_factor=Decimal("5.3"),
    emission_factor_unit="kg_co2e_per_therm"
)

# Fugitive emissions (refrigerants)
result = Scope1Calculator.calculate_fugitive_emissions(
    refrigerant_type="R-134a",
    amount_leaked=Decimal("10.5"),  # kg
    gwp=1430
)
```

### Scope 2: Indirect Energy

```python
from app.core.calculations import Scope2Calculator

# Location-based method
result = Scope2Calculator.calculate_location_based(
    electricity_kwh=Decimal("1000000"),
    grid_emission_factor=Decimal("0.000385")  # US average
)

# Market-based method (with RECs)
result = Scope2Calculator.calculate_market_based(
    electricity_kwh=Decimal("1000000"),
    supplier_emission_factor=Decimal("0.000234"),
    renewable_energy_kwh=Decimal("200000")  # 20% renewable
)
```

### Scope 3: Value Chain

```python
from app.core.calculations import Scope3Calculator

# Category 1: Purchased goods (spend-based)
result = Scope3Calculator.calculate_spend_based(
    spend_amount=Decimal("1000000"),
    currency="USD",
    emission_factor=Decimal("0.5"),  # kg CO2e/$
    category=1
)

# Category 6: Business travel (distance-based)
result = Scope3Calculator.calculate_distance_based(
    distance=Decimal("5000"),
    distance_unit="km",
    mode="Air - Economy",
    emission_factor=Decimal("0.150"),
    category=6
)
```

## 📊 Report Generation

### GHG Protocol Corporate Standard

```python
from app.services.reports import GHGProtocolReportGenerator, GHGProtocolReportData
from decimal import Decimal
from datetime import date

# Prepare report data
report_data = GHGProtocolReportData(
    company_name="Acme Corp",
    reporting_period_start=date(2024, 1, 1),
    reporting_period_end=date(2024, 12, 31),
    naics_code="334413",
    total_scope_1=Decimal("1500000.00"),
    total_scope_2=Decimal("2500000.00"),
    total_scope_3=Decimal("3000000.00"),
    # ... all regulatory fields
)

# Generate PDF
generator = GHGProtocolReportGenerator(report_data)
pdf_bytes = generator.generate()

# Save to file
with open("ghg_report.pdf", "wb") as f:
    f.write(pdf_bytes)
```

### California SB253 Climate Disclosure

```python
from app.services.reports import SB253ReportGenerator, SB253ReportData

report_data = SB253ReportData(
    company_name="Acme Corp",
    total_revenue=Decimal("5000000000"),
    california_revenue=Decimal("800000000"),
    sb253_compliance_year=2024,
    # ... includes all GHG Protocol fields
)

generator = SB253ReportGenerator(report_data)
pdf_bytes = generator.generate()
```

## 🗄️ Database Models

### Core Models

- **Company**: Organization-level data
- **Facility**: Physical locations
- **EmissionData**: Scope 1, 2, 3 emissions records
- **EmissionFactor**: Reference emission factors
- **ActivityData**: Raw activity data (fuel use, electricity, etc.)
- **Report**: Generated reports metadata
- **AuditLog**: Change tracking for compliance

### Relationships

```
Company (1) ──< (many) Facility
Facility (1) ──< (many) EmissionData
EmissionData (many) >── (1) EmissionFactor
```

## 🔌 API Endpoints

### Reports

- `POST /api/v1/reports/ghg-protocol` - Generate GHG Protocol report
- `POST /api/v1/reports/sb253` - Generate California SB253 report
- `GET /api/v1/reports/{report_id}` - Retrieve generated report
- `GET /api/v1/reports/{report_id}/download` - Download report PDF

### Emissions Data

- `GET /api/v1/emissions` - List all emissions records
- `POST /api/v1/emissions` - Create emission record
- `GET /api/v1/emissions/{id}` - Get specific record
- `PUT /api/v1/emissions/{id}` - Update record
- `DELETE /api/v1/emissions/{id}` - Delete record

### Calculations

- `POST /api/v1/calculate/scope-1` - Calculate Scope 1 emissions
- `POST /api/v1/calculate/scope-2` - Calculate Scope 2 emissions
- `POST /api/v1/calculate/scope-3` - Calculate Scope 3 emissions

## 🧪 Testing

```bash
# Run all tests
pytest

# With coverage
pytest --cov=app --cov-report=html

# Specific test file
pytest tests/test_calculations.py

# Verbose mode
pytest -v
```

## 📝 Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/zero_emissions

# Security
SECRET_KEY=your-secret-key-here
BACKEND_CORS_ORIGINS=["http://localhost:3000","http://localhost:5173"]

# Supabase (if using)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key

# Redis (background tasks)
REDIS_URL=redis://localhost:6379/0

# Email (for report delivery)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password
```

## 🔒 Security

- **Authentication**: JWT tokens with configurable expiration
- **Authorization**: Role-based access control (Admin, Analyst, Viewer)
- **Data Validation**: Pydantic models with strict validation
- **SQL Injection**: SQLAlchemy ORM prevents injection
- **CORS**: Configurable allowed origins
- **Rate Limiting**: Built-in rate limiting on API endpoints
- **Encryption**: Sensitive data encrypted at rest (database level)

## 📈 Regulatory Compliance

### Supported Standards

- ✅ **GHG Protocol Corporate Accounting and Reporting Standard**
- ✅ **ISO 14064-1:2018** (Greenhouse gases specification)
- ✅ **California SB253** (Climate Corporate Data Accountability Act)
- ✅ **EPA GHG Reporting Program** (40 CFR Part 98)
- ✅ **SEC Climate Disclosure Rules**
- ✅ **CDP Climate Change Questionnaire**

### Compliance Features

- Scope 1, 2, 3 comprehensive coverage (all 15 categories)
- Facility-level emissions tracking
- Dual reporting for Scope 2 (location & market-based)
- GHG breakdown by gas type (CO2, CH4, N2O, F-gases)
- Data quality assessment (Tier 1-4)
- Base year recalculation policy
- Third-party verification support
- Audit trail logging
- Document version control

## 🚢 Deployment

### Docker

```bash
# Build image
docker build -t zero-backend .

# Run container
docker run -p 8000:8000 --env-file .env zero-backend
```

### Docker Compose

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
    depends_on:
      - db
      - redis

  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=zero_emissions
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres

  redis:
    image: redis:7-alpine
```

### Production Checklist

- [ ] Set strong `SECRET_KEY`
- [ ] Configure proper CORS origins
- [ ] Enable HTTPS
- [ ] Set up database backups
- [ ] Configure logging aggregation
- [ ] Set up monitoring (Sentry, DataDog, etc.)
- [ ] Enable rate limiting
- [ ] Review and update emission factors annually
- [ ] Set up automated testing in CI/CD

## 📖 Additional Documentation

- [Emissions Data Checklist](../../EMISSIONS_DATA_CHECKLIST.md) - Complete data entry requirements
- [Emission Factors](app/data/README.md) - Reference data documentation
- [API Documentation](http://localhost:8000/docs) - Interactive API docs (when server running)

## 🤝 Contributing

1. Follow PEP 8 style guide
2. Use Black for code formatting
3. Add type hints to all functions
4. Write tests for new features
5. Update documentation

## 📄 License

Proprietary - All rights reserved

## 🆘 Support

For issues or questions:
- Review documentation
- Check [API docs](http://localhost:8000/docs)
- Consult emissions data checklist

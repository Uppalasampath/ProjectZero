# Emission Factors Data

This directory contains reference data for GHG emissions calculations.

## Structure

```
data/
└── emission_factors/
    ├── electricity_grid_factors.json     # Grid electricity by country/region
    ├── fuel_combustion_factors.json      # Scope 1 fuels (gas, diesel, coal, etc.)
    ├── refrigerant_gwp.json              # Global Warming Potentials for refrigerants
    └── transportation_factors.json       # Scope 3 travel & freight
```

## Data Sources

- **EPA**: U.S. Environmental Protection Agency
  - eGRID (Emissions & Generation Resource Integrated Database)
  - GHG Emission Factors Hub

- **DEFRA**: UK Department for Environment, Food & Rural Affairs
  - Government GHG Conversion Factors for Company Reporting

- **IPCC**: Intergovernmental Panel on Climate Change
  - AR5 (Fifth Assessment Report) - Global Warming Potentials

- **IEA**: International Energy Agency
  - Global electricity emission factors

## Usage

These JSON files serve as reference data to be loaded into the `emission_factors` database table.

### Loading Data

```python
from app.data.loaders import load_emission_factors

# Load all emission factors into database
load_emission_factors()
```

### Accessing in Calculations

```python
from app.core.calculations import GHGProtocolCalculator
from app.models import EmissionFactor

# Fetch factor from database
factor = session.query(EmissionFactor).filter_by(
    fuel_type="Natural Gas",
    unit="therms"
).first()

# Use in calculation
calculator = GHGProtocolCalculator()
result = calculator.calculate(
    scope=1,
    category="stationary_combustion",
    activity_amount=1000,
    activity_unit="therms",
    emission_factor=factor.value,
    emission_factor_unit=factor.unit
)
```

## Updating Factors

Emission factors should be updated annually when new data is released:

1. **EPA eGRID**: Released annually (typically October)
2. **DEFRA**: Released annually (typically June)
3. **IPCC GWPs**: Updated with each Assessment Report (every 5-7 years)

## Data Format

### Electricity Grid Factors

```json
{
  "country": "United States",
  "region": "California",
  "subregion": "CAMX",
  "emission_factor_kg_co2e_per_kwh": 0.000234,
  "co2_percentage": 0.94,
  "ch4_percentage": 0.04,
  "n2o_percentage": 0.02,
  "year": 2023
}
```

### Fuel Combustion Factors

```json
{
  "fuel_type": "Natural Gas",
  "category": "stationary_combustion",
  "unit": "therms",
  "emission_factor_kg_co2e_per_unit": 5.3,
  "co2_kg_per_unit": 5.28,
  "ch4_kg_per_unit": 0.01,
  "n2o_kg_per_unit": 0.01,
  "source": "EPA"
}
```

### Refrigerant GWP

```json
{
  "gas_name": "R-134a",
  "chemical_formula": "CH2FCF3",
  "gwp_100yr": 1430,
  "category": "hfc",
  "common_use": "Automotive AC, refrigeration"
}
```

### Transportation Factors

```json
{
  "mode": "Air Travel",
  "category": "Long-haul Economy (>3700 km)",
  "unit": "passenger_km",
  "emission_factor_kg_co2e_per_unit": 0.150,
  "notes": "International long-haul, economy class"
}
```

## Custom Factors

Organizations can add custom emission factors:

1. Create a new JSON file in this directory
2. Follow the same structure as existing files
3. Include proper documentation (source, year, methodology)
4. Run data loader to import into database

## Compliance Notes

- **GHG Protocol**: Requires use of most recent published factors
- **ISO 14064-1**: Factors must be documented and justified
- **California SB253**: Requires third-party verified factors where possible
- **SEC Climate Disclosure**: Factors must be from recognized sources

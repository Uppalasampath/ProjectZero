"""
Carbon Emissions Calculation Engine
GHG Protocol Compliant Calculations for Scope 1, 2, and 3

This module provides government-grade emission calculations following:
- GHG Protocol Corporate Standard
- EPA Emission Factors Hub
- eGRID 2023 for electricity
- DEFRA 2024 for UK factors
"""

from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime
import json

@dataclass
class ActivityData:
    """Activity data for emission calculations"""
    source_id: str
    activity_amount: float
    activity_unit: str
    period_start: datetime
    period_end: datetime
    location: Optional[str] = None
    data_quality: str = "measured"  # measured, calculated, estimated


@dataclass
class EmissionFactor:
    """Emission factor from regulatory databases"""
    factor_id: str
    factor_value: float  # kg CO2e per unit
    source: str  # EPA, eGRID, DEFRA, IPCC
    unit: str
    scope: int
    category: str
    geography: Optional[str] = None
    gwp_standard: str = "AR5"  # IPCC AR5 required by SB-253


@dataclass
class EmissionResult:
    """Result of emission calculation"""
    source_id: str
    scope: int
    category: str
    subcategory: Optional[str]
    activity_data: float
    activity_unit: str
    emission_factor: float
    total_emissions: float  # tons CO2e
    calculation_method: str
    data_quality: str
    calculated_at: datetime


class Scope1Calculator:
    """
    Scope 1: Direct GHG emissions from sources owned or controlled by the company

    Categories:
    - Stationary combustion (boilers, furnaces, heaters)
    - Mobile combustion (company vehicles, fleet)
    - Process emissions (chemical reactions, manufacturing)
    - Fugitive emissions (refrigerants, leaks from equipment)
    """

    # EPA Emission Factors (2024) - Stationary Combustion
    EPA_FACTORS = {
        'natural_gas': 0.05306,  # kg CO2e per cubic foot
        'fuel_oil_no2': 10.21,   # kg CO2e per gallon
        'diesel': 10.21,         # kg CO2e per gallon
        'gasoline': 8.78,        # kg CO2e per gallon
        'coal_bituminous': 2325.73,  # kg CO2e per short ton
        'propane': 5.74,         # kg CO2e per gallon
    }

    @classmethod
    def calculate_stationary_combustion(cls, fuel_type: str, amount: float, unit: str) -> float:
        """
        Calculate emissions from stationary combustion sources

        Formula: Emissions = Activity Data × Emission Factor ÷ 1000

        Args:
            fuel_type: Type of fuel (natural_gas, diesel, etc.)
            amount: Amount consumed
            unit: Unit of consumption

        Returns:
            Emissions in tons CO2e
        """
        if fuel_type not in cls.EPA_FACTORS:
            raise ValueError(f"Unknown fuel type: {fuel_type}")

        factor = cls.EPA_FACTORS[fuel_type]
        emissions_kg = amount * factor
        emissions_tons = emissions_kg / 1000

        return emissions_tons

    @classmethod
    def calculate_mobile_combustion(cls, vehicle_data: List[Dict]) -> float:
        """
        Calculate emissions from company-owned vehicles

        Args:
            vehicle_data: List of vehicle activity records
                [{"fuel_type": "diesel", "amount": 5000, "unit": "gallons"}, ...]

        Returns:
            Total emissions in tons CO2e
        """
        total_emissions = 0

        for vehicle in vehicle_data:
            fuel_type = vehicle.get('fuel_type', 'gasoline')
            amount = vehicle.get('amount', 0)

            if fuel_type in cls.EPA_FACTORS:
                emissions_kg = amount * cls.EPA_FACTORS[fuel_type]
                total_emissions += emissions_kg / 1000

        return total_emissions

    @classmethod
    def calculate_fugitive_emissions(cls, refrigerant_data: List[Dict]) -> float:
        """
        Calculate fugitive emissions from refrigerants and equipment leaks

        Uses IPCC AR5 Global Warming Potentials:
        - HFC-134a: 1430 (common in cooling systems)
        - R-410A: 2088 (common in AC)

        Args:
            refrigerant_data: List of refrigerant leak records
                [{"type": "HFC-134a", "amount_kg": 5}, ...]

        Returns:
            Total emissions in tons CO2e
        """
        GWP_FACTORS = {
            'HFC-134a': 1430,
            'R-410A': 2088,
            'R-404A': 3922,
            'R-22': 1810,
        }

        total_emissions = 0

        for leak in refrigerant_data:
            refrigerant_type = leak.get('type')
            amount_kg = leak.get('amount_kg', 0)

            if refrigerant_type in GWP_FACTORS:
                # Direct conversion: kg refrigerant × GWP = kg CO2e
                emissions_kg = amount_kg * GWP_FACTORS[refrigerant_type]
                total_emissions += emissions_kg / 1000

        return total_emissions

    @classmethod
    def calculate_total_scope1(cls, sources: List[Dict]) -> Tuple[float, List[EmissionResult]]:
        """
        Calculate total Scope 1 emissions from all sources

        Args:
            sources: List of all Scope 1 emission sources

        Returns:
            Tuple of (total_emissions, breakdown_by_source)
        """
        total = 0
        breakdown = []

        for source in sources:
            category = source.get('category')

            if category == 'stationary_combustion':
                emissions = cls.calculate_stationary_combustion(
                    source['fuel_type'],
                    source['amount'],
                    source['unit']
                )
            elif category == 'mobile_combustion':
                emissions = cls.calculate_mobile_combustion([source])
            elif category == 'fugitive_emissions':
                emissions = cls.calculate_fugitive_emissions([source])
            else:
                emissions = 0

            total += emissions

            result = EmissionResult(
                source_id=source.get('id', ''),
                scope=1,
                category=category,
                subcategory=source.get('subcategory'),
                activity_data=source.get('amount', 0),
                activity_unit=source.get('unit', ''),
                emission_factor=0,  # Varies by source
                total_emissions=emissions,
                calculation_method='GHG Protocol - Activity Based',
                data_quality=source.get('data_quality', 'measured'),
                calculated_at=datetime.now()
            )
            breakdown.append(result)

        return total, breakdown


class Scope2Calculator:
    """
    Scope 2: Indirect emissions from purchased energy

    Two calculation methods (both required by GHG Protocol):
    - Location-based: Uses average grid emission factors
    - Market-based: Uses contractual instruments (RECs, PPAs)

    Energy types:
    - Purchased electricity
    - Purchased steam
    - Purchased heating
    - Purchased cooling
    """

    # eGRID 2023 Subregion Factors (kg CO2e per MWh)
    EGRID_2023_FACTORS = {
        'CAMX': 213.07,      # California
        'ERCT': 390.58,      # Texas
        'NYCW': 256.41,      # New York City
        'MROW': 713.21,      # Midwest (coal-heavy)
        'FRCC': 412.76,      # Florida
        'NEWE': 245.32,      # New England
        'RFCW': 638.94,      # RFC West
        'US_AVERAGE': 386.88,  # U.S. Average
    }

    @classmethod
    def calculate_location_based(cls, electricity_data: List[Dict]) -> float:
        """
        Calculate Scope 2 using location-based method
        Uses regional grid average emission factors (eGRID)

        Args:
            electricity_data: List of electricity consumption records
                [{"kwh": 500000, "egrid_subregion": "CAMX"}, ...]

        Returns:
            Total emissions in tons CO2e
        """
        total_emissions = 0

        for record in electricity_data:
            kwh = record.get('kwh', 0)
            mwh = kwh / 1000  # Convert to MWh

            subregion = record.get('egrid_subregion', 'US_AVERAGE')
            factor = cls.EGRID_2023_FACTORS.get(subregion, cls.EGRID_2023_FACTORS['US_AVERAGE'])

            # Emissions = MWh × eGRID factor (kg CO2e/MWh) ÷ 1000
            emissions_kg = mwh * factor
            total_emissions += emissions_kg / 1000

        return total_emissions

    @classmethod
    def calculate_market_based(cls, electricity_data: List[Dict]) -> float:
        """
        Calculate Scope 2 using market-based method
        Uses supplier-specific or contractual emission factors

        Hierarchy (per GHG Protocol):
        1. Energy attribute certificates (RECs, GOs)
        2. Direct contracts with suppliers (PPAs)
        3. Supplier-specific emission rates
        4. Residual mix (if available)
        5. Location-based factors (default)

        Args:
            electricity_data: List with supplier emission factors
                [{"kwh": 500000, "supplier_factor": 0}, ...]  # 0 = renewable

        Returns:
            Total emissions in tons CO2e
        """
        total_emissions = 0

        for record in electricity_data:
            kwh = record.get('kwh', 0)
            mwh = kwh / 1000

            # Supplier-specific factor (kg CO2e per MWh)
            # If renewable energy certificates, factor = 0
            supplier_factor = record.get('supplier_factor')

            if supplier_factor is not None:
                emissions_kg = mwh * supplier_factor
            else:
                # Fallback to location-based if no supplier data
                subregion = record.get('egrid_subregion', 'US_AVERAGE')
                factor = cls.EGRID_2023_FACTORS.get(subregion, cls.EGRID_2023_FACTORS['US_AVERAGE'])
                emissions_kg = mwh * factor

            total_emissions += emissions_kg / 1000

        return total_emissions

    @classmethod
    def calculate_total_scope2(cls, electricity_data: List[Dict]) -> Dict:
        """
        Calculate Scope 2 using both methods (required by GHG Protocol)

        Args:
            electricity_data: All purchased electricity records

        Returns:
            Dictionary with both calculations:
            {
                "location_based": float,
                "market_based": float,
                "breakdown": [...]
            }
        """
        location_based = cls.calculate_location_based(electricity_data)
        market_based = cls.calculate_market_based(electricity_data)

        return {
            "location_based": location_based,
            "market_based": market_based,
            "calculation_method": "GHG Protocol Scope 2 Guidance",
            "egrid_version": "2023",
            "calculated_at": datetime.now().isoformat()
        }


class Scope3Calculator:
    """
    Scope 3: All other indirect emissions in the value chain

    15 Categories (GHG Protocol):
    Upstream:
    1. Purchased goods and services
    2. Capital goods
    3. Fuel and energy related activities
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

    # EPA Supply Chain Emission Factors (spend-based, kg CO2e per $)
    SPEND_BASED_FACTORS = {
        'purchased_goods_services': 0.456,  # Economy-wide average
        'capital_goods': 0.523,
        'professional_services': 0.235,
        'it_services': 0.189,
        'construction': 0.687,
    }

    # DEFRA 2024 Business Travel Factors
    DEFRA_TRAVEL_FACTORS = {
        'flight_short_haul': 0.15587,  # kg CO2e per passenger-km (< 500 km)
        'flight_medium_haul': 0.10686,  # 500-3700 km
        'flight_long_haul': 0.14807,   # > 3700 km
        'hotel_stay': 25.7,            # kg CO2e per room-night
        'rail': 0.03549,               # kg CO2e per passenger-km
        'taxi': 0.16684,               # kg CO2e per km
    }

    @classmethod
    def calculate_category(cls, category_id: int, items: List[Dict]) -> float:
        """
        Calculate emissions for a specific Scope 3 category

        Args:
            category_id: GHG Protocol category number (1-15)
            items: Activity data for this category

        Returns:
            Total emissions for category in tons CO2e
        """
        total = 0

        for item in items:
            activity = item.get('activity', 0)
            emission_factor = item.get('emission_factor', 0)

            # Emissions in kg CO2e
            emissions_kg = activity * emission_factor
            total += emissions_kg / 1000

        return total

    @classmethod
    def calculate_purchased_goods(cls, procurement_spend: float) -> float:
        """
        Category 1: Purchased goods and services
        Uses spend-based method when supplier data unavailable

        Args:
            procurement_spend: Annual procurement spend in USD

        Returns:
            Emissions in tons CO2e
        """
        factor = cls.SPEND_BASED_FACTORS['purchased_goods_services']
        emissions_kg = procurement_spend * factor
        return emissions_kg / 1000

    @classmethod
    def calculate_business_travel(cls, travel_data: List[Dict]) -> float:
        """
        Category 6: Business travel

        Args:
            travel_data: List of travel records
                [
                    {"type": "flight_short_haul", "distance_km": 1000, "passengers": 1},
                    {"type": "hotel_stay", "nights": 5},
                    ...
                ]

        Returns:
            Total emissions in tons CO2e
        """
        total = 0

        for trip in travel_data:
            travel_type = trip.get('type')

            if travel_type in cls.DEFRA_TRAVEL_FACTORS:
                factor = cls.DEFRA_TRAVEL_FACTORS[travel_type]

                if 'flight' in travel_type:
                    distance_km = trip.get('distance_km', 0)
                    passengers = trip.get('passengers', 1)
                    emissions_kg = distance_km * factor * passengers
                elif travel_type == 'hotel_stay':
                    nights = trip.get('nights', 0)
                    emissions_kg = nights * factor
                else:
                    distance_km = trip.get('distance_km', 0)
                    emissions_kg = distance_km * factor

                total += emissions_kg / 1000

        return total

    @classmethod
    def calculate_employee_commuting(cls, employee_data: Dict) -> float:
        """
        Category 7: Employee commuting

        Args:
            employee_data: Commuting patterns
                {
                    "total_employees": 500,
                    "avg_commute_km": 15,
                    "working_days_per_year": 250,
                    "mode_split": {
                        "car": 0.7,      # 70% drive
                        "public_transit": 0.2,
                        "bike_walk": 0.1
                    }
                }

        Returns:
            Annual emissions in tons CO2e
        """
        total_employees = employee_data.get('total_employees', 0)
        avg_commute_km = employee_data.get('avg_commute_km', 0)
        working_days = employee_data.get('working_days_per_year', 250)
        mode_split = employee_data.get('mode_split', {})

        # Round trip
        total_km_per_employee = avg_commute_km * 2 * working_days

        # Emission factors (kg CO2e per passenger-km)
        mode_factors = {
            'car': 0.171,           # Average passenger car
            'public_transit': 0.104,  # Bus/train average
            'bike_walk': 0           # Zero emissions
        }

        total_emissions = 0

        for mode, percentage in mode_split.items():
            if mode in mode_factors:
                mode_km = total_km_per_employee * percentage
                emissions_kg = total_employees * mode_km * mode_factors[mode]
                total_emissions += emissions_kg / 1000

        return total_emissions

    @classmethod
    def calculate_total_scope3(cls, categories: Dict[int, List[Dict]]) -> Dict:
        """
        Calculate all Scope 3 emissions across 15 categories

        Args:
            categories: Dictionary mapping category IDs to activity data
                {
                    1: [{"activity": 5000000, "emission_factor": 0.456}],  # Purchased goods
                    6: [{"type": "flight_short_haul", "distance_km": 1000}],  # Business travel
                    ...
                }

        Returns:
            {
                "total": float,
                "breakdown": {1: float, 2: float, ...},
                "category_names": {1: "Purchased goods and services", ...}
            }
        """
        CATEGORY_NAMES = {
            1: "Purchased goods and services",
            2: "Capital goods",
            3: "Fuel and energy related activities",
            4: "Upstream transportation and distribution",
            5: "Waste generated in operations",
            6: "Business travel",
            7: "Employee commuting",
            8: "Upstream leased assets",
            9: "Downstream transportation and distribution",
            10: "Processing of sold products",
            11: "Use of sold products",
            12: "End-of-life treatment of sold products",
            13: "Downstream leased assets",
            14: "Franchises",
            15: "Investments"
        }

        breakdown = {}
        total = 0

        for category_id, items in categories.items():
            if category_id == 6:
                # Business travel uses special calculation
                category_total = cls.calculate_business_travel(items)
            else:
                # Generic calculation for other categories
                category_total = cls.calculate_category(category_id, items)

            breakdown[category_id] = category_total
            total += category_total

        return {
            "total": total,
            "breakdown": breakdown,
            "category_names": CATEGORY_NAMES,
            "calculation_method": "GHG Protocol Corporate Value Chain (Scope 3) Standard",
            "calculated_at": datetime.now().isoformat()
        }


# Main calculation function
def calculate_full_inventory(
    scope1_sources: List[Dict],
    scope2_electricity: List[Dict],
    scope3_categories: Dict[int, List[Dict]]
) -> Dict:
    """
    Calculate complete carbon footprint across all three scopes

    Args:
        scope1_sources: All Scope 1 emission sources
        scope2_electricity: All purchased electricity records
        scope3_categories: All Scope 3 activity data by category

    Returns:
        Complete emissions inventory:
        {
            "scope1": {"total": float, "breakdown": [...]},
            "scope2": {"location_based": float, "market_based": float},
            "scope3": {"total": float, "breakdown": {...}},
            "grand_total": float,
            "calculated_at": str
        }
    """
    # Calculate Scope 1
    scope1_total, scope1_breakdown = Scope1Calculator.calculate_total_scope1(scope1_sources)

    # Calculate Scope 2 (both methods)
    scope2_results = Scope2Calculator.calculate_total_scope2(scope2_electricity)

    # Calculate Scope 3 (all 15 categories)
    scope3_results = Scope3Calculator.calculate_total_scope3(scope3_categories)

    # Grand total using market-based Scope 2 (preferred by GHG Protocol)
    grand_total = scope1_total + scope2_results['market_based'] + scope3_results['total']

    return {
        "scope1": {
            "total": scope1_total,
            "breakdown": [result.__dict__ for result in scope1_breakdown]
        },
        "scope2": scope2_results,
        "scope3": scope3_results,
        "grand_total": grand_total,
        "calculation_method": "GHG Protocol Corporate Standard",
        "ghg_inventory_standard": "ISO 14064-1:2018",
        "calculated_at": datetime.now().isoformat()
    }

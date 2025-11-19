"""
GHG Protocol Calculation Engine
Implements calculation methodologies for Scope 1, 2, and 3 emissions
"""
from decimal import Decimal
from typing import List, Dict, Optional, Tuple
from datetime import date
import logging

from pint import UnitRegistry

# Initialize unit registry for conversions
ureg = UnitRegistry()

logger = logging.getLogger(__name__)


class EmissionResult:
    """Result of an emission calculation"""

    def __init__(
        self,
        co2e_kg: Decimal,
        co2_kg: Optional[Decimal] = None,
        ch4_kg: Optional[Decimal] = None,
        n2o_kg: Optional[Decimal] = None,
        calculation_formula: str = "",
        uncertainty_percentage: Optional[Decimal] = None
    ):
        self.co2e_kg = co2e_kg
        self.co2_kg = co2_kg or co2e_kg  # Default to total if not broken down
        self.ch4_kg = ch4_kg or Decimal(0)
        self.n2o_kg = n2o_kg or Decimal(0)
        self.calculation_formula = calculation_formula
        self.uncertainty_percentage = uncertainty_percentage

    @property
    def co2e_tons(self) -> Decimal:
        """Convert to tons CO2e"""
        return self.co2e_kg / Decimal(1000)

    def to_dict(self) -> Dict:
        return {
            "co2e_kg": float(self.co2e_kg),
            "co2e_tons": float(self.co2e_tons),
            "co2_kg": float(self.co2_kg),
            "ch4_kg": float(self.ch4_kg),
            "n2o_kg": float(self.n2o_kg),
            "calculation_formula": self.calculation_formula,
            "uncertainty_percentage": float(self.uncertainty_percentage) if self.uncertainty_percentage else None
        }


class UnitConverter:
    """
    Handles unit conversions for emissions calculations
    """

    # Standard conversion factors
    ENERGY_CONVERSIONS = {
        "kwh_to_mwh": Decimal("0.001"),
        "kwh_to_gwh": Decimal("0.000001"),
        "kwh_to_tj": Decimal("0.0000036"),
        "btu_to_kwh": Decimal("0.000293071"),
    }

    VOLUME_CONVERSIONS = {
        "liters_to_gallons": Decimal("0.264172"),
        "gallons_to_liters": Decimal("3.78541"),
        "cubic_meters_to_liters": Decimal("1000"),
    }

    MASS_CONVERSIONS = {
        "kg_to_tons": Decimal("0.001"),
        "tons_to_kg": Decimal("1000"),
        "lbs_to_kg": Decimal("0.453592"),
        "kg_to_lbs": Decimal("2.20462"),
    }

    DISTANCE_CONVERSIONS = {
        "km_to_miles": Decimal("0.621371"),
        "miles_to_km": Decimal("1.60934"),
    }

    @classmethod
    def convert(cls, value: Decimal, from_unit: str, to_unit: str) -> Decimal:
        """
        Convert value from one unit to another

        Args:
            value: The value to convert
            from_unit: Source unit (e.g., "kwh", "liters")
            to_unit: Target unit (e.g., "mwh", "gallons")

        Returns:
            Converted value
        """
        from_unit = from_unit.lower()
        to_unit = to_unit.lower()

        if from_unit == to_unit:
            return value

        # Try direct conversion
        conversion_key = f"{from_unit}_to_{to_unit}"

        # Check all conversion dictionaries
        for conversions in [cls.ENERGY_CONVERSIONS, cls.VOLUME_CONVERSIONS,
                           cls.MASS_CONVERSIONS, cls.DISTANCE_CONVERSIONS]:
            if conversion_key in conversions:
                return value * conversions[conversion_key]

        # Try reverse conversion
        reverse_key = f"{to_unit}_to_{from_unit}"
        for conversions in [cls.ENERGY_CONVERSIONS, cls.VOLUME_CONVERSIONS,
                           cls.MASS_CONVERSIONS, cls.DISTANCE_CONVERSIONS]:
            if reverse_key in conversions:
                return value / conversions[reverse_key]

        # If no direct conversion found, try using pint
        try:
            quantity = ureg.Quantity(float(value), from_unit)
            converted = quantity.to(to_unit)
            return Decimal(str(converted.magnitude))
        except Exception as e:
            logger.error(f"Unit conversion failed: {from_unit} to {to_unit}: {e}")
            raise ValueError(f"Cannot convert {from_unit} to {to_unit}")

    @classmethod
    def to_kg_co2e(cls, value: Decimal, unit: str) -> Decimal:
        """Convert any CO2e unit to kg"""
        unit = unit.lower()

        if "ton" in unit or "tonne" in unit:
            return value * Decimal(1000)
        elif "kg" in unit:
            return value
        elif "g" in unit:
            return value / Decimal(1000)
        else:
            return value  # Assume kg if not specified


class Scope1Calculator:
    """
    Scope 1: Direct GHG emissions from sources owned/controlled by organization

    Categories:
    - Stationary Combustion (boilers, furnaces, generators)
    - Mobile Combustion (company vehicles, equipment)
    - Process Emissions (chemical reactions, industrial processes)
    - Fugitive Emissions (refrigerants, HVAC leaks, natural gas leaks)
    """

    @staticmethod
    def calculate_emission(
        activity_amount: Decimal,
        activity_unit: str,
        emission_factor: Decimal,
        emission_factor_unit: str,
        gas_breakdown: Optional[Dict[str, float]] = None
    ) -> EmissionResult:
        """
        Core calculation: Activity Data × Emission Factor = Emissions

        Args:
            activity_amount: Amount of activity (e.g., 1000 liters)
            activity_unit: Unit of activity (e.g., "liters")
            emission_factor: Emission factor value (e.g., 2.68)
            emission_factor_unit: Unit of emission factor (e.g., "kg_co2e_per_liter")
            gas_breakdown: Optional breakdown by gas {"co2": 0.9, "ch4": 0.05, "n2o": 0.05}

        Returns:
            EmissionResult with calculated emissions
        """
        # Extract expected activity unit from factor unit
        # e.g., "kg_co2e_per_liter" -> "liter"
        expected_unit = emission_factor_unit.split("_per_")[-1] if "_per_" in emission_factor_unit else activity_unit

        # Convert activity to expected unit if needed
        try:
            standardized_amount = UnitConverter.convert(activity_amount, activity_unit, expected_unit)
        except ValueError:
            # If conversion fails, assume units match
            standardized_amount = activity_amount

        # Calculate total CO2e
        co2e_kg = standardized_amount * emission_factor

        # Extract unit from factor (kg, tons, etc.)
        if "ton" in emission_factor_unit.lower():
            co2e_kg = UnitConverter.to_kg_co2e(co2e_kg, "tons")
        elif "g" in emission_factor_unit.lower() and "kg" not in emission_factor_unit.lower():
            co2e_kg = UnitConverter.to_kg_co2e(co2e_kg, "g")

        # Break down by gas if provided
        co2_kg = None
        ch4_kg = None
        n2o_kg = None

        if gas_breakdown:
            co2_kg = co2e_kg * Decimal(str(gas_breakdown.get("co2", 1.0)))
            ch4_kg = co2e_kg * Decimal(str(gas_breakdown.get("ch4", 0)))
            n2o_kg = co2e_kg * Decimal(str(gas_breakdown.get("n2o", 0)))

        # Build calculation formula for audit trail
        formula = f"{activity_amount} {activity_unit} × {emission_factor} {emission_factor_unit} = {co2e_kg:.2f} kg CO2e"

        return EmissionResult(
            co2e_kg=co2e_kg,
            co2_kg=co2_kg,
            ch4_kg=ch4_kg,
            n2o_kg=n2o_kg,
            calculation_formula=formula
        )

    @classmethod
    def calculate_stationary_combustion(
        cls,
        fuel_type: str,
        fuel_amount: Decimal,
        fuel_unit: str,
        emission_factor: Decimal,
        emission_factor_unit: str
    ) -> EmissionResult:
        """
        Calculate emissions from stationary combustion sources

        Examples:
        - Natural gas: 1000 cubic meters
        - Diesel: 500 liters
        - Coal: 2 tons
        """
        return cls.calculate_emission(
            activity_amount=fuel_amount,
            activity_unit=fuel_unit,
            emission_factor=emission_factor,
            emission_factor_unit=emission_factor_unit
        )

    @classmethod
    def calculate_mobile_combustion(
        cls,
        fuel_type: str,
        fuel_amount: Decimal,
        fuel_unit: str,
        emission_factor: Decimal,
        emission_factor_unit: str
    ) -> EmissionResult:
        """
        Calculate emissions from mobile sources (vehicles)

        Can use fuel-based or distance-based methods
        """
        return cls.calculate_emission(
            activity_amount=fuel_amount,
            activity_unit=fuel_unit,
            emission_factor=emission_factor,
            emission_factor_unit=emission_factor_unit
        )

    @classmethod
    def calculate_fugitive_emissions(
        cls,
        refrigerant_type: str,
        amount_leaked: Decimal,
        gwp: int  # Global Warming Potential
    ) -> EmissionResult:
        """
        Calculate fugitive emissions from refrigerants

        Formula: Amount leaked (kg) × GWP = kg CO2e

        GWP examples:
        - R-134a: 1430
        - R-410A: 2088
        - R-22: 1810
        """
        co2e_kg = amount_leaked * Decimal(gwp)

        formula = f"{amount_leaked} kg {refrigerant_type} × GWP {gwp} = {co2e_kg} kg CO2e"

        return EmissionResult(
            co2e_kg=co2e_kg,
            calculation_formula=formula
        )


class Scope2Calculator:
    """
    Scope 2: Indirect emissions from purchased electricity, heat, steam, cooling

    Two methods:
    - Location-based: Grid average emission factor
    - Market-based: Supplier-specific or contractual instruments (RECs)
    """

    @staticmethod
    def calculate_location_based(
        electricity_kwh: Decimal,
        grid_emission_factor: Decimal,  # kg CO2e per kWh
        gas_breakdown: Optional[Dict[str, float]] = None
    ) -> EmissionResult:
        """
        Location-based method: Uses grid average emission factors

        Args:
            electricity_kwh: Electricity consumption in kWh
            grid_emission_factor: Grid emission factor (kg CO2e/kWh)
            gas_breakdown: Optional gas breakdown

        Returns:
            EmissionResult
        """
        co2e_kg = electricity_kwh * grid_emission_factor

        # Gas breakdown
        co2_kg = None
        ch4_kg = None
        n2o_kg = None

        if gas_breakdown:
            co2_kg = co2e_kg * Decimal(str(gas_breakdown.get("co2", 0.95)))
            ch4_kg = co2e_kg * Decimal(str(gas_breakdown.get("ch4", 0.03)))
            n2o_kg = co2e_kg * Decimal(str(gas_breakdown.get("n2o", 0.02)))

        formula = f"{electricity_kwh} kWh × {grid_emission_factor} kg CO2e/kWh = {co2e_kg:.2f} kg CO2e"

        return EmissionResult(
            co2e_kg=co2e_kg,
            co2_kg=co2_kg,
            ch4_kg=ch4_kg,
            n2o_kg=n2o_kg,
            calculation_formula=formula
        )

    @staticmethod
    def calculate_market_based(
        electricity_kwh: Decimal,
        supplier_emission_factor: Decimal,  # kg CO2e per kWh (supplier-specific)
        renewable_energy_kwh: Decimal = Decimal(0),  # RECs or renewable contracts
        gas_breakdown: Optional[Dict[str, float]] = None
    ) -> EmissionResult:
        """
        Market-based method: Uses supplier-specific factors

        Args:
            electricity_kwh: Total electricity consumption
            supplier_emission_factor: Supplier-specific emission factor
            renewable_energy_kwh: Amount covered by RECs or renewable contracts
            gas_breakdown: Optional gas breakdown

        Returns:
            EmissionResult
        """
        # Calculate emissions for non-renewable portion
        non_renewable_kwh = electricity_kwh - renewable_energy_kwh
        co2e_kg = non_renewable_kwh * supplier_emission_factor

        # Renewable energy has zero emissions
        formula = (
            f"({electricity_kwh} kWh - {renewable_energy_kwh} renewable kWh) × "
            f"{supplier_emission_factor} kg CO2e/kWh = {co2e_kg:.2f} kg CO2e"
        )

        return EmissionResult(
            co2e_kg=co2e_kg,
            calculation_formula=formula
        )

    @staticmethod
    def calculate_steam_heat(
        amount: Decimal,
        unit: str,  # "mmbtu", "gj", "kwh"
        emission_factor: Decimal,
        emission_factor_unit: str
    ) -> EmissionResult:
        """
        Calculate emissions from purchased steam or heat
        """
        # Standardize to common unit
        if "mmbtu" in unit.lower():
            standardized_amount = amount
        elif "gj" in unit.lower():
            # 1 GJ = 0.947817 MMBtu
            standardized_amount = amount * Decimal("0.947817")
        elif "kwh" in unit.lower():
            # 1 kWh = 0.00341214 MMBtu
            standardized_amount = amount * Decimal("0.00341214")
        else:
            standardized_amount = amount

        co2e_kg = standardized_amount * emission_factor

        formula = f"{amount} {unit} × {emission_factor} {emission_factor_unit} = {co2e_kg:.2f} kg CO2e"

        return EmissionResult(
            co2e_kg=co2e_kg,
            calculation_formula=formula
        )


class Scope3Calculator:
    """
    Scope 3: All indirect emissions in value chain (15 categories)

    This is a simplified implementation for MVP.
    Full implementation would have specialized calculators for each category.
    """

    # Category names for reference
    CATEGORIES = {
        1: "Purchased goods and services",
        2: "Capital goods",
        3: "Fuel- and energy-related activities",
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

    @staticmethod
    def calculate_spend_based(
        spend_amount: Decimal,
        currency: str,
        emission_factor: Decimal,  # kg CO2e per currency unit
        category: int
    ) -> EmissionResult:
        """
        Spend-based method: Common for Categories 1, 2

        Formula: Spend ($) × Emission Factor (kg CO2e/$) = kg CO2e

        Args:
            spend_amount: Amount spent
            currency: Currency code (USD, EUR, GBP)
            emission_factor: Emission factor per currency unit
            category: Scope 3 category number

        Returns:
            EmissionResult
        """
        co2e_kg = spend_amount * emission_factor

        category_name = Scope3Calculator.CATEGORIES.get(category, f"Category {category}")
        formula = f"{spend_amount} {currency} × {emission_factor} kg CO2e/{currency} = {co2e_kg:.2f} kg CO2e ({category_name})"

        return EmissionResult(
            co2e_kg=co2e_kg,
            calculation_formula=formula
        )

    @staticmethod
    def calculate_distance_based(
        distance: Decimal,
        distance_unit: str,
        mode: str,  # "flight", "rail", "car"
        emission_factor: Decimal,
        category: int = 6  # Business travel
    ) -> EmissionResult:
        """
        Distance-based method: Common for Categories 4, 6, 7, 9

        Formula: Distance (km) × Emission Factor (kg CO2e/km) = kg CO2e

        Args:
            distance: Distance traveled
            distance_unit: Unit (km, miles)
            mode: Mode of transport
            emission_factor: Emission factor per distance unit
            category: Scope 3 category

        Returns:
            EmissionResult
        """
        # Convert to km if needed
        if distance_unit.lower() in ["miles", "mi"]:
            distance_km = UnitConverter.convert(distance, "miles", "km")
        else:
            distance_km = distance

        co2e_kg = distance_km * emission_factor

        category_name = Scope3Calculator.CATEGORIES.get(category, f"Category {category}")
        formula = f"{distance_km} km ({mode}) × {emission_factor} kg CO2e/km = {co2e_kg:.2f} kg CO2e ({category_name})"

        return EmissionResult(
            co2e_kg=co2e_kg,
            calculation_formula=formula
        )

    @staticmethod
    def calculate_waste_based(
        waste_amount: Decimal,
        waste_unit: str,
        waste_type: str,
        disposal_method: str,
        emission_factor: Decimal,
        category: int = 5  # Waste generated in operations
    ) -> EmissionResult:
        """
        Waste-based method: Category 5

        Formula: Waste (tons) × Emission Factor (kg CO2e/ton) = kg CO2e

        Args:
            waste_amount: Amount of waste
            waste_unit: Unit (tons, kg)
            waste_type: Type of waste (mixed, organic, etc.)
            disposal_method: Method (landfill, incineration, recycling)
            emission_factor: Emission factor
            category: Scope 3 category

        Returns:
            EmissionResult
        """
        # Convert to tons if needed
        if waste_unit.lower() in ["kg", "kilograms"]:
            waste_tons = waste_amount / Decimal(1000)
        else:
            waste_tons = waste_amount

        co2e_kg = waste_tons * emission_factor * Decimal(1000)  # Convert back to kg

        formula = f"{waste_tons} tons {waste_type} ({disposal_method}) × {emission_factor} kg CO2e/ton = {co2e_kg:.2f} kg CO2e"

        return EmissionResult(
            co2e_kg=co2e_kg,
            calculation_formula=formula
        )


class GHGProtocolCalculator:
    """
    Main orchestrator for GHG Protocol calculations
    """

    def __init__(self):
        self.scope_1_calc = Scope1Calculator()
        self.scope_2_calc = Scope2Calculator()
        self.scope_3_calc = Scope3Calculator()

    def calculate(
        self,
        scope: int,
        category: str,
        activity_amount: Decimal,
        activity_unit: str,
        emission_factor: Decimal,
        emission_factor_unit: str,
        **kwargs
    ) -> EmissionResult:
        """
        Route calculation to appropriate scope calculator

        Args:
            scope: 1, 2, or 3
            category: Emission category
            activity_amount: Amount of activity
            activity_unit: Unit of activity
            emission_factor: Emission factor value
            emission_factor_unit: Unit of emission factor
            **kwargs: Additional parameters

        Returns:
            EmissionResult
        """
        if scope == 1:
            return self.scope_1_calc.calculate_emission(
                activity_amount=activity_amount,
                activity_unit=activity_unit,
                emission_factor=emission_factor,
                emission_factor_unit=emission_factor_unit,
                gas_breakdown=kwargs.get("gas_breakdown")
            )

        elif scope == 2:
            if category == "electricity":
                return self.scope_2_calc.calculate_location_based(
                    electricity_kwh=activity_amount,
                    grid_emission_factor=emission_factor,
                    gas_breakdown=kwargs.get("gas_breakdown")
                )
            else:
                # Steam or heat
                return self.scope_2_calc.calculate_steam_heat(
                    amount=activity_amount,
                    unit=activity_unit,
                    emission_factor=emission_factor,
                    emission_factor_unit=emission_factor_unit
                )

        elif scope == 3:
            scope_3_category = kwargs.get("scope_3_category", 1)

            # Route to appropriate method based on category
            if scope_3_category in [1, 2]:  # Purchased goods, capital goods
                return self.scope_3_calc.calculate_spend_based(
                    spend_amount=activity_amount,
                    currency=activity_unit,
                    emission_factor=emission_factor,
                    category=scope_3_category
                )
            elif scope_3_category in [4, 6, 7, 9]:  # Transportation, travel
                return self.scope_3_calc.calculate_distance_based(
                    distance=activity_amount,
                    distance_unit=activity_unit,
                    mode=category,
                    emission_factor=emission_factor,
                    category=scope_3_category
                )
            elif scope_3_category == 5:  # Waste
                return self.scope_3_calc.calculate_waste_based(
                    waste_amount=activity_amount,
                    waste_unit=activity_unit,
                    waste_type=category,
                    disposal_method=kwargs.get("disposal_method", "landfill"),
                    emission_factor=emission_factor,
                    category=scope_3_category
                )
            else:
                # Generic calculation for other categories
                return self.scope_1_calc.calculate_emission(
                    activity_amount=activity_amount,
                    activity_unit=activity_unit,
                    emission_factor=emission_factor,
                    emission_factor_unit=emission_factor_unit
                )

        else:
            raise ValueError(f"Invalid scope: {scope}. Must be 1, 2, or 3")

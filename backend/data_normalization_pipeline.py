"""
Data Normalization and Preprocessing Pipeline
For Test Company Pet Ltd - Complex Semiconductor Manufacturing Data

This pipeline:
1. Loads complex raw data with quality issues
2. Normalizes units and formats
3. Fills missing values using estimation methods
4. Calculates total emissions
5. Generates regulatory-compliant report
"""

from datetime import date, datetime
from decimal import Decimal
from typing import Dict, List, Any, Optional
import copy

# Import the complex seed data
from seed_data_complex_semiconductor import get_complex_seed_data


class DataNormalizationPipeline:
    """
    Pipeline to normalize and preprocess complex emissions data
    """

    def __init__(self, raw_data: Dict):
        self.raw_data = raw_data
        self.normalized_data = None
        self.normalization_log = []
        self.warnings = []
        self.errors = []

    def log_action(self, action: str, details: str, severity: str = "INFO"):
        """Log normalization action"""
        entry = {
            "timestamp": datetime.now(),
            "action": action,
            "details": details,
            "severity": severity
        }
        self.normalization_log.append(entry)
        print(f"[{severity}] {action}: {details}")

    def normalize_units(self):
        """Step 1: Normalize all units to standard units"""
        self.log_action("UNIT_NORMALIZATION", "Starting unit normalization", "INFO")

        facilities = copy.deepcopy(self.raw_data['facilities_raw'])

        for facility in facilities:
            fac_id = facility['facility_id']

            # Normalize electricity units to kWh
            if 'electricity_mwh' in facility:
                kwh = facility['electricity_mwh'] * 1000
                facility['electricity_kwh'] = kwh
                self.log_action(
                    "UNIT_CONVERSION",
                    f"{fac_id}: Converted {facility['electricity_mwh']} MWh to {kwh} kWh",
                    "INFO"
                )
                del facility['electricity_mwh']

            if 'electricity_gwh' in facility:
                kwh = facility['electricity_gwh'] * 1000000
                facility['electricity_kwh'] = kwh
                self.log_action(
                    "UNIT_CONVERSION",
                    f"{fac_id}: Converted {facility['electricity_gwh']} GWh to {kwh} kWh",
                    "INFO"
                )
                del facility['electricity_gwh']

            # Normalize natural gas to therms
            if 'natural_gas_m3' in facility:
                # 1 m³ natural gas ≈ 0.0353 therms
                therms = facility['natural_gas_m3'] * 0.0353
                facility['natural_gas_therms'] = therms
                self.log_action(
                    "UNIT_CONVERSION",
                    f"{fac_id}: Converted {facility['natural_gas_m3']} m³ to {therms:.2f} therms",
                    "INFO"
                )
                del facility['natural_gas_m3']

            if 'natural_gas_mmbtu' in facility:
                # 1 MMBtu ≈ 10 therms
                therms = facility['natural_gas_mmbtu'] * 10
                facility['natural_gas_therms'] = therms
                self.log_action(
                    "UNIT_CONVERSION",
                    f"{fac_id}: Converted {facility['natural_gas_mmbtu']} MMBtu to {therms:.2f} therms",
                    "INFO"
                )
                del facility['natural_gas_mmbtu']

            # Handle nested natural gas data
            if 'natural_gas' in facility and isinstance(facility['natural_gas'], dict):
                if facility['natural_gas']['unit'] == 'therms':
                    facility['natural_gas_therms'] = facility['natural_gas']['amount']
                    del facility['natural_gas']

        return facilities

    def fill_missing_scope_data(self, facilities: List[Dict]):
        """Step 2: Fill missing Scope 1, 2, 3 data using estimation methods"""
        self.log_action("MISSING_DATA", "Filling missing emissions data", "INFO")

        # Standard emission factors
        EF_NATURAL_GAS = 0.0053  # tons CO2e/therm
        EF_ELECTRICITY_DEFAULT = 0.000389  # tons CO2e/kWh (US average)

        # GWP values for process gases
        GWP_VALUES = {
            'NF3': 16100,
            'SF6': 23500,
            'CF4': 6630,
            'CHF3': 12400,
            'C2F6': 11100,
            'C4F8': 8600
        }

        for facility in facilities:
            fac_id = facility['facility_id']

            # Estimate Scope 1 if missing
            if facility.get('scope_1') is None:
                scope_1_estimate = 0.0

                # From natural gas
                if facility.get('natural_gas_therms'):
                    ng_emissions = facility['natural_gas_therms'] * EF_NATURAL_GAS
                    scope_1_estimate += ng_emissions

                # From process gases (with 85% abatement assumption)
                if facility.get('process_gases_kg'):
                    for gas, amount_kg in facility['process_gases_kg'].items():
                        gwp = GWP_VALUES.get(gas, 1)
                        # Assume 85% abatement efficiency (industry standard)
                        actual_emissions_kg = amount_kg * 0.15  # 15% escapes
                        co2e_tons = (actual_emissions_kg * gwp) / 1000
                        scope_1_estimate += co2e_tons

                facility['scope_1'] = round(scope_1_estimate, 2)
                facility['scope_1_estimated'] = True
                self.log_action(
                    "ESTIMATION",
                    f"{fac_id}: Estimated Scope 1 = {scope_1_estimate:.2f} tons CO2e",
                    "WARNING"
                )

            # Estimate Scope 2 if missing
            if facility.get('scope_2') is None:
                if facility.get('electricity_kwh'):
                    # Use appropriate grid emission factor based on location
                    grid_factors = {
                        'USA': 0.000389,  # tons CO2e/kWh
                        'Germany': 0.000310,
                        'Taiwan': 0.000502,
                        'South Korea': 0.000405,
                        'China': 0.000555,
                        'Singapore': 0.000392,
                        'Japan': 0.000463,
                        'Ireland': 0.000285,
                        'Malaysia': 0.000658
                    }

                    # Infer country from address
                    address = facility.get('address', '')
                    ef = EF_ELECTRICITY_DEFAULT
                    for country, factor in grid_factors.items():
                        if country in address or country.lower() in address.lower():
                            ef = factor
                            break

                    scope_2_estimate = facility['electricity_kwh'] * ef
                    facility['scope_2'] = round(scope_2_estimate, 2)
                    facility['scope_2_estimated'] = True
                    self.log_action(
                        "ESTIMATION",
                        f"{fac_id}: Estimated Scope 2 = {scope_2_estimate:.2f} tons CO2e (EF={ef})",
                        "WARNING"
                    )

            # Estimate Scope 3 if missing (use 45% of Scope 1+2 as rough estimate)
            if facility.get('scope_3') is None:
                scope_1 = facility.get('scope_1', 0)
                scope_2 = facility.get('scope_2', 0)
                scope_3_estimate = (scope_1 + scope_2) * 0.45
                facility['scope_3'] = round(scope_3_estimate, 2)
                facility['scope_3_estimated'] = True
                self.log_action(
                    "ESTIMATION",
                    f"{fac_id}: Estimated Scope 3 = {scope_3_estimate:.2f} tons CO2e (45% of S1+S2)",
                    "WARNING"
                )

            # Handle partial year data (annualize)
            if facility.get('operational_months') and facility['operational_months'] < 12:
                months = facility['operational_months']
                annualization_factor = 12 / months

                facility['scope_1_annualized'] = facility['scope_1'] * annualization_factor
                facility['scope_2_annualized'] = facility['scope_2'] * annualization_factor
                facility['scope_3_annualized'] = facility['scope_3'] * annualization_factor

                self.log_action(
                    "ANNUALIZATION",
                    f"{fac_id}: Annualized {months}-month data (factor={annualization_factor:.2f})",
                    "INFO"
                )

                # Use annualized values
                facility['scope_1'] = round(facility['scope_1_annualized'], 2)
                facility['scope_2'] = round(facility['scope_2_annualized'], 2)
                facility['scope_3'] = round(facility['scope_3_annualized'], 2)

        return facilities

    def calculate_totals(self, facilities: List[Dict]):
        """Step 3: Calculate total emissions across all facilities"""
        self.log_action("CALCULATION", "Calculating total emissions", "INFO")

        total_scope_1 = sum(f.get('scope_1', 0) for f in facilities)
        total_scope_2 = sum(f.get('scope_2', 0) for f in facilities)
        total_scope_3 = sum(f.get('scope_3', 0) for f in facilities)

        # Add Scope 3 category-level data
        scope_3_data = self.raw_data.get('scope_3_raw_data', {})

        scope_3_breakdown = {}
        scope_3_exclusions = {}
        scope_3_methodologies = {}

        # Category 1: Purchased goods and services
        if 'category_1' in scope_3_data:
            cat1 = scope_3_data['category_1']
            scope_3_breakdown[1] = Decimal(str(cat1['total_emissions_estimate']))
            scope_3_methodologies[1] = "Spend-based method using EPA EEIO emission factors for procurement categories"

        # Category 3: Fuel and energy related
        if 'category_3' in scope_3_data:
            cat3 = scope_3_data['category_3']
            scope_3_breakdown[3] = Decimal(str(cat3['total_emissions_estimate']))
            scope_3_methodologies[3] = "Average-data method for T&D losses and upstream fuel emissions"

        # Category 4: Upstream transportation
        if 'category_4' in scope_3_data:
            cat4 = scope_3_data['category_4']
            scope_3_breakdown[4] = Decimal(str(cat4['total_emissions_estimate']))
            scope_3_methodologies[4] = "Distance-based method using ton-km data and modal split assumptions"

        # Category 5: Waste
        if 'category_5' in scope_3_data:
            cat5 = scope_3_data['category_5']
            scope_3_breakdown[5] = Decimal(str(cat5['total_emissions_estimate']))
            scope_3_methodologies[5] = "Waste-type-specific method using EPA WARM emission factors"

        # Category 6: Business travel
        if 'category_6' in scope_3_data:
            cat6 = scope_3_data['category_6']
            scope_3_breakdown[6] = Decimal(str(cat6['total_emissions_estimate']))
            scope_3_methodologies[6] = "Distance-based method with flight class breakdown and DEFRA emission factors including radiative forcing"

        # Category 7: Employee commuting
        if 'category_7' in scope_3_data:
            cat7 = scope_3_data['category_7']
            scope_3_breakdown[7] = Decimal(str(cat7['total_emissions_estimate']))
            scope_3_methodologies[7] = "Average-data method using employee survey (42% response rate) with modal split and EPA SmartWay factors"

        # Exclusions
        scope_3_exclusions[2] = "Capital goods excluded due to immateriality - represents <2% of estimated total emissions based on screening analysis"
        scope_3_exclusions[8] = "Not applicable - company owns all facilities"
        scope_3_exclusions[9] = "Not applicable - products sold FOB from manufacturing facility"
        scope_3_exclusions[10] = "Not applicable - semiconductors require no further processing by customers"
        scope_3_exclusions[12] = "Excluded - end-of-life treatment estimated at <0.5% of total Scope 3"
        scope_3_exclusions[13] = "Not applicable - no downstream leased assets"
        scope_3_exclusions[14] = "Not applicable - company does not operate franchises"
        scope_3_exclusions[15] = "Excluded - financial investments are in operating companies whose emissions are reported in their own Scope 1&2 inventories"

        # Category 11 marked as highly uncertain - use screening value or exclude
        scope_3_exclusions[11] = "Use of sold products excluded due to extreme data uncertainty (Tier 4 quality). Screening estimate: 2,850,000 tons CO2e, but requires customer-specific usage data not available. Represents product use-phase electricity consumption which varies dramatically by application."

        # Recalculate Scope 3 total from categories
        total_scope_3_from_categories = float(sum(scope_3_breakdown.values()))

        self.log_action(
            "CALCULATION",
            f"Total Scope 1: {total_scope_1:,.2f} tons CO2e",
            "INFO"
        )
        self.log_action(
            "CALCULATION",
            f"Total Scope 2: {total_scope_2:,.2f} tons CO2e",
            "INFO"
        )
        self.log_action(
            "CALCULATION",
            f"Total Scope 3 (from categories): {total_scope_3_from_categories:,.2f} tons CO2e",
            "INFO"
        )
        self.log_action(
            "CALCULATION",
            f"Total Emissions: {total_scope_1 + total_scope_2 + total_scope_3_from_categories:,.2f} tons CO2e",
            "INFO"
        )

        return {
            'scope_1_total': Decimal(str(total_scope_1)),
            'scope_2_total': Decimal(str(total_scope_2)),
            'scope_3_total': Decimal(str(total_scope_3_from_categories)),
            'scope_3_breakdown': scope_3_breakdown,
            'scope_3_exclusions': scope_3_exclusions,
            'scope_3_methodologies': scope_3_methodologies,
            'facilities_normalized': facilities
        }

    def assess_data_quality(self, facilities: List[Dict], totals: Dict):
        """Step 4: Assess overall data quality"""
        self.log_action("DATA_QUALITY", "Assessing data quality", "INFO")

        # Calculate weighted data quality score
        tier_scores = {'Tier 1': 5.0, 'Tier 2': 3.5, 'Tier 3': 2.0, 'Tier 4': 1.0}

        total_emissions = 0
        weighted_score_sum = 0

        for facility in facilities:
            fac_emissions = (
                facility.get('scope_1', 0) +
                facility.get('scope_2', 0) +
                facility.get('scope_3', 0)
            )
            total_emissions += fac_emissions

            tier = facility.get('data_quality', 'Tier 3')
            score = tier_scores.get(tier, 2.0)

            # Penalize estimated data
            if facility.get('scope_1_estimated'):
                score -= 0.5
            if facility.get('scope_2_estimated'):
                score -= 0.5
            if facility.get('scope_3_estimated'):
                score -= 0.5

            weighted_score_sum += fac_emissions * score

        overall_quality = weighted_score_sum / total_emissions if total_emissions > 0 else 2.5

        # Calculate reporting completeness
        complete_facilities = sum(1 for f in facilities if f.get('reporting_completeness', 0) > 0.75)
        overall_completeness = complete_facilities / len(facilities) if facilities else 0

        self.log_action(
            "DATA_QUALITY",
            f"Overall Quality Score: {overall_quality:.2f}/5.0",
            "INFO"
        )
        self.log_action(
            "DATA_QUALITY",
            f"Reporting Completeness: {overall_completeness:.1%}",
            "INFO"
        )

        return {
            'data_quality_score': Decimal(str(round(overall_quality, 2))),
            'reporting_completeness': overall_completeness,
            'estimated_data_percentage': sum(1 for f in facilities if f.get('scope_1_estimated') or f.get('scope_2_estimated') or f.get('scope_3_estimated')) / len(facilities),
        }

    def run_pipeline(self):
        """Execute the complete normalization pipeline"""
        print("\n" + "="*80)
        print("DATA NORMALIZATION PIPELINE - Test Company Pet Ltd")
        print("="*80 + "\n")

        # Step 1: Normalize units
        facilities = self.normalize_units()

        # Step 2: Fill missing data
        facilities = self.fill_missing_scope_data(facilities)

        # Step 3: Calculate totals
        totals = self.calculate_totals(facilities)

        # Step 4: Assess data quality
        quality_metrics = self.assess_data_quality(facilities, totals)

        # Compile normalized data
        self.normalized_data = {
            **self.raw_data,
            'facilities': totals['facilities_normalized'],
            'scope_1_total': totals['scope_1_total'],
            'scope_2_total': totals['scope_2_total'],
            'scope_3_total': totals['scope_3_total'],
            'scope_3_breakdown': totals['scope_3_breakdown'],
            'scope_3_exclusions': totals['scope_3_exclusions'],
            'scope_3_methodologies': totals['scope_3_methodologies'],
            'data_quality_score': quality_metrics['data_quality_score'],
            'overall_reporting_completeness': quality_metrics['reporting_completeness'],
            'estimated_data_percentage': quality_metrics['estimated_data_percentage']
        }

        print("\n" + "="*80)
        print("PIPELINE COMPLETE")
        print("="*80)
        print(f"Total Actions Logged: {len(self.normalization_log)}")
        print(f"Warnings: {len([l for l in self.normalization_log if l['severity'] == 'WARNING'])}")
        print(f"Errors: {len([l for l in self.normalization_log if l['severity'] == 'ERROR'])}")

        return self.normalized_data

    def get_normalization_log(self):
        """Return the normalization log for reporting"""
        return self.normalization_log


if __name__ == "__main__":
    # Load complex raw data
    raw_data = get_complex_seed_data()

    # Run normalization pipeline
    pipeline = DataNormalizationPipeline(raw_data)
    normalized_data = pipeline.run_pipeline()

    print("\n" + "="*80)
    print("NORMALIZED DATA SUMMARY")
    print("="*80)
    print(f"\nTotal Scope 1 Emissions: {normalized_data['scope_1_total']:,.2f} metric tons CO2e")
    print(f"Total Scope 2 Emissions: {normalized_data['scope_2_total']:,.2f} metric tons CO2e")
    print(f"Total Scope 3 Emissions: {normalized_data['scope_3_total']:,.2f} metric tons CO2e")
    print(f"Total Emissions: {float(normalized_data['scope_1_total'] + normalized_data['scope_2_total'] + normalized_data['scope_3_total']):,.2f} metric tons CO2e")
    print(f"\nData Quality Score: {normalized_data['data_quality_score']}/5.0")
    print(f"Reporting Completeness: {normalized_data['overall_reporting_completeness']:.1%}")
    print(f"Estimated Data: {normalized_data['estimated_data_percentage']:.1%}")

    print("\n" + "="*80)
    print("Data is ready for regulatory report generation!")
    print("="*80)

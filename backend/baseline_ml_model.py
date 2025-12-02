"""
Machine Learning Model for Carbon Baseline Estimation
When historical emissions data is insufficient or missing

Uses RandomForestRegressor with industry benchmarks
Trained on:
- Revenue
- Employee count
- Energy spend
- Production volume
- Facility square footage
- Industry classification (NAICS codes)
- Geographic region
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from typing import Dict, Optional, List
import joblib
import os
from datetime import datetime


class CarbonBaselineMLModel:
    """
    ML-based carbon baseline estimator for companies with insufficient data

    Features:
    - Revenue (USD)
    - Employee count
    - Energy spend (USD)
    - Facility square footage
    - Industry sector (NAICS)
    - Geographic region
    - Production volume (optional, industry-specific)
    """

    def __init__(self, model_path: Optional[str] = None):
        self.model = RandomForestRegressor(
            n_estimators=200,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42
        )
        self.scaler = StandardScaler()
        self.industry_encoder = LabelEncoder()
        self.region_encoder = LabelEncoder()
        self.model_path = model_path or "models/baseline_estimator.pkl"
        self.is_trained = False

        # Industry emission intensity benchmarks (tons CO2e per million USD revenue)
        self.INDUSTRY_BENCHMARKS = {
            'manufacturing_heavy': 450,      # Steel, cement, chemicals
            'manufacturing_light': 120,      # Electronics, textiles
            'energy_utilities': 2500,        # Power generation
            'transportation': 380,           # Logistics, shipping
            'retail': 45,                    # Retail stores
            'technology': 25,                # Software, IT services
            'financial_services': 15,        # Banking, insurance
            'healthcare': 65,                # Hospitals, pharma
            'hospitality': 85,               # Hotels, restaurants
            'construction': 180,             # Building construction
            'agriculture': 220,              # Farming, food production
            'real_estate': 55,               # Property management
        }

    def prepare_training_data(self) -> pd.DataFrame:
        """
        Generate synthetic training data based on industry benchmarks
        In production, this would use real company emission data

        Returns:
            DataFrame with features and target (total emissions)
        """
        np.random.seed(42)

        # Generate 5000 synthetic company records
        n_samples = 5000

        data = []
        industries = list(self.INDUSTRY_BENCHMARKS.keys())
        regions = ['northeast', 'southeast', 'midwest', 'southwest', 'west', 'northwest']

        for i in range(n_samples):
            industry = np.random.choice(industries)
            region = np.random.choice(regions)

            # Revenue (log-normal distribution)
            revenue = np.random.lognormal(mean=15, sigma=2)  # $1M - $100M range

            # Employees (correlated with revenue)
            employees = int(revenue / np.random.uniform(100000, 500000))

            # Energy spend (2-5% of revenue for most industries)
            energy_spend = revenue * np.random.uniform(0.02, 0.05)

            # Facility square footage (100-500 sqft per employee)
            sqft = employees * np.random.uniform(100, 500)

            # Production volume (if applicable)
            production_volume = revenue * np.random.uniform(0.5, 2.0) if 'manufacturing' in industry else 0

            # Calculate emissions using industry benchmark with noise
            base_intensity = self.INDUSTRY_BENCHMARKS[industry]

            # Add noise and variations
            noise_factor = np.random.uniform(0.7, 1.3)
            regional_factor = np.random.uniform(0.9, 1.1)  # Regional grid mix differences

            # Emissions = (Revenue / 1M) × Industry Intensity × Factors
            total_emissions = (revenue / 1_000_000) * base_intensity * noise_factor * regional_factor

            # Add component-based calculations
            # Scope 1: ~30% of total for manufacturing, ~10% for services
            scope1_pct = 0.3 if 'manufacturing' in industry else 0.1
            # Scope 2: ~40% of total
            scope2_pct = 0.4
            # Scope 3: remainder
            scope3_pct = 1 - scope1_pct - scope2_pct

            data.append({
                'revenue': revenue,
                'employees': employees,
                'energy_spend': energy_spend,
                'facility_sqft': sqft,
                'industry': industry,
                'region': region,
                'production_volume': production_volume,
                'total_emissions': total_emissions,
                'scope1': total_emissions * scope1_pct,
                'scope2': total_emissions * scope2_pct,
                'scope3': total_emissions * scope3_pct,
            })

        return pd.DataFrame(data)

    def train(self, df: Optional[pd.DataFrame] = None):
        """
        Train the ML model on historical company data

        Args:
            df: Training data (if None, generates synthetic data)
        """
        if df is None:
            df = self.prepare_training_data()

        # Encode categorical variables
        df['industry_encoded'] = self.industry_encoder.fit_transform(df['industry'])
        df['region_encoded'] = self.region_encoder.fit_transform(df['region'])

        # Select features
        feature_cols = [
            'revenue',
            'employees',
            'energy_spend',
            'facility_sqft',
            'production_volume',
            'industry_encoded',
            'region_encoded'
        ]

        X = df[feature_cols].values
        y = df['total_emissions'].values

        # Scale features
        X_scaled = self.scaler.fit_transform(X)

        # Train model
        self.model.fit(X_scaled, y)
        self.is_trained = True

        # Calculate feature importances
        feature_importance = dict(zip(feature_cols, self.model.feature_importances_))
        print("Feature Importances:")
        for feature, importance in sorted(feature_importance.items(), key=lambda x: x[1], reverse=True):
            print(f"  {feature}: {importance:.3f}")

        return self

    def predict(self, company_data: Dict) -> Dict:
        """
        Predict baseline emissions for a company with limited data

        Args:
            company_data: Dictionary with company features:
                {
                    "revenue": float,           # Annual revenue in USD
                    "employees": int,           # Number of employees
                    "energy_spend": float,      # Annual energy spend in USD
                    "facility_sqft": float,     # Total facility square footage
                    "industry": str,            # Industry sector
                    "region": str,              # Geographic region
                    "production_volume": float  # Optional production volume
                }

        Returns:
            Estimated emissions:
            {
                "total_emissions": float,
                "scope1_estimate": float,
                "scope2_estimate": float,
                "scope3_estimate": float,
                "confidence_interval": (float, float),
                "data_quality": str,
                "method": str
            }
        """
        if not self.is_trained:
            self.train()  # Train on synthetic data if not already trained

        # Encode inputs
        try:
            industry_encoded = self.industry_encoder.transform([company_data['industry']])[0]
        except:
            # Unknown industry, use median
            industry_encoded = 0

        try:
            region_encoded = self.region_encoder.transform([company_data['region']])[0]
        except:
            region_encoded = 0

        # Prepare feature vector
        features = np.array([[
            company_data.get('revenue', 0),
            company_data.get('employees', 0),
            company_data.get('energy_spend', 0),
            company_data.get('facility_sqft', 0),
            company_data.get('production_volume', 0),
            industry_encoded,
            region_encoded
        ]])

        # Scale features
        features_scaled = self.scaler.transform(features)

        # Predict total emissions
        total_emissions = self.model.predict(features_scaled)[0]

        # Estimate confidence interval using tree predictions
        tree_predictions = np.array([tree.predict(features_scaled)[0] for tree in self.model.estimators_])
        lower_bound = np.percentile(tree_predictions, 10)
        upper_bound = np.percentile(tree_predictions, 90)

        # Estimate scope breakdown based on industry
        industry = company_data.get('industry', 'technology')
        if 'manufacturing' in industry or 'energy' in industry:
            scope1_pct = 0.3
            scope2_pct = 0.4
        elif 'transportation' in industry:
            scope1_pct = 0.4
            scope2_pct = 0.2
        else:
            scope1_pct = 0.1
            scope2_pct = 0.4

        scope3_pct = 1 - scope1_pct - scope2_pct

        return {
            "total_emissions": round(total_emissions, 2),
            "scope1_estimate": round(total_emissions * scope1_pct, 2),
            "scope2_estimate": round(total_emissions * scope2_pct, 2),
            "scope3_estimate": round(total_emissions * scope3_pct, 2),
            "confidence_interval": (round(lower_bound, 2), round(upper_bound, 2)),
            "uncertainty_pct": round((upper_bound - lower_bound) / total_emissions * 100, 1),
            "data_quality": "estimated",
            "method": "ML-based estimation (RandomForest)",
            "estimated_at": datetime.now().isoformat()
        }

    def save_model(self):
        """Save trained model to disk"""
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)

        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'industry_encoder': self.industry_encoder,
            'region_encoder': self.region_encoder,
            'is_trained': self.is_trained
        }

        joblib.dump(model_data, self.model_path)
        print(f"Model saved to {self.model_path}")

    def load_model(self):
        """Load trained model from disk"""
        if os.path.exists(self.model_path):
            model_data = joblib.load(self.model_path)
            self.model = model_data['model']
            self.scaler = model_data['scaler']
            self.industry_encoder = model_data['industry_encoder']
            self.region_encoder = model_data['region_encoder']
            self.is_trained = model_data['is_trained']
            print(f"Model loaded from {self.model_path}")
        else:
            print(f"No saved model found at {self.model_path}")


def calculate_baseline_with_ml(company_data: Dict, historical_data: Optional[List[Dict]] = None) -> Dict:
    """
    Calculate baseline emissions using ML when insufficient historical data

    Logic:
    1. If 12+ months of historical data exists → use average
    2. If 6-11 months → blend historical average with ML estimate
    3. If < 6 months → use ML estimation
    4. If no data → use industry average

    Args:
        company_data: Company profile for ML estimation
        historical_data: List of monthly emission records (if any)

    Returns:
        Baseline calculation result
    """
    if historical_data and len(historical_data) >= 12:
        # Sufficient historical data - use average of first 12 months
        first_12_months = historical_data[:12]
        baseline = sum([record['total_emissions'] for record in first_12_months]) / 12 * 12  # Annualize

        return {
            "baseline_emissions": round(baseline, 2),
            "method": "historical_average",
            "data_quality": "measured",
            "months_of_data": 12,
            "calculated_at": datetime.now().isoformat()
        }

    elif historical_data and len(historical_data) >= 6:
        # Partial historical data - blend with ML estimate
        months = len(historical_data)
        historical_avg = sum([record['total_emissions'] for record in historical_data]) / months * 12

        # Get ML estimate
        ml_model = CarbonBaselineMLModel()
        ml_result = ml_model.predict(company_data)

        # Weighted blend: more historical data = higher weight
        weight_historical = months / 12
        weight_ml = 1 - weight_historical

        baseline = (historical_avg * weight_historical) + (ml_result['total_emissions'] * weight_ml)

        return {
            "baseline_emissions": round(baseline, 2),
            "method": "hybrid_historical_ml",
            "data_quality": "calculated",
            "months_of_data": months,
            "ml_contribution_pct": round(weight_ml * 100, 1),
            "calculated_at": datetime.now().isoformat()
        }

    elif historical_data and len(historical_data) > 0:
        # Very limited historical data - primarily ML with reference to actuals
        ml_model = CarbonBaselineMLModel()
        ml_result = ml_model.predict(company_data)

        return {
            "baseline_emissions": ml_result['total_emissions'],
            "scope1_estimate": ml_result['scope1_estimate'],
            "scope2_estimate": ml_result['scope2_estimate'],
            "scope3_estimate": ml_result['scope3_estimate'],
            "confidence_interval": ml_result['confidence_interval'],
            "method": "ml_estimation",
            "data_quality": "estimated",
            "months_of_data": len(historical_data),
            "calculated_at": datetime.now().isoformat()
        }

    else:
        # No historical data - pure ML estimation or industry average
        if company_data.get('revenue') and company_data.get('industry'):
            ml_model = CarbonBaselineMLModel()
            ml_result = ml_model.predict(company_data)

            return {
                "baseline_emissions": ml_result['total_emissions'],
                "scope1_estimate": ml_result['scope1_estimate'],
                "scope2_estimate": ml_result['scope2_estimate'],
                "scope3_estimate": ml_result['scope3_estimate'],
                "confidence_interval": ml_result['confidence_interval'],
                "uncertainty_pct": ml_result['uncertainty_pct'],
                "method": "ml_estimation",
                "data_quality": "estimated",
                "months_of_data": 0,
                "warning": "No historical data available. Estimate based on industry benchmarks.",
                "calculated_at": datetime.now().isoformat()
            }
        else:
            # Fallback to simple industry average
            industry = company_data.get('industry', 'technology')
            revenue = company_data.get('revenue', 1_000_000)

            model = CarbonBaselineMLModel()
            intensity = model.INDUSTRY_BENCHMARKS.get(industry, 50)
            baseline = (revenue / 1_000_000) * intensity

            return {
                "baseline_emissions": round(baseline, 2),
                "method": "industry_average",
                "data_quality": "estimated",
                "months_of_data": 0,
                "warning": "Using industry average. Highly uncertain.",
                "calculated_at": datetime.now().isoformat()
            }


# Example usage
if __name__ == "__main__":
    # Train the model
    ml_model = CarbonBaselineMLModel()
    ml_model.train()
    ml_model.save_model()

    # Example prediction for a tech company
    company = {
        "revenue": 50_000_000,      # $50M revenue
        "employees": 300,            # 300 employees
        "energy_spend": 1_000_000,   # $1M energy spend
        "facility_sqft": 50_000,     # 50,000 sqft office
        "industry": "technology",
        "region": "west",
        "production_volume": 0
    }

    result = ml_model.predict(company)
    print("\nML Baseline Estimate:")
    print(f"Total Emissions: {result['total_emissions']:,.0f} tons CO2e")
    print(f"Scope 1: {result['scope1_estimate']:,.0f} tons CO2e")
    print(f"Scope 2: {result['scope2_estimate']:,.0f} tons CO2e")
    print(f"Scope 3: {result['scope3_estimate']:,.0f} tons CO2e")
    print(f"Confidence Interval: {result['confidence_interval'][0]:,.0f} - {result['confidence_interval'][1]:,.0f}")
    print(f"Uncertainty: ±{result['uncertainty_pct']}%")

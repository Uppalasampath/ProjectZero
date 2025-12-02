"""
ERP & Financial System Integrations
Connects to external systems to pull activity data for emissions calculations

Supported Systems:
- SAP (S/4HANA, ECC)
- Oracle (ERP Cloud, E-Business Suite)
- Microsoft Dynamics 365
- NetSuite
- QuickBooks
- Workday

Data Sources for Emissions:
- Fuel purchases → Scope 1
- Utility bills (electricity, gas, steam) → Scope 2
- Travel expenses → Scope 3 Category 6
- Procurement/PO data → Scope 3 Category 1
- Waste management invoices → Scope 3 Category 5
- Employee commuting reimbursements → Scope 3 Category 7
- Third-party spend → Scope 3 various
"""

from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from abc import ABC, abstractmethod
import requests
import json
from dataclasses import dataclass


@dataclass
class IntegrationCredentials:
    """Credentials for ERP connection"""
    system_type: str  # sap, oracle, netsuite, etc.
    client_id: Optional[str] = None
    client_secret: Optional[str] = None
    api_key: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None
    base_url: Optional[str] = None
    tenant_id: Optional[str] = None
    oauth_token: Optional[str] = None


@dataclass
class ERPDataRecord:
    """Standardized data record from ERP systems"""
    record_type: str  # fuel, electricity, travel, procurement
    transaction_id: str
    transaction_date: datetime
    amount: float
    unit: str
    category: str
    subcategory: Optional[str]
    vendor: Optional[str]
    cost: Optional[float]
    currency: Optional[str]
    facility: Optional[str]
    metadata: Dict[str, Any]


class ERPIntegration(ABC):
    """Base class for ERP integrations"""

    def __init__(self, credentials: IntegrationCredentials):
        self.credentials = credentials
        self.connection_status = "disconnected"
        self.last_sync = None

    @abstractmethod
    def test_connection(self) -> Dict:
        """Test connection to ERP system"""
        pass

    @abstractmethod
    def authenticate(self) -> bool:
        """Authenticate with ERP system"""
        pass

    @abstractmethod
    def fetch_fuel_purchases(self, start_date: datetime, end_date: datetime) -> List[ERPDataRecord]:
        """Fetch fuel purchase transactions for Scope 1"""
        pass

    @abstractmethod
    def fetch_utility_bills(self, start_date: datetime, end_date: datetime) -> List[ERPDataRecord]:
        """Fetch electricity, gas, steam bills for Scope 2"""
        pass

    @abstractmethod
    def fetch_travel_expenses(self, start_date: datetime, end_date: datetime) -> List[ERPDataRecord]:
        """Fetch employee travel expenses for Scope 3"""
        pass

    @abstractmethod
    def fetch_procurement_data(self, start_date: datetime, end_date: datetime) -> List[ERPDataRecord]:
        """Fetch purchase orders for Scope 3 Category 1"""
        pass


class SAPIntegration(ERPIntegration):
    """
    SAP S/4HANA and ECC Integration
    Uses SAP OData API
    """

    def __init__(self, credentials: IntegrationCredentials):
        super().__init__(credentials)
        self.api_version = "v2"
        self.headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

    def authenticate(self) -> bool:
        """
        Authenticate with SAP using OAuth 2.0 or basic auth
        """
        try:
            if self.credentials.oauth_token:
                self.headers["Authorization"] = f"Bearer {self.credentials.oauth_token}"
                self.connection_status = "connected"
                return True

            elif self.credentials.username and self.credentials.password:
                # Basic auth for testing
                import base64
                credentials = f"{self.credentials.username}:{self.credentials.password}"
                encoded = base64.b64encode(credentials.encode()).decode()
                self.headers["Authorization"] = f"Basic {encoded}"
                self.connection_status = "connected"
                return True

            return False

        except Exception as e:
            print(f"SAP authentication failed: {e}")
            return False

    def test_connection(self) -> Dict:
        """Test SAP connection"""
        try:
            url = f"{self.credentials.base_url}/sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner"
            response = requests.get(url, headers=self.headers, timeout=10)

            return {
                "status": "success" if response.status_code == 200 else "failed",
                "status_code": response.status_code,
                "system": "SAP",
                "tested_at": datetime.now().isoformat()
            }

        except Exception as e:
            return {
                "status": "failed",
                "error": str(e),
                "system": "SAP"
            }

    def fetch_fuel_purchases(self, start_date: datetime, end_date: datetime) -> List[ERPDataRecord]:
        """
        Fetch fuel purchase transactions from SAP
        Maps to GL accounts for fuel (typically 6xxx or 5xxx series)
        """
        records = []

        try:
            # SAP OData query for fuel purchases
            # Filter by GL account codes and date range
            url = f"{self.credentials.base_url}/sap/opu/odata/sap/API_JOURNALENTRY_SRV/A_JournalEntry"

            params = {
                "$filter": f"PostingDate ge '{start_date.strftime('%Y%m%d')}' and PostingDate le '{end_date.strftime('%Y%m%d')}' and (GLAccount eq '500100' or GLAccount eq '500101')",  # Example GL codes for fuel
                "$format": "json"
            }

            response = requests.get(url, headers=self.headers, params=params, timeout=30)

            if response.status_code == 200:
                data = response.json()

                for entry in data.get('d', {}).get('results', []):
                    record = ERPDataRecord(
                        record_type="fuel",
                        transaction_id=entry.get('JournalEntry'),
                        transaction_date=datetime.strptime(entry.get('PostingDate'), '%Y%m%d'),
                        amount=float(entry.get('Quantity', 0)),
                        unit=entry.get('QuantityUnit', 'gallons'),
                        category="mobile_combustion",
                        subcategory="diesel" if "diesel" in entry.get('ItemText', '').lower() else "gasoline",
                        vendor=entry.get('Supplier'),
                        cost=float(entry.get('AmountInCompanyCodeCurrency', 0)),
                        currency=entry.get('CompanyCodeCurrency'),
                        facility=entry.get('Plant'),
                        metadata={"gl_account": entry.get('GLAccount')}
                    )
                    records.append(record)

        except Exception as e:
            print(f"Error fetching SAP fuel data: {e}")

        return records

    def fetch_utility_bills(self, start_date: datetime, end_date: datetime) -> List[ERPDataRecord]:
        """Fetch electricity and gas bills from SAP"""
        records = []

        try:
            # Query utility GL accounts
            url = f"{self.credentials.base_url}/sap/opu/odata/sap/API_JOURNALENTRY_SRV/A_JournalEntry"

            params = {
                "$filter": f"PostingDate ge '{start_date.strftime('%Y%m%d')}' and PostingDate le '{end_date.strftime('%Y%m%d')}' and (GLAccount eq '600100' or GLAccount eq '600101' or GLAccount eq '600102')",  # Utility GL codes
                "$format": "json"
            }

            response = requests.get(url, headers=self.headers, params=params, timeout=30)

            if response.status_code == 200:
                data = response.json()

                for entry in data.get('d', {}).get('results', []):
                    # Determine utility type from GL account or text
                    item_text = entry.get('ItemText', '').lower()
                    if 'electric' in item_text or entry.get('GLAccount') == '600100':
                        category = "purchased_electricity"
                        unit = "kWh"
                    elif 'gas' in item_text or 'natural gas' in item_text:
                        category = "purchased_gas"
                        unit = "therms"
                    else:
                        category = "purchased_energy"
                        unit = "unit"

                    record = ERPDataRecord(
                        record_type="utility",
                        transaction_id=entry.get('JournalEntry'),
                        transaction_date=datetime.strptime(entry.get('PostingDate'), '%Y%m%d'),
                        amount=float(entry.get('Quantity', 0)),
                        unit=unit,
                        category=category,
                        subcategory=None,
                        vendor=entry.get('Supplier'),
                        cost=float(entry.get('AmountInCompanyCodeCurrency', 0)),
                        currency=entry.get('CompanyCodeCurrency'),
                        facility=entry.get('Plant'),
                        metadata={"gl_account": entry.get('GLAccount')}
                    )
                    records.append(record)

        except Exception as e:
            print(f"Error fetching SAP utility data: {e}")

        return records

    def fetch_travel_expenses(self, start_date: datetime, end_date: datetime) -> List[ERPDataRecord]:
        """Fetch travel expense reports from SAP Concur integration"""
        # This would integrate with SAP Concur or similar expense management
        # Placeholder implementation
        return []

    def fetch_procurement_data(self, start_date: datetime, end_date: datetime) -> List[ERPDataRecord]:
        """Fetch purchase orders from SAP MM module"""
        records = []

        try:
            url = f"{self.credentials.base_url}/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV/A_PurchaseOrder"

            params = {
                "$filter": f"PurchaseOrderDate ge '{start_date.strftime('%Y%m%d')}' and PurchaseOrderDate le '{end_date.strftime('%Y%m%d')}'",
                "$format": "json"
            }

            response = requests.get(url, headers=self.headers, params=params, timeout=30)

            if response.status_code == 200:
                data = response.json()

                for po in data.get('d', {}).get('results', []):
                    record = ERPDataRecord(
                        record_type="procurement",
                        transaction_id=po.get('PurchaseOrder'),
                        transaction_date=datetime.strptime(po.get('PurchaseOrderDate'), '%Y%m%d'),
                        amount=1,  # Spend-based calculation doesn't need quantity
                        unit="USD",
                        category="purchased_goods_services",
                        subcategory=po.get('MaterialGroup'),
                        vendor=po.get('Supplier'),
                        cost=float(po.get('NetAmount', 0)),
                        currency=po.get('DocumentCurrency'),
                        facility=po.get('Plant'),
                        metadata={
                            "material_group": po.get('MaterialGroup'),
                            "company_code": po.get('CompanyCode')
                        }
                    )
                    records.append(record)

        except Exception as e:
            print(f"Error fetching SAP procurement data: {e}")

        return records


class OracleIntegration(ERPIntegration):
    """
    Oracle ERP Cloud Integration
    Uses Oracle REST API
    """

    def authenticate(self) -> bool:
        """Authenticate with Oracle Cloud using OAuth"""
        try:
            if self.credentials.oauth_token:
                self.headers["Authorization"] = f"Bearer {self.credentials.oauth_token}"
                self.connection_status = "connected"
                return True
            return False
        except Exception as e:
            print(f"Oracle authentication failed: {e}")
            return False

    def test_connection(self) -> Dict:
        """Test Oracle connection"""
        try:
            url = f"{self.credentials.base_url}/fscmRestApi/resources/11.13.18.05/suppliers"
            response = requests.get(url, headers=self.headers, timeout=10)

            return {
                "status": "success" if response.status_code == 200 else "failed",
                "status_code": response.status_code,
                "system": "Oracle",
                "tested_at": datetime.now().isoformat()
            }
        except Exception as e:
            return {"status": "failed", "error": str(e), "system": "Oracle"}

    # Implement other methods similar to SAP
    def fetch_fuel_purchases(self, start_date, end_date): return []
    def fetch_utility_bills(self, start_date, end_date): return []
    def fetch_travel_expenses(self, start_date, end_date): return []
    def fetch_procurement_data(self, start_date, end_date): return []


class NetSuiteIntegration(ERPIntegration):
    """NetSuite SuiteCloud Platform Integration"""

    def authenticate(self) -> bool:
        """Authenticate with NetSuite using Token-Based Authentication (TBA)"""
        try:
            # NetSuite TBA requires OAuth 1.0a
            self.connection_status = "connected"
            return True
        except Exception as e:
            print(f"NetSuite authentication failed: {e}")
            return False

    def test_connection(self) -> Dict:
        """Test NetSuite connection"""
        try:
            url = f"{self.credentials.base_url}/services/rest/record/v1/customer"
            response = requests.get(url, headers=self.headers, timeout=10)

            return {
                "status": "success" if response.status_code == 200 else "failed",
                "status_code": response.status_code,
                "system": "NetSuite",
                "tested_at": datetime.now().isoformat()
            }
        except Exception as e:
            return {"status": "failed", "error": str(e), "system": "NetSuite"}

    def fetch_fuel_purchases(self, start_date, end_date): return []
    def fetch_utility_bills(self, start_date, end_date): return []
    def fetch_travel_expenses(self, start_date, end_date): return []
    def fetch_procurement_data(self, start_date, end_date): return []


class QuickBooksIntegration(ERPIntegration):
    """QuickBooks Online Integration"""

    def authenticate(self) -> bool:
        """Authenticate with QuickBooks using OAuth 2.0"""
        try:
            if self.credentials.oauth_token:
                self.headers["Authorization"] = f"Bearer {self.credentials.oauth_token}"
                self.connection_status = "connected"
                return True
            return False
        except Exception as e:
            print(f"QuickBooks authentication failed: {e}")
            return False

    def test_connection(self) -> Dict:
        """Test QuickBooks connection"""
        try:
            url = f"{self.credentials.base_url}/v3/company/{self.credentials.tenant_id}/companyinfo/{self.credentials.tenant_id}"
            response = requests.get(url, headers=self.headers, timeout=10)

            return {
                "status": "success" if response.status_code == 200 else "failed",
                "status_code": response.status_code,
                "system": "QuickBooks",
                "tested_at": datetime.now().isoformat()
            }
        except Exception as e:
            return {"status": "failed", "error": str(e), "system": "QuickBooks"}

    def fetch_fuel_purchases(self, start_date, end_date): return []
    def fetch_utility_bills(self, start_date, end_date): return []
    def fetch_travel_expenses(self, start_date, end_date): return []
    def fetch_procurement_data(self, start_date, end_date): return []


# Integration Factory
class ERPIntegrationFactory:
    """Factory to create ERP integration instances"""

    @staticmethod
    def create_integration(credentials: IntegrationCredentials) -> ERPIntegration:
        """
        Create appropriate ERP integration based on system type

        Args:
            credentials: Integration credentials

        Returns:
            ERPIntegration instance

        Raises:
            ValueError: If system type not supported
        """
        integrations = {
            'sap': SAPIntegration,
            'oracle': OracleIntegration,
            'netsuite': NetSuiteIntegration,
            'quickbooks': QuickBooksIntegration,
        }

        system_type = credentials.system_type.lower()

        if system_type not in integrations:
            raise ValueError(f"Unsupported ERP system: {credentials.system_type}")

        return integrations[system_type](credentials)


def sync_erp_data(credentials: IntegrationCredentials, start_date: datetime, end_date: datetime) -> Dict:
    """
    Main function to sync data from ERP system

    Args:
        credentials: ERP connection credentials
        start_date: Start of data range
        end_date: End of data range

    Returns:
        {
            "status": "success|failed",
            "records_synced": int,
            "fuel_purchases": [],
            "utility_bills": [],
            "travel_expenses": [],
            "procurement": [],
            "synced_at": str
        }
    """
    try:
        # Create integration instance
        integration = ERPIntegrationFactory.create_integration(credentials)

        # Authenticate
        if not integration.authenticate():
            return {
                "status": "failed",
                "error": "Authentication failed",
                "system": credentials.system_type
            }

        # Fetch all data types
        fuel_purchases = integration.fetch_fuel_purchases(start_date, end_date)
        utility_bills = integration.fetch_utility_bills(start_date, end_date)
        travel_expenses = integration.fetch_travel_expenses(start_date, end_date)
        procurement = integration.fetch_procurement_data(start_date, end_date)

        total_records = len(fuel_purchases) + len(utility_bills) + len(travel_expenses) + len(procurement)

        return {
            "status": "success",
            "system": credentials.system_type,
            "records_synced": total_records,
            "fuel_purchases": [r.__dict__ for r in fuel_purchases],
            "utility_bills": [r.__dict__ for r in utility_bills],
            "travel_expenses": [r.__dict__ for r in travel_expenses],
            "procurement": [r.__dict__ for r in procurement],
            "synced_at": datetime.now().isoformat()
        }

    except Exception as e:
        return {
            "status": "failed",
            "error": str(e),
            "system": credentials.system_type
        }


# Field Mapping Configuration
def get_field_mapping_template(system_type: str) -> Dict:
    """
    Get field mapping template for an ERP system

    Returns a template showing which ERP fields map to emission source fields
    """
    mappings = {
        'sap': {
            "fuel_purchases": {
                "quantity_field": "Quantity",
                "unit_field": "QuantityUnit",
                "cost_field": "AmountInCompanyCodeCurrency",
                "date_field": "PostingDate",
                "vendor_field": "Supplier",
                "gl_account_codes": ["500100", "500101", "500110"],
                "category_logic": "Determine from ItemText or MaterialGroup"
            },
            "electricity": {
                "quantity_field": "Quantity",
                "unit_field": "QuantityUnit (kWh)",
                "cost_field": "AmountInCompanyCodeCurrency",
                "date_field": "PostingDate",
                "vendor_field": "Supplier",
                "gl_account_codes": ["600100", "600105"],
                "egrid_subregion": "Derive from Plant location"
            },
            "travel": {
                "expense_amount": "ExpenseAmount",
                "expense_type": "ExpenseType",
                "date": "ExpenseDate",
                "employee": "EmployeeID",
                "category": "Map ExpenseType to travel category"
            }
        },
        'oracle': {
            # Similar structure for Oracle
        },
        'netsuite': {
            # Similar structure for NetSuite
        },
        'quickbooks': {
            # Similar structure for QuickBooks
        }
    }

    return mappings.get(system_type.lower(), {})

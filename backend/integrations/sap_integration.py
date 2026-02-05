import requests
from typing import Dict, Any, List
import logging

logger = logging.getLogger(__name__)

class SAPIntegration:
    def __init__(self, config: Dict[str, Any]):
        self.endpoint_url = config.get("endpoint_url")
        self.username = config.get("username")
        self.password = config.get("password")
        self.api_key = config.get("api_key")
        self.session = requests.Session()
        
    def test_connection(self) -> bool:
        """Test connection to SAP system"""
        try:
            # Example SAP OData service check
            response = self.session.get(
                f"{self.endpoint_url}/sap/opu/odata/sap/API_SERVICE",
                auth=(self.username, self.password),
                headers={"x-api-key": self.api_key} if self.api_key else {},
                timeout=10
            )
            return response.status_code == 200
        except Exception as e:
            logger.error(f"SAP connection test failed: {str(e)}")
            return False
    
    def get_customers(self) -> List[Dict]:
        """Fetch customers from SAP"""
        try:
            response = self.session.get(
                f"{self.endpoint_url}/sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner",
                auth=(self.username, self.password),
                headers={"x-api-key": self.api_key} if self.api_key else {},
                params={"$format": "json"}
            )
            if response.status_code == 200:
                data = response.json()
                return data.get("d", {}).get("results", [])
            return []
        except Exception as e:
            logger.error(f"Failed to fetch SAP customers: {str(e)}")
            return []
    
    def sync_work_order_to_sap(self, work_order: Dict) -> bool:
        """Push work order to SAP as a service order"""
        try:
            sap_order = {
                "ServiceOrder": work_order["work_order_number"],
                "ServiceOrderDescription": work_order["description"],
                "SoldToParty": work_order["customer_id"],
                "RequestedServiceStartDateTime": work_order["scheduled_date"],
                "ServiceOrderType": "ZSV1"
            }
            
            response = self.session.post(
                f"{self.endpoint_url}/sap/opu/odata/sap/API_SERVICE_ORDER_SRV/A_ServiceOrder",
                auth=(self.username, self.password),
                headers={
                    "x-api-key": self.api_key if self.api_key else "",
                    "Content-Type": "application/json"
                },
                json=sap_order
            )
            return response.status_code in [200, 201]
        except Exception as e:
            logger.error(f"Failed to sync work order to SAP: {str(e)}")
            return False
    
    def get_inventory_levels(self) -> List[Dict]:
        """Fetch inventory from SAP MM module"""
        try:
            response = self.session.get(
                f"{self.endpoint_url}/sap/opu/odata/sap/API_MATERIAL_STOCK_SRV/A_MaterialStock",
                auth=(self.username, self.password),
                headers={"x-api-key": self.api_key} if self.api_key else {},
                params={"$format": "json"}
            )
            if response.status_code == 200:
                data = response.json()
                return data.get("d", {}).get("results", [])
            return []
        except Exception as e:
            logger.error(f"Failed to fetch SAP inventory: {str(e)}")
            return []

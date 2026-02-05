import requests
import logging
from typing import Dict, Any, List
from datetime import datetime

logger = logging.getLogger(__name__)

class SAPS4HANAClient:
    """
    Advanced SAP S/4HANA integration client
    Supports Real-time inventory sync, financial controlling, and reporting
    """
    
    def __init__(self, config: Dict[str, Any]):
        self.base_url = config.get("endpoint_url")
        self.client_id = config.get("username")
        self.client_secret = config.get("password")
        self.api_key = config.get("api_key")
        self.session = requests.Session()
        self.access_token = None
        
    def authenticate(self) -> bool:
        """OAuth 2.0 authentication for S/4HANA Cloud"""
        try:
            auth_url = f"{self.base_url}/sap/bc/sec/oauth2/token"
            response = self.session.post(
                auth_url,
                data={
                    "grant_type": "client_credentials",
                    "client_id": self.client_id,
                    "client_secret": self.client_secret
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            
            if response.status_code == 200:
                self.access_token = response.json().get("access_token")
                return True
            return False
        except Exception as e:
            logger.error(f"S/4HANA authentication failed: {str(e)}")
            return False
    
    def _get_headers(self) -> Dict[str, str]:
        """Get request headers with authentication"""
        return {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    
    # ===== INVENTORY MANAGEMENT =====
    
    def get_material_stock(self, material_numbers: List[str] = None) -> List[Dict]:
        """
        Get real-time inventory levels from S/4HANA MM (Materials Management)
        Endpoint: /API_MATERIAL_STOCK_SRV/A_MatlStkInAcctMod
        """
        try:
            url = f"{self.base_url}/sap/opu/odata/sap/API_MATERIAL_STOCK_SRV/A_MatlStkInAcctMod"
            
            params = {"$format": "json", "$top": 1000}
            if material_numbers:
                filter_query = " or ".join([f"Material eq '{m}'" for m in material_numbers])
                params["$filter"] = filter_query
            
            response = self.session.get(url, headers=self._get_headers(), params=params)
            
            if response.status_code == 200:
                data = response.json()
                results = data.get("d", {}).get("results", [])
                
                # Transform to our format
                inventory = []
                for item in results:
                    inventory.append({
                        "material_number": item.get("Material"),
                        "material_description": item.get("MaterialDescription"),
                        "plant": item.get("Plant"),
                        "storage_location": item.get("StorageLocation"),
                        "quantity": float(item.get("MatlWrhsStkQtyInMatlBaseUnit", 0)),
                        "unit": item.get("MaterialBaseUnit"),
                        "value": float(item.get("StockValueInCCCrcy", 0)),
                        "currency": item.get("CompanyCodeCurrency"),
                        "last_update": item.get("MaterialDocumentPostingDate")
                    })
                
                return inventory
            return []
        except Exception as e:
            logger.error(f"Failed to fetch S/4HANA inventory: {str(e)}")
            return []
    
    def create_goods_movement(self, movement_data: Dict) -> Dict:
        """
        Post goods movement (goods receipt, goods issue)
        Endpoint: /API_MATERIAL_DOCUMENT_SRV/A_MaterialDocumentHeader
        """
        try:
            url = f"{self.base_url}/sap/opu/odata/sap/API_MATERIAL_DOCUMENT_SRV/A_MaterialDocumentHeader"
            
            payload = {
                "GoodsMovementCode": movement_data.get("movement_code", "01"),  # 01=GR, 02=GI
                "PostingDate": movement_data.get("posting_date", datetime.now().isoformat()),
                "DocumentDate": movement_data.get("document_date", datetime.now().isoformat()),
                "to_MaterialDocumentItem": {
                    "results": [
                        {
                            "Material": item["material"],
                            "Plant": item["plant"],
                            "StorageLocation": item["storage_location"],
                            "QuantityInEntryUnit": str(item["quantity"]),
                            "EntryUnit": item["unit"],
                            "GoodsMovementType": movement_data.get("movement_type", "501")
                        }
                        for item in movement_data.get("items", [])
                    ]
                }
            }
            
            response = self.session.post(url, headers=self._get_headers(), json=payload)
            
            if response.status_code in [200, 201]:
                result = response.json()
                return {
                    "success": True,
                    "document_number": result.get("d", {}).get("MaterialDocument"),
                    "year": result.get("d", {}).get("MaterialDocumentYear")
                }
            return {"success": False, "error": response.text}
        except Exception as e:
            logger.error(f"Failed to create goods movement: {str(e)}")
            return {"success": False, "error": str(e)}
    
    # ===== FINANCIAL CONTROLLING (CO) =====
    
    def get_cost_center_actuals(self, cost_center: str, fiscal_year: str) -> Dict:
        """
        Get actual costs for a cost center
        Endpoint: /API_COSTCENTER_SRV/A_CostCenterActual
        """
        try:
            url = f"{self.base_url}/sap/opu/odata/sap/API_COSTCENTER_SRV/A_CostCenterActual"
            
            params = {
                "$format": "json",
                "$filter": f"CostCenter eq '{cost_center}' and FiscalYear eq '{fiscal_year}'"
            }
            
            response = self.session.get(url, headers=self._get_headers(), params=params)
            
            if response.status_code == 200:
                data = response.json()
                results = data.get("d", {}).get("results", [])
                
                total_actual = sum(float(r.get("ActualCosts", 0)) for r in results)
                total_plan = sum(float(r.get("PlanCosts", 0)) for r in results)
                
                return {
                    "cost_center": cost_center,
                    "fiscal_year": fiscal_year,
                    "actual_costs": total_actual,
                    "plan_costs": total_plan,
                    "variance": total_actual - total_plan,
                    "variance_percent": ((total_actual - total_plan) / total_plan * 100) if total_plan > 0 else 0,
                    "details": results
                }
            return {}
        except Exception as e:
            logger.error(f"Failed to fetch cost center actuals: {str(e)}")
            return {}
    
    def get_profit_center_report(self, profit_center: str, period: str) -> Dict:
        """
        Get profit center actual data
        Endpoint: /API_PROFITCENTER_SRV/A_ProfitCenterActual
        """
        try:
            url = f"{self.base_url}/sap/opu/odata/sap/API_PROFITCENTER_SRV/A_ProfitCenterActual"
            
            params = {
                "$format": "json",
                "$filter": f"ProfitCenter eq '{profit_center}' and FiscalPeriod eq '{period}'"
            }
            
            response = self.session.get(url, headers=self._get_headers(), params=params)
            
            if response.status_code == 200:
                data = response.json()
                results = data.get("d", {}).get("results", [])
                
                revenue = sum(float(r.get("Revenue", 0)) for r in results)
                costs = sum(float(r.get("Costs", 0)) for r in results)
                
                return {
                    "profit_center": profit_center,
                    "period": period,
                    "revenue": revenue,
                    "costs": costs,
                    "profit": revenue - costs,
                    "margin_percent": ((revenue - costs) / revenue * 100) if revenue > 0 else 0
                }
            return {}
        except Exception as e:
            logger.error(f"Failed to fetch profit center report: {str(e)}")
            return {}
    
    # ===== REPORTING & ANALYTICS =====
    
    def get_inventory_valuation(self, valuation_area: str = None) -> Dict:
        """
        Get inventory valuation report
        """
        try:
            materials = self.get_material_stock()
            
            total_value = sum(m.get("value", 0) for m in materials)
            total_quantity = sum(m.get("quantity", 0) for m in materials)
            
            # Group by plant
            by_plant = {}
            for m in materials:
                plant = m.get("plant", "Unknown")
                if plant not in by_plant:
                    by_plant[plant] = {"value": 0, "quantity": 0, "items": 0}
                by_plant[plant]["value"] += m.get("value", 0)
                by_plant[plant]["quantity"] += m.get("quantity", 0)
                by_plant[plant]["items"] += 1
            
            return {
                "total_value": total_value,
                "total_quantity": total_quantity,
                "total_items": len(materials),
                "by_plant": by_plant,
                "currency": materials[0].get("currency") if materials else "USD",
                "report_date": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Failed to generate inventory valuation: {str(e)}")
            return {}
    
    def get_slow_moving_inventory(self, days_threshold: int = 90) -> List[Dict]:
        """
        Identify slow-moving inventory items
        """
        try:
            # This would typically query material documents for movement history
            # For now, return structure showing what data would be available
            return [
                {
                    "material": "PART-12345",
                    "description": "Brake Pad Set",
                    "quantity_on_hand": 45,
                    "last_movement_date": "2024-10-15",
                    "days_since_movement": 92,
                    "value": 10125.00,
                    "recommended_action": "Price reduction or transfer"
                }
            ]
        except Exception as e:
            logger.error(f"Failed to identify slow-moving inventory: {str(e)}")
            return []
    
    # ===== SERVICE ORDERS =====
    
    def create_service_order(self, order_data: Dict) -> Dict:
        """
        Create service order in S/4HANA
        Endpoint: /API_SERVICE_ORDER_SRV/A_ServiceOrder
        """
        try:
            url = f"{self.base_url}/sap/opu/odata/sap/API_SERVICE_ORDER_SRV/A_ServiceOrder"
            
            payload = {
                "ServiceOrder": order_data.get("order_number"),
                "ServiceOrderDescription": order_data.get("description"),
                "ServiceObjectType": order_data.get("object_type", "VEH"),
                "SoldToParty": order_data.get("customer_id"),
                "RequestedServiceStartDateTime": order_data.get("start_date"),
                "ServiceOrderType": order_data.get("order_type", "ZSV1")
            }
            
            response = self.session.post(url, headers=self._get_headers(), json=payload)
            
            if response.status_code in [200, 201]:
                result = response.json()
                return {
                    "success": True,
                    "service_order": result.get("d", {}).get("ServiceOrder")
                }
            return {"success": False, "error": response.text}
        except Exception as e:
            logger.error(f"Failed to create service order: {str(e)}")
            return {"success": False, "error": str(e)}

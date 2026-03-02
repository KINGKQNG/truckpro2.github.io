import requests
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

class DieselLaptopsAPI:
    """
    Integration with Diesel Laptops API
    - Access to truck diagnostic data
    - Parts lookup and cross-reference
    - Technical service bulletins (TSBs)
    - Wiring diagrams and repair procedures
    """
    
    def __init__(self, config: Dict[str, Any]):
        self.api_url = config.get("endpoint_url", "https://api.diesellaptops.com/v1")
        self.api_key = config.get("api_key")
        self.account_id = config.get("username")
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        })
    
    def test_connection(self) -> bool:
        """Test API connection"""
        try:
            response = self.session.get(f"{self.api_url}/status")
            return response.status_code == 200
        except Exception as e:
            logger.error(f"Diesel Laptops connection failed: {str(e)}")
            return False
    
    # ===== DIAGNOSTIC TOOLS =====
    
    def lookup_dtc(self, dtc_code: str, make: str = None, model: str = None) -> Dict:
        """
        Look up Diagnostic Trouble Code information
        """
        try:
            params = {"code": dtc_code}
            if make:
                params["make"] = make
            if model:
                params["model"] = model
            
            response = self.session.get(
                f"{self.api_url}/diagnostics/dtc",
                params=params
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "code": dtc_code,
                    "description": data.get("description"),
                    "severity": data.get("severity"),
                    "possible_causes": data.get("causes", []),
                    "repair_procedures": data.get("procedures", []),
                    "related_codes": data.get("related_codes", []),
                    "common_parts": data.get("common_parts", [])
                }
            return {}
        except Exception as e:
            logger.error(f"Failed to lookup DTC: {str(e)}")
            return {}
    
    def get_wiring_diagram(self, vin: str, system: str) -> Dict:
        """
        Get wiring diagrams for specific vehicle system
        """
        try:
            response = self.session.get(
                f"{self.api_url}/wiring/{vin}",
                params={"system": system}
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "vin": vin,
                    "system": system,
                    "diagram_url": data.get("diagram_url"),
                    "pin_layouts": data.get("pin_layouts", []),
                    "wire_colors": data.get("wire_colors", {}),
                    "connector_types": data.get("connectors", [])
                }
            return {}
        except Exception as e:
            logger.error(f"Failed to get wiring diagram: {str(e)}")
            return {}
    
    # ===== PARTS LOOKUP =====
    
    def search_parts(self, search_term: str, make: str = None) -> List[Dict]:
        """
        Search for parts by keyword or part number
        """
        try:
            params = {"q": search_term}
            if make:
                params["make"] = make
            
            response = self.session.get(
                f"{self.api_url}/parts/search",
                params=params
            )
            
            if response.status_code == 200:
                data = response.json()
                return [
                    {
                        "part_number": part.get("part_number"),
                        "description": part.get("description"),
                        "oem_numbers": part.get("oem_numbers", []),
                        "interchange": part.get("interchange", []),
                        "price": part.get("price"),
                        "availability": part.get("availability"),
                        "image_url": part.get("image_url"),
                        "specifications": part.get("specs", {})
                    }
                    for part in data.get("results", [])
                ]
            return []
        except Exception as e:
            logger.error(f"Failed to search parts: {str(e)}")
            return []
    
    def get_parts_by_vin(self, vin: str, category: str = None) -> List[Dict]:
        """
        Get VIN-specific parts recommendations
        """
        try:
            params = {}
            if category:
                params["category"] = category
            
            response = self.session.get(
                f"{self.api_url}/parts/vin/{vin}",
                params=params
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get("parts", [])
            return []
        except Exception as e:
            logger.error(f"Failed to get parts by VIN: {str(e)}")
            return []
    
    # ===== TECHNICAL SERVICE BULLETINS =====
    
    def get_tsbs(self, make: str, model: str, year: int) -> List[Dict]:
        """
        Get Technical Service Bulletins
        """
        try:
            response = self.session.get(
                f"{self.api_url}/tsb",
                params={"make": make, "model": model, "year": year}
            )
            
            if response.status_code == 200:
                data = response.json()
                return [
                    {
                        "bulletin_number": tsb.get("number"),
                        "title": tsb.get("title"),
                        "date": tsb.get("date"),
                        "description": tsb.get("description"),
                        "affected_components": tsb.get("components", []),
                        "document_url": tsb.get("url")
                    }
                    for tsb in data.get("bulletins", [])
                ]
            return []
        except Exception as e:
            logger.error(f"Failed to get TSBs: {str(e)}")
            return []
    
    # ===== REPAIR PROCEDURES =====
    
    def get_repair_procedure(self, procedure_id: str) -> Dict:
        """
        Get detailed repair procedure
        """
        try:
            response = self.session.get(
                f"{self.api_url}/procedures/{procedure_id}"
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "id": procedure_id,
                    "title": data.get("title"),
                    "description": data.get("description"),
                    "steps": data.get("steps", []),
                    "tools_required": data.get("tools", []),
                    "estimated_time": data.get("time"),
                    "difficulty": data.get("difficulty"),
                    "images": data.get("images", []),
                    "videos": data.get("videos", [])
                }
            return {}
        except Exception as e:
            logger.error(f"Failed to get repair procedure: {str(e)}")
            return {}
    
    # ===== MAINTENANCE SCHEDULES =====
    
    def get_maintenance_schedule(self, vin: str, mileage: int) -> Dict:
        """
        Get recommended maintenance based on VIN and mileage
        """
        try:
            response = self.session.get(
                f"{self.api_url}/maintenance/{vin}",
                params={"mileage": mileage}
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "vin": vin,
                    "current_mileage": mileage,
                    "recommended_services": [
                        {
                            "service": svc.get("name"),
                            "description": svc.get("description"),
                            "due_at": svc.get("due_mileage"),
                            "overdue": svc.get("is_overdue", False),
                            "parts_needed": svc.get("parts", []),
                            "estimated_cost": svc.get("cost")
                        }
                        for svc in data.get("services", [])
                    ]
                }
            return {}
        except Exception as e:
            logger.error(f"Failed to get maintenance schedule: {str(e)}")
            return {}

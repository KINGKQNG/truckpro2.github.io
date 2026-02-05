import requests
from typing import Dict, Any, List
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class LogileIntegration:
    def __init__(self, config: Dict[str, Any]):
        self.endpoint_url = config.get("endpoint_url")
        self.api_key = config.get("api_key")
        self.username = config.get("username")
        self.password = config.get("password")
        self.session = requests.Session()
        
    def test_connection(self) -> bool:
        """Test connection to Logile time system"""
        try:
            response = self.session.get(
                f"{self.endpoint_url}/api/v1/health",
                headers={"Authorization": f"Bearer {self.api_key}"},
                timeout=10
            )
            return response.status_code == 200
        except Exception as e:
            logger.error(f"Logile connection test failed: {str(e)}")
            return False
    
    def get_technician_hours(self, tech_id: str, start_date: str, end_date: str) -> Dict:
        """Fetch technician hours from Logile"""
        try:
            response = self.session.get(
                f"{self.endpoint_url}/api/v1/timesheet/employee/{tech_id}",
                headers={"Authorization": f"Bearer {self.api_key}"},
                params={
                    "start_date": start_date,
                    "end_date": end_date
                }
            )
            if response.status_code == 200:
                return response.json()
            return {}
        except Exception as e:
            logger.error(f"Failed to fetch Logile hours: {str(e)}")
            return {}
    
    def submit_time_entry(self, entry: Dict) -> bool:
        """Submit time entry to Logile"""
        try:
            logile_entry = {
                "employee_id": entry["tech_id"],
                "work_order": entry["work_order_number"],
                "date": entry["date"],
                "hours": entry["hours"],
                "activity_code": entry.get("activity_code", "SERVICE"),
                "notes": entry.get("notes", "")
            }
            
            response = self.session.post(
                f"{self.endpoint_url}/api/v1/timesheet/entry",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json=logile_entry
            )
            return response.status_code in [200, 201]
        except Exception as e:
            logger.error(f"Failed to submit time entry: {str(e)}")
            return False
    
    def get_all_technician_hours(self, date: str = None) -> List[Dict]:
        """Get all technician hours for a specific date"""
        try:
            if not date:
                date = datetime.now().strftime("%Y-%m-%d")
                
            response = self.session.get(
                f"{self.endpoint_url}/api/v1/timesheet/daily",
                headers={"Authorization": f"Bearer {self.api_key}"},
                params={"date": date}
            )
            if response.status_code == 200:
                return response.json().get("timesheets", [])
            return []
        except Exception as e:
            logger.error(f"Failed to fetch daily hours: {str(e)}")
            return []

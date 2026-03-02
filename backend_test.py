#!/usr/bin/env python3
"""
TruckService Pro Backend API Regression Test Suite

Tests all major API endpoints with admin credentials:
- Authentication
- Dashboard summary
- Work Orders CRUD, status/approval, delete
- Customers + customer detail
- Technicians + skill update
- Appointments create/list
- Inspections upload/save
- Inventory + purchase orders + auto-replenish
- Payments process
- Leads interactions
- Reports daily/advanced
- Integrations create/test/sync
- Admin code editor get/save
- OBD scan/create-repair-order
- Diesel Laptops endpoints
"""

import json
import requests
import sys
from typing import Any, Dict, List, Optional


class TruckServiceAPITest:
    def __init__(self, base_url: str, email: str, password: str):
        self.base_url = base_url.rstrip('/')
        self.api_url = f"{self.base_url}/api"
        self.email = email
        self.password = password
        self.access_token: Optional[str] = None
        self.headers: Dict[str, str] = {"Content-Type": "application/json"}
        self.test_results: List[Dict[str, Any]] = []
        self.failed_endpoints: List[Dict[str, Any]] = []
    
    def log_test(self, endpoint: str, method: str, success: bool, details: str, response_code: int = None, curl_command: str = None):
        """Log test result"""
        result = {
            "endpoint": endpoint,
            "method": method,
            "success": success,
            "details": details,
            "response_code": response_code,
            "curl_command": curl_command
        }
        self.test_results.append(result)
        
        if not success:
            self.failed_endpoints.append(result)
            print(f"❌ FAIL {method} {endpoint} - {details}")
        else:
            print(f"✅ PASS {method} {endpoint}")
    
    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, params: Optional[Dict] = None) -> Dict[str, Any]:
        """Make HTTP request with error handling"""
        url = f"{self.api_url}{endpoint}"
        
        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=self.headers, params=params, timeout=30)
            elif method.upper() == "POST":
                response = requests.post(url, headers=self.headers, json=data, timeout=30)
            elif method.upper() == "PUT":
                response = requests.put(url, headers=self.headers, json=data, timeout=30)
            elif method.upper() == "DELETE":
                response = requests.delete(url, headers=self.headers, timeout=30)
            else:
                return {"success": False, "error": f"Unsupported method: {method}"}
            
            # Generate curl command for failed requests
            curl_command = self.generate_curl_command(method, url, data, self.headers)
            
            if response.status_code in [200, 201]:
                return {
                    "success": True, 
                    "data": response.json() if response.content else {}, 
                    "status_code": response.status_code,
                    "curl_command": curl_command
                }
            else:
                return {
                    "success": False, 
                    "error": f"HTTP {response.status_code}: {response.text}", 
                    "status_code": response.status_code,
                    "curl_command": curl_command
                }
                
        except requests.exceptions.RequestException as e:
            curl_command = self.generate_curl_command(method, url, data, self.headers)
            return {
                "success": False, 
                "error": f"Request failed: {str(e)}", 
                "curl_command": curl_command
            }
    
    def generate_curl_command(self, method: str, url: str, data: Optional[Dict] = None, headers: Dict[str, str] = None) -> str:
        """Generate curl command for debugging"""
        cmd = f"curl -X {method.upper()} '{url}'"
        
        if headers:
            for key, value in headers.items():
                cmd += f" -H '{key}: {value}'"
        
        if data and method.upper() in ["POST", "PUT"]:
            cmd += f" -d '{json.dumps(data)}'"
        
        return cmd
    
    def test_authentication(self):
        """Test login functionality"""
        print("\n🔐 Testing Authentication...")
        
        # Test login with admin credentials
        login_data = {
            "email": self.email,
            "password": self.password
        }
        
        result = self.make_request("POST", "/auth/login", login_data)
        
        if result["success"]:
            data = result["data"]
            if "access_token" in data and "user" in data:
                self.access_token = data["access_token"]
                self.headers["Authorization"] = f"Bearer {self.access_token}"
                user_role = data["user"].get("role", "unknown")
                self.log_test("/auth/login", "POST", True, f"Login successful, role: {user_role}", result["status_code"])
            else:
                self.log_test("/auth/login", "POST", False, "Login response missing token or user", result["status_code"], result["curl_command"])
        else:
            self.log_test("/auth/login", "POST", False, result["error"], result.get("status_code"), result["curl_command"])
    
    def test_dashboard(self):
        """Test dashboard summary endpoint"""
        print("\n📊 Testing Dashboard...")
        
        result = self.make_request("GET", "/dashboard/summary")
        
        if result["success"]:
            data = result["data"]
            if "kpis" in data and "pendingApprovalOrders" in data:
                kpis = data["kpis"]
                revenue = kpis.get("totalRevenue", 0)
                completed_orders = kpis.get("workOrdersCompleted", 0)
                self.log_test("/dashboard/summary", "GET", True, f"Dashboard loaded - Revenue: ${revenue}, Completed: {completed_orders}", result["status_code"])
            else:
                self.log_test("/dashboard/summary", "GET", False, "Dashboard response missing required fields", result["status_code"], result["curl_command"])
        else:
            self.log_test("/dashboard/summary", "GET", False, result["error"], result.get("status_code"), result["curl_command"])
    
    def test_work_orders(self):
        """Test work orders CRUD operations"""
        print("\n🔧 Testing Work Orders...")
        
        # Test GET work orders
        result = self.make_request("GET", "/work-orders")
        work_orders = []
        
        if result["success"]:
            work_orders = result["data"]
            self.log_test("/work-orders", "GET", True, f"Retrieved {len(work_orders)} work orders", result["status_code"])
        else:
            self.log_test("/work-orders", "GET", False, result["error"], result.get("status_code"), result["curl_command"])
            return
        
        # Test work order filters
        result = self.make_request("GET", "/work-orders", params={"status": "pending_approval"})
        if result["success"]:
            pending = result["data"]
            self.log_test("/work-orders?status=pending_approval", "GET", True, f"Found {len(pending)} pending approval orders", result["status_code"])
        else:
            self.log_test("/work-orders?status=pending_approval", "GET", False, result["error"], result.get("status_code"), result["curl_command"])
        
        # Test work order creation
        create_data = {
            "customerId": "c1",
            "truckId": "t1",
            "description": "Test API work order",
            "priority": "medium",
            "scheduledDate": "2025-01-20",
            "assignedTech": "John Technician",
            "parts": [{"name": "Test Part", "partNumber": "TEST-001", "quantity": 1, "cost": 100}],
            "labor": [{"description": "Test Labor", "hours": 2, "rate": 125, "cost": 250}]
        }
        
        result = self.make_request("POST", "/work-orders", create_data)
        new_work_order_id = None
        
        if result["success"]:
            data = result["data"]
            new_work_order_id = data.get("id")
            work_order_number = data.get("workOrderNumber")
            self.log_test("/work-orders", "POST", True, f"Created work order {work_order_number}", result["status_code"])
        else:
            self.log_test("/work-orders", "POST", False, result["error"], result.get("status_code"), result["curl_command"])
        
        # Test status update
        if work_orders:
            test_wo_id = work_orders[0].get("id")
            if test_wo_id:
                status_data = {"status": "in_progress"}
                result = self.make_request("PUT", f"/work-orders/{test_wo_id}/status", status_data)
                
                if result["success"]:
                    self.log_test(f"/work-orders/{test_wo_id}/status", "PUT", True, "Status updated to in_progress", result["status_code"])
                else:
                    self.log_test(f"/work-orders/{test_wo_id}/status", "PUT", False, result["error"], result.get("status_code"), result["curl_command"])
        
        # Test approval
        if work_orders:
            approval_wo = next((wo for wo in work_orders if wo.get("approvalStatus") == "pending"), None)
            if approval_wo:
                wo_id = approval_wo.get("id")
                result = self.make_request("PUT", f"/work-orders/{wo_id}/approve")
                
                if result["success"]:
                    self.log_test(f"/work-orders/{wo_id}/approve", "PUT", True, "Work order approved", result["status_code"])
                else:
                    self.log_test(f"/work-orders/{wo_id}/approve", "PUT", False, result["error"], result.get("status_code"), result["curl_command"])
        
        # Test deletion (only delete our test work order)
        if new_work_order_id:
            result = self.make_request("DELETE", f"/work-orders/{new_work_order_id}")
            
            if result["success"]:
                self.log_test(f"/work-orders/{new_work_order_id}", "DELETE", True, "Work order deleted", result["status_code"])
            else:
                self.log_test(f"/work-orders/{new_work_order_id}", "DELETE", False, result["error"], result.get("status_code"), result["curl_command"])
    
    def test_customers(self):
        """Test customer endpoints"""
        print("\n👥 Testing Customers...")
        
        # Test GET customers
        result = self.make_request("GET", "/customers")
        customers = []
        
        if result["success"]:
            customers = result["data"]
            self.log_test("/customers", "GET", True, f"Retrieved {len(customers)} customers", result["status_code"])
        else:
            self.log_test("/customers", "GET", False, result["error"], result.get("status_code"), result["curl_command"])
            return
        
        # Test customer detail
        if customers:
            customer_id = customers[0].get("id")
            if customer_id:
                result = self.make_request("GET", f"/customers/{customer_id}")
                
                if result["success"]:
                    data = result["data"]
                    customer_name = data.get("customer", {}).get("name", "Unknown")
                    trucks_count = len(data.get("trucks", []))
                    orders_count = len(data.get("workOrders", []))
                    self.log_test(f"/customers/{customer_id}", "GET", True, f"Customer {customer_name}: {trucks_count} trucks, {orders_count} orders", result["status_code"])
                else:
                    self.log_test(f"/customers/{customer_id}", "GET", False, result["error"], result.get("status_code"), result["curl_command"])
    
    def test_technicians(self):
        """Test technician endpoints"""
        print("\n🔧 Testing Technicians...")
        
        # Test GET technicians
        result = self.make_request("GET", "/technicians")
        technicians = []
        
        if result["success"]:
            technicians = result["data"]
            self.log_test("/technicians", "GET", True, f"Retrieved {len(technicians)} technicians", result["status_code"])
        else:
            self.log_test("/technicians", "GET", False, result["error"], result.get("status_code"), result["curl_command"])
            return
        
        # Test skill update
        if technicians:
            tech_id = technicians[0].get("id")
            if tech_id:
                skill_data = {
                    "skillLevels": {
                        "Engine Repair": "expert",
                        "Diagnostics": "advanced",
                        "Brake Service": "intermediate"
                    }
                }
                result = self.make_request("PUT", f"/technicians/{tech_id}/skills", skill_data)
                
                if result["success"]:
                    tech_name = technicians[0].get("name", "Unknown")
                    self.log_test(f"/technicians/{tech_id}/skills", "PUT", True, f"Updated skills for {tech_name}", result["status_code"])
                else:
                    self.log_test(f"/technicians/{tech_id}/skills", "PUT", False, result["error"], result.get("status_code"), result["curl_command"])
    
    def test_appointments(self):
        """Test appointment endpoints"""
        print("\n📅 Testing Appointments...")
        
        # Test GET appointments
        result = self.make_request("GET", "/appointments")
        
        if result["success"]:
            appointments = result["data"]
            self.log_test("/appointments", "GET", True, f"Retrieved {len(appointments)} appointments", result["status_code"])
        else:
            self.log_test("/appointments", "GET", False, result["error"], result.get("status_code"), result["curl_command"])
        
        # Test create appointment
        appointment_data = {
            "email": "test@customer.com",
            "phone": "555-0199",
            "mileage": "150000",
            "services": ["oil_change", "tire_rotation"],
            "time": "10:00 AM",
            "advisor": "tech1",
            "transportation": "drop_off",
            "concerns": "Engine making noise",
            "date": "2025-01-25"
        }
        
        result = self.make_request("POST", "/appointments", appointment_data)
        
        if result["success"]:
            data = result["data"]
            service = data.get("service", "Unknown")
            cost = data.get("estimatedCost", 0)
            self.log_test("/appointments", "POST", True, f"Created appointment: {service} (${cost})", result["status_code"])
        else:
            self.log_test("/appointments", "POST", False, result["error"], result.get("status_code"), result["curl_command"])
    
    def test_inspections(self):
        """Test inspection endpoints"""
        print("\n🔍 Testing Inspections...")
        
        # Test inspection save
        inspection_data = {
            "vehicle": {
                "vin": "TEST123456789",
                "year": 2020,
                "make": "Peterbilt",
                "model": "579"
            },
            "areas": [
                {
                    "id": "front_end",
                    "name": "Front End", 
                    "status": "good",
                    "notes": "No issues found"
                },
                {
                    "id": "engine",
                    "name": "Engine",
                    "status": "needs_attention", 
                    "notes": "Oil leak detected"
                }
            ]
        }
        
        result = self.make_request("POST", "/inspections", inspection_data)
        
        if result["success"]:
            data = result["data"]
            vehicle_info = f"{data['vehicle']['year']} {data['vehicle']['make']} {data['vehicle']['model']}"
            areas_count = len(data.get("areas", []))
            self.log_test("/inspections", "POST", True, f"Saved inspection for {vehicle_info} ({areas_count} areas)", result["status_code"])
        else:
            self.log_test("/inspections", "POST", False, result["error"], result.get("status_code"), result["curl_command"])
    
    def test_inventory(self):
        """Test inventory and purchase order endpoints"""
        print("\n📦 Testing Inventory...")
        
        # Test GET inventory
        result = self.make_request("GET", "/inventory")
        inventory = []
        
        if result["success"]:
            inventory = result["data"]
            self.log_test("/inventory", "GET", True, f"Retrieved {len(inventory)} inventory items", result["status_code"])
        else:
            self.log_test("/inventory", "GET", False, result["error"], result.get("status_code"), result["curl_command"])
        
        # Test GET purchase orders
        result = self.make_request("GET", "/purchase-orders")
        
        if result["success"]:
            purchase_orders = result["data"]
            self.log_test("/purchase-orders", "GET", True, f"Retrieved {len(purchase_orders)} purchase orders", result["status_code"])
        else:
            self.log_test("/purchase-orders", "GET", False, result["error"], result.get("status_code"), result["curl_command"])
        
        # Test auto-replenish
        if inventory:
            item = next((item for item in inventory if item.get("status") in ["low_stock", "critical"]), inventory[0])
            item_id = item.get("id")
            if item_id:
                result = self.make_request("POST", f"/inventory/{item_id}/replenish")
                
                if result["success"]:
                    data = result["data"]
                    if data.get("purchaseOrder"):
                        po_number = data["purchaseOrder"].get("orderNumber", "Unknown")
                        amount = data["purchaseOrder"].get("totalAmount", 0)
                        self.log_test(f"/inventory/{item_id}/replenish", "POST", True, f"Created PO {po_number} for ${amount}", result["status_code"])
                    else:
                        self.log_test(f"/inventory/{item_id}/replenish", "POST", True, "Item already at par level", result["status_code"])
                else:
                    self.log_test(f"/inventory/{item_id}/replenish", "POST", False, result["error"], result.get("status_code"), result["curl_command"])
    
    def test_payments(self):
        """Test payment endpoints"""
        print("\n💳 Testing Payments...")
        
        # Test GET payments
        result = self.make_request("GET", "/payments")
        payments = []
        
        if result["success"]:
            payments = result["data"]
            pending_count = len([p for p in payments if p.get("status") == "pending"])
            paid_count = len([p for p in payments if p.get("status") == "paid"])
            self.log_test("/payments", "GET", True, f"Retrieved {len(payments)} payments ({pending_count} pending, {paid_count} paid)", result["status_code"])
        else:
            self.log_test("/payments", "GET", False, result["error"], result.get("status_code"), result["curl_command"])
        
        # Test payment processing
        pending_payment = next((p for p in payments if p.get("status") == "pending"), None)
        if pending_payment:
            payment_id = pending_payment.get("id")
            if payment_id:
                process_data = {"method": "credit_card"}
                result = self.make_request("POST", f"/payments/{payment_id}/process", process_data)
                
                if result["success"]:
                    amount = pending_payment.get("amount", 0)
                    self.log_test(f"/payments/{payment_id}/process", "POST", True, f"Processed ${amount} payment via credit card", result["status_code"])
                else:
                    self.log_test(f"/payments/{payment_id}/process", "POST", False, result["error"], result.get("status_code"), result["curl_command"])
    
    def test_leads(self):
        """Test leads endpoints"""
        print("\n🎯 Testing Leads...")
        
        # Test GET leads
        result = self.make_request("GET", "/leads")
        leads = []
        
        if result["success"]:
            leads = result["data"]
            hot_leads = len([l for l in leads if l.get("status") == "hot"])
            self.log_test("/leads", "GET", True, f"Retrieved {len(leads)} leads ({hot_leads} hot)", result["status_code"])
        else:
            self.log_test("/leads", "GET", False, result["error"], result.get("status_code"), result["curl_command"])
        
        # Test lead interaction
        if leads:
            lead_id = leads[0].get("id")
            if lead_id:
                interaction_data = {
                    "channel": "phone",
                    "note": "API test interaction - customer interested in service"
                }
                result = self.make_request("POST", f"/leads/{lead_id}/interactions", interaction_data)
                
                if result["success"]:
                    lead_name = leads[0].get("name", "Unknown")
                    self.log_test(f"/leads/{lead_id}/interactions", "POST", True, f"Logged interaction for {lead_name}", result["status_code"])
                else:
                    self.log_test(f"/leads/{lead_id}/interactions", "POST", False, result["error"], result.get("status_code"), result["curl_command"])
    
    def test_reports(self):
        """Test reporting endpoints"""
        print("\n📊 Testing Reports...")
        
        # Test daily report
        result = self.make_request("GET", "/reports/daily")
        
        if result["success"]:
            data = result["data"]
            today = data.get("today", {})
            revenue = today.get("revenue", 0)
            completed = today.get("workOrdersCompleted", 0)
            self.log_test("/reports/daily", "GET", True, f"Daily report: ${revenue} revenue, {completed} completed orders", result["status_code"])
        else:
            self.log_test("/reports/daily", "GET", False, result["error"], result.get("status_code"), result["curl_command"])
        
        # Test advanced report
        result = self.make_request("GET", "/reports/advanced")
        
        if result["success"]:
            data = result["data"]
            cost_center = data.get("costCenter", {})
            profit_center = data.get("profitCenter", {})
            variance = cost_center.get("variance", 0)
            profit = profit_center.get("profit", 0)
            self.log_test("/reports/advanced", "GET", True, f"Advanced report: ${variance} variance, ${profit} profit", result["status_code"])
        else:
            self.log_test("/reports/advanced", "GET", False, result["error"], result.get("status_code"), result["curl_command"])
    
    def test_integrations(self):
        """Test integration endpoints"""
        print("\n🔗 Testing Integrations...")
        
        # Test GET integrations
        result = self.make_request("GET", "/integrations")
        integrations = []
        
        if result["success"]:
            integrations = result["data"]
            active_count = len([i for i in integrations if i.get("isActive")])
            self.log_test("/integrations", "GET", True, f"Retrieved {len(integrations)} integrations ({active_count} active)", result["status_code"])
        else:
            self.log_test("/integrations", "GET", False, result["error"], result.get("status_code"), result["curl_command"])
        
        # Test create integration
        integration_data = {
            "system_type": "test_system",
            "name": "API Test Integration",
            "endpoint_url": "https://test.api.com/endpoint",
            "username": "test_user",
            "password": "test_pass",
            "api_key": "test_key_123"
        }
        
        result = self.make_request("POST", "/integrations", integration_data)
        new_integration_id = None
        
        if result["success"]:
            data = result["data"]
            new_integration_id = data.get("id")
            integration_name = data.get("name")
            self.log_test("/integrations", "POST", True, f"Created integration: {integration_name}", result["status_code"])
        else:
            self.log_test("/integrations", "POST", False, result["error"], result.get("status_code"), result["curl_command"])
        
        # Test integration connection
        if integrations:
            test_integration = integrations[0]
            integration_id = test_integration.get("id")
            if integration_id:
                result = self.make_request("POST", f"/integrations/{integration_id}/test")
                
                if result["success"]:
                    integration_name = test_integration.get("name", "Unknown")
                    self.log_test(f"/integrations/{integration_id}/test", "POST", True, f"Tested connection for {integration_name}", result["status_code"])
                else:
                    self.log_test(f"/integrations/{integration_id}/test", "POST", False, result["error"], result.get("status_code"), result["curl_command"])
        
        # Test integration sync
        if integrations:
            sync_integration = integrations[0]
            integration_id = sync_integration.get("id")
            if integration_id:
                sync_data = {"syncType": "customers"}
                result = self.make_request("POST", f"/integrations/{integration_id}/sync", sync_data)
                
                if result["success"]:
                    data = result["data"]
                    records = data.get("recordsProcessed", 0)
                    self.log_test(f"/integrations/{integration_id}/sync", "POST", True, f"Synced {records} customer records", result["status_code"])
                else:
                    self.log_test(f"/integrations/{integration_id}/sync", "POST", False, result["error"], result.get("status_code"), result["curl_command"])
    
    def test_admin_code_editor(self):
        """Test admin code editor endpoints"""
        print("\n💻 Testing Admin Code Editor...")
        
        # Test GET code editor page
        page_id = "dashboard"
        result = self.make_request("GET", f"/admin/code-editor/{page_id}")
        
        if result["success"]:
            data = result["data"]
            page_id_response = data.get("pageId")
            self.log_test(f"/admin/code-editor/{page_id}", "GET", True, f"Retrieved code for page: {page_id_response}", result["status_code"])
        else:
            self.log_test(f"/admin/code-editor/{page_id}", "GET", False, result["error"], result.get("status_code"), result["curl_command"])
        
        # Test save code editor page
        code_data = {
            "jsCode": "// API Test JavaScript Code\nconsole.log('Test code saved via API');",
            "cssCode": "/* API Test CSS */\n.test-class { color: blue; }",
            "actionCode": "// API Test Action Code\nfunction testAction() { return true; }"
        }
        
        result = self.make_request("PUT", f"/admin/code-editor/{page_id}", code_data)
        
        if result["success"]:
            data = result["data"]
            saved_page = data.get("pageId")
            self.log_test(f"/admin/code-editor/{page_id}", "PUT", True, f"Saved code for page: {saved_page}", result["status_code"])
        else:
            self.log_test(f"/admin/code-editor/{page_id}", "PUT", False, result["error"], result.get("status_code"), result["curl_command"])
    
    def test_obd_scanner(self):
        """Test OBD scanner endpoints"""
        print("\n🔌 Testing OBD Scanner...")
        
        # Test OBD scan
        result = self.make_request("POST", "/obd/scan")
        
        if result["success"]:
            data = result["data"]
            vin = data.get("vin", "Unknown")
            dtc_count = len(data.get("dtcs", []))
            mileage = data.get("mileage", 0)
            self.log_test("/obd/scan", "POST", True, f"Scanned vehicle {vin}: {mileage} miles, {dtc_count} DTCs", result["status_code"])
            
            # Test create repair order from OBD data
            ro_data = {"scanData": data}
            result = self.make_request("POST", "/obd/create-repair-order", ro_data)
            
            if result["success"]:
                ro_data = result["data"]
                ro_number = ro_data.get("workOrderNumber", "Unknown")
                cost = ro_data.get("estimatedCost", 0)
                self.log_test("/obd/create-repair-order", "POST", True, f"Created RO {ro_number} from OBD scan (${cost})", result["status_code"])
            else:
                self.log_test("/obd/create-repair-order", "POST", False, result["error"], result.get("status_code"), result["curl_command"])
        else:
            self.log_test("/obd/scan", "POST", False, result["error"], result.get("status_code"), result["curl_command"])
    
    def test_diesel_laptops(self):
        """Test Diesel Laptops integration endpoints"""
        print("\n🔧 Testing Diesel Laptops Endpoints...")
        
        # Test DTC lookup
        result = self.make_request("GET", "/diesel-laptops/dtc", params={
            "code": "P0420",
            "make": "Peterbilt", 
            "model": "579"
        })
        
        if result["success"]:
            data = result["data"]
            code = data.get("code")
            description = data.get("description")
            actions_count = len(data.get("recommendedActions", []))
            self.log_test("/diesel-laptops/dtc", "GET", True, f"DTC lookup {code}: {actions_count} recommended actions", result["status_code"])
        else:
            self.log_test("/diesel-laptops/dtc", "GET", False, result["error"], result.get("status_code"), result["curl_command"])
        
        # Test parts search
        result = self.make_request("GET", "/diesel-laptops/parts/search", params={
            "q": "turbo",
            "make": "Peterbilt"
        })
        
        if result["success"]:
            data = result["data"]
            query = data.get("query")
            results_count = len(data.get("results", []))
            self.log_test("/diesel-laptops/parts/search", "GET", True, f"Parts search '{query}': {results_count} results", result["status_code"])
        else:
            self.log_test("/diesel-laptops/parts/search", "GET", False, result["error"], result.get("status_code"), result["curl_command"])
    
    def run_all_tests(self):
        """Run all API tests"""
        print("🚛 TruckService Pro Backend API Regression Test")
        print("=" * 60)
        
        # Authentication is required for all other tests
        self.test_authentication()
        
        if not self.access_token:
            print("\n❌ Authentication failed - cannot continue with other tests")
            return
        
        # Run all endpoint tests
        self.test_dashboard()
        self.test_work_orders()
        self.test_customers()
        self.test_technicians()
        self.test_appointments()
        self.test_inspections()
        self.test_inventory()
        self.test_payments()
        self.test_leads()
        self.test_reports()
        self.test_integrations()
        self.test_admin_code_editor()
        self.test_obd_scanner()
        self.test_diesel_laptops()
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        total_tests = len(self.test_results)
        failed_tests = len(self.failed_endpoints)
        passed_tests = total_tests - failed_tests
        
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests*100):.1f}%")
        
        if self.failed_endpoints:
            print("\n🚨 FAILED ENDPOINTS:")
            print("-" * 60)
            for failure in self.failed_endpoints:
                severity = "CRITICAL" if failure["response_code"] in [500, 503, 504] else "HIGH" if failure["response_code"] in [401, 403, 404] else "MEDIUM"
                print(f"Endpoint: {failure['method']} {failure['endpoint']}")
                print(f"Severity: {severity}")
                print(f"Error: {failure['details']}")
                if failure.get("curl_command"):
                    print(f"Repro: {failure['curl_command']}")
                print("-" * 60)


if __name__ == "__main__":
    # Test configuration
    BASE_URL = "https://truck-service-crm.preview.emergentagent.com"
    EMAIL = "admin@truckservice.com"
    PASSWORD = "admin123"
    
    # Run tests
    tester = TruckServiceAPITest(BASE_URL, EMAIL, PASSWORD)
    tester.run_all_tests()
    
    # Exit with proper code
    sys.exit(1 if tester.failed_endpoints else 0)
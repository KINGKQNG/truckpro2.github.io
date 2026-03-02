"""
TruckService Pro API Tests
Tests all core API endpoints for the semi-truck service CRM
Modules: Auth, Dashboard, Work Orders, Customers, Technicians, Inventory,
         Payments, Leads, Appointments, Inspections, Integrations, Code Editor
"""
import os
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Auth module variables
AUTH_TOKEN = None
LOGIN_EMAIL = "admin@truckservice.com"
LOGIN_PASSWORD = "admin123"


class TestHealth:
    """Health check tests - run first"""

    def test_api_health(self):
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"

    def test_api_root(self):
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "TruckService" in data["message"]


class TestAuth:
    """Authentication endpoint tests"""

    def test_login_success(self):
        global AUTH_TOKEN
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": LOGIN_EMAIL, "password": LOGIN_PASSWORD}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == LOGIN_EMAIL
        assert data["user"]["role"] == "admin"
        AUTH_TOKEN = data["access_token"]

    def test_login_invalid_credentials(self):
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "wrong@email.com", "password": "wrongpassword"}
        )
        assert response.status_code == 401


# Helper for authenticated requests
def auth_headers():
    global AUTH_TOKEN
    if not AUTH_TOKEN:
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": LOGIN_EMAIL, "password": LOGIN_PASSWORD}
        )
        AUTH_TOKEN = response.json().get("access_token")
    return {"Authorization": f"Bearer {AUTH_TOKEN}"}


class TestDashboard:
    """Dashboard summary endpoint tests"""

    def test_dashboard_summary(self):
        response = requests.get(
            f"{BASE_URL}/api/dashboard/summary",
            headers=auth_headers()
        )
        assert response.status_code == 200
        data = response.json()
        assert "kpis" in data
        assert "pendingApprovalOrders" in data
        assert "inProgressOrders" in data
        # Verify KPI structure
        kpis = data["kpis"]
        assert "totalRevenue" in kpis
        assert "workOrdersCompleted" in kpis
        assert "avgRepairTime" in kpis

    def test_dashboard_summary_requires_auth(self):
        response = requests.get(f"{BASE_URL}/api/dashboard/summary")
        assert response.status_code == 401


class TestWorkOrders:
    """Work Orders CRUD tests"""

    def test_get_all_work_orders(self):
        response = requests.get(
            f"{BASE_URL}/api/work-orders",
            headers=auth_headers()
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if len(data) > 0:
            wo = data[0]
            assert "id" in wo
            assert "workOrderNumber" in wo
            assert "status" in wo

    def test_filter_work_orders_by_status(self):
        response = requests.get(
            f"{BASE_URL}/api/work-orders",
            params={"status": "completed"},
            headers=auth_headers()
        )
        assert response.status_code == 200
        data = response.json()
        for wo in data:
            assert wo["status"] == "completed"

    def test_update_work_order_status(self):
        # Get a work order first
        response = requests.get(
            f"{BASE_URL}/api/work-orders",
            headers=auth_headers()
        )
        orders = response.json()
        if len(orders) > 0:
            order_id = orders[0]["id"]
            # Update status
            response = requests.put(
                f"{BASE_URL}/api/work-orders/{order_id}/status",
                json={"status": "in_progress"},
                headers=auth_headers()
            )
            assert response.status_code == 200
            data = response.json()
            assert "message" in data
            assert data["workOrder"]["status"] == "in_progress"

    def test_update_work_order_approval(self):
        # Get pending approval orders
        response = requests.get(
            f"{BASE_URL}/api/work-orders",
            params={"approval_status": "pending"},
            headers=auth_headers()
        )
        orders = [o for o in response.json() if o.get("approvalStatus") == "pending"]
        if len(orders) > 0:
            order_id = orders[0]["id"]
            # Approve
            response = requests.put(
                f"{BASE_URL}/api/work-orders/{order_id}/approval",
                json={"approvalStatus": "approved"},
                headers=auth_headers()
            )
            assert response.status_code == 200
            data = response.json()
            assert data["workOrder"]["approvalStatus"] == "approved"


class TestCustomers:
    """Customers API tests"""

    def test_get_all_customers(self):
        response = requests.get(
            f"{BASE_URL}/api/customers",
            headers=auth_headers()
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if len(data) > 0:
            customer = data[0]
            assert "id" in customer
            assert "name" in customer
            assert "email" in customer

    def test_get_customer_detail(self):
        # Get a customer first
        response = requests.get(
            f"{BASE_URL}/api/customers",
            headers=auth_headers()
        )
        customers = response.json()
        if len(customers) > 0:
            customer_id = customers[0]["id"]
            # Get detail
            response = requests.get(
                f"{BASE_URL}/api/customers/{customer_id}",
                headers=auth_headers()
            )
            assert response.status_code == 200
            data = response.json()
            assert "customer" in data
            assert "trucks" in data
            assert "workOrders" in data

    def test_get_customer_not_found(self):
        response = requests.get(
            f"{BASE_URL}/api/customers/nonexistent-id",
            headers=auth_headers()
        )
        assert response.status_code == 404


class TestTrucks:
    """Trucks API tests"""

    def test_get_all_trucks(self):
        response = requests.get(
            f"{BASE_URL}/api/trucks",
            headers=auth_headers()
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if len(data) > 0:
            truck = data[0]
            assert "id" in truck
            assert "vin" in truck
            assert "make" in truck

    def test_get_trucks_by_customer(self):
        # Get a customer first
        response = requests.get(
            f"{BASE_URL}/api/customers",
            headers=auth_headers()
        )
        customers = response.json()
        if len(customers) > 0:
            customer_id = customers[0]["id"]
            response = requests.get(
                f"{BASE_URL}/api/trucks",
                params={"customer_id": customer_id},
                headers=auth_headers()
            )
            assert response.status_code == 200
            trucks = response.json()
            for truck in trucks:
                assert truck["customerId"] == customer_id


class TestTechnicians:
    """Technicians API tests"""

    def test_get_all_technicians(self):
        response = requests.get(
            f"{BASE_URL}/api/technicians",
            headers=auth_headers()
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if len(data) > 0:
            tech = data[0]
            assert "id" in tech
            assert "name" in tech
            assert "skillLevels" in tech

    def test_update_technician_skills(self):
        # Get a technician first
        response = requests.get(
            f"{BASE_URL}/api/technicians",
            headers=auth_headers()
        )
        techs = response.json()
        if len(techs) > 0:
            tech_id = techs[0]["id"]
            new_skills = {
                "Engine Repair": "expert",
                "Diagnostics": "advanced",
                "Brake Service": "expert"
            }
            response = requests.put(
                f"{BASE_URL}/api/technicians/{tech_id}/skills",
                json={"skillLevels": new_skills},
                headers=auth_headers()
            )
            assert response.status_code == 200
            data = response.json()
            assert "technician" in data
            # Verify skills updated
            assert data["technician"]["skillLevels"]["Engine Repair"] == "expert"


class TestAppointments:
    """Appointments/Scheduler API tests"""

    def test_get_all_appointments(self):
        response = requests.get(
            f"{BASE_URL}/api/appointments",
            headers=auth_headers()
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_create_appointment(self):
        # Get technician for advisor
        tech_response = requests.get(
            f"{BASE_URL}/api/technicians",
            headers=auth_headers()
        )
        techs = tech_response.json()
        if len(techs) > 0:
            tech_id = techs[0]["id"]
            appointment_data = {
                "email": "TEST_scheduler@example.com",
                "phone": "555-0123",
                "mileage": "150000",
                "services": ["oil_change", "tire_rotation"],
                "time": "10:00 AM",
                "advisor": tech_id,
                "transportation": "wait",
                "concerns": "Test appointment",
                "date": "2026-02-15"
            }
            response = requests.post(
                f"{BASE_URL}/api/appointments",
                json=appointment_data,
                headers=auth_headers()
            )
            assert response.status_code == 200
            data = response.json()
            assert "id" in data
            assert data["email"] == appointment_data["email"]
            assert data["status"] == "scheduled"


class TestInspections:
    """Inspections/Walk-Around API tests"""

    def test_save_inspection(self):
        inspection_data = {
            "vehicle": {
                "vin": "TEST123VIN456",
                "make": "Peterbilt",
                "model": "579",
                "year": 2020
            },
            "areas": [
                {
                    "id": "front",
                    "name": "Front End",
                    "status": "completed",
                    "notes": "No damage observed"
                },
                {
                    "id": "driver_side",
                    "name": "Driver Side",
                    "status": "flagged",
                    "damage": [{"type": "Scratch"}],
                    "notes": "Minor scratch on door"
                }
            ]
        }
        response = requests.post(
            f"{BASE_URL}/api/inspections",
            json=inspection_data,
            headers=auth_headers()
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["status"] == "saved"


class TestInventory:
    """Inventory API tests"""

    def test_get_inventory(self):
        response = requests.get(
            f"{BASE_URL}/api/inventory",
            headers=auth_headers()
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if len(data) > 0:
            item = data[0]
            assert "id" in item
            assert "partNumber" in item
            assert "quantity" in item

    def test_get_purchase_orders(self):
        response = requests.get(
            f"{BASE_URL}/api/purchase-orders",
            headers=auth_headers()
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_auto_replenish_creates_po(self):
        # Get a low stock item
        response = requests.get(
            f"{BASE_URL}/api/inventory",
            headers=auth_headers()
        )
        items = response.json()
        low_stock_items = [i for i in items if i.get("status") in ["low_stock", "critical"]]
        if len(low_stock_items) > 0:
            item_id = low_stock_items[0]["id"]
            response = requests.post(
                f"{BASE_URL}/api/inventory/{item_id}/replenish",
                headers=auth_headers()
            )
            assert response.status_code == 200
            data = response.json()
            assert "message" in data


class TestPayments:
    """Payments API tests"""

    def test_get_payments(self):
        response = requests.get(
            f"{BASE_URL}/api/payments",
            headers=auth_headers()
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if len(data) > 0:
            payment = data[0]
            assert "id" in payment
            assert "amount" in payment
            assert "status" in payment

    def test_process_payment(self):
        # Get pending payments
        response = requests.get(
            f"{BASE_URL}/api/payments",
            headers=auth_headers()
        )
        payments = response.json()
        pending = [p for p in payments if p.get("status") == "pending"]
        if len(pending) > 0:
            payment_id = pending[0]["id"]
            response = requests.post(
                f"{BASE_URL}/api/payments/{payment_id}/process",
                json={"method": "credit_card"},
                headers=auth_headers()
            )
            assert response.status_code == 200
            data = response.json()
            assert data["payment"]["status"] == "paid"
            assert data["payment"]["method"] == "credit_card"


class TestLeads:
    """CRM Lead Management API tests"""

    def test_get_leads(self):
        response = requests.get(
            f"{BASE_URL}/api/leads",
            headers=auth_headers()
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if len(data) > 0:
            lead = data[0]
            assert "id" in lead
            assert "name" in lead
            assert "score" in lead

    def test_log_lead_interaction(self):
        # Get a lead
        response = requests.get(
            f"{BASE_URL}/api/leads",
            headers=auth_headers()
        )
        leads = response.json()
        if len(leads) > 0:
            lead_id = leads[0]["id"]
            # Log call interaction
            response = requests.post(
                f"{BASE_URL}/api/leads/{lead_id}/interactions",
                json={"channel": "call", "note": "Test call interaction"},
                headers=auth_headers()
            )
            assert response.status_code == 200
            data = response.json()
            assert "interaction" in data
            assert data["interaction"]["channel"] == "call"


class TestReports:
    """Reports API tests"""

    def test_get_daily_report(self):
        response = requests.get(
            f"{BASE_URL}/api/reports/daily",
            headers=auth_headers()
        )
        assert response.status_code == 200
        data = response.json()
        assert "today" in data
        assert "revenue" in data["today"]
        assert "workOrdersCompleted" in data["today"]

    def test_get_advanced_report(self):
        response = requests.get(
            f"{BASE_URL}/api/reports/advanced",
            headers=auth_headers()
        )
        assert response.status_code == 200
        data = response.json()
        assert "costCenter" in data
        assert "profitCenter" in data


class TestIntegrations:
    """Integrations page API tests"""

    def test_get_integrations(self):
        response = requests.get(
            f"{BASE_URL}/api/integrations",
            headers=auth_headers()
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_create_integration(self):
        integration_data = {
            "system_type": "sap",
            "name": "TEST_SAP Integration",
            "endpoint_url": "https://test-sap.example.com/api",
            "username": "testuser",
            "password": "testpass",
            "api_key": "test-api-key"
        }
        response = requests.post(
            f"{BASE_URL}/api/integrations",
            json=integration_data,
            headers=auth_headers()
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["name"] == integration_data["name"]
        assert data["status"] == "disconnected"

    def test_test_integration_connection(self):
        # Get an integration
        response = requests.get(
            f"{BASE_URL}/api/integrations",
            headers=auth_headers()
        )
        integrations = response.json()
        if len(integrations) > 0:
            integration_id = integrations[0]["id"]
            response = requests.post(
                f"{BASE_URL}/api/integrations/{integration_id}/test",
                headers=auth_headers()
            )
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True

    def test_sync_integration(self):
        # Get an active integration
        response = requests.get(
            f"{BASE_URL}/api/integrations",
            headers=auth_headers()
        )
        integrations = response.json()
        active_integrations = [i for i in integrations if i.get("isActive")]
        if len(active_integrations) > 0:
            integration_id = active_integrations[0]["id"]
            response = requests.post(
                f"{BASE_URL}/api/integrations/{integration_id}/sync",
                json={"syncType": "customers"},
                headers=auth_headers()
            )
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "success"


class TestCodeEditor:
    """Admin Code Editor API tests"""

    def test_get_code_editor_page(self):
        response = requests.get(
            f"{BASE_URL}/api/admin/code-editor/dashboard",
            headers=auth_headers()
        )
        assert response.status_code == 200
        data = response.json()
        assert "pageId" in data

    def test_save_code_editor_page(self):
        code_data = {
            "jsCode": "const test = () => console.log('hello');",
            "cssCode": ".test { color: red; }",
            "actionCode": "// test action"
        }
        response = requests.put(
            f"{BASE_URL}/api/admin/code-editor/dashboard",
            json=code_data,
            headers=auth_headers()
        )
        assert response.status_code == 200
        data = response.json()
        assert data["jsCode"] == code_data["jsCode"]

        # Verify persistence
        response = requests.get(
            f"{BASE_URL}/api/admin/code-editor/dashboard",
            headers=auth_headers()
        )
        assert response.status_code == 200
        data = response.json()
        assert data["jsCode"] == code_data["jsCode"]


class TestOBD:
    """OBD Scanner API tests"""

    def test_obd_scan(self):
        response = requests.post(
            f"{BASE_URL}/api/obd/scan",
            headers=auth_headers()
        )
        assert response.status_code == 200
        data = response.json()
        assert "vin" in data
        assert "dtcs" in data
        assert "mileage" in data

    def test_create_repair_order_from_obd(self):
        scan_data = {
            "dtcs": [
                {"code": "P0420", "description": "Test DTC"},
                {"code": "P0171", "description": "System Too Lean"}
            ]
        }
        response = requests.post(
            f"{BASE_URL}/api/obd/create-repair-order",
            json={"scanData": scan_data},
            headers=auth_headers()
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "workOrderNumber" in data


class TestUsers:
    """Users/Admin API tests (admin only)"""

    def test_get_users(self):
        response = requests.get(
            f"{BASE_URL}/api/users",
            headers=auth_headers()
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if len(data) > 0:
            user = data[0]
            assert "id" in user
            assert "email" in user
            assert "role" in user
            # Password hash should not be exposed
            assert "password_hash" not in user

    def test_update_user_tiles(self):
        # Get users
        response = requests.get(
            f"{BASE_URL}/api/users",
            headers=auth_headers()
        )
        users = response.json()
        if len(users) > 0:
            user_id = users[0]["id"]
            tiles = [
                {"tile_id": "dashboard", "tile_name": "Dashboard", "enabled": True, "order": 1},
                {"tile_id": "work_orders", "tile_name": "Work Orders", "enabled": True, "order": 2}
            ]
            response = requests.put(
                f"{BASE_URL}/api/users/{user_id}/tiles",
                json=tiles,
                headers=auth_headers()
            )
            assert response.status_code == 200


class TestDieselLaptops:
    """Diesel Laptops integration tests (simulated)"""

    def test_dtc_lookup(self):
        response = requests.get(
            f"{BASE_URL}/api/diesel-laptops/dtc",
            params={"code": "P0420", "make": "Peterbilt"},
            headers=auth_headers()
        )
        assert response.status_code == 200
        data = response.json()
        assert "code" in data
        assert "description" in data

    def test_parts_search(self):
        response = requests.get(
            f"{BASE_URL}/api/diesel-laptops/parts/search",
            params={"q": "turbocharger", "make": "Freightliner"},
            headers=auth_headers()
        )
        assert response.status_code == 200
        data = response.json()
        assert "results" in data
        assert isinstance(data["results"], list)

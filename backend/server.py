import hashlib
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, File, Header, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pydantic import BaseModel, EmailStr, Field

from utils.auth import create_access_token, get_password_hash, verify_password, decode_access_token

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
db_name = os.environ["DB_NAME"]
cors_origins = os.environ["CORS_ORIGINS"]

client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

app = FastAPI(title="TruckService Pro API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[origin.strip() for origin in cors_origins.split(",")],
    allow_methods=["*"],
    allow_headers=["*"],
)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def clean_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    if not doc:
        return {}
    sanitized = {**doc}
    sanitized.pop("_id", None)
    return sanitized


async def get_db() -> AsyncIOMotorDatabase:
    return app.state.db


async def get_current_user(
    request: Request,
    authorization: Optional[str] = Header(default=None),
) -> Dict[str, Any]:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = authorization.split(" ", maxsplit=1)[1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = await request.app.state.db.users.find_one(
        {"email": payload.get("sub")},
        {"_id": 0, "password_hash": 0},
    )
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class StatusUpdateRequest(BaseModel):
    status: str


class ApprovalUpdateRequest(BaseModel):
    approvalStatus: str


class WorkOrderCreateRequest(BaseModel):
    customerId: str
    truckId: str
    description: str
    priority: str = "medium"
    scheduledDate: str
    assignedTech: str
    parts: List[Dict[str, Any]] = Field(default_factory=list)
    labor: List[Dict[str, Any]] = Field(default_factory=list)


class SkillUpdateRequest(BaseModel):
    skillLevels: Dict[str, str]


class AppointmentCreateRequest(BaseModel):
    email: EmailStr
    phone: str
    mileage: str
    services: List[str]
    time: str
    advisor: str
    transportation: str = ""
    concerns: str = ""
    date: str


class InspectionSaveRequest(BaseModel):
    vehicle: Dict[str, Any]
    areas: List[Dict[str, Any]]


class TilePermission(BaseModel):
    tile_id: str
    tile_name: str
    enabled: bool
    order: int


class PaymentProcessRequest(BaseModel):
    method: str


class InteractionRequest(BaseModel):
    channel: str
    note: Optional[str] = ""


class IntegrationCreateRequest(BaseModel):
    system_type: str
    name: str
    endpoint_url: str
    username: Optional[str] = ""
    password: Optional[str] = ""
    api_key: Optional[str] = ""


class SyncRequest(BaseModel):
    syncType: str


class CodeSaveRequest(BaseModel):
    jsCode: str
    cssCode: str
    actionCode: str


class OBDCreateRepairOrderRequest(BaseModel):
    scanData: Dict[str, Any]


DEFAULT_TILES = {
    "admin": [
        {"tile_id": "dashboard", "tile_name": "Dashboard", "enabled": True, "order": 1},
        {"tile_id": "work_orders", "tile_name": "Work Orders", "enabled": True, "order": 2},
        {"tile_id": "technicians", "tile_name": "Technicians", "enabled": True, "order": 3},
        {"tile_id": "customers", "tile_name": "Customers", "enabled": True, "order": 4},
        {"tile_id": "inventory", "tile_name": "Inventory", "enabled": True, "order": 5},
        {"tile_id": "payments", "tile_name": "Payments", "enabled": True, "order": 6},
        {"tile_id": "reports", "tile_name": "Reports", "enabled": True, "order": 7},
        {"tile_id": "admin_panel", "tile_name": "Admin Panel", "enabled": True, "order": 8},
        {"tile_id": "integrations", "tile_name": "Integrations", "enabled": True, "order": 9},
    ],
    "service_manager": [
        {"tile_id": "dashboard", "tile_name": "Dashboard", "enabled": True, "order": 1},
        {"tile_id": "work_orders", "tile_name": "Work Orders", "enabled": True, "order": 2},
        {"tile_id": "technicians", "tile_name": "Technicians", "enabled": True, "order": 3},
        {"tile_id": "customers", "tile_name": "Customers", "enabled": True, "order": 4},
        {"tile_id": "inventory", "tile_name": "Inventory", "enabled": True, "order": 5},
        {"tile_id": "payments", "tile_name": "Payments", "enabled": True, "order": 6},
        {"tile_id": "reports", "tile_name": "Reports", "enabled": True, "order": 7},
    ],
    "technician": [
        {"tile_id": "dashboard", "tile_name": "Dashboard", "enabled": True, "order": 1},
        {"tile_id": "work_orders", "tile_name": "Work Orders", "enabled": True, "order": 2},
    ],
    "fleet_manager": [
        {"tile_id": "dashboard", "tile_name": "Dashboard", "enabled": True, "order": 1},
        {"tile_id": "approvals", "tile_name": "Fleet Approvals", "enabled": True, "order": 2},
    ],
}


def sample_seed_data() -> Dict[str, List[Dict[str, Any]]]:
    users = [
        {
            "id": "u-admin",
            "email": "admin@truckservice.com",
            "name": "Admin User",
            "role": "admin",
            "password_hash": get_password_hash("admin123"),
            "tiles": DEFAULT_TILES["admin"],
            "isActive": True,
            "createdAt": now_iso(),
            "updatedAt": now_iso(),
        },
        {
            "id": "u-manager",
            "email": "manager@truckservice.com",
            "name": "Service Manager",
            "role": "service_manager",
            "password_hash": get_password_hash("manager123"),
            "tiles": DEFAULT_TILES["service_manager"],
            "isActive": True,
            "createdAt": now_iso(),
            "updatedAt": now_iso(),
        },
        {
            "id": "u-tech",
            "email": "tech@truckservice.com",
            "name": "John Technician",
            "role": "technician",
            "password_hash": get_password_hash("tech123"),
            "tiles": DEFAULT_TILES["technician"],
            "isActive": True,
            "createdAt": now_iso(),
            "updatedAt": now_iso(),
        },
        {
            "id": "u-fleet",
            "email": "fleet@company.com",
            "name": "Fleet Manager",
            "role": "fleet_manager",
            "password_hash": get_password_hash("fleet123"),
            "tiles": DEFAULT_TILES["fleet_manager"],
            "isActive": True,
            "createdAt": now_iso(),
            "updatedAt": now_iso(),
        },
    ]

    customers = [
        {
            "id": "c1",
            "name": "ABC Transport LLC",
            "type": "fleet",
            "contact": "John Smith",
            "email": "fleet@company.com",
            "phone": "555-0101",
            "fleetSize": 25,
            "status": "active",
            "totalSpent": 125000,
            "joinedDate": "2023-01-15",
            "createdAt": now_iso(),
        },
        {
            "id": "c2",
            "name": "XYZ Logistics",
            "type": "fleet",
            "contact": "Sarah Johnson",
            "email": "sarah@xyzlogistics.com",
            "phone": "555-0102",
            "fleetSize": 50,
            "status": "active",
            "totalSpent": 250000,
            "joinedDate": "2022-06-10",
            "createdAt": now_iso(),
        },
        {
            "id": "c3",
            "name": "Mike's Trucking",
            "type": "individual",
            "contact": "Mike Davis",
            "email": "mike@example.com",
            "phone": "555-0103",
            "fleetSize": 3,
            "status": "active",
            "totalSpent": 15000,
            "joinedDate": "2024-01-05",
            "createdAt": now_iso(),
        },
    ]

    trucks = [
        {
            "id": "t1",
            "customerId": "c1",
            "vin": "1XKAD49X0CJ123456",
            "year": 2020,
            "make": "Kenworth",
            "model": "T680",
            "unitNumber": "TRK-001",
            "mileage": 245000,
            "status": "active",
        },
        {
            "id": "t2",
            "customerId": "c1",
            "vin": "1XKAD49X0CJ123457",
            "year": 2019,
            "make": "Peterbilt",
            "model": "579",
            "unitNumber": "TRK-002",
            "mileage": 320000,
            "status": "in_service",
        },
        {
            "id": "t3",
            "customerId": "c2",
            "vin": "1XKAD49X0CJ123458",
            "year": 2021,
            "make": "Freightliner",
            "model": "Cascadia",
            "unitNumber": "TRK-105",
            "mileage": 180000,
            "status": "active",
        },
    ]

    technicians = [
        {
            "id": "tech1",
            "name": "John Technician",
            "email": "john@truckservice.com",
            "phone": "555-1001",
            "status": "working",
            "currentJob": "WO-2025-002",
            "location": "Bay 3",
            "certifications": ["ASE Master Technician", "Cummins Certified"],
            "skillLevels": {
                "Engine Repair": "expert",
                "Diagnostics": "expert",
                "Preventive Maintenance": "advanced",
                "Electrical": "intermediate",
                "Brake Service": "advanced",
                "Transmission": "intermediate",
            },
            "hoursWorked": 38.5,
            "jobsCompleted": 12,
            "efficiency": 95,
            "updatedAt": now_iso(),
        },
        {
            "id": "tech2",
            "name": "Sarah Martinez",
            "email": "sarah@truckservice.com",
            "phone": "555-1002",
            "status": "available",
            "currentJob": None,
            "location": "Shop Floor",
            "certifications": ["ASE Brakes", "ASE Suspension"],
            "skillLevels": {
                "Engine Repair": "intermediate",
                "Diagnostics": "advanced",
                "Preventive Maintenance": "expert",
                "Electrical": "intermediate",
                "Brake Service": "expert",
                "Transmission": "beginner",
            },
            "hoursWorked": 40,
            "jobsCompleted": 15,
            "efficiency": 92,
            "updatedAt": now_iso(),
        },
    ]

    work_orders = [
        {
            "id": "wo1",
            "workOrderNumber": "WO-2025-001",
            "customerId": "c1",
            "customerName": "ABC Transport LLC",
            "truckId": "t2",
            "truck": "Peterbilt 579 - TRK-002",
            "status": "pending_approval",
            "priority": "high",
            "description": "Engine warning light, loss of power",
            "scheduledDate": "2025-01-15",
            "assignedTech": "John Technician",
            "estimatedCost": 4500,
            "actualCost": 0,
            "createdDate": "2025-01-10",
            "approvalStatus": "pending",
            "parts": [
                {"name": "Turbocharger", "partNumber": "TC-2890", "quantity": 1, "cost": 2800},
                {"name": "Oil Filter", "partNumber": "OF-145", "quantity": 2, "cost": 45},
            ],
            "labor": [
                {"description": "Diagnostic", "hours": 2, "rate": 125, "cost": 250},
                {"description": "Turbo replacement", "hours": 6, "rate": 125, "cost": 750},
            ],
            "createdAt": now_iso(),
            "updatedAt": now_iso(),
        },
        {
            "id": "wo2",
            "workOrderNumber": "WO-2025-002",
            "customerId": "c2",
            "customerName": "XYZ Logistics",
            "truckId": "t3",
            "truck": "Freightliner Cascadia - TRK-105",
            "status": "in_progress",
            "priority": "medium",
            "description": "Routine maintenance - PM service",
            "scheduledDate": "2025-01-12",
            "assignedTech": "John Technician",
            "estimatedCost": 850,
            "actualCost": 850,
            "createdDate": "2025-01-08",
            "approvalStatus": "approved",
            "parts": [
                {"name": "Oil 15W-40", "partNumber": "OIL-1540", "quantity": 10, "cost": 150},
            ],
            "labor": [{"description": "PM Service", "hours": 4, "rate": 125, "cost": 500}],
            "createdAt": now_iso(),
            "updatedAt": now_iso(),
        },
        {
            "id": "wo3",
            "workOrderNumber": "WO-2025-003",
            "customerId": "c3",
            "customerName": "Mike's Trucking",
            "truckId": "t1",
            "truck": "Kenworth T680 - TRK-001",
            "status": "completed",
            "priority": "low",
            "description": "Brake inspection and pad replacement",
            "scheduledDate": "2025-01-05",
            "assignedTech": "John Technician",
            "estimatedCost": 1200,
            "actualCost": 1150,
            "createdDate": "2025-01-03",
            "completedDate": "2025-01-06",
            "approvalStatus": "approved",
            "paymentStatus": "pending",
            "parts": [{"name": "Brake Pads Set", "partNumber": "BP-4500", "quantity": 2, "cost": 450}],
            "labor": [{"description": "Brake service", "hours": 5.6, "rate": 125, "cost": 700}],
            "createdAt": now_iso(),
            "updatedAt": now_iso(),
        },
    ]

    inventory_items = [
        {
            "id": "inv1",
            "partNumber": "TC-2890",
            "name": "Turbocharger",
            "category": "Engine",
            "quantity": 5,
            "parLevel": 8,
            "reorderPoint": 3,
            "unitCost": 2800,
            "supplier": "Detroit Parts Co",
            "location": "Warehouse A-12",
            "status": "low_stock",
        },
        {
            "id": "inv2",
            "partNumber": "OF-145",
            "name": "Oil Filter",
            "category": "Filters",
            "quantity": 45,
            "parLevel": 50,
            "reorderPoint": 20,
            "unitCost": 22.5,
            "supplier": "Filter Supply Inc",
            "location": "Warehouse B-5",
            "status": "ok",
        },
        {
            "id": "inv3",
            "partNumber": "AF-890",
            "name": "Air Filter",
            "category": "Filters",
            "quantity": 8,
            "parLevel": 30,
            "reorderPoint": 12,
            "unitCost": 60,
            "supplier": "Filter Supply Inc",
            "location": "Warehouse B-5",
            "status": "critical",
        },
    ]

    purchase_orders = [
        {
            "id": "po1",
            "orderNumber": "PO-2025-001",
            "supplier": "Filter Supply Inc",
            "status": "pending",
            "orderDate": "2025-01-12",
            "expectedDelivery": "2025-01-18",
            "items": [{"partNumber": "AF-890", "name": "Air Filter", "quantity": 25, "unitCost": 60, "total": 1500}],
            "totalAmount": 1500,
        }
    ]

    appointments = [
        {
            "id": "apt1",
            "customerName": "ABC Transport LLC",
            "email": "fleet@company.com",
            "phone": "555-0101",
            "date": "2025-01-18",
            "time": "09:00 AM",
            "service": "Tire rotation and alignment",
            "status": "scheduled",
            "technicianId": "tech2",
            "technician": "Sarah Martinez",
            "estimatedDuration": 1.5,
            "estimatedCost": 450,
            "mileage": "245000",
            "concerns": "",
        }
    ]

    payments = [
        {
            "id": "pay1",
            "workOrderId": "wo3",
            "workOrderNumber": "WO-2025-003",
            "customerId": "c3",
            "customerName": "Mike's Trucking",
            "amount": 1150,
            "status": "pending",
            "method": None,
            "date": "2025-01-06",
            "dueDate": "2025-01-21",
        },
        {
            "id": "pay2",
            "workOrderId": "wo2",
            "workOrderNumber": "WO-2025-002",
            "customerId": "c2",
            "customerName": "XYZ Logistics",
            "amount": 850,
            "status": "paid",
            "method": "credit_card",
            "date": "2025-01-12",
            "paidDate": "2025-01-12",
        },
    ]

    leads = [
        {
            "id": "L-2025-001",
            "name": "Robert Johnson",
            "phone": "555-0234",
            "email": "robert@email.com",
            "source": "Website Form",
            "score": 85,
            "status": "hot",
            "vehicle": "Peterbilt 579",
            "lastContact": "2 hours ago",
            "assigned": "Sarah Martinez",
            "equity": 15000,
            "priority": "high",
            "interactions": [],
        },
        {
            "id": "L-2025-002",
            "name": "Jennifer Davis",
            "phone": "555-0567",
            "email": "jennifer@fleet.com",
            "source": "Trade-In Inquiry",
            "score": 92,
            "status": "hot",
            "vehicle": "Kenworth T680",
            "lastContact": "4 hours ago",
            "assigned": "Mike Johnson",
            "equity": 22000,
            "priority": "high",
            "interactions": [],
        },
    ]

    integrations = [
        {
            "id": "int-1",
            "system_type": "sap",
            "name": "SAP ERP Production",
            "endpoint_url": "https://sap.company.com:44300",
            "isActive": True,
            "lastSync": "2025-01-14T10:30:00",
            "status": "connected",
        },
        {
            "id": "int-2",
            "system_type": "logile",
            "name": "Logile Time & Attendance",
            "endpoint_url": "https://logile.timetracking.com/api",
            "isActive": True,
            "lastSync": "2025-01-14T09:15:00",
            "status": "connected",
        },
    ]

    return {
        "users": users,
        "customers": customers,
        "trucks": trucks,
        "technicians": technicians,
        "work_orders": work_orders,
        "inventory_items": inventory_items,
        "purchase_orders": purchase_orders,
        "appointments": appointments,
        "payments": payments,
        "leads": leads,
        "integrations": integrations,
    }


async def seed_collection_if_empty(collection_name: str, docs: List[Dict[str, Any]]) -> None:
    count = await db[collection_name].count_documents({})
    if count == 0 and docs:
        await db[collection_name].insert_many(docs)


@app.on_event("startup")
async def startup() -> None:
    app.state.db = db
    seed_data = sample_seed_data()
    for collection_name, docs in seed_data.items():
        await seed_collection_if_empty(collection_name, docs)


@app.on_event("shutdown")
async def shutdown() -> None:
    client.close()


@app.get("/api/")
async def root() -> Dict[str, Any]:
    return {
        "message": "TruckService Pro API",
        "version": "2.0.0",
        "status": "ok",
    }


@app.get("/api/health")
async def healthcheck() -> Dict[str, str]:
    return {"status": "healthy"}


@app.post("/api/auth/login")
async def login(payload: LoginRequest, db_conn: AsyncIOMotorDatabase = Depends(get_db)) -> Dict[str, Any]:
    user = await db_conn.users.find_one({"email": payload.email})
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.get("isActive", True):
        raise HTTPException(status_code=403, detail="User account is disabled")

    access_token = create_access_token({"sub": user["email"], "role": user["role"]})
    response_user = clean_doc(user)
    response_user.pop("password_hash", None)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": response_user,
    }


@app.get("/api/dashboard/summary")
async def get_dashboard_summary(
    db_conn: AsyncIOMotorDatabase = Depends(get_db),
    _: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    work_orders = await db_conn.work_orders.find({}, {"_id": 0}).to_list(1000)
    payments = await db_conn.payments.find({}, {"_id": 0}).to_list(1000)

    total_revenue = sum(float(payment.get("amount", 0)) for payment in payments if payment.get("status") == "paid")
    completed_orders = [wo for wo in work_orders if wo.get("status") == "completed"]
    in_progress_orders = [wo for wo in work_orders if wo.get("status") == "in_progress"]
    pending_approval_orders = [wo for wo in work_orders if wo.get("approvalStatus") == "pending"]
    avg_repair_time = 4.2
    customer_satisfaction = 4.7

    service_type_revenue: Dict[str, Dict[str, Any]] = {}
    for wo in work_orders:
        service_type = wo.get("description", "General Service").split("-")[0].strip()[:32] or "General Service"
        if service_type not in service_type_revenue:
            service_type_revenue[service_type] = {"type": service_type, "count": 0, "revenue": 0}
        service_type_revenue[service_type]["count"] += 1
        service_type_revenue[service_type]["revenue"] += float(wo.get("estimatedCost", 0))

    kpis = {
        "totalRevenue": total_revenue,
        "revenueChange": 12.5,
        "workOrdersCompleted": len(completed_orders),
        "workOrdersChange": 8.3,
        "avgRepairTime": avg_repair_time,
        "repairTimeChange": -5.2,
        "customerSatisfaction": customer_satisfaction,
        "satisfactionChange": 3.1,
        "serviceTypes": list(service_type_revenue.values())[:5],
    }

    return {
        "kpis": kpis,
        "pendingApprovalOrders": pending_approval_orders,
        "inProgressOrders": in_progress_orders,
    }


@app.get("/api/work-orders")
async def get_work_orders(
    status: Optional[str] = None,
    approval_status: Optional[str] = None,
    db_conn: AsyncIOMotorDatabase = Depends(get_db),
    _: Dict[str, Any] = Depends(get_current_user),
) -> List[Dict[str, Any]]:
    query: Dict[str, Any] = {}
    if status:
        query["status"] = status
    if approval_status:
        query["approvalStatus"] = approval_status
    return await db_conn.work_orders.find(query, {"_id": 0}).sort("createdAt", -1).to_list(1000)


@app.post("/api/work-orders")
async def create_work_order(
    payload: WorkOrderCreateRequest,
    db_conn: AsyncIOMotorDatabase = Depends(get_db),
    _: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    customer = await db_conn.customers.find_one({"id": payload.customerId}, {"_id": 0})
    truck = await db_conn.trucks.find_one({"id": payload.truckId}, {"_id": 0})

    if not customer or not truck:
        raise HTTPException(status_code=400, detail="Customer or truck not found")

    count = await db_conn.work_orders.count_documents({})
    work_order_number = f"WO-2026-{str(count + 1).zfill(3)}"
    parts_total = sum(float(part.get("cost", 0)) * int(part.get("quantity", 1)) for part in payload.parts)
    labor_total = sum(float(labor.get("cost", 0)) for labor in payload.labor)

    new_order = {
        "id": str(uuid.uuid4()),
        "workOrderNumber": work_order_number,
        "customerId": payload.customerId,
        "customerName": customer["name"],
        "truckId": payload.truckId,
        "truck": f"{truck['make']} {truck['model']} - {truck['unitNumber']}",
        "status": "pending_approval",
        "priority": payload.priority,
        "description": payload.description,
        "scheduledDate": payload.scheduledDate,
        "assignedTech": payload.assignedTech,
        "estimatedCost": parts_total + labor_total,
        "actualCost": 0,
        "createdDate": now_iso().split("T", maxsplit=1)[0],
        "approvalStatus": "pending",
        "parts": payload.parts,
        "labor": payload.labor,
        "createdAt": now_iso(),
        "updatedAt": now_iso(),
    }

    await db_conn.work_orders.insert_one(new_order)
    return clean_doc(new_order)


@app.put("/api/work-orders/{work_order_id}/status")
async def update_work_order_status(
    work_order_id: str,
    payload: StatusUpdateRequest,
    db_conn: AsyncIOMotorDatabase = Depends(get_db),
    _: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    update_result = await db_conn.work_orders.update_one(
        {"id": work_order_id},
        {"$set": {"status": payload.status, "updatedAt": now_iso()}},
    )
    if update_result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Work order not found")
    updated = await db_conn.work_orders.find_one({"id": work_order_id}, {"_id": 0})
    return {"message": "Status updated", "workOrder": updated}


@app.put("/api/work-orders/{work_order_id}/approval")
async def update_work_order_approval(
    work_order_id: str,
    payload: ApprovalUpdateRequest,
    db_conn: AsyncIOMotorDatabase = Depends(get_db),
    _: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    update_data: Dict[str, Any] = {
        "approvalStatus": payload.approvalStatus,
        "updatedAt": now_iso(),
    }
    if payload.approvalStatus == "approved":
        update_data["status"] = "scheduled"

    update_result = await db_conn.work_orders.update_one(
        {"id": work_order_id},
        {"$set": update_data},
    )
    if update_result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Work order not found")

    updated = await db_conn.work_orders.find_one({"id": work_order_id}, {"_id": 0})
    return {"message": "Approval updated", "workOrder": updated}


@app.put("/api/work-orders/{work_order_id}/approve")
async def approve_work_order(
    work_order_id: str,
    db_conn: AsyncIOMotorDatabase = Depends(get_db),
    _: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    return await update_work_order_approval(
        work_order_id,
        ApprovalUpdateRequest(approvalStatus="approved"),
        db_conn,
        _,
    )


@app.delete("/api/work-orders/{work_order_id}")
async def delete_work_order(
    work_order_id: str,
    db_conn: AsyncIOMotorDatabase = Depends(get_db),
    _: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, str]:
    result = await db_conn.work_orders.delete_one({"id": work_order_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Work order not found")
    return {"message": "Work order deleted"}


@app.get("/api/customers")
async def get_customers(
    db_conn: AsyncIOMotorDatabase = Depends(get_db),
    _: Dict[str, Any] = Depends(get_current_user),
) -> List[Dict[str, Any]]:
    return await db_conn.customers.find({}, {"_id": 0}).to_list(1000)


@app.get("/api/customers/{customer_id}")
async def get_customer_detail(
    customer_id: str,
    db_conn: AsyncIOMotorDatabase = Depends(get_db),
    _: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    customer = await db_conn.customers.find_one({"id": customer_id}, {"_id": 0})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    trucks = await db_conn.trucks.find({"customerId": customer_id}, {"_id": 0}).to_list(100)
    work_orders = await db_conn.work_orders.find({"customerId": customer_id}, {"_id": 0}).to_list(100)
    return {
        "customer": customer,
        "trucks": trucks,
        "workOrders": work_orders,
    }


@app.get("/api/trucks")
async def get_trucks(
    customer_id: Optional[str] = None,
    db_conn: AsyncIOMotorDatabase = Depends(get_db),
    _: Dict[str, Any] = Depends(get_current_user),
) -> List[Dict[str, Any]]:
    query: Dict[str, Any] = {}
    if customer_id:
        query["customerId"] = customer_id
    return await db_conn.trucks.find(query, {"_id": 0}).to_list(1000)


@app.get("/api/technicians")
async def get_technicians(
    db_conn: AsyncIOMotorDatabase = Depends(get_db),
    _: Dict[str, Any] = Depends(get_current_user),
) -> List[Dict[str, Any]]:
    return await db_conn.technicians.find({}, {"_id": 0}).to_list(1000)


@app.put("/api/technicians/{technician_id}/skills")
async def update_technician_skills(
    technician_id: str,
    payload: SkillUpdateRequest,
    db_conn: AsyncIOMotorDatabase = Depends(get_db),
    _: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    result = await db_conn.technicians.update_one(
        {"id": technician_id},
        {"$set": {"skillLevels": payload.skillLevels, "updatedAt": now_iso()}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Technician not found")
    updated = await db_conn.technicians.find_one({"id": technician_id}, {"_id": 0})
    return {"message": "Skills updated", "technician": updated}


@app.get("/api/appointments")
async def get_appointments(
    date: Optional[str] = None,
    db_conn: AsyncIOMotorDatabase = Depends(get_db),
    _: Dict[str, Any] = Depends(get_current_user),
) -> List[Dict[str, Any]]:
    query: Dict[str, Any] = {}
    if date:
        query["date"] = date
    return await db_conn.appointments.find(query, {"_id": 0}).to_list(1000)


@app.post("/api/appointments")
async def create_appointment(
    payload: AppointmentCreateRequest,
    db_conn: AsyncIOMotorDatabase = Depends(get_db),
    _: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    advisor = await db_conn.technicians.find_one({"id": payload.advisor}, {"_id": 0})
    if not advisor:
        raise HTTPException(status_code=400, detail="Selected technician not found")

    service_catalog = {
        "oil_change": {"name": "Oil Change", "price": 89.99, "duration": 0.5},
        "tire_rotation": {"name": "Tire Rotation", "price": 49.99, "duration": 0.75},
        "brake_inspection": {"name": "Brake Inspection", "price": 0, "duration": 0.5},
        "pm_service": {"name": "Preventive Maintenance", "price": 299.99, "duration": 2},
        "engine_diagnostic": {"name": "Engine Diagnostic", "price": 149.99, "duration": 1},
        "transmission_service": {"name": "Transmission Service", "price": 249.99, "duration": 1.5},
    }

    total_cost = 0.0
    total_duration = 0.0
    service_names: List[str] = []
    for service_id in payload.services:
        service = service_catalog.get(service_id)
        if service:
            total_cost += float(service["price"])
            total_duration += float(service["duration"])
            service_names.append(service["name"])

    appointment = {
        "id": str(uuid.uuid4()),
        "customerName": payload.email.split("@", maxsplit=1)[0],
        "email": payload.email,
        "phone": payload.phone,
        "date": payload.date,
        "time": payload.time,
        "service": ", ".join(service_names),
        "services": payload.services,
        "status": "scheduled",
        "technicianId": payload.advisor,
        "technician": advisor["name"],
        "estimatedCost": round(total_cost, 2),
        "estimatedDuration": round(total_duration, 2),
        "transportation": payload.transportation,
        "concerns": payload.concerns,
        "mileage": payload.mileage,
        "createdAt": now_iso(),
    }
    await db_conn.appointments.insert_one(appointment)
    return clean_doc(appointment)


@app.post("/api/inspections/upload")
async def upload_inspection_media(
    areaId: str,
    files: List[UploadFile] = File(default=[]),
    db_conn: AsyncIOMotorDatabase = Depends(get_db),
    _: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    uploaded_files = []
    for file in files:
        uploaded_files.append(
            {
                "name": file.filename,
                "contentType": file.content_type,
                "size": 0,
                "url": f"uploaded://{file.filename}",
                "timestamp": now_iso(),
            }
        )

    log_doc = {
        "id": str(uuid.uuid4()),
        "areaId": areaId,
        "uploadedFiles": uploaded_files,
        "createdAt": now_iso(),
    }
    await db_conn.inspection_uploads.insert_one(log_doc)
    return {"files": uploaded_files}


@app.post("/api/inspections")
async def save_inspection(
    payload: InspectionSaveRequest,
    db_conn: AsyncIOMotorDatabase = Depends(get_db),
    _: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    inspection = {
        "id": str(uuid.uuid4()),
        "vehicle": payload.vehicle,
        "areas": payload.areas,
        "createdAt": now_iso(),
        "status": "saved",
    }
    await db_conn.inspections.insert_one(inspection)
    return clean_doc(inspection)


@app.get("/api/inventory")
async def get_inventory(
    db_conn: AsyncIOMotorDatabase = Depends(get_db),
    _: Dict[str, Any] = Depends(get_current_user),
) -> List[Dict[str, Any]]:
    return await db_conn.inventory_items.find({}, {"_id": 0}).to_list(1000)


@app.get("/api/purchase-orders")
async def get_purchase_orders(
    db_conn: AsyncIOMotorDatabase = Depends(get_db),
    _: Dict[str, Any] = Depends(get_current_user),
) -> List[Dict[str, Any]]:
    return await db_conn.purchase_orders.find({}, {"_id": 0}).sort("orderDate", -1).to_list(1000)


@app.post("/api/inventory/{item_id}/replenish")
async def auto_replenish_item(
    item_id: str,
    db_conn: AsyncIOMotorDatabase = Depends(get_db),
    _: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    item = await db_conn.inventory_items.find_one({"id": item_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")

    replenish_qty = max(int(item.get("parLevel", 0)) - int(item.get("quantity", 0)), 0)
    if replenish_qty == 0:
        return {"message": "Item already at par level", "purchaseOrder": None}

    po_count = await db_conn.purchase_orders.count_documents({})
    new_po = {
        "id": str(uuid.uuid4()),
        "orderNumber": f"PO-2026-{str(po_count + 1).zfill(3)}",
        "supplier": item.get("supplier"),
        "status": "pending",
        "orderDate": now_iso().split("T", maxsplit=1)[0],
        "expectedDelivery": now_iso().split("T", maxsplit=1)[0],
        "items": [
            {
                "partNumber": item["partNumber"],
                "name": item["name"],
                "quantity": replenish_qty,
                "unitCost": item["unitCost"],
                "total": replenish_qty * float(item["unitCost"]),
            }
        ],
        "totalAmount": replenish_qty * float(item["unitCost"]),
    }
    await db_conn.purchase_orders.insert_one(new_po)
    return {"message": "Purchase order created", "purchaseOrder": clean_doc(new_po)}


@app.get("/api/payments")
async def get_payments(
    db_conn: AsyncIOMotorDatabase = Depends(get_db),
    _: Dict[str, Any] = Depends(get_current_user),
) -> List[Dict[str, Any]]:
    return await db_conn.payments.find({}, {"_id": 0}).to_list(1000)


@app.post("/api/payments/{payment_id}/process")
async def process_payment(
    payment_id: str,
    payload: PaymentProcessRequest,
    db_conn: AsyncIOMotorDatabase = Depends(get_db),
    _: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    result = await db_conn.payments.update_one(
        {"id": payment_id},
        {
            "$set": {
                "status": "paid",
                "method": payload.method,
                "paidDate": now_iso().split("T", maxsplit=1)[0],
                "updatedAt": now_iso(),
            }
        },
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Payment not found")

    updated = await db_conn.payments.find_one({"id": payment_id}, {"_id": 0})
    return {"message": "Payment processed", "payment": updated}


@app.get("/api/users")
async def get_users(
    db_conn: AsyncIOMotorDatabase = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> List[Dict[str, Any]]:
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    users = await db_conn.users.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
    return users


@app.put("/api/users/{user_id}/tiles")
async def update_user_tiles(
    user_id: str,
    payload: List[TilePermission],
    db_conn: AsyncIOMotorDatabase = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    result = await db_conn.users.update_one(
        {"id": user_id},
        {"$set": {"tiles": [item.model_dump() for item in payload], "updatedAt": now_iso()}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    updated_user = await db_conn.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    return updated_user


@app.get("/api/leads")
async def get_leads(
    db_conn: AsyncIOMotorDatabase = Depends(get_db),
    _: Dict[str, Any] = Depends(get_current_user),
) -> List[Dict[str, Any]]:
    return await db_conn.leads.find({}, {"_id": 0}).to_list(1000)


@app.post("/api/leads/{lead_id}/interactions")
async def log_lead_interaction(
    lead_id: str,
    payload: InteractionRequest,
    db_conn: AsyncIOMotorDatabase = Depends(get_db),
    _: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    interaction = {
        "id": str(uuid.uuid4()),
        "channel": payload.channel,
        "note": payload.note,
        "timestamp": now_iso(),
    }
    result = await db_conn.leads.update_one(
        {"id": lead_id},
        {
            "$push": {"interactions": interaction},
            "$set": {"lastContact": "Just now", "updatedAt": now_iso()},
        },
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"message": "Interaction logged", "interaction": interaction}


@app.get("/api/reports/daily")
async def get_daily_report(
    db_conn: AsyncIOMotorDatabase = Depends(get_db),
    _: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    payments = await db_conn.payments.find({}, {"_id": 0}).to_list(1000)
    work_orders = await db_conn.work_orders.find({}, {"_id": 0}).to_list(1000)

    paid = [p for p in payments if p.get("status") == "paid"]
    pending = [p for p in payments if p.get("status") == "pending"]
    today_revenue = sum(float(p.get("amount", 0)) for p in paid)
    in_progress = len([wo for wo in work_orders if wo.get("status") == "in_progress"])
    completed = len([wo for wo in work_orders if wo.get("status") == "completed"])

    return {
        "today": {
            "date": now_iso().split("T", maxsplit=1)[0],
            "revenue": today_revenue,
            "workOrdersCompleted": completed,
            "workOrdersInProgress": in_progress,
            "partsRevenue": round(today_revenue * 0.38, 2),
            "laborRevenue": round(today_revenue * 0.62, 2),
            "avgRepairTime": 4.5,
            "technicianUtilization": 87,
            "customerCount": len({wo.get("customerId") for wo in work_orders}),
            "pendingPayments": len(pending),
        }
    }


@app.get("/api/reports/advanced")
async def get_advanced_report(_: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    return {
        "costCenter": {
            "id": "CC-SERVICE-001",
            "actualCosts": 125450,
            "planCosts": 118000,
            "variance": 7450,
            "variancePercent": 6.3,
        },
        "profitCenter": {
            "id": "PC-TRUCK-SERVICE",
            "revenue": 285000,
            "costs": 178500,
            "profit": 106500,
            "marginPercent": 37.4,
        },
    }


@app.get("/api/integrations")
async def get_integrations(
    db_conn: AsyncIOMotorDatabase = Depends(get_db),
    _: Dict[str, Any] = Depends(get_current_user),
) -> List[Dict[str, Any]]:
    return await db_conn.integrations.find({}, {"_id": 0}).to_list(1000)


@app.post("/api/integrations")
async def create_integration(
    payload: IntegrationCreateRequest,
    db_conn: AsyncIOMotorDatabase = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    new_integration = {
        "id": str(uuid.uuid4()),
        "system_type": payload.system_type,
        "name": payload.name,
        "endpoint_url": payload.endpoint_url,
        "username": payload.username,
        "password": payload.password,
        "api_key": payload.api_key,
        "isActive": False,
        "lastSync": None,
        "status": "disconnected",
        "createdAt": now_iso(),
    }
    await db_conn.integrations.insert_one(new_integration)
    return clean_doc(new_integration)


@app.post("/api/integrations/{integration_id}/test")
async def test_integration(
    integration_id: str,
    db_conn: AsyncIOMotorDatabase = Depends(get_db),
    _: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    integration = await db_conn.integrations.find_one({"id": integration_id}, {"_id": 0})
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    await db_conn.integrations.update_one(
        {"id": integration_id},
        {"$set": {"status": "connected", "isActive": True, "updatedAt": now_iso()}},
    )
    return {"success": True, "message": "Connection successful"}


@app.post("/api/integrations/{integration_id}/sync")
async def sync_integration(
    integration_id: str,
    payload: SyncRequest,
    db_conn: AsyncIOMotorDatabase = Depends(get_db),
    _: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    integration = await db_conn.integrations.find_one({"id": integration_id}, {"_id": 0})
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")

    sync_log = {
        "id": str(uuid.uuid4()),
        "integrationId": integration_id,
        "syncType": payload.syncType,
        "status": "success",
        "recordsProcessed": 12,
        "createdAt": now_iso(),
    }
    await db_conn.sync_logs.insert_one(sync_log)
    await db_conn.integrations.update_one(
        {"id": integration_id},
        {"$set": {"lastSync": now_iso(), "updatedAt": now_iso()}},
    )
    return clean_doc(sync_log)


@app.get("/api/admin/code-editor/{page_id}")
async def get_code_editor_page(
    page_id: str,
    db_conn: AsyncIOMotorDatabase = Depends(get_db),
    _: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    template = await db_conn.code_templates.find_one({"pageId": page_id}, {"_id": 0})
    if template:
        return template
    return {
        "pageId": page_id,
        "jsCode": "",
        "cssCode": "",
        "actionCode": "",
    }


@app.put("/api/admin/code-editor/{page_id}")
async def save_code_editor_page(
    page_id: str,
    payload: CodeSaveRequest,
    db_conn: AsyncIOMotorDatabase = Depends(get_db),
    _: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    record = {
        "pageId": page_id,
        "jsCode": payload.jsCode,
        "cssCode": payload.cssCode,
        "actionCode": payload.actionCode,
        "updatedAt": now_iso(),
    }
    await db_conn.code_templates.update_one({"pageId": page_id}, {"$set": record}, upsert=True)
    return record


@app.post("/api/obd/scan")
async def obd_scan(_: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    return {
        "vin": "1XKAD49X0CJ123457",
        "make": "Peterbilt",
        "model": "579",
        "year": 2019,
        "mileage": 325478,
        "engineHours": 18234,
        "oilLife": 35,
        "tirePressure": {
            "frontLeft": 105,
            "frontRight": 108,
            "rearLeft": 110,
            "rearRight": 107,
        },
        "dtcs": [
            {"code": "P0420", "description": "Catalyst System Efficiency Below Threshold", "severity": "warning"},
            {"code": "P0171", "description": "System Too Lean (Bank 1)", "severity": "warning"},
        ],
        "recalls": [{"id": "R2024-001", "description": "Fuel Pump Recall", "status": "open"}],
        "batteryVoltage": 12.6,
        "coolantTemp": 195,
        "fuelLevel": 65,
        "timestamp": now_iso(),
    }


@app.post("/api/obd/create-repair-order")
async def create_ro_from_obd(
    payload: OBDCreateRepairOrderRequest,
    db_conn: AsyncIOMotorDatabase = Depends(get_db),
    _: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    customers = await db_conn.customers.find({}, {"_id": 0}).to_list(1)
    trucks = await db_conn.trucks.find({}, {"_id": 0}).to_list(1)
    if not customers or not trucks:
        raise HTTPException(status_code=400, detail="Missing customer/truck records")

    count = await db_conn.work_orders.count_documents({})
    description = " / ".join(item.get("description", "DTC") for item in payload.scanData.get("dtcs", []))
    new_order = {
        "id": str(uuid.uuid4()),
        "workOrderNumber": f"WO-2026-{str(count + 1).zfill(3)}",
        "customerId": customers[0]["id"],
        "customerName": customers[0]["name"],
        "truckId": trucks[0]["id"],
        "truck": f"{trucks[0]['make']} {trucks[0]['model']} - {trucks[0]['unitNumber']}",
        "status": "pending_approval",
        "priority": "high",
        "description": description or "OBD diagnostics generated repair order",
        "scheduledDate": now_iso().split("T", maxsplit=1)[0],
        "assignedTech": "John Technician",
        "estimatedCost": 900,
        "actualCost": 0,
        "createdDate": now_iso().split("T", maxsplit=1)[0],
        "approvalStatus": "pending",
        "parts": [],
        "labor": [{"description": "OBD diagnostics", "hours": 1.5, "rate": 125, "cost": 188}],
        "createdAt": now_iso(),
        "updatedAt": now_iso(),
    }
    await db_conn.work_orders.insert_one(new_order)
    return clean_doc(new_order)


_DTC_DB: Dict[str, Any] = {
    "SPN102FMI2": {
        "code": "SPN 102 FMI 2",
        "spn": 102,
        "fmi": 2,
        "description": "Boost Pressure – Data Erratic, Intermittent, or Incorrect",
        "system": "Air Management",
        "severity": "high",
        "possibleCauses": [
            "Faulty boost pressure sensor",
            "Cracked or loose boost pressure hose",
            "Leaking intercooler",
            "Turbocharger failure",
            "Wiring harness damage or corrosion",
        ],
        "recommendedActions": [
            "Inspect boost pressure sensor connector and wiring",
            "Check intercooler for cracks and leaks",
            "Inspect turbocharger impeller and compressor wheel",
            "Replace boost pressure sensor if voltage out of range",
            "Perform boost leak test",
        ],
        "repairProcedures": [
            {
                "step": 1,
                "description": "Connect diagnostic tool and monitor SPN 102 live data at idle and under load.",
            },
            {
                "step": 2,
                "description": "Inspect MAP/boost sensor connector for bent pins, corrosion, or moisture.",
            },
            {"step": 3, "description": "Measure sensor supply voltage (should be 5 V ± 0.2 V)."},
            {"step": 4, "description": "Inspect boost hose from turbo to intercooler and intercooler to intake manifold."},
            {"step": 5, "description": "Perform smoke test on intake/boost system to locate leaks."},
            {"step": 6, "description": "Replace boost pressure sensor if faulty. Clear codes and retest."},
        ],
        "relatedCodes": ["SPN 27 FMI 5", "SPN 100 FMI 1", "SPN 94 FMI 1"],
        "commonParts": [
            {"partNumber": "A0041539228", "description": "Boost Pressure Sensor", "price": 89.95},
            {"partNumber": "A9615400617", "description": "Boost Hose Assembly", "price": 54.50},
        ],
        "laborTime": 1.5,
    },
    "SPN27FMI5": {
        "code": "SPN 27 FMI 5",
        "spn": 27,
        "fmi": 5,
        "description": "EGR Valve Position Sensor – Current Below Normal",
        "system": "Emissions / EGR",
        "severity": "high",
        "possibleCauses": [
            "Open circuit in EGR position sensor signal wire",
            "Faulty EGR position sensor",
            "EGR valve actuator failure",
            "ECM calibration issue",
        ],
        "recommendedActions": [
            "Check EGR position sensor wiring for open circuit",
            "Inspect EGR valve for carbon buildup",
            "Clean or replace EGR valve",
            "Update ECM software if applicable",
        ],
        "repairProcedures": [
            {"step": 1, "description": "Inspect EGR valve and sensor connector for damage or corrosion."},
            {"step": 2, "description": "Measure resistance on sensor signal wire (should not exceed 5 Ω)."},
            {"step": 3, "description": "Remove EGR valve and inspect for excessive carbon fouling."},
            {"step": 4, "description": "Clean EGR valve ports with approved solvent. Replace if severely fouled."},
        ],
        "relatedCodes": ["SPN 102 FMI 2", "SPN 412 FMI 3"],
        "commonParts": [
            {"partNumber": "A0001400560", "description": "EGR Valve Assembly", "price": 379.00},
            {"partNumber": "A0051530228", "description": "EGR Position Sensor", "price": 67.50},
        ],
        "laborTime": 2.5,
    },
    "P0087": {
        "code": "P0087",
        "description": "Fuel Rail/System Pressure – Too Low",
        "system": "Fuel System",
        "severity": "critical",
        "possibleCauses": [
            "Clogged fuel filter",
            "Weak or failing fuel transfer pump",
            "High-pressure fuel pump wear",
            "Restricted fuel supply line",
            "Contaminated fuel",
        ],
        "recommendedActions": [
            "Replace primary and secondary fuel filters",
            "Test fuel transfer pump output pressure",
            "Inspect fuel supply lines for kinks or blockage",
            "Check fuel rail pressure sensor accuracy",
            "Inspect injectors for excessive return flow",
        ],
        "repairProcedures": [
            {"step": 1, "description": "Connect scan tool – record live fuel rail pressure at idle and under load."},
            {"step": 2, "description": "Replace primary fuel filter; check for water in fuel."},
            {"step": 3, "description": "Test transfer pump inlet restriction (max 4 in-Hg)."},
            {"step": 4, "description": "Perform high-pressure pump flow test using OEM procedure."},
            {"step": 5, "description": "Replace injectors if return flow exceeds spec. Clear codes and road test."},
        ],
        "relatedCodes": ["P0088", "P0193"],
        "commonParts": [
            {"partNumber": "F276200012060", "description": "Primary Fuel Filter", "price": 28.95},
            {"partNumber": "A0000901551", "description": "Transfer Pump Assembly", "price": 312.00},
        ],
        "laborTime": 2.0,
    },
    "P0299": {
        "code": "P0299",
        "description": "Turbocharger/Supercharger A Underboost Condition",
        "system": "Turbocharger",
        "severity": "high",
        "possibleCauses": [
            "Boost leak in intake system",
            "Variable geometry turbocharger vane issue",
            "EGR valve stuck open",
            "Air filter restriction",
            "Charge air cooler core leak",
        ],
        "recommendedActions": [
            "Perform boost leak test on entire intake system",
            "Inspect and clean VGT actuator and vanes",
            "Verify EGR valve operation",
            "Check air filter restriction",
            "Inspect charge air cooler for leaks",
        ],
        "repairProcedures": [
            {"step": 1, "description": "Record boost pressure PID at rated RPM under full load."},
            {"step": 2, "description": "Inspect all intercooler hose clamps and boots."},
            {"step": 3, "description": "Perform smoke/pressure test at 20 psi on intake."},
            {"step": 4, "description": "Inspect VGT actuator rod travel and clean vanes with approved cleaner."},
            {"step": 5, "description": "Check EGR valve duty cycle; repair if stuck open."},
        ],
        "relatedCodes": ["SPN 102 FMI 2", "P0420"],
        "commonParts": [
            {"partNumber": "A0090960399", "description": "VGT Turbocharger Assembly", "price": 2450.00},
            {"partNumber": "A9600900854", "description": "Charge Air Cooler", "price": 890.00},
        ],
        "laborTime": 4.0,
    },
    "P0420": {
        "code": "P0420",
        "description": "Catalyst System Efficiency Below Threshold (Bank 1)",
        "system": "Aftertreatment / Emissions",
        "severity": "medium",
        "possibleCauses": [
            "Failing or degraded DPF/DOC",
            "Coolant or oil contamination of exhaust",
            "Incorrect fuel sulfur content",
            "Oxygen sensor malfunction",
            "Exhaust system leaks ahead of DPF",
        ],
        "recommendedActions": [
            "Check exhaust for leaks upstream of catalyst",
            "Inspect downstream oxygen/NOx sensor",
            "Review DEF quality and dosing rate",
            "Perform forced DPF regeneration",
            "Replace DOC/DPF if soot or ash loading excessive",
        ],
        "repairProcedures": [
            {"step": 1, "description": "Check exhaust back-pressure and soot load via diagnostic tool."},
            {"step": 2, "description": "Inspect for exhaust leaks between turbo and DPF."},
            {"step": 3, "description": "Perform a parked DPF regeneration cycle."},
            {"step": 4, "description": "Test NOx sensor upstream and downstream for correct readings."},
            {"step": 5, "description": "Replace DPF/DOC if soot load exceeds manufacturer limit."},
        ],
        "relatedCodes": ["P2002", "P2463", "P228C"],
        "commonParts": [
            {"partNumber": "A0004900492", "description": "DOC/DPF Assembly", "price": 3200.00},
            {"partNumber": "A0009053203", "description": "NOx Sensor", "price": 245.00},
        ],
        "laborTime": 3.5,
    },
    "SPN100FMI1": {
        "code": "SPN 100 FMI 1",
        "description": "Engine Oil Pressure – Data Valid But Below Normal Range",
        "system": "Lubrication",
        "severity": "critical",
        "possibleCauses": [
            "Low engine oil level",
            "Worn oil pump",
            "Clogged oil filter or pickup tube",
            "Worn main or rod bearings",
            "Oil pressure sensor failure",
        ],
        "recommendedActions": [
            "STOP ENGINE IMMEDIATELY if pressure is critically low",
            "Check engine oil level and condition",
            "Replace oil filter",
            "Inspect oil pressure sensor and circuit",
            "Perform oil pump output test",
        ],
        "repairProcedures": [
            {"step": 1, "description": "Check oil level and condition. Add oil if low; investigate source of loss."},
            {"step": 2, "description": "Install mechanical oil pressure gauge to verify sensor accuracy."},
            {"step": 3, "description": "Replace oil filter and check oil pickup tube for restriction."},
            {"step": 4, "description": "Measure oil pump output pressure at warm idle (min 10 psi; spec ~40 psi)."},
            {"step": 5, "description": "If low pressure confirmed, disassemble engine for bearing inspection."},
        ],
        "relatedCodes": ["SPN 110 FMI 0"],
        "commonParts": [
            {"partNumber": "A4721800009", "description": "Oil Pressure Sensor", "price": 45.00},
            {"partNumber": "A4721840225", "description": "Oil Pump Assembly", "price": 580.00},
        ],
        "laborTime": 2.0,
    },
}

_PARTS_DB: List[Dict[str, Any]] = [
    {
        "partNumber": "A0041539228",
        "name": "Boost Pressure Sensor",
        "category": "Sensors",
        "make": ["Freightliner", "Peterbilt", "Kenworth"],
        "oemNumbers": ["A0041539228", "5WK96841"],
        "description": "MAP/Boost pressure sensor for DD15/DD13 engines",
        "price": 89.95,
        "availability": "in_stock",
        "specifications": {"voltage": "5V", "thread": "M14x1.5", "connectorType": "3-pin Deutsch"},
    },
    {
        "partNumber": "A0001400560",
        "name": "EGR Valve Assembly",
        "category": "Emissions",
        "make": ["Freightliner", "Western Star"],
        "oemNumbers": ["A0001400560", "OM471", "DD15-EGR"],
        "description": "Complete EGR valve assembly for DD15 engine",
        "price": 379.00,
        "availability": "in_stock",
        "specifications": {"voltage": "12V", "flowRate": "600 kg/hr"},
    },
    {
        "partNumber": "F276200012060",
        "name": "Primary Fuel Filter",
        "category": "Filters",
        "make": ["Freightliner", "Peterbilt", "Kenworth", "Volvo", "Mack"],
        "oemNumbers": ["F276200012060", "WF10128", "FS20126"],
        "description": "Primary/pre-filter for HPCR fuel system",
        "price": 28.95,
        "availability": "in_stock",
        "specifications": {"micron": "10", "bypassValve": "25 PSI", "waterSeparator": True},
    },
    {
        "partNumber": "A0090960399",
        "name": "VGT Turbocharger Assembly – Remanufactured",
        "category": "Turbocharger",
        "make": ["Freightliner", "Western Star"],
        "oemNumbers": ["A0090960399", "BW174357"],
        "description": "Variable geometry turbocharger for DD15, remanufactured with 2-year warranty",
        "price": 2450.00,
        "availability": "limited",
        "specifications": {"compressorInducer": "72mm", "turbineWheel": "80mm", "type": "VGT"},
    },
    {
        "partNumber": "A0004900492",
        "name": "DPF/DOC Aftertreatment Assembly",
        "category": "Aftertreatment",
        "make": ["Freightliner", "Western Star"],
        "oemNumbers": ["A0004900492"],
        "description": "Complete diesel particulate filter and diesel oxidation catalyst assembly",
        "price": 3200.00,
        "availability": "order",
        "specifications": {"substrate": "Cordierite", "inlet": "5-inch"},
    },
    {
        "partNumber": "K152765",
        "name": "Wheel Seal – Rear Drive Axle",
        "category": "Drivetrain",
        "make": ["Peterbilt", "Kenworth", "Freightliner", "International"],
        "oemNumbers": ["K152765", "71220", "SKF-32407"],
        "description": "Unitized wheel seal for Dana/Spicer rear drive axle",
        "price": 42.50,
        "availability": "in_stock",
        "specifications": {"innerDiameter": "3.376 in", "outerDiameter": "4.875 in"},
    },
    {
        "partNumber": "WA10510",
        "name": "Coolant/Water Pump",
        "category": "Cooling",
        "make": ["Peterbilt", "Kenworth"],
        "oemNumbers": ["WA10510", "Q21-1075", "E600-6205"],
        "description": "Engine coolant pump for PACCAR MX-13",
        "price": 318.00,
        "availability": "in_stock",
        "specifications": {"flowRate": "100 GPM", "pulleyDiameter": "6.5 in"},
    },
    {
        "partNumber": "21707132",
        "name": "Injector – Unit (Remanufactured)",
        "category": "Fuel System",
        "make": ["Volvo", "Mack"],
        "oemNumbers": ["21707132", "22171491", "E3.18"],
        "description": "Reman unit injector for Volvo D13 / Mack MP8 engine",
        "price": 425.00,
        "availability": "in_stock",
        "specifications": {"sprayHoles": 8, "pressure": "1800 bar"},
    },
]

_WIRING_SYSTEMS: Dict[str, Any] = {
    "engine": {
        "system": "Engine Management",
        "circuits": [
            {"circuit": "ECM Power Supply", "wireColor": "Red/White", "gauge": "12 AWG", "connectorType": "Deutsch DT"},
            {"circuit": "ECM Ground", "wireColor": "Black", "gauge": "12 AWG", "connectorType": "Deutsch DT"},
            {"circuit": "CAN H (J1939)", "wireColor": "Yellow", "gauge": "18 AWG", "connectorType": "9-pin Deutsch"},
            {"circuit": "CAN L (J1939)", "wireColor": "Green", "gauge": "18 AWG", "connectorType": "9-pin Deutsch"},
            {"circuit": "Boost Pressure Signal", "wireColor": "Orange", "gauge": "20 AWG", "connectorType": "3-pin Packard"},
            {"circuit": "Coolant Temp Signal", "wireColor": "Pink", "gauge": "20 AWG", "connectorType": "2-pin Packard"},
        ],
        "pinLayouts": [
            {"connector": "ECM J1 (120-pin)", "pins": [
                {"pin": "A1", "function": "Battery +12V", "color": "Red"},
                {"pin": "A2", "function": "Battery Ground", "color": "Black"},
                {"pin": "B5", "function": "CAN High", "color": "Yellow"},
                {"pin": "B6", "function": "CAN Low", "color": "Green"},
                {"pin": "C10", "function": "Boost Pressure Signal", "color": "Orange"},
            ]},
        ],
    },
    "brakes": {
        "system": "Air Brake System",
        "circuits": [
            {"circuit": "ABS Module Power", "wireColor": "Red", "gauge": "14 AWG", "connectorType": "Packard 56"},
            {"circuit": "ABS Module Ground", "wireColor": "Black", "gauge": "14 AWG", "connectorType": "Packard 56"},
            {"circuit": "Wheel Speed Sensor FL", "wireColor": "Brown/White", "gauge": "18 AWG", "connectorType": "2-pin AMP"},
            {"circuit": "Wheel Speed Sensor RR", "wireColor": "Gray/White", "gauge": "18 AWG", "connectorType": "2-pin AMP"},
            {"circuit": "J1939 CAN H", "wireColor": "Yellow", "gauge": "18 AWG", "connectorType": "9-pin Deutsch"},
        ],
        "pinLayouts": [
            {"connector": "ABS ECU (36-pin)", "pins": [
                {"pin": "1", "function": "Battery +12V", "color": "Red"},
                {"pin": "2", "function": "Ignition Power", "color": "Orange"},
                {"pin": "3", "function": "Ground", "color": "Black"},
                {"pin": "10", "function": "WSS FL +", "color": "Brown"},
                {"pin": "11", "function": "WSS FL –", "color": "White/Brown"},
            ]},
        ],
    },
    "electrical": {
        "system": "Chassis Electrical",
        "circuits": [
            {"circuit": "Main Battery Feed", "wireColor": "Red", "gauge": "2/0 AWG", "connectorType": "Bolt-on lug"},
            {"circuit": "Alternator Output", "wireColor": "Orange", "gauge": "4 AWG", "connectorType": "Ring terminal"},
            {"circuit": "Ignition Switch", "wireColor": "Yellow/Red", "gauge": "16 AWG", "connectorType": "Packard"},
            {"circuit": "Lighting Bus", "wireColor": "Blue", "gauge": "16 AWG", "connectorType": "Deutsch"},
        ],
        "pinLayouts": [],
    },
    "transmission": {
        "system": "Transmission Control",
        "circuits": [
            {"circuit": "TCM Power Supply", "wireColor": "Red/Purple", "gauge": "14 AWG", "connectorType": "Deutsch DT"},
            {"circuit": "TCM Ground", "wireColor": "Black", "gauge": "14 AWG", "connectorType": "Deutsch DT"},
            {"circuit": "Output Shaft Speed", "wireColor": "Tan", "gauge": "20 AWG", "connectorType": "2-pin Packard"},
            {"circuit": "TPS Signal", "wireColor": "Green/White", "gauge": "20 AWG", "connectorType": "3-pin Packard"},
        ],
        "pinLayouts": [],
    },
    "hvac": {
        "system": "HVAC / Climate Control",
        "circuits": [
            {"circuit": "Compressor Clutch", "wireColor": "Blue/White", "gauge": "16 AWG", "connectorType": "Packard"},
            {"circuit": "Blower Motor", "wireColor": "Purple", "gauge": "14 AWG", "connectorType": "2-pin Packard"},
            {"circuit": "Temp Sensor Signal", "wireColor": "Green", "gauge": "20 AWG", "connectorType": "2-pin Packard"},
        ],
        "pinLayouts": [],
    },
}

_TSB_DB: List[Dict[str, Any]] = [
    {
        "bulletinNumber": "TSB-DD15-2023-041",
        "title": "DD15 – EGR Valve Carbon Deposit Procedure",
        "date": "2023-08-14",
        "make": "Freightliner",
        "model": "Cascadia",
        "system": "Emissions",
        "description": "Carbon buildup on EGR valve disc and seat may cause SPN 27 FMI 5/7 or rough idle. This bulletin provides a cleaning and inspection procedure before replacement.",
        "affectedComponents": ["EGR Valve", "EGR Cooler", "Intake Manifold"],
        "affectedSerialRange": "DD15 serial 471xxxxx built before 2023-06-01",
        "laborTime": 2.5,
        "partsRequired": [{"partNumber": "A0001400560", "qty": 1}],
    },
    {
        "bulletinNumber": "TSB-MX13-2022-019",
        "title": "PACCAR MX-13 – Injector Return Banjo Bolt Torque Revision",
        "date": "2022-05-22",
        "make": "Kenworth",
        "model": "T680",
        "system": "Fuel System",
        "description": "Incorrect torque specification in prior service manual. Torque for injector return banjo bolt revised from 22 Nm to 18 Nm to prevent cracking of banjo fitting.",
        "affectedComponents": ["Fuel Injectors", "High-Pressure Lines"],
        "affectedSerialRange": "MX-13 engines built 2019-2022",
        "laborTime": 1.0,
        "partsRequired": [],
    },
    {
        "bulletinNumber": "TSB-DPF-2024-007",
        "title": "SCR System – DEF Dosing Valve Replacement Program",
        "date": "2024-01-10",
        "make": "All",
        "model": "All",
        "system": "Aftertreatment",
        "description": "Extended idle or low-load operation may result in DEF dosing valve crystallization leading to P20EE or SPN 4094 FMI codes. This bulletin authorizes replacement under extended warranty.",
        "affectedComponents": ["DEF Dosing Valve", "SCR Catalyst", "DEF Supply Module"],
        "affectedSerialRange": "All EPA2017+ engines",
        "laborTime": 1.5,
        "partsRequired": [{"partNumber": "A0009018735", "qty": 1}],
    },
    {
        "bulletinNumber": "TSB-ABS-2023-012",
        "title": "Meritor ABS – Wheel Speed Sensor Air Gap Spec Update",
        "date": "2023-03-30",
        "make": "All",
        "model": "All",
        "system": "Brakes",
        "description": "Service manual air gap spec updated from 0.020–0.040 in to 0.015–0.035 in for improved ABS response at low speeds. Applies to Meritor EX+L brake assembly.",
        "affectedComponents": ["Wheel Speed Sensors", "ABS Module"],
        "affectedSerialRange": "All vehicles with Meritor EX+L brakes",
        "laborTime": 0.5,
        "partsRequired": [],
    },
]


@app.get("/api/diesel-laptops/dtc")
async def diesel_dtc_lookup(
    code: str,
    make: Optional[str] = None,
    model: Optional[str] = None,
    _: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    key = code.upper().replace(" ", "").replace("-", "").replace("/", "")
    record = _DTC_DB.get(key)
    if record:
        result = dict(record)
        result["make"] = make
        result["model"] = model
        return result
    return {
        "code": code,
        "make": make,
        "model": model,
        "description": f"Fault code {code} – sensor or circuit fault detected",
        "system": "Unknown",
        "severity": "medium",
        "possibleCauses": ["Faulty sensor", "Wiring harness damage", "Connector corrosion", "Component failure"],
        "recommendedActions": [
            "Inspect related sensor connector and wiring",
            "Check for chafed or open wires",
            "Replace sensor if voltage out of specification",
            "Re-scan after repair to confirm code is cleared",
        ],
        "repairProcedures": [
            {"step": 1, "description": "Connect diagnostic tool and record live data for related PIDs."},
            {"step": 2, "description": "Inspect wiring harness for damage or corrosion."},
            {"step": 3, "description": "Replace faulty component and clear codes."},
        ],
        "relatedCodes": [],
        "commonParts": [],
        "laborTime": 1.0,
    }


@app.get("/api/diesel-laptops/parts/search")
async def diesel_parts_search(
    q: str,
    make: Optional[str] = None,
    _: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    term = q.lower()
    filtered = [
        p for p in _PARTS_DB
        if term in p["name"].lower()
        or term in p["partNumber"].lower()
        or term in p["category"].lower()
        or any(term in oem.lower() for oem in p["oemNumbers"])
    ]
    if make:
        filtered = [p for p in filtered if make in p.get("make", [])] or filtered
    if not filtered:
        _h = int(hashlib.md5(q.encode()).hexdigest(), 16)
        filtered = [
            {
                "partNumber": f"DL-{_h % 9000 + 1000}",
                "name": f"{q.title()} Assembly",
                "category": "General",
                "make": [make or "All"],
                "oemNumbers": [],
                "description": f"OEM replacement {q} assembly",
                "price": round(50 + _h % 450, 2),
                "availability": "order",
                "specifications": {},
            }
        ]
    return {"query": q, "make": make, "results": filtered}


@app.get("/api/diesel-laptops/wiring")
async def diesel_wiring_diagram(
    vin: str,
    system: str,
    _: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    system_key = system.lower().replace(" ", "_")
    diagram = _WIRING_SYSTEMS.get(system_key, _WIRING_SYSTEMS.get("engine"))
    return {
        "vin": vin,
        "system": system,
        **diagram,
    }


@app.get("/api/diesel-laptops/tsb")
async def diesel_tsb_lookup(
    make: Optional[str] = None,
    model: Optional[str] = None,
    year: Optional[int] = None,
    _: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    results = _TSB_DB
    if make:
        results = [t for t in results if t["make"] in (make, "All")]
    if model:
        results = [t for t in results if t["model"] in (model, "All")]
    return {"make": make, "model": model, "year": year, "bulletins": results}


@app.get("/api/diesel-laptops/maintenance")
async def diesel_maintenance_schedule(
    vin: str,
    mileage: int,
    _: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    services = [
        {
            "service": "Engine Oil & Filter Change",
            "description": "Drain and refill engine oil; replace oil filter",
            "interval": 25000,
            "dueMileage": ((mileage // 25000) + 1) * 25000,
            "overdue": mileage % 25000 > 23000,
            "partsNeeded": [
                {"partNumber": "F276200012060", "description": "Oil Filter", "qty": 1},
            ],
            "estimatedCost": 185.0,
            "laborTime": 0.8,
        },
        {
            "service": "Fuel Filter Replacement (Primary & Secondary)",
            "description": "Replace primary water-separator/pre-filter and secondary fuel filter",
            "interval": 25000,
            "dueMileage": ((mileage // 25000) + 1) * 25000,
            "overdue": mileage % 25000 > 23000,
            "partsNeeded": [
                {"partNumber": "F276200012060", "description": "Primary Fuel Filter", "qty": 1},
                {"partNumber": "F276200012061", "description": "Secondary Fuel Filter", "qty": 1},
            ],
            "estimatedCost": 120.0,
            "laborTime": 0.5,
        },
        {
            "service": "Air Filter Service",
            "description": "Inspect and replace engine air filter element",
            "interval": 50000,
            "dueMileage": ((mileage // 50000) + 1) * 50000,
            "overdue": mileage % 50000 > 48000,
            "partsNeeded": [
                {"partNumber": "A0040940004", "description": "Air Filter Element", "qty": 1},
            ],
            "estimatedCost": 95.0,
            "laborTime": 0.5,
        },
        {
            "service": "Coolant System Flush",
            "description": "Flush and refill cooling system with OAT coolant; inspect hoses and clamps",
            "interval": 300000,
            "dueMileage": ((mileage // 300000) + 1) * 300000,
            "overdue": mileage % 300000 > 295000,
            "partsNeeded": [],
            "estimatedCost": 350.0,
            "laborTime": 2.0,
        },
        {
            "service": "DPF Inspection & Cleaning",
            "description": "Inspect diesel particulate filter soot and ash load; clean if necessary",
            "interval": 200000,
            "dueMileage": ((mileage // 200000) + 1) * 200000,
            "overdue": mileage % 200000 > 195000,
            "partsNeeded": [],
            "estimatedCost": 450.0,
            "laborTime": 3.0,
        },
        {
            "service": "Brake System Inspection",
            "description": "Measure brake lining thickness, drum/rotor condition, slack adjuster travel",
            "interval": 50000,
            "dueMileage": ((mileage // 50000) + 1) * 50000,
            "overdue": mileage % 50000 > 48000,
            "partsNeeded": [],
            "estimatedCost": 200.0,
            "laborTime": 1.5,
        },
        {
            "service": "Wheel End / Bearing Inspection",
            "description": "Inspect front and rear wheel bearings for play and seal leaks",
            "interval": 100000,
            "dueMileage": ((mileage // 100000) + 1) * 100000,
            "overdue": mileage % 100000 > 98000,
            "partsNeeded": [],
            "estimatedCost": 300.0,
            "laborTime": 2.0,
        },
    ]
    return {
        "vin": vin,
        "currentMileage": mileage,
        "recommendedServices": services,
        "nextServiceDue": min(s["dueMileage"] for s in services),
    }


@app.get("/api/diesel-laptops/fleet-scan")
async def diesel_fleet_scan(
    _: Dict[str, Any] = Depends(get_current_user),
    db_conn: AsyncIOMotorDatabase = Depends(get_db),
) -> Dict[str, Any]:
    trucks = await db_conn.trucks.find({}, {"_id": 0}).to_list(100)
    results = []
    mock_dtcs = [
        {"code": "SPN 102 FMI 2", "description": "Boost Pressure – Data Erratic", "severity": "high"},
        {"code": "P0087", "description": "Fuel Rail Pressure Too Low", "severity": "critical"},
        {"code": "P0420", "description": "Catalyst System Efficiency Below Threshold", "severity": "medium"},
    ]
    for idx, truck in enumerate(trucks):
        active_codes = mock_dtcs[: idx % 4] if idx % 3 != 0 else []
        results.append(
            {
                "unitNumber": truck.get("unitNumber", f"UNIT-{idx + 1}"),
                "vin": truck.get("vin", "1HGCM82633A004352"),
                "make": truck.get("make", "Unknown"),
                "model": truck.get("model", "Unknown"),
                "year": truck.get("year", 2020),
                "mileage": truck.get("mileage", 350000),
                "activeDTCs": active_codes,
                "dtcCount": len(active_codes),
                "status": "critical" if any(c["severity"] == "critical" for c in active_codes)
                else "warning" if active_codes
                else "ok",
                "lastScanned": now_iso(),
            }
        )
    return {
        "scannedAt": now_iso(),
        "totalVehicles": len(results),
        "criticalCount": sum(1 for r in results if r["status"] == "critical"),
        "warningCount": sum(1 for r in results if r["status"] == "warning"),
        "okCount": sum(1 for r in results if r["status"] == "ok"),
        "vehicles": results,
    }
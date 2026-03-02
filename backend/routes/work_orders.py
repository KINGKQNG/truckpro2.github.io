from fastapi import APIRouter, HTTPException, Depends
from typing import List
from motor.motor_asyncio import AsyncIOMotorDatabase
from models.work_order import WorkOrder, WorkOrderCreate
from routes.users import get_current_user
import uuid
from datetime import datetime

router = APIRouter()

@router.post("/work-orders", response_model=WorkOrder)
async def create_work_order(
    work_order: WorkOrderCreate,
    db: AsyncIOMotorDatabase,
    current_user: dict = Depends(get_current_user)
):
    """Create new work order"""
    if current_user["role"] not in ["admin", "service_manager", "technician"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Generate work order number
    count = await db.work_orders.count_documents({})
    wo_number = f"WO-2025-{str(count + 1).zfill(3)}"
    
    wo_dict = work_order.dict()
    wo_dict["id"] = str(uuid.uuid4())
    wo_dict["work_order_number"] = wo_number
    wo_dict["status"] = "pending"
    wo_dict["created_date"] = datetime.now().isoformat()
    wo_dict["created_at"] = datetime.utcnow()
    wo_dict["updated_at"] = datetime.utcnow()
    
    # Calculate estimated cost
    parts_total = sum(p["cost"] * p["quantity"] for p in wo_dict["parts"])
    labor_total = sum(l["cost"] for l in wo_dict["labor"])
    wo_dict["estimated_cost"] = parts_total + labor_total
    wo_dict["actual_cost"] = 0
    
    await db.work_orders.insert_one(wo_dict)
    return WorkOrder(**wo_dict)

@router.get("/work-orders", response_model=List[WorkOrder])
async def get_work_orders(
    status: str = None,
    db: AsyncIOMotorDatabase = None,
    current_user: dict = Depends(get_current_user)
):
    """Get all work orders"""
    query = {}
    if status:
        query["status"] = status
    
    work_orders = await db.work_orders.find(query).to_list(1000)
    return [WorkOrder(**wo) for wo in work_orders]

@router.get("/work-orders/{work_order_id}", response_model=WorkOrder)
async def get_work_order(
    work_order_id: str,
    db: AsyncIOMotorDatabase,
    current_user: dict = Depends(get_current_user)
):
    """Get specific work order"""
    work_order = await db.work_orders.find_one({"id": work_order_id})
    if not work_order:
        raise HTTPException(status_code=404, detail="Work order not found")
    
    return WorkOrder(**work_order)

@router.put("/work-orders/{work_order_id}/status")
async def update_work_order_status(
    work_order_id: str,
    status: str,
    db: AsyncIOMotorDatabase,
    current_user: dict = Depends(get_current_user)
):
    """Update work order status"""
    if current_user["role"] not in ["admin", "service_manager", "technician"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    result = await db.work_orders.update_one(
        {"id": work_order_id},
        {"$set": {"status": status, "updated_at": datetime.utcnow()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Work order not found")
    
    return {"message": "Status updated successfully"}

@router.put("/work-orders/{work_order_id}/approve")
async def approve_work_order(
    work_order_id: str,
    db: AsyncIOMotorDatabase,
    current_user: dict = Depends(get_current_user)
):
    """Approve work order (for fleet managers)"""
    if current_user["role"] not in ["admin", "fleet_manager", "customer"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    result = await db.work_orders.update_one(
        {"id": work_order_id},
        {"$set": {"approval_status": "approved", "updated_at": datetime.utcnow()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Work order not found")
    
    return {"message": "Work order approved"}

@router.delete("/work-orders/{work_order_id}")
async def delete_work_order(
    work_order_id: str,
    db: AsyncIOMotorDatabase,
    current_user: dict = Depends(get_current_user)
):
    """Delete work order"""
    if current_user["role"] not in ["admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    result = await db.work_orders.delete_one({"id": work_order_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Work order not found")
    
    return {"message": "Work order deleted"}

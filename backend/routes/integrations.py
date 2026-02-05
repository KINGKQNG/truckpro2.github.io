from fastapi import APIRouter, HTTPException, Depends
from typing import List
from motor.motor_asyncio import AsyncIOMotorDatabase
from models.integrations import IntegrationConfig, SyncLog
from integrations.sap_integration import SAPIntegration
from integrations.logile_integration import LogileIntegration
from integrations.dos_matrix_integration import DOSMatrixIntegration
from routes.users import get_current_user
import uuid
from datetime import datetime

router = APIRouter()

def get_integration_client(config: dict):
    """Factory to get appropriate integration client"""
    system_type = config["system_type"]
    if system_type == "sap":
        return SAPIntegration(config)
    elif system_type == "logile":
        return LogileIntegration(config)
    elif system_type == "dos_matrix":
        return DOSMatrixIntegration(config)
    else:
        raise ValueError(f"Unknown system type: {system_type}")

@router.post("/integrations", response_model=IntegrationConfig)
async def create_integration(
    config: IntegrationConfig,
    db: AsyncIOMotorDatabase,
    current_user: dict = Depends(get_current_user)
):
    """Create new integration configuration"""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    config_dict = config.dict()
    config_dict["id"] = str(uuid.uuid4())
    config_dict["created_at"] = datetime.utcnow()
    
    await db.integrations.insert_one(config_dict)
    return IntegrationConfig(**config_dict)

@router.get("/integrations", response_model=List[IntegrationConfig])
async def get_integrations(
    db: AsyncIOMotorDatabase,
    current_user: dict = Depends(get_current_user)
):
    """Get all integration configurations"""
    if current_user["role"] not in ["admin", "service_manager"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    integrations = await db.integrations.find().to_list(100)
    return [IntegrationConfig(**i) for i in integrations]

@router.post("/integrations/{integration_id}/test")
async def test_integration(
    integration_id: str,
    db: AsyncIOMotorDatabase,
    current_user: dict = Depends(get_current_user)
):
    """Test integration connection"""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    integration = await db.integrations.find_one({"id": integration_id})
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    
    try:
        client = get_integration_client(integration)
        success = client.test_connection()
        return {"success": success, "message": "Connection successful" if success else "Connection failed"}
    except Exception as e:
        return {"success": False, "message": str(e)}

@router.post("/integrations/{integration_id}/sync")
async def sync_integration(
    integration_id: str,
    sync_type: str,
    db: AsyncIOMotorDatabase,
    current_user: dict = Depends(get_current_user)
):
    """Trigger integration sync"""
    if current_user["role"] not in ["admin", "service_manager"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    integration = await db.integrations.find_one({"id": integration_id})
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    
    sync_log = {
        "id": str(uuid.uuid4()),
        "integration_id": integration_id,
        "sync_type": sync_type,
        "status": "in_progress",
        "records_processed": 0,
        "created_at": datetime.utcnow()
    }
    
    try:
        client = get_integration_client(integration)
        
        if sync_type == "pull_customers" and integration["system_type"] == "sap":
            customers = client.get_customers()
            sync_log["records_processed"] = len(customers)
            sync_log["status"] = "success"
            # Store customers in DB
            for customer in customers:
                await db.customers.update_one(
                    {"sap_id": customer.get("BusinessPartner")},
                    {"$set": customer},
                    upsert=True
                )
        
        elif sync_type == "pull_inventory" and integration["system_type"] == "dos_matrix":
            parts = client.get_all_parts()
            sync_log["records_processed"] = len(parts)
            sync_log["status"] = "success"
            # Update inventory
            for part in parts:
                await db.inventory.update_one(
                    {"part_number": part["part_number"]},
                    {"$set": {
                        "dos_quantity": part["quantity"],
                        "dos_price": part["price"],
                        "dos_synced_at": datetime.utcnow()
                    }}
                )
        
        elif sync_type == "pull_hours" and integration["system_type"] == "logile":
            today = datetime.now().strftime("%Y-%m-%d")
            hours = client.get_all_technician_hours(today)
            sync_log["records_processed"] = len(hours)
            sync_log["status"] = "success"
        
        else:
            sync_log["status"] = "failed"
            sync_log["error_message"] = f"Unsupported sync type: {sync_type}"
        
        # Update last sync time
        await db.integrations.update_one(
            {"id": integration_id},
            {"$set": {"last_sync": datetime.utcnow()}}
        )
        
    except Exception as e:
        sync_log["status"] = "failed"
        sync_log["error_message"] = str(e)
    
    # Save sync log
    await db.sync_logs.insert_one(sync_log)
    
    return sync_log

@router.get("/integrations/{integration_id}/logs", response_model=List[SyncLog])
async def get_sync_logs(
    integration_id: str,
    db: AsyncIOMotorDatabase,
    current_user: dict = Depends(get_current_user)
):
    """Get sync logs for an integration"""
    if current_user["role"] not in ["admin", "service_manager"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    logs = await db.sync_logs.find({"integration_id": integration_id}).sort("created_at", -1).limit(50).to_list(50)
    return [SyncLog(**log) for log in logs]

@router.delete("/integrations/{integration_id}")
async def delete_integration(
    integration_id: str,
    db: AsyncIOMotorDatabase,
    current_user: dict = Depends(get_current_user)
):
    """Delete integration configuration"""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    result = await db.integrations.delete_one({"id": integration_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Integration not found")
    
    return {"message": "Integration deleted successfully"}

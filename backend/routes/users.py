from fastapi import APIRouter, HTTPException, Depends, Header
from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from models.user import User, UserCreate, UserUpdate, UserLogin, UserResponse, TilePermission
from utils.auth import get_password_hash, verify_password, create_access_token, decode_access_token
import uuid

router = APIRouter()

# Default tiles for each role
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
        {"tile_id": "integrations", "tile_name": "Integrations", "enabled": True, "order": 9}
    ],
    "service_manager": [
        {"tile_id": "dashboard", "tile_name": "Dashboard", "enabled": True, "order": 1},
        {"tile_id": "work_orders", "tile_name": "Work Orders", "enabled": True, "order": 2},
        {"tile_id": "technicians", "tile_name": "Technicians", "enabled": True, "order": 3},
        {"tile_id": "customers", "tile_name": "Customers", "enabled": True, "order": 4},
        {"tile_id": "inventory", "tile_name": "Inventory", "enabled": True, "order": 5},
        {"tile_id": "payments", "tile_name": "Payments", "enabled": True, "order": 6},
        {"tile_id": "reports", "tile_name": "Reports", "enabled": True, "order": 7}
    ],
    "technician": [
        {"tile_id": "dashboard", "tile_name": "Dashboard", "enabled": True, "order": 1},
        {"tile_id": "work_orders", "tile_name": "Work Orders", "enabled": True, "order": 2}
    ],
    "fleet_manager": [
        {"tile_id": "dashboard", "tile_name": "Dashboard", "enabled": True, "order": 1},
        {"tile_id": "approvals", "tile_name": "Fleet Approvals", "enabled": True, "order": 2}
    ]
}

async def get_current_user(authorization: Optional[str] = Header(None), db: AsyncIOMotorDatabase = None):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = await db.users.find_one({"email": payload.get("sub")})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

@router.post("/auth/login")
async def login(user_login: UserLogin, db: AsyncIOMotorDatabase):
    user = await db.users.find_one({"email": user_login.email})
    
    if not user or not verify_password(user_login.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="User account is disabled")
    
    access_token = create_access_token(data={"sub": user["email"], "role": user["role"]})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "role": user["role"],
            "tiles": user.get("tiles", [])
        }
    }

@router.post("/users", response_model=UserResponse)
async def create_user(user: UserCreate, db: AsyncIOMotorDatabase, current_user: dict = Depends(get_current_user)):
    # Only admin can create users
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Create user with hashed password and default tiles
    user_dict = user.dict()
    user_dict["id"] = str(uuid.uuid4())
    user_dict["password_hash"] = get_password_hash(user_dict.pop("password"))
    user_dict["tiles"] = DEFAULT_TILES.get(user.role, [])
    user_dict["is_active"] = True
    
    await db.users.insert_one(user_dict)
    
    return UserResponse(**user_dict)

@router.get("/users", response_model=List[UserResponse])
async def get_users(db: AsyncIOMotorDatabase, current_user: dict = Depends(get_current_user)):
    # Only admin can view all users
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    users = await db.users.find().to_list(1000)
    return [UserResponse(**user) for user in users]

@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, db: AsyncIOMotorDatabase, current_user: dict = Depends(get_current_user)):
    # Admin can view any user, others only themselves
    if current_user["role"] != "admin" and current_user["id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserResponse(**user)

@router.put("/users/{user_id}/tiles", response_model=UserResponse)
async def update_user_tiles(
    user_id: str, 
    tiles: List[TilePermission], 
    db: AsyncIOMotorDatabase,
    current_user: dict = Depends(get_current_user)
):
    # Only admin can update user tiles
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update tiles
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"tiles": [t.dict() for t in tiles]}}
    )
    
    updated_user = await db.users.find_one({"id": user_id})
    return UserResponse(**updated_user)

@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_update: UserUpdate,
    db: AsyncIOMotorDatabase,
    current_user: dict = Depends(get_current_user)
):
    # Only admin can update users
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update user
    update_data = {k: v for k, v in user_update.dict().items() if v is not None}
    if update_data:
        await db.users.update_one({"id": user_id}, {"$set": update_data})
    
    updated_user = await db.users.find_one({"id": user_id})
    return UserResponse(**updated_user)

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    db: AsyncIOMotorDatabase,
    current_user: dict = Depends(get_current_user)
):
    # Only admin can delete users
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    result = await db.users.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User deleted successfully"}

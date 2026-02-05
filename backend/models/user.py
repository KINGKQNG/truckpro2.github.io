from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class TilePermission(BaseModel):
    tile_id: str
    tile_name: str
    enabled: bool = True
    order: int = 0

class User(BaseModel):
    id: Optional[str] = None
    email: EmailStr
    name: str
    role: str
    password_hash: str
    phone: Optional[str] = None
    tiles: List[TilePermission] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    role: str
    password: str
    phone: Optional[str] = None

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    role: Optional[str] = None
    phone: Optional[str] = None
    tiles: Optional[List[TilePermission]] = None
    is_active: Optional[bool] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    phone: Optional[str] = None
    tiles: List[TilePermission]
    is_active: bool

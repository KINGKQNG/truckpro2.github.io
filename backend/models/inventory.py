from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class InventoryItem(BaseModel):
    id: Optional[str] = None
    part_number: str
    name: str
    category: str
    quantity: int
    par_level: int
    reorder_point: int
    unit_cost: float
    supplier: str
    location: str
    status: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class InventoryUpdate(BaseModel):
    quantity: Optional[int] = None
    par_level: Optional[int] = None
    reorder_point: Optional[int] = None
    unit_cost: Optional[float] = None
    supplier: Optional[str] = None
    location: Optional[str] = None

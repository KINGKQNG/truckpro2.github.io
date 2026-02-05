from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class Part(BaseModel):
    name: str
    part_number: str
    quantity: int
    cost: float

class Labor(BaseModel):
    description: str
    hours: float
    rate: float
    cost: float

class WorkOrder(BaseModel):
    id: Optional[str] = None
    work_order_number: str
    customer_id: str
    customer_name: str
    truck_id: str
    truck: str
    status: str
    priority: str
    description: str
    scheduled_date: str
    assigned_tech: str
    estimated_cost: float
    actual_cost: float = 0
    created_date: str
    completed_date: Optional[str] = None
    approval_status: str = "pending"
    payment_status: Optional[str] = None
    parts: List[Part] = []
    labor: List[Labor] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class WorkOrderCreate(BaseModel):
    customer_id: str
    truck_id: str
    description: str
    scheduled_date: str
    priority: str = "medium"
    parts: List[Part] = []
    labor: List[Labor] = []

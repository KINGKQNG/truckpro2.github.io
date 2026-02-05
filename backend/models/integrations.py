from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class IntegrationConfig(BaseModel):
    id: Optional[str] = None
    system_type: str  # 'sap', 'logile', 'dos_matrix'
    name: str
    endpoint_url: str
    username: Optional[str] = None
    password: Optional[str] = None
    api_key: Optional[str] = None
    connection_params: Dict[str, Any] = {}
    is_active: bool = True
    last_sync: Optional[datetime] = None
    created_at: datetime = datetime.utcnow()

class SyncLog(BaseModel):
    id: Optional[str] = None
    integration_id: str
    sync_type: str  # 'pull', 'push'
    status: str  # 'success', 'failed', 'partial'
    records_processed: int = 0
    error_message: Optional[str] = None
    created_at: datetime = datetime.utcnow()

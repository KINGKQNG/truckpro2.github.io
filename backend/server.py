from fastapi import FastAPI, APIRouter, Request
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
import sys

# Add routes directory to path
sys.path.insert(0, str(Path(__file__).parent))

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(title="TruckService Pro API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Import routes
from routes import users, integrations

# Dependency to inject database
async def get_database():
    return db

# Add database to request state
@app.middleware("http")
async def add_db_to_request(request: Request, call_next):
    request.state.db = db
    response = await call_next(request)
    return response

# Root endpoint
@api_router.get("/")
async def root():
    return {
        "message": "TruckService Pro API",
        "version": "1.0.0",
        "endpoints": {
            "auth": "/api/auth/login",
            "users": "/api/users",
            "integrations": "/api/integrations"
        }
    }

# Include routers with database dependency injection
def create_router_with_db(router, prefix=""):
    new_router = APIRouter(prefix=prefix)
    for route in router.routes:
        # Inject database into route dependencies
        route.dependencies = route.dependencies or []
        new_router.routes.append(route)
    return new_router

# Add routes with database injection
@api_router.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"], include_in_schema=False)
async def catch_all(request: Request, path: str):
    # This allows routes to access db via request.state.db
    if path.startswith("auth/") or path.startswith("users"):
        return await users.router.handle(request)
    elif path.startswith("integrations"):
        return await integrations.router.handle(request)
    return JSONResponse({"detail": "Not found"}, status_code=404)

# Include the user routes
for route in users.router.routes:
    original_endpoint = route.endpoint
    async def wrapped_endpoint(*args, **kwargs):
        if 'db' not in kwargs:
            from fastapi import Request
            for arg in args:
                if isinstance(arg, Request):
                    kwargs['db'] = arg.state.db
                    break
        return await original_endpoint(*args, **kwargs)
    route.endpoint = wrapped_endpoint
api_router.include_router(users.router, tags=["users"])

# Include the integration routes  
for route in integrations.router.routes:
    original_endpoint = route.endpoint
    async def wrapped_endpoint(*args, **kwargs):
        if 'db' not in kwargs:
            from fastapi import Request
            for arg in args:
                if isinstance(arg, Request):
                    kwargs['db'] = arg.state.db
                    break
        return await original_endpoint(*args, **kwargs)
    route.endpoint = wrapped_endpoint
api_router.include_router(integrations.router, tags=["integrations"])

# Include the main router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_db_client():
    """Initialize database with demo data if empty"""
    # Check if users collection exists
    users_count = await db.users.count_documents({})
    if users_count == 0:
        logger.info("Initializing database with demo users...")
        from utils.auth import get_password_hash
        import uuid
        
        demo_users = [
            {
                "id": str(uuid.uuid4()),
                "email": "admin@truckservice.com",
                "name": "Admin User",
                "role": "admin",
                "password_hash": get_password_hash("admin123"),
                "tiles": [
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
                "is_active": True
            }
        ]
        await db.users.insert_many(demo_users)
        logger.info("Demo users created")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
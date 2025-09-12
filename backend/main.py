from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import upload
from routes.manage import delete
from routes.preview import preview
from routes.videos import latest, random, search
from utils.logging_config import get_logger

# Initialize logger for main application
logger = get_logger("main")

app = FastAPI(
    title="Sonic MD Backend",
    description="Backend API for Sonic MD video management system",
    version="1.0.0"
)

# Log application startup
logger.info("Starting Sonic MD Backend application")

origins = ["http://localhost", "http://localhost:5173", "https://sonicmd.vercel.app"]
logger.info(f"Configuring CORS with origins: {origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with logging
logger.info("Registering API routes")

app.include_router(upload.router, prefix="/api")
logger.debug("Registered upload router at /api")

app.include_router(delete.router, prefix="/api")
logger.debug("Registered delete router at /api")

# Routes that return video elements
app.include_router(preview.router, prefix="/api")
logger.debug("Registered preview router at /api")

app.include_router(random.router, prefix="/api/videos")
logger.debug("Registered random videos router at /api/videos")

app.include_router(latest.router, prefix="/api/videos")
logger.debug("Registered latest videos router at /api/videos")

app.include_router(search.router, prefix="/api/videos")
logger.debug("Registered search videos router at /api/videos")

logger.info("Application startup completed successfully")


@app.on_event("startup")
async def startup_event():
    """Log application startup event."""
    logger.info("FastAPI application startup event triggered")


@app.on_event("shutdown")
async def shutdown_event():
    """Log application shutdown event."""
    logger.info("FastAPI application shutdown event triggered")

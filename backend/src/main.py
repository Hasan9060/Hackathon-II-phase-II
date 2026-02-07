"""
Main FastAPI application for Backend Task Service.

Entry point for the Todo task management API with JWT authentication.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.config import settings
from src.database import init_db
from src.middleware.jwt import jwt_auth_middleware
from src.routes.tasks import router as tasks_router
from src.routes.me_tasks import router as me_tasks_router
from src.routes.auth import router as auth_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.

    Handles startup and shutdown events.
    """
    # Startup: Initialize database
    init_db()
    yield
    # Shutdown: Cleanup (if needed)


# Create FastAPI application with JWT security scheme
app = FastAPI(
    title="Backend Task Service",
    description="RESTful API for Todo task management with JWT authentication",
    version="2.0.0",
    lifespan=lifespan,
    # OpenAPI security scheme for JWT authentication
    security=[{"BearerAuth": []}],
    # OpenAPI components configuration
    openapi_tags=[
        {"name": "tasks", "description": "Task management endpoints"}
    ],
)

# Configure OpenAPI security scheme component
app.openapi_schema = {
    "openapi": "3.1.0",
    "info": {
        "title": "Backend Task Service",
        "version": "2.0.0",
        "description": "RESTful API for Todo task management with JWT authentication"
    },
    "components": {
        "securitySchemes": {
            "BearerAuth": {
                "type": "http",
                "scheme": "bearer",
                "bearerFormat": "JWT",
                "description": "JWT token issued by Better Auth. Include as 'Bearer <token>' in Authorization header."
            }
        }
    },
    "security": [{"BearerAuth": []}],
    "paths": {},
    "tags": [
        {"name": "tasks", "description": "Task management endpoints"}
    ]
}


# Register JWT authentication middleware
# This must be registered before routes to intercept all requests
app.middleware("http")(jwt_auth_middleware)


# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(me_tasks_router)
app.include_router(tasks_router)
app.include_router(auth_router)


@app.get("/")
def read_root():
    """Root endpoint with API information."""
    return {
        "name": "Backend Task Service",
        "version": "2.0.0",
        "description": "Todo task management API with JWT authentication",
        "docs": "/docs",
    }


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

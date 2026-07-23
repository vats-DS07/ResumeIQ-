import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler

from app.config import settings
from app.limiter import limiter
from app.database import engine, Base
from app.routers import auth, resumes, analysis, users, dashboard

# 1. Database table creation on startup via lifespan
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure tables are created
    Base.metadata.create_all(bind=engine)
    # Ensure upload directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    yield

# 2. Instantiate FastAPI
app = FastAPI(
    title="ResumeIQ API",
    description="SaaS backend for premium AI-powered resume analysis and ATS compatibility checking",
    version="1.0.0",
    lifespan=lifespan
)

# 3. Rate Limiter Configuration
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Custom handler to return structured JSON response for rate limits
@app.exception_handler(RateLimitExceeded)
async def custom_rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": "Too many requests. Please slow down and try again later."}
    )

# 4. CORS Middleware Setup
# Restricted to the Vite development origin, supporting credentials for HttpOnly cookies
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",

        "https://resume-br9oqtksk-vats-ds07s-projects.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 5. Serve Uploaded Resumes static directory
# Allows access to raw uploaded resume files if needed by administrators or frontend previews
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# 6. Register Router endpoints
app.include_router(auth.router)
app.include_router(resumes.router)
app.include_router(analysis.router)
app.include_router(users.router)
app.include_router(dashboard.router)

# Healthcheck endpoint
@app.get("/api/health")
def healthcheck():
    return {"status": "healthy", "service": "ResumeIQ SaaS API"}

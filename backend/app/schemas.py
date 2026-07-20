from pydantic import BaseModel, EmailStr, Field
from typing import List, Dict, Optional, Any
from datetime import datetime

# --- AUTH SCHEMAS ---
class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

# --- USER SCHEMAS ---
class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    target_role: Optional[str] = None
    bio: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    target_role: Optional[str] = None
    bio: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None

class PasswordUpdate(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=6, max_length=100)

class UserStatsResponse(BaseModel):
    total_analyzed: int
    average_score: int
    best_score: int
    member_since: datetime

# --- RESUME SCHEMAS ---
class ResumeResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    guest_session_id: Optional[str] = None
    filename: str
    file_path: str
    page_count: int
    uploaded_at: datetime
    ats_score: Optional[int] = None
    analysis_id: Optional[int] = None

    class Config:
        from_attributes = True

# --- ANALYSIS SCHEMAS ---
class SuggestionSchema(BaseModel):
    category: str
    issue: str
    suggestion: str
    before: str
    after: str

class RecommendedRoleSchema(BaseModel):
    role: str
    match_percentage: int
    reason: str

class AnalysisResponse(BaseModel):
    id: int
    resume_id: int
    status: str
    ats_score: Optional[int] = None
    sub_scores: Optional[Dict[str, int]] = None
    summary: Optional[str] = None
    extracted_skills: Optional[List[str]] = None
    missing_skills: Optional[List[str]] = None
    suggestions: Optional[List[SuggestionSchema]] = None
    recommended_roles: Optional[List[RecommendedRoleSchema]] = None
    job_description: Optional[str] = None
    jd_match_score: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True

class AnalysisRunRequest(BaseModel):
    resume_id: int
    job_description: Optional[str] = None

class AnalysisStatusResponse(BaseModel):
    id: int
    resume_id: int
    status: str
    ats_score: Optional[int] = None

# --- DASHBOARD SCHEMAS ---
class DashboardSummaryResponse(BaseModel):
    average_score: int
    score_change_delta: int  # change compared to previous analysis
    total_resumes: int
    score_trend: List[Dict[str, Any]]  # lists of {"date": str, "score": int}
    top_skills: List[Dict[str, Any]]   # lists of {"text": str, "value": int} for wordcloud
    top_missing_skills: List[Dict[str, Any]]
    recommended_roles: List[Dict[str, Any]]
    recent_analyses: List[Dict[str, Any]]
    tips: List[str]

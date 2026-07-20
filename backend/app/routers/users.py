import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Resume, Analysis
from ..schemas import UserResponse, UserUpdate, PasswordUpdate, UserStatsResponse
from ..services.auth_service import AuthService
from .auth import get_current_user

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.get("/me", response_model=UserResponse)
def get_me(user: User = Depends(get_current_user)):
    """
    Returns details of the currently logged-in user.
    """
    return user

@router.put("/me", response_model=UserResponse)
def update_profile(
    profile_data: UserUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    Updates profile fields (name, target_role, bio, preferences).
    """
    if profile_data.name is not None:
        user.name = profile_data.name
    if profile_data.target_role is not None:
        user.target_role = profile_data.target_role
    if profile_data.bio is not None:
        user.bio = profile_data.bio
    if profile_data.preferences is not None:
        # Merge dicts to retain existing key-values
        current_prefs = user.preferences or {}
        user.preferences = {**current_prefs, **profile_data.preferences}

    db.commit()
    db.refresh(user)
    return user

@router.put("/me/password", status_code=status.HTTP_200_OK)
def update_password(
    password_data: PasswordUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    Changes user's password. Requires verifying old password.
    """
    # 1. Verify old password
    if not AuthService.verify_password(password_data.old_password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect old password."
        )

    # 2. Hash and update with new password
    user.password_hash = AuthService.get_password_hash(password_data.new_password)
    db.commit()
    return {"message": "Password updated successfully"}

@router.delete("/me", status_code=status.HTTP_200_OK)
def delete_account(
    response: Response,
    request: Request,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    Soft-deletes user account, anonymizes sensitive details, and clears cookies.
    """
    # Anonymize email to free it up for re-registration and protect privacy
    user.email = f"deleted_{uuid.uuid4()}@resumeiq.deleted"
    user.name = "Deleted User"
    user.bio = None
    user.target_role = None
    user.is_deleted = True
    
    db.commit()

    # Clear HttpOnly authorization cookies
    response.delete_cookie(key="access_token")
    response.delete_cookie(key="refresh_token")

    return {"message": "Account successfully deleted"}

@router.get("/me/stats", response_model=UserStatsResponse)
def get_user_stats(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    Aggregates profile stats: total resumes analyzed, average scores, and best score.
    """
    # Get all resumes owned by the user
    user_resumes = db.query(Resume.id).filter(Resume.user_id == user.id).subquery()
    
    # Query all completed analyses linked to those resumes
    completed_analyses = db.query(Analysis.ats_score).filter(
        Analysis.resume_id.in_(user_resumes),
        Analysis.status == "COMPLETED"
    ).all()

    total_analyzed = len(completed_analyses)
    scores = [a.ats_score for a in completed_analyses if a.ats_score is not None]
    
    avg_score = round(sum(scores) / len(scores)) if scores else 0
    best_score = max(scores, default=0)

    return UserStatsResponse(
        total_analyzed=total_analyzed,
        average_score=avg_score,
        best_score=best_score,
        member_since=user.created_at
    )

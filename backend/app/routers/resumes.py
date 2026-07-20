import os
import uuid
import logging
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Request, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Resume, User
from ..schemas import ResumeResponse
from ..services.parsing_service import ParsingService
from ..config import settings
from .auth import get_current_user

logger = logging.getLogger("resumeiq.resumes")

router = APIRouter(prefix="/api/resumes", tags=["Resumes"])

def get_current_user_optional(request: Request, db: Session = Depends(get_db)) -> Optional[User]:
    """
    Optional dependency to fetch user if authenticated, returns None otherwise.
    """
    try:
        return get_current_user(request, db)
    except HTTPException as e:
        if e.status_code == status.HTTP_401_UNAUTHORIZED:
            return None
        raise e

@router.post("/upload", response_model=ResumeResponse)
async def upload_resume(
    request: Request,
    file: UploadFile = File(...),
    guest_session_id: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Uploads a resume file (PDF/DOCX), parses its text, and saves it.
    Supports authenticated users and guest users via guest_session_id.
    """
    # 1. Validate File Size (Max 5MB)
    MAX_SIZE = 5 * 1024 * 1024  # 5MB
    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds the 5MB limit."
        )
    
    # Reset read pointer after size validation
    await file.seek(0)
    
    # 2. Validate File Type / Extension
    filename = file.filename or ""
    ext = os.path.splitext(filename.lower())[1]
    if ext not in [".pdf", ".docx", ".doc"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type: {ext}. Only PDF and DOCX/DOC files are allowed."
        )
        
    # 3. Parse Resume Text
    try:
        parsed_data = ParsingService.parse_resume(filename, content)
    except Exception as e:
        logger.error(f"Error parsing uploaded file {filename}: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unable to read or parse the resume file: {str(e)}"
        )
        
    # 4. Save file to disk with unique name to prevent collisions
    unique_filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    
    try:
        with open(file_path, "wb") as f:
            f.write(content)
    except Exception as e:
        logger.error(f"Failed to save file to disk: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save uploaded file on server."
        )
        
    # 5. Determine association
    user_id = user.id if user else None
    
    # If not authenticated, ensure we have a guest session id
    effective_guest_id = None
    if not user:
        effective_guest_id = guest_session_id or request.cookies.get("guest_session_id")
        if not effective_guest_id:
            # Generate one if not provided
            effective_guest_id = str(uuid.uuid4())

    # Create Resume DB Record
    db_resume = Resume(
        user_id=user_id,
        guest_session_id=effective_guest_id,
        filename=filename,
        file_path=file_path,
        raw_text=parsed_data["raw_text"],
        page_count=parsed_data["page_count"]
    )
    
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)
    
    return db_resume

@router.get("", response_model=List[ResumeResponse])
def list_resumes(
    request: Request,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    guest_session_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_current_user_optional)
):
    """
    List resumes for the current authenticated user, or the current guest session.
    """
    query = db.query(Resume)
    if user:
        query = query.filter(Resume.user_id == user.id)
    else:
        # Check guest session id in query or cookie
        effective_guest_id = guest_session_id or request.cookies.get("guest_session_id")
        if not effective_guest_id:
            return []
        query = query.filter(Resume.guest_session_id == effective_guest_id)
        
    resumes = query.order_by(Resume.uploaded_at.desc()).offset(skip).limit(limit).all()
    for r in resumes:
        completed = [a for a in r.analyses if a.status == "COMPLETED"]
        if completed:
            latest = max(completed, key=lambda a: a.created_at)
            r.ats_score = latest.ats_score
            r.analysis_id = latest.id
    return resumes

@router.get("/{resume_id}", response_model=ResumeResponse)
def get_resume(
    resume_id: int,
    request: Request,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Get details of a specific resume. Validates ownership.
    """
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found."
        )
        
    # Check ownership
    if user:
        if resume.user_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resume."
            )
    else:
        effective_guest_id = request.cookies.get("guest_session_id")
        if not effective_guest_id or resume.guest_session_id != effective_guest_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resume."
            )
            
    completed = [a for a in resume.analyses if a.status == "COMPLETED"]
    if completed:
        latest = max(completed, key=lambda a: a.created_at)
        resume.ats_score = latest.ats_score
        resume.analysis_id = latest.id
        
    return resume

@router.delete("/{resume_id}", status_code=status.HTTP_200_OK)
def delete_resume(
    resume_id: int,
    request: Request,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Hard delete a resume, its file on disk, and cascade delete its analyses.
    """
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found."
        )
        
    # Check ownership
    if user:
        if resume.user_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to delete this resume."
            )
    else:
        effective_guest_id = request.cookies.get("guest_session_id")
        if not effective_guest_id or resume.guest_session_id != effective_guest_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to delete this resume."
            )
            
    # Delete from disk
    if os.path.exists(resume.file_path):
        try:
            os.remove(resume.file_path)
        except Exception as e:
            logger.error(f"Error removing resume file from disk ({resume.file_path}): {e}")
            
    # Delete from DB (associated analyses cascade deleted via SQLAlchemy configuration)
    db.delete(resume)
    db.commit()
    
    return {"message": "Resume deleted successfully"}

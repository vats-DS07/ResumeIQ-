from datetime import timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Resume
from ..schemas import UserCreate, UserLogin, UserResponse, TokenResponse
from ..services.auth_service import AuthService
from ..config import settings
from ..limiter import limiter

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

def claim_guest_resumes(guest_session_id: str, user_id: int, db: Session, response: Response):
    """
    Claims all guest resumes for the new user_id and clears the guest session cookie.
    """
    if not guest_session_id:
        return
    # Update resumes belonging to guest session
    db.query(Resume).filter(Resume.guest_session_id == guest_session_id).update(
        {Resume.user_id: user_id, Resume.guest_session_id: None},
        synchronize_session=False
    )
    db.commit()
    # Clear the guest session cookie if set
    response.delete_cookie(key="guest_session_id")

def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    """
    Dependency to fetch the authenticated user.
    Supports both httpOnly cookies (preferred) and Bearer auth header.
    """
    # 1. Try cookie
    token = request.cookies.get("access_token")
    
    # 2. Try Authorization header if cookie not found
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided."
        )
        
    payload = AuthService.verify_token(token, expected_type="access")
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token."
        )
        
    email = payload.get("sub")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload is invalid."
        )
        
    user = db.query(User).filter(User.email == email, User.is_deleted == False).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or account is deactivated."
        )
    return user

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(
    user_data: UserCreate, 
    request: Request,
    response: Response,
    guest_session_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Creates a new user.
    """
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        if existing_user.is_deleted:
            # Reactivate deleted user
            existing_user.is_deleted = False
            existing_user.name = user_data.name
            existing_user.password_hash = AuthService.get_password_hash(user_data.password)
            db.commit()
            db.refresh(existing_user)
            
            # Claim guest resumes if present
            effective_guest_id = guest_session_id or request.cookies.get("guest_session_id")
            if effective_guest_id:
                claim_guest_resumes(effective_guest_id, existing_user.id, db, response)
                
            return existing_user
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )
        
    password_hash = AuthService.get_password_hash(user_data.password)
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=password_hash,
        preferences={"theme": "light"}
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Claim guest resumes if present
    effective_guest_id = guest_session_id or request.cookies.get("guest_session_id")
    if effective_guest_id:
        claim_guest_resumes(effective_guest_id, new_user.id, db, response)
        
    return new_user

@router.post("/login")
@limiter.limit("10/minute")
def login(
    request: Request,
    login_data: UserLogin, 
    response: Response, 
    guest_session_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Authenticates a user and sets HTTP-only cookies.
    """
    user = db.query(User).filter(User.email == login_data.email, User.is_deleted == False).first()
    if not user or not AuthService.verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )
        
    # Generate tokens
    access_token = AuthService.create_access_token(data={"sub": user.email})
    refresh_token = AuthService.create_refresh_token(data={"sub": user.email})
    
    # Set cookies
    # Access token cookie (HTTP-only)
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        expires=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=False  # Set to True in production with HTTPS
    )
    # Refresh token cookie (HTTP-only)
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600,
        expires=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600,
        samesite="lax",
        secure=False  # Set to True in production
    )
    
    # Claim guest resumes if present
    effective_guest_id = guest_session_id or request.cookies.get("guest_session_id")
    if effective_guest_id:
        claim_guest_resumes(effective_guest_id, user.id, db, response)
        
    return {
        "message": "Login successful",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "target_role": user.target_role,
            "bio": user.bio,
            "preferences": user.preferences
        },
        "access_token": access_token  # Also return access token in body in case clients want to store it in memory
    }

@router.post("/logout")
def logout(response: Response):
    """
    Clears HTTP-only cookies.
    """
    response.delete_cookie(key="access_token")
    response.delete_cookie(key="refresh_token")
    return {"message": "Logout successful"}

@router.post("/refresh")
def refresh(request: Request, response: Response, db: Session = Depends(get_db)):
    """
    Refreshes access token using refresh token from cookies.
    """
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        # Fallback to authorization header if custom client
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            refresh_token = auth_header.split(" ")[1]

    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token is missing."
        )
        
    payload = AuthService.verify_token(refresh_token, expected_type="refresh")
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token."
        )
        
    email = payload.get("sub")
    user = db.query(User).filter(User.email == email, User.is_deleted == False).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or account is deactivated."
        )
        
    # Generate new access token
    new_access_token = AuthService.create_access_token(data={"sub": user.email})
    
    response.set_cookie(
        key="access_token",
        value=new_access_token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        expires=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=False
    )
    
    return {
        "message": "Token refreshed successfully",
        "access_token": new_access_token
    }

@router.get("/me", response_model=UserResponse)
def get_me(user: User = Depends(get_current_user)):
    """
    Returns currently authenticated user.
    """
    return user

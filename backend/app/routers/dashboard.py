from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from collections import Counter
from ..database import get_db
from ..models import Resume, Analysis, User
from ..schemas import DashboardSummaryResponse
from .auth import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    Fetches statistical summary for the user's dashboard.
    Aggregates scores, skills, trends, and recent resume activity.
    """
    # 1. Fetch user's resumes
    resumes = db.query(Resume).filter(Resume.user_id == user.id).all()
    resume_ids = [r.id for r in resumes]
    total_resumes = len(resumes)

    default_tips = [
        "Upload your first resume to see your ATS score and get optimization feedback.",
        "Make sure your resume contains clear headings like 'Work Experience' and 'Education'.",
        "Using action verbs like 'Led', 'Managed', 'Developed' boosts your readability score.",
        "Tailor your resume by pasting a Job Description when analyzing to see your match score.",
        "Keep your formatting simple: standard fonts and list bullet points are preferred by ATS parsers."
    ]

    # Return clean empty state if no resumes or analyses exist
    if not resume_ids:
        return DashboardSummaryResponse(
            average_score=0,
            score_change_delta=0,
            total_resumes=0,
            score_trend=[],
            top_skills=[],
            top_missing_skills=[],
            recommended_roles=[],
            recent_analyses=[],
            tips=default_tips
        )

    # 2. Fetch completed analyses
    analyses = db.query(Analysis).filter(
        Analysis.resume_id.in_(resume_ids),
        Analysis.status == "COMPLETED"
    ).order_by(Analysis.created_at.desc()).all()

    if not analyses:
        return DashboardSummaryResponse(
            average_score=0,
            score_change_delta=0,
            total_resumes=total_resumes,
            score_trend=[],
            top_skills=[],
            top_missing_skills=[],
            recommended_roles=[],
            recent_analyses=[],
            tips=default_tips
        )

    # 3. Calculate average score
    scores = [a.ats_score for a in analyses if a.ats_score is not None]
    average_score = round(sum(scores) / len(scores)) if scores else 0

    # 4. Calculate score change delta (latest - second latest)
    score_change_delta = 0
    if len(scores) >= 2:
        score_change_delta = scores[0] - scores[1]

    # 5. Compile chronological score trend (up to last 10 analyses)
    trend_analyses = analyses[:10]
    score_trend = [
        {
            "date": a.created_at.strftime("%Y-%m-%d"),
            "score": a.ats_score
        }
        for a in reversed(trend_analyses)
    ]

    # 6. Aggregate top extracted & missing skills across all runs
    skills_counter = Counter()
    missing_skills_counter = Counter()
    for a in analyses:
        if a.extracted_skills:
            skills_counter.update(a.extracted_skills)
        if a.missing_skills:
            missing_skills_counter.update(a.missing_skills)

    # Convert to format required for tags / word cloud visualization
    top_skills = [{"text": s, "value": count} for s, count in skills_counter.most_common(15)]
    top_missing_skills = [{"text": s, "value": count} for s, count in missing_skills_counter.most_common(15)]

    # 7. Extract recommended roles from the latest analysis run
    recommended_roles = []
    if analyses[0].recommended_roles:
        recommended_roles = analyses[0].recommended_roles

    # 8. Fetch detailed recent analysis list (up to 5)
    recent_analyses = []
    for a in analyses[:5]:
        res = next((r for r in resumes if r.id == a.resume_id), None)
        filename = res.filename if res else "Unknown Resume"
        recent_analyses.append({
            "id": a.id,
            "resume_id": a.resume_id,
            "filename": filename,
            "ats_score": a.ats_score,
            "status": a.status,
            "created_at": a.created_at.isoformat()
        })

    # Tips list
    tips = [
        "Include metrics to prove impact (e.g., 'saved $5k' or 'reduced latency by 20%').",
        "Keywords are case-insensitive, but ensure they appear naturally in your experience descriptions.",
        "A single-page resume is optimal for candidates with less than 5 years of experience.",
        "Clean structure with headers like 'Professional Experience' makes it easy for ATS parsers to parse.",
        "Your average score is improving! Keep aligning your resume description with your target roles.",
        "Missing skills? Try taking short courses or working on side projects to fill those gaps."
    ]

    return DashboardSummaryResponse(
        average_score=average_score,
        score_change_delta=score_change_delta,
        total_resumes=total_resumes,
        score_trend=score_trend,
        top_skills=top_skills,
        top_missing_skills=top_missing_skills,
        recommended_roles=recommended_roles,
        recent_analyses=recent_analyses,
        tips=tips
    )

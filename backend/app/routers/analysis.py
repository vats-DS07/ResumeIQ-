import io
import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Resume, Analysis, User
from ..schemas import AnalysisResponse, AnalysisRunRequest, AnalysisStatusResponse
from ..services.ai_service import AIService
from ..services.scoring_service import ScoringService
from .auth import get_current_user
from ..limiter import limiter

# ReportLab imports for PDF generation
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

logger = logging.getLogger("resumeiq.analysis")

router = APIRouter(prefix="/api/analysis", tags=["Analysis"])
ai_service = AIService()

def get_current_user_optional(request: Request, db: Session = Depends(get_db)) -> Optional[User]:
    try:
        return get_current_user(request, db)
    except Exception:
        return None

def run_async_analysis(analysis_id: int, resume_id: int, target_role: Optional[str], job_description: Optional[str], db_session_factory):
    """
    Background task to execute AI resume parsing and ATS scoring,
    and persist the results to SQLite.
    """
    db: Session = db_session_factory()
    try:
        analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
        resume = db.query(Resume).filter(Resume.id == resume_id).first()
        if not analysis or not resume:
            logger.error(f"Async analysis error: Analysis {analysis_id} or Resume {resume_id} not found.")
            return

        # Update status to PROCESSING
        analysis.status = "PROCESSING"
        db.commit()

        # 1. Run AI qualitative analysis (Gemini API)
        try:
            ai_result = ai_service.analyze_resume(
                resume_text=resume.raw_text,
                target_role=target_role,
                job_description=job_description
            )
        except Exception as e:
            logger.error(f"Gemini AI parsing failed for Analysis {analysis_id}: {e}")
            raise e

        # 2. Extract and format values safely for JSON schema
        extracted_skills = ai_result.extracted_skills or []
        missing_skills = ai_result.missing_skills or []
        
        # Pydantic schema model conversion helper
        def to_dict(obj):
            if hasattr(obj, "model_dump"):
                return obj.model_dump()
            return obj.dict()

        suggestions_dict_list = [to_dict(s) for s in ai_result.suggestions] if ai_result.suggestions else []
        roles_dict_list = [to_dict(r) for r in ai_result.recommended_roles] if ai_result.recommended_roles else []

        # 3. Compute Deterministic & Hybrid scores
        final_score, sub_scores = ScoringService.calculate_hybrid_score(
            raw_text=resume.raw_text,
            page_count=resume.page_count,
            extracted_skills=extracted_skills,
            missing_skills=missing_skills,
            ai_score=ai_result.ai_score,
            job_description=job_description
        )

        # 4. Save results to Database
        analysis.status = "COMPLETED"
        analysis.ats_score = final_score
        analysis.sub_scores = sub_scores
        analysis.summary = ai_result.summary
        analysis.extracted_skills = extracted_skills
        analysis.missing_skills = missing_skills
        analysis.suggestions = suggestions_dict_list
        analysis.recommended_roles = roles_dict_list
        analysis.jd_match_score = float(ai_result.jd_match_score) if ai_result.jd_match_score is not None else None
        
        db.commit()
        logger.info(f"Analysis {analysis_id} completed successfully with score {final_score}.")

    except Exception as e:
        logger.error(f"Analysis {analysis_id} failed: {e}")
        try:
            # Re-fetch analysis in case of session errors
            analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
            if analysis:
                analysis.status = "FAILED"
                db.commit()
        except Exception as db_err:
            logger.error(f"Failed to set status to FAILED in DB for analysis {analysis_id}: {db_err}")
    finally:
        db.close()

@router.post("/run", response_model=AnalysisResponse)
@limiter.limit("5/minute")
def run_analysis(
    request: Request,
    payload: AnalysisRunRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Triggers an ATS analysis for a given resume.
    Initializes status as PENDING and offloads work to a background worker.
    """
    resume = db.query(Resume).filter(Resume.id == payload.resume_id).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found."
        )

    # Ownership validation
    if user:
        if resume.user_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to analyze this resume."
            )
    else:
        effective_guest_id = request.cookies.get("guest_session_id")
        if not effective_guest_id or resume.guest_session_id != effective_guest_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to analyze this resume."
            )

    # Check target role if user has it set
    target_role = user.target_role if user else None

    # Create new analysis run entry in PENDING status
    db_analysis = Analysis(
        resume_id=payload.resume_id,
        status="PENDING",
        job_description=payload.job_description
    )
    db.add(db_analysis)
    db.commit()
    db.refresh(db_analysis)

    # Queue background task to fetch API result
    # We pass the SessionLocal generator factory to run inside background worker thread
    from ..database import SessionLocal
    background_tasks.add_task(
        run_async_analysis,
        db_analysis.id,
        payload.resume_id,
        target_role,
        payload.job_description,
        SessionLocal
    )

    return db_analysis

@router.get("/status/{analysis_id}", response_model=AnalysisStatusResponse)
def get_analysis_status(
    analysis_id: int,
    request: Request,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Get the processing status and score of an analysis (for frontend polling).
    """
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found."
        )

    # Validate ownership of the resume tied to the analysis
    resume = db.query(Resume).filter(Resume.id == analysis.resume_id).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated resume not found."
        )

    if user:
        if resume.user_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to view this analysis."
            )
    else:
        effective_guest_id = request.cookies.get("guest_session_id")
        if not effective_guest_id or resume.guest_session_id != effective_guest_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to view this analysis."
            )

    return analysis

@router.get("/{analysis_id}", response_model=AnalysisResponse)
def get_analysis(
    analysis_id: int,
    request: Request,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Retrieve the full completed analysis details.
    """
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found."
        )

    resume = db.query(Resume).filter(Resume.id == analysis.resume_id).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated resume not found."
        )

    # Ownership check
    if user:
        if resume.user_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to view this analysis."
            )
    else:
        effective_guest_id = request.cookies.get("guest_session_id")
        if not effective_guest_id or resume.guest_session_id != effective_guest_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to view this analysis."
            )

    return analysis

def clean_text(text: Optional[str]) -> str:
    """
    Sanitize raw text for ReportLab Paragraphs to prevent XML parser errors.
    Escapes special XML characters and formats basic markdown (bold, italic, headers, breaks).
    """
    if not text:
        return ""
    import re
    # 1. Escape special XML entities first
    escaped = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    # 2. Parse markdown bold **bold** and __bold__
    cleaned = re.sub(r"\*\*(.*?)\*\*", r"<b>\1</b>", escaped)
    cleaned = re.sub(r"__(.*?)__", r"<b>\1</b>", cleaned)
    # 3. Parse markdown italic *italic* and _italic_
    cleaned = re.sub(r"\*(.*?)\*", r"<i>\1</i>", cleaned)
    cleaned = re.sub(r"_(.*?)_", r"<i>\1</i>", cleaned)
    # 4. Parse markdown headers (### Header)
    cleaned = re.sub(r"^###?\s+(.*?)$", r"<br/><b>\1</b><br/>", cleaned, flags=re.MULTILINE)
    # 5. Replace newlines with breaks
    cleaned = cleaned.replace("\n", "<br/>")
    return cleaned

def build_pdf(analysis: Analysis, resume: Resume) -> bytes:
    """
    Generate a styled PDF report using ReportLab.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )
    story = []
    
    # Color definitions
    color_primary = colors.HexColor("#2563EB")
    color_dark = colors.HexColor("#0F172A")
    color_gray = colors.HexColor("#64748B")
    color_border = colors.HexColor("#E2E8F0")
    
    # Score band colors
    score = analysis.ats_score or 0
    if score < 50:
        score_color = colors.HexColor("#EF4444")
        band_text = "Action Needed"
    elif score < 80:
        score_color = colors.HexColor("#F59E0B")
        band_text = "Good"
    else:
        score_color = colors.HexColor("#10B981")
        band_text = "Excellent"

    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=color_primary
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=color_gray
    )
    
    h2_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=color_dark,
        spaceBefore=12,
        spaceAfter=6
    )
    
    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=color_dark
    )
    
    bold_style = ParagraphStyle(
        'BodyTextBold',
        parent=body_style,
        fontName='Helvetica-Bold'
    )
    
    italic_style = ParagraphStyle(
        'BodyTextItalic',
        parent=body_style,
        fontName='Helvetica-Oblique'
    )

    # 1. Header Section
    story.append(Paragraph("ResumeIQ Analysis Report", title_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph(f"File Name: {clean_text(resume.filename)} | Uploaded: {resume.uploaded_at.strftime('%Y-%m-%d %H:%M')}", subtitle_style))
    story.append(Spacer(1, 15))

    # 2. Score Section (Table layout)
    score_data = [
        [
            Paragraph(f"<b>Overall ATS Score:</b>", body_style),
            Paragraph(f"<font color='{score_color.hexval()}'><b>{score} / 100</b></font> ({band_text})", bold_style)
        ]
    ]
    if analysis.jd_match_score is not None:
        score_data.append([
            Paragraph("<b>Job Match Score:</b>", body_style),
            Paragraph(f"<b>{int(analysis.jd_match_score)}%</b>", bold_style)
        ])
        
    score_table = Table(score_data, colWidths=[150, 350])
    score_table.setStyle(TableStyle([
        ('GRID', (0,0), (-1,-1), 1, color_border),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(score_table)
    story.append(Spacer(1, 15))

    # 3. Sub-scores Breakdowns
    story.append(Paragraph("Sub-score Breakdown", h2_style))
    if analysis.sub_scores:
        sub_data = []
        for category, sub_val in analysis.sub_scores.items():
            sub_data.append([Paragraph(clean_text(category), body_style), Paragraph(f"{sub_val} / 100", bold_style)])
            
        sub_table = Table(sub_data, colWidths=[200, 300])
        sub_table.setStyle(TableStyle([
            ('GRID', (0,0), (-1,-1), 0.5, color_border),
            ('PADDING', (0,0), (-1,-1), 6),
        ]))
        story.append(sub_table)
    story.append(Spacer(1, 15))

    # 4. Summary
    story.append(Paragraph("Executive Summary", h2_style))
    raw_summary = analysis.summary or "No summary generated."
    story.append(Paragraph(clean_text(raw_summary), body_style))
    story.append(Spacer(1, 15))

    # 5. Skills Grid
    story.append(Paragraph("Extracted Core Skills", h2_style))
    skills_text = ", ".join(analysis.extracted_skills or []) or "No skills extracted."
    story.append(Paragraph(clean_text(skills_text), body_style))
    story.append(Spacer(1, 10))

    story.append(Paragraph("Missing Relevant Skills", h2_style))
    missing_skills_text = ", ".join(analysis.missing_skills or []) or "No missing skills identified."
    story.append(Paragraph(f"<font color='#F59E0B'>{clean_text(missing_skills_text)}</font>", body_style))
    story.append(Spacer(1, 15))

    # 6. Suggestions
    story.append(Paragraph("Improvement Suggestions", h2_style))
    if analysis.suggestions:
        for idx, sug in enumerate(analysis.suggestions):
            cat = sug.get("category", "General")
            issue = sug.get("issue", "")
            adv = sug.get("suggestion", "")
            before = sug.get("before", "")
            after = sug.get("after", "")
            
            story.append(Paragraph(f"<b>{idx+1}. [{clean_text(cat)}] {clean_text(issue)}</b>", bold_style))
            story.append(Paragraph(f"<i>Advice:</i> {clean_text(adv)}", body_style))
            if before:
                story.append(Paragraph(f"<font color='#EF4444'>Before:</font> \"{clean_text(before)}\"", italic_style))
            if after:
                story.append(Paragraph(f"<font color='#10B981'>After:</font> \"{clean_text(after)}\"", bold_style))
            story.append(Spacer(1, 8))
    else:
        story.append(Paragraph("No critical suggestions found.", body_style))
        
    story.append(Spacer(1, 15))

    # 7. Recommended Roles
    story.append(Paragraph("Recommended Job Roles", h2_style))
    if analysis.recommended_roles:
        roles_data = []
        for r in analysis.recommended_roles:
            role_name = r.get("role", "")
            pct = r.get("match_percentage", 0)
            reason = r.get("reason", "")
            roles_data.append([
                Paragraph(f"<b>{clean_text(role_name)}</b> ({pct}%)", bold_style),
                Paragraph(clean_text(reason), body_style)
            ])
        roles_table = Table(roles_data, colWidths=[180, 320])
        roles_table.setStyle(TableStyle([
            ('GRID', (0,0), (-1,-1), 0.5, color_border),
            ('PADDING', (0,0), (-1,-1), 6),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ]))
        story.append(roles_table)
    else:
        story.append(Paragraph("No role recommendations available.", body_style))

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()

@router.get("/{analysis_id}/pdf")
def get_analysis_pdf(
    analysis_id: int,
    request: Request,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Generate and stream a clean PDF copy of the analysis results.
    """
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis or analysis.status != "COMPLETED":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Completed analysis report not found."
        )

    resume = db.query(Resume).filter(Resume.id == analysis.resume_id).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated resume not found."
        )

    # Ownership validation
    if user:
        if resume.user_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to export this analysis."
            )
    else:
        effective_guest_id = request.cookies.get("guest_session_id")
        if not effective_guest_id or resume.guest_session_id != effective_guest_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to export this analysis."
            )

    try:
        pdf_bytes = build_pdf(analysis, resume)
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=ResumeIQ-Report-{analysis_id}.pdf"}
        )
    except Exception as e:
        logger.error(f"Error generating PDF for analysis {analysis_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate PDF document: {str(e)}"
        )

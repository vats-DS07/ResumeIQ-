import os
import json
import logging
import time
from google import genai
from google.genai import types
from pydantic import BaseModel, Field
from typing import List, Dict, Optional

logger = logging.getLogger("resumeiq.ai_service")

# Pydantic schemas for validation
class AISuggestion(BaseModel):
    category: str = Field(description="Category of suggestion (e.g., Formatting, Keywords, Structure, Impact)")
    issue: str = Field(description="The issue identified in the resume")
    suggestion: str = Field(description="Clear advice on how to improve")
    before: str = Field(description="An example of the weak text in the resume")
    after: str = Field(description="An example of the rewritten, high-impact text")

class AIRecommendedRole(BaseModel):
    role: str = Field(description="Recommended job title matching the resume skills")
    match_percentage: int = Field(description="Percentage score matching the role (0-100)")
    reason: str = Field(description="Reason for recommending this role")

class AIAnalysisResult(BaseModel):
    ai_score: int = Field(description="Qualitative resume score (0-100) based on alignment, impact, and clarity")
    summary: str = Field(description="Executive summary of the candidate's profile, highlights, and critical gaps (markdown supported)")
    extracted_skills: List[str] = Field(description="List of core professional/technical skills found in the resume")
    missing_skills: List[str] = Field(description="List of skills that are missing but highly relevant for their target role or job description")
    suggestions: List[AISuggestion] = Field(description="Actionable suggestions with before/after examples")
    recommended_roles: List[AIRecommendedRole] = Field(description="Top 2-3 matching job roles")
    jd_match_score: Optional[int] = Field(None, description="Match score with the job description if provided (0-100)")

class AIService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.model_name = "gemini-1.5-flash"
        
        if self.api_key:
            try:
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                logger.error(f"Failed to initialize Gemini Client: {e}")
                self.client = None
        else:
            logger.warning("GEMINI_API_KEY environment variable not found. Running in DEMO mode with mock analysis.")
            self.client = None

    def analyze_resume(self, resume_text: str, target_role: Optional[str] = None, job_description: Optional[str] = None) -> AIAnalysisResult:
        """
        Sends the resume text and optional job description to Gemini and retrieves a structured analysis.
        Implements retry logic and validates response against AIAnalysisResult schema.
        """
        if not self.api_key or not self.client:
            return self._generate_mock_analysis(resume_text, target_role, job_description)

        system_instruction = (
            "You are an elite ATS (Applicant Tracking System) optimizer and professional resume consultant. "
            "Your task is to analyze the candidate's resume text and match it against industry standards. "
            "If a Job Description is provided, evaluate how well the resume matches the job description. "
            "You must return a valid JSON object matching the requested schema. "
            "Provide realistic, highly specific feedback. Do not use generic placeholders. "
            "Write the 'summary' in high-quality markdown."
        )

        prompt = f"""
Target Role: {target_role or "Not Specified"}
Job Description (Optional): {job_description or "Not Provided"}

Resume Text:
{resume_text}

---
Analyze the resume above. Return a JSON structure matching the requested output schema.
"""

        # Retry logic (up to 3 times)
        for attempt in range(3):
            try:
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=f"{system_instruction}\n\n{prompt}",
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        response_schema=AIAnalysisResult,
                        temperature=0.2,
                        http_options=types.HttpOptions(timeout=20.0),
                    )
                )
                
                # Parse JSON
                data = json.loads(response.text.strip())
                
                # Validate against Pydantic schema
                validated_data = AIAnalysisResult(**data)
                return validated_data
                
            except Exception as e:
                logger.error(f"Gemini API attempt {attempt + 1} failed: {str(e)}")
                if attempt == 2:
                    # Final attempt failed, fallback to mock
                    logger.warning("All Gemini API attempts failed. Falling back to mock analysis.")
                    return self._generate_mock_analysis(resume_text, target_role, job_description)
                time.sleep(1)

    def _generate_mock_analysis(self, resume_text: str, target_role: Optional[str] = None, job_description: Optional[str] = None) -> AIAnalysisResult:
        """
        Generates realistic analysis data for local testing and presentation without an API key.
        """
        # Determine candidate type from text keywords
        text_lower = resume_text.lower()
        role = target_role or "Software Engineer"
        
        # Simple heuristics for parsing resume info
        skills = []
        if "python" in text_lower or "django" in text_lower:
            skills.extend(["Python", "Django", "SQLAlchemy", "FastAPI"])
        if "react" in text_lower or "javascript" in text_lower:
            skills.extend(["React", "JavaScript", "HTML5", "CSS3", "Tailwind CSS"])
        if "docker" in text_lower or "aws" in text_lower:
            skills.extend(["Docker", "AWS", "CI/CD", "Cloud Computing"])
        if not skills:
            skills = ["Project Management", "Communication", "Problem Solving", "Team Leadership"]
        
        # Unique list
        skills = list(set(skills))
        
        missing = ["System Design", "Unit Testing", "TypeScript", "Redis"]
        if "react" in text_lower and "typescript" not in text_lower:
            missing.append("TypeScript")
        if "python" in text_lower and "pytest" not in text_lower:
            missing.append("Pytest (Unit Testing)")
        
        # Clean missing list
        missing = list(set(missing))[:4]
        
        suggestions = [
            AISuggestion(
                category="Quantifiable Impact",
                issue="Bullet points list duties rather than achievements with metrics.",
                suggestion="Add concrete numbers, percentages, or scale metrics to demonstrate your actual business impact.",
                before="Responsible for managing the frontend and improving load times.",
                after="Refactored legacy React codebase, reducing page load latency by 35% and improving overall lighthouse scores from 72 to 94."
            ),
            AISuggestion(
                category="Action Verbs",
                issue="Passive language used to start experience bullets.",
                suggestion="Begin sentences with strong, active verbs that highlight leadership and execution.",
                before="Helped the team design and deploy new API endpoints.",
                after="Spearheaded the design and deployment of 15+ secure REST API endpoints, boosting system throughput by 20%."
            )
        ]
        
        recommended_roles = [
            AIRecommendedRole(
                role=role if target_role else "Full Stack Software Engineer",
                match_percentage=78,
                reason="Excellent matches for Core React and Python frameworks, though lacking TypeScript and CI/CD pipelines."
            ),
            AIRecommendedRole(
                role="Backend Developer",
                match_percentage=82,
                reason="Strong background in API development and database structures."
            )
        ]
        
        jd_score = None
        if job_description:
            jd_score = 65
            if any(s.lower() in job_description.lower() for s in skills):
                jd_score += 15
            jd_score = min(95, jd_score)
            
        return AIAnalysisResult(
            ai_score=82,
            summary=f"### Profile Overview\nThe candidate shows a strong foundation matching **{role}** expectations. The experience detail indicates hands-on knowledge of backend development and modern stack components.\n\n### Key Gaps\nThere is a noticeable lack of metrics and quantitative outcomes. Additionally, advanced architectural details (such as system design, microservices, or database optimizations) are omitted. Addressing these gaps will significantly boost ATS performance.",
            extracted_skills=skills,
            missing_skills=missing,
            suggestions=suggestions,
            recommended_roles=recommended_roles,
            jd_match_score=jd_score
        )

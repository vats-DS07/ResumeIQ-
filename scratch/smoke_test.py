import os
import sys
import time
import subprocess
import requests
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

def generate_pdf_resume(filepath):
    print(f"Generating test PDF resume at {filepath}...")
    doc = SimpleDocTemplate(filepath, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []
    
    story.append(Paragraph("<b>John Doe</b>", styles["Title"]))
    story.append(Spacer(1, 10))
    story.append(Paragraph("Experienced Software Engineer with a background in Python, Django, FastAPI, and React.", styles["Normal"]))
    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>Skills:</b> Python, FastAPI, React, JavaScript, HTML5, CSS3, Docker, SQL", styles["Normal"]))
    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>Experience:</b>", styles["Heading2"]))
    story.append(Paragraph("Senior Engineer at Tech Corp. Built FastAPI APIs and React frontend pages.", styles["Normal"]))
    
    doc.build(story)
    print("PDF generation complete.")

def run_smoke_test():
    test_pdf = os.path.abspath("test_resume.pdf")
    generate_pdf_resume(test_pdf)
    
    backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
    venv_python = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "venv", "Scripts", "python.exe"))
    
    print(f"Starting backend server from {backend_dir}...")
    # Start the backend via python -m uvicorn main:app --port 8081
    server_process = subprocess.Popen(
        [venv_python, "-m", "uvicorn", "main:app", "--port", "8081"],
        cwd=backend_dir,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    
    # Wait for the server to boot up
    time.sleep(3)
    
    base_url = "http://127.0.0.1:8081"
    session = requests.Session()
    
    try:
        # Check health
        print("Checking API health...")
        r = session.get(f"{base_url}/api/health")
        print(f"Health check status: {r.status_code}, response: {r.json()}")
        
        # Test Signup
        print("Registering new test user...")
        signup_data = {
            "name": "Smoke Test User",
            "email": "smoketest@example.com",
            "password": "SecurePassword123!"
        }
        r = session.post(f"{base_url}/api/auth/signup", json=signup_data)
        print(f"Signup response: {r.status_code}, {r.json()}")
        
        # Test Login
        print("Logging in...")
        login_data = {
            "email": "smoketest@example.com",
            "password": "SecurePassword123!"
        }
        r = session.post(f"{base_url}/api/auth/login", json=login_data)
        print(f"Login response: {r.status_code}, {r.json()}")
        
        # Test Upload Resume
        print("Uploading test resume...")
        with open(test_pdf, "rb") as f:
            files = {"file": ("test_resume.pdf", f, "application/pdf")}
            r = session.post(f"{base_url}/api/resumes/upload", files=files)
        resume_data = r.json()
        print(f"Upload response: {r.status_code}, {resume_data}")
        resume_id = resume_data.get("id")
        
        # Test Run Analysis
        print(f"Running analysis for resume ID {resume_id}...")
        analysis_payload = {
            "resume_id": resume_id,
            "job_description": "We are looking for a Python developer with experience in FastAPI and React."
        }
        r = session.post(f"{base_url}/api/analysis/run", json=analysis_payload)
        analysis_data = r.json()
        print(f"Run analysis response: {r.status_code}, {analysis_data}")
        analysis_id = analysis_data.get("id")
        
        # Poll status
        print(f"Polling analysis status for ID {analysis_id}...")
        for _ in range(10):
            r = session.get(f"{base_url}/api/analysis/status/{analysis_id}")
            status_data = r.json()
            status_str = status_data.get("status")
            print(f"Status: {status_str}")
            if status_str in ["COMPLETED", "FAILED"]:
                break
            time.sleep(2)
            
        # Get full analysis
        print(f"Fetching completed analysis detail...")
        r = session.get(f"{base_url}/api/analysis/{analysis_id}")
        full_analysis = r.json()
        print(f"Full Analysis (truncated summary): {full_analysis.get('summary')[:200]}...")
        print(f"ATS Score: {full_analysis.get('ats_score')}")
        print(f"Sub Scores: {full_analysis.get('sub_scores')}")
        print(f"Extracted Skills: {full_analysis.get('extracted_skills')}")
        print(f"Missing Skills: {full_analysis.get('missing_skills')}")
        
        # Get PDF Report
        print("Downloading PDF analysis report...")
        r = session.get(f"{base_url}/api/analysis/{analysis_id}/pdf")
        print(f"PDF download response: {r.status_code}, content length: {len(r.content)} bytes")
        
        print("\nSmoke Test PASSED successfully!")
        
    except Exception as e:
        print(f"\nSmoke Test FAILED with exception: {e}")
    finally:
        # Shutdown server
        print("Terminating backend server process...")
        server_process.terminate()
        try:
            server_process.wait(timeout=5)
            print("Backend server terminated cleanly.")
        except subprocess.TimeoutExpired:
            server_process.kill()
            print("Backend server killed.")
            
        # Clean up files
        if os.path.exists(test_pdf):
            os.remove(test_pdf)
            print("Cleaned up test_resume.pdf")

if __name__ == "__main__":
    run_smoke_test()

import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  UploadCloud, Brain, FileCheck2, Presentation, ChevronLeft, 
  HelpCircle, ArrowRight, Sparkles, FileText, CheckCircle2 
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Accordion } from '../components/ui/Accordion';
import { Badge } from '../components/ui/Badge';

export const HowItWorksPage = () => {
  const navigate = useNavigate();

  // FAQ items for the Accordion component
  const faqItems = [
    {
      title: "What is an ATS and how does ResumeIQ audit it?",
      content: "An ATS (Applicant Tracking System) is software used by employers to screen, sort, and rank job applications. ResumeIQ scans your document using similar parser structures to identify formatting blockers, verify parsing readability, and score key tag alignment to ensure you rank high in recruiters' databases."
    },
    {
      title: "How accurate is the scoring algorithm?",
      content: "Our score is computed using a hybrid deterministic and qualitative AI framework. We verify hard technical parameters (such as formatting guidelines, page limits, and contact information presence) and query Google Gemini to evaluate contextual match relevance, resulting in an accurate reflection of how your resume stands out."
    },
    {
      title: "Which file formats does ResumeIQ support?",
      content: "We support PDF (.pdf) and Microsoft Word (.docx) documents. For best formatting results across all systems, we recommend uploading a standard single-column PDF file."
    },
    {
      title: "How is my personal data and resume file secured?",
      content: "Your privacy is our top priority. Resumes are processed over SSL encryption and saved securely in private storage. We do not sell, rent, or distribute your resumes or contact details to third-party databases. You can permanently delete your files and account at any time."
    },
    {
      title: "How does the AI Bullet Rewrite recommendation system work?",
      content: "When analyzing your experience bullet points, the AI identifies passive framing, lack of quantifiers, and weak verbs. It then generates high-impact alternatives using strong action verbs, framing achievements with the X-Y-Z formula (accomplished X, measured by Y, by doing Z)."
    },
    {
      title: "Can I customize the analysis for a specific job description?",
      content: "Yes! In addition to a general profile scan, you can copy and paste the specific job description of a role you are targeting. The AI will evaluate your resume against that description, giving you a custom match percentage and identifying exactly which keywords you are missing."
    },
    {
      title: "What is the difference between guest scans and registered accounts?",
      content: "Guest scans allow you to run a single mock analysis without an account. Creating a free registered account preserves your upload history in a personal dashboard, letting you track your score improvements over time as you apply recommendations."
    },
    {
      title: "Are there any hidden recurring fees?",
      content: "No. Our pricing is completely transparent. You can use the free tier with basic diagnostics forever. If you choose to upgrade to Pro, you will be billed the specified price monthly, which you can cancel at any point from your billing dashboard."
    },
    {
      title: "How do I download the analysis report as a PDF?",
      content: "Once your resume analysis is completed in your dashboard, you will see a 'Download PDF Report' button. Clicking it streams a professionally styled PDF compilation of your score, executive summary, and improvements directly to your browser."
    }
  ];

  const timelineSteps = [
    {
      icon: <UploadCloud className="w-6 h-6 text-primary" />,
      step: "Step 1",
      title: "Upload & File Extraction",
      description: "Drop your PDF or Word resume. Our parser immediately extracts metadata, separates structural layers, and converts raw text content into structured segments without modifying your original document layout."
    },
    {
      icon: <FileText className="w-6 h-6 text-primary" />,
      step: "Step 2",
      title: "Syntax & Structure Audit",
      description: "We evaluate core formatting criteria: verify layout density, inspect margins, check email and phone structure, analyze page length, and scan for fonts and characters that typically freeze legacy ATS parsers."
    },
    {
      icon: <Brain className="w-6 h-6 text-primary" />,
      step: "Step 3",
      title: "Gemini AI Contextual Match",
      description: "Our AI model checks your descriptions against industry taxonomies. It isolates technical hard tools, soft capabilities, and computes score matches against either standard roles or a pasted job description."
    },
    {
      icon: <FileCheck2 className="w-6 h-6 text-primary" />,
      step: "Step 4",
      title: "Interactive Optimization Report",
      description: "View your final score, sub-scores, and checklist. Interact with inline AI recommendations to swap out generic descriptions with tailored action-verb rewrites, then download a PDF summary."
    }
  ];

  return (
    <div className="min-h-screen bg-bg text-text selection:bg-primary/20">
      


      {/* Hero Banner */}
      <section className="pt-28 pb-12 bg-surface/30">
        <div className="max-w-4xl mx-auto px-6 text-center flex flex-col items-center gap-4">
          <Badge variant="primary">🔍 Behind the Scenes</Badge>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-text">
            How ResumeIQ Evaluates Your Resume
          </h1>
          <p className="text-base text-text-secondary max-w-xl leading-relaxed">
            Discover the technology and methodology behind our hybrid parser and AI analysis engine.
          </p>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 max-w-4xl mx-auto px-6">
        <div className="relative border-l-2 border-border/80 ml-6 pl-10 md:ml-12 md:pl-16 flex flex-col gap-12 text-left">
          
          {timelineSteps.map((item, idx) => (
            <div key={idx} className="relative">
              {/* Outer timeline indicator */}
              <div className="absolute -left-[61px] md:-left-[85px] top-1.5 w-10 h-10 md:w-12 md:h-12 rounded-full bg-surface border border-border flex items-center justify-center shadow-sm">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  {item.icon}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                  {item.step}
                </span>
                <h3 className="text-xl md:text-2xl font-bold text-text">
                  {item.title}
                </h3>
                <p className="text-sm md:text-base text-text-secondary leading-relaxed max-w-2xl">
                  {item.description}
                </p>
              </div>
            </div>
          ))}

        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-surface/30 border-t border-border/50">
        <div className="max-w-4xl mx-auto px-6 text-left">
          <div className="text-center flex flex-col items-center gap-3 mb-12">
            <Badge variant="neutral" className="px-2.5 py-0.5">
              <HelpCircle className="w-3.5 h-3.5 mr-1 inline" /> FAQ
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-text">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed max-w-md">
              Everything you need to know about our parsing security, pricing, and scoring checks.
            </p>
          </div>

          <Accordion items={faqItems} className="border-border shadow-sm" />
        </div>
      </section>

      {/* CTA Footer Band */}
      <section className="py-16 bg-gradient-to-r from-primary to-blue-900 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent_60%)]" />
        <div className="max-w-3xl mx-auto px-6 relative z-10 flex flex-col items-center gap-5">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Ready to test your resume?
          </h2>
          <p className="text-xs text-white/80 max-w-md leading-relaxed">
            Join thousands of professionals using ResumeIQ to bypass formatting filters and secure interviews.
          </p>
          <Button size="lg" className="bg-white text-primary hover:bg-white/90 active:scale-[0.98] border-none font-bold mt-2" onClick={() => navigate('/signup')}>
            Start Analyzing Now
          </Button>
        </div>
      </section>



    </div>
  );
};

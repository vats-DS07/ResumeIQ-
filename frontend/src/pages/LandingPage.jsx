import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowRight, Check, Star, RefreshCw, ChevronLeft, ChevronRight, 
  UploadCloud, BarChart3, ShieldCheck, Zap, Brain, Sparkles, 
  FileText, ArrowUpRight, Award, Flame, Quote 
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ScoreGauge } from '../components/charts/ScoreGauge';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

// Reusable scroll animation wrapper
const FadeUpSection = ({ children, delay = 0, className = "" }) => {
  const [ref, isIntersecting] = useIntersectionObserver({
    threshold: 0.05,
    triggerOnce: true,
  });

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out transform ${className} ${
        isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export const LandingPage = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Scroll detection for navbar styles
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const testimonials = [
    {
      quote: "ResumeIQ completely changed my job hunt. I was applying for frontend roles and getting zero callbacks. After adding the missing skills identified by the analyzer and polishing my experience block, I got three interviews in two weeks!",
      author: "Sarah Jenkins",
      role: "Frontend Engineer at Vercel",
      rating: 5,
      avatar: "SJ"
    },
    {
      quote: "The bullet rewrites are magic. I knew what I did at my last role, but framing it with strong action verbs and concrete metrics was tough. The AI suggestion tool generated options that sounded incredibly professional.",
      author: "Marcus Chen",
      role: "Product Manager",
      rating: 5,
      avatar: "MC"
    },
    {
      quote: "Being able to see how a resume scores against specific job descriptions before applying saved me so much time. I didn't realize how much the ATS was filtering out until I started using ResumeIQ.",
      author: "Elena Rostova",
      role: "Data Scientist",
      rating: 5,
      avatar: "ER"
    }
  ];

  const handleNextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const features = [
    {
      icon: <BarChart3 className="w-6 h-6 text-primary" />,
      title: "ATS Compatibility Score",
      description: "Get an instant scan checking core formatting, length guidelines, layout readability, and impact statistics."
    },
    {
      icon: <Brain className="w-6 h-6 text-primary" />,
      title: "Intelligent Skill Extraction",
      description: "Our parsed models isolate and categorize hard tools, soft capabilities, and industry terminology instantly."
    },
    {
      icon: <Flame className="w-6 h-6 text-primary" />,
      title: "Missing Skill Detection",
      description: "Compare your resume directly against target roles to identify critical keywords and skills recruiters look for."
    },
    {
      icon: <FileText className="w-6 h-6 text-primary" />,
      title: "Executive Summary",
      description: "Receive a professional, context-aware analysis summary highlighting overall strength and key recommendations."
    },
    {
      icon: <Award className="w-6 h-6 text-primary" />,
      title: "Role Recommendation Engine",
      description: "Discover which job descriptions and career pathways align closest to the experience and skills you possess."
    },
    {
      icon: <Sparkles className="w-6 h-6 text-primary" />,
      title: "Bullet Rewrite AI",
      description: "Transform passive responsibilities into high-impact, metrics-driven achievements tailored for high conversion."
    }
  ];

  return (
    <div className="min-h-screen bg-bg text-text selection:bg-primary/20">
      


      {/* Hero Section */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden">
        {/* Decorative subtle background gradients */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-12 left-10 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column Text */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-left">
            <Badge variant="primary" className="px-3 py-1">
              🚀 Elevate Your Job Search
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-text leading-[1.1]">
              Know your resume's <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">real score</span> — before a recruiter does.
            </h1>
            <p className="text-lg text-text-secondary max-w-xl leading-relaxed">
              Upload your resume to get instant ATS scores, pinpoint crucial skill gaps, and generate AI achievement bullets tailored to land interviews at top companies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <Button size="lg" className="shadow-lg group" onClick={() => navigate('/signup')}>
                Analyze My Resume Free
                <ArrowRight className="w-5 h-5 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
              </Button>
              <Button variant="secondary" size="lg" onClick={() => navigate('/how-it-works')}>
                See Sample Report
              </Button>
            </div>
            
            {/* Trust Strip */}
            <div className="mt-12 border-t border-border/60 pt-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary/70 mb-3">
                Trusted by job seekers placing at
              </p>
              <div className="flex flex-wrap gap-x-8 gap-y-3 items-center opacity-40 grayscale">
                <span className="font-bold text-sm tracking-tight text-text">GOOGLE</span>
                <span className="font-bold text-sm tracking-tight text-text">META</span>
                <span className="font-bold text-sm tracking-tight text-text">AMAZON</span>
                <span className="font-bold text-sm tracking-tight text-text">MICROSOFT</span>
              </div>
            </div>
          </div>

          {/* Right Column Gauge */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[340px] aspect-square rounded-2xl bg-surface border border-border p-8 shadow-elevated flex flex-col justify-center items-center overflow-hidden animate-[float_4s_ease-in-out_infinite]">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
              <ScoreGauge score={78} />
              <div className="mt-4 text-center">
                <Badge variant="amber" className="mb-1.5">ATS Readability: Good</Badge>
                <p className="text-xs text-text-secondary">Needs 3 key missing skills to reach green zone</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 border-t border-border/50 bg-surface/30">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <FadeUpSection delay={0}>
            <Badge variant="neutral" className="mb-3">Simplicity First</Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Get Analyzed in 3 Simple Steps
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto mb-16 leading-relaxed">
              Our automated models parse layout structure, analyze experience context, and verify skill alignment in real-time.
            </p>
          </FadeUpSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Upload Resume",
                desc: "Drop your current resume in PDF or DOCX format. Your styling format and metadata will remain completely intact."
              },
              {
                step: "02",
                title: "AI Analysis Scan",
                desc: "Our model reviews content against ATS constraints, categorizes skills, and checks structural readability."
              },
              {
                step: "03",
                title: "Optimize & Apply",
                desc: "Address critical flaws, insert missing high-volume tags, swap out weak bullet phrases, and download your report."
              }
            ].map((s, idx) => (
              <FadeUpSection key={idx} delay={idx * 80}>
                <Card className="h-full relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                  <div className="absolute -right-4 -top-8 text-8xl font-black text-border/20 group-hover:text-primary/5 transition-colors select-none">
                    {s.step}
                  </div>
                  <CardContent className="pt-8 text-left">
                    <span className="inline-flex w-8 h-8 rounded-full bg-primary/10 text-primary font-bold items-center justify-center mb-4">
                      {idx + 1}
                    </span>
                    <h3 className="text-xl font-bold mb-2 text-text">{s.title}</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">{s.desc}</p>
                  </CardContent>
                </Card>
              </FadeUpSection>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-20 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-6">
          <FadeUpSection delay={0} className="text-center">
            <Badge variant="primary" className="mb-3">Feature Checklist</Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Equipped with Everything You Need
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto mb-16 leading-relaxed">
              We leverage modern language models and parsing rules to review your profiles with recruiter-level fidelity.
            </p>
          </FadeUpSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, idx) => (
              <FadeUpSection key={idx} delay={idx * 80}>
                <Card hoverable className="h-full border-border/80">
                  <CardContent className="pt-6 text-left flex flex-col gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                      {f.icon}
                    </div>
                    <h3 className="text-lg font-bold text-text">{f.title}</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">{f.description}</p>
                  </CardContent>
                </Card>
              </FadeUpSection>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Carousel Section */}
      <section className="py-20 border-t border-border/50 bg-surface/30">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <FadeUpSection delay={0}>
            <Badge variant="neutral" className="mb-3">Testimonials</Badge>
            <h2 className="text-3xl font-bold tracking-tight mb-12">
              Loved by Hundreds of Job Seekers
            </h2>
          </FadeUpSection>

          <FadeUpSection delay={80}>
            <div className="relative min-h-[220px] flex items-center justify-center bg-surface border border-border rounded-xl p-8 shadow-sm">
              <Quote className="absolute left-6 top-6 w-12 h-12 text-primary/5 pointer-events-none" />
              
              <div className="flex flex-col gap-4 items-center">
                <p className="text-base md:text-lg text-text-secondary italic leading-relaxed max-w-2xl">
                  "{testimonials[activeTestimonial].quote}"
                </p>
                <div className="flex items-center gap-1.5 text-amber-500">
                  {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    {testimonials[activeTestimonial].avatar}
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-bold text-text">{testimonials[activeTestimonial].author}</h4>
                    <p className="text-xs text-text-secondary">{testimonials[activeTestimonial].role}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Carousel Controls */}
            <div className="flex items-center justify-center gap-6 mt-6">
              <button 
                onClick={handlePrevTestimonial}
                className="w-10 h-10 rounded-full border border-border hover:bg-bg text-text flex items-center justify-center cursor-pointer transition-colors shadow-sm"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-2">
                {testimonials.map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveTestimonial(idx)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      activeTestimonial === idx ? 'bg-primary w-5' : 'bg-border hover:bg-text-secondary/50'
                    }`}
                  />
                ))}
              </div>

              <button 
                onClick={handleNextTestimonial}
                className="w-10 h-10 rounded-full border border-border hover:bg-bg text-text flex items-center justify-center cursor-pointer transition-colors shadow-sm"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </FadeUpSection>
        </div>
      </section>

      {/* Sample Report Teaser Section */}
      <section className="py-20 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Teaser Info */}
            <div className="lg:col-span-5 text-left flex flex-col gap-5">
              <Badge variant="primary">📊 Premium Dashboards</Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-text leading-tight">
                Clear, actionable reports layout
              </h2>
              <p className="text-text-secondary leading-relaxed">
                We don't just dump raw text feedback. We structure your scores, category subscores, highlighted bullet rewrites, and missing keywords in clean tabs and charts so you know exactly where to make adjustments.
              </p>
              <ul className="flex flex-col gap-2.5 mt-2">
                {[
                  "Detailed sub-score breakdown tags",
                  "Inline PDF downloads of optimized reports",
                  "Side-by-side match rate metrics",
                  "Interactive resume content playground editor"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-text-secondary">
                    <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <Button variant="outline" rightIcon={<ArrowUpRight className="w-4 h-4" />} onClick={() => navigate('/how-it-works')}>
                  Learn More About Scoring
                </Button>
              </div>
            </div>

            {/* Right Teaser Visual */}
            <div className="lg:col-span-7">
              <FadeUpSection delay={80}>
                <Card className="shadow-elevated border-border overflow-hidden">
                  <div className="bg-bg border-b border-border px-5 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <span className="text-xs font-semibold text-text-secondary">ResumeIQ Report Teaser</span>
                    <Badge variant="emerald" size="sm">✓ Complete</Badge>
                  </div>
                  <CardContent className="p-6 bg-surface flex flex-col gap-6 text-left">
                    <div className="flex items-center justify-between flex-wrap gap-4 border-b border-border pb-4">
                      <div>
                        <h4 className="font-bold text-text text-base">Resume_Senior_Frontend_v2.pdf</h4>
                        <p className="text-xs text-text-secondary">Target Role: Senior React Developer</p>
                      </div>
                      <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/25">
                        <span className="font-black text-emerald-500 text-lg">82</span>
                        <span className="text-xs text-emerald-500 font-semibold uppercase tracking-wider">ATS MATCH</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border border-border rounded-lg p-4 bg-bg/50">
                        <span className="text-xs font-bold uppercase tracking-wider text-text-secondary block mb-2">
                          IDENTIFIED SKILLS
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-surface border border-border text-text">React</span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-surface border border-border text-text">TypeScript</span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-surface border border-border text-text">Vite</span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-surface border border-border text-text">TailwindCSS</span>
                        </div>
                      </div>
                      <div className="border border-border rounded-lg p-4 bg-bg/50">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-500 block mb-2">
                          MISSING RELEVANT SKILLS
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500">GraphQL</span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500">NextJS</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </FadeUpSection>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Teaser Section */}
      <section className="py-20 border-t border-border/50 bg-surface/30">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <FadeUpSection delay={0}>
            <Badge variant="neutral" className="mb-3">Simple Pricing</Badge>
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Get Started with No Commitments
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto mb-12 leading-relaxed">
              Analyze free, scan as guest, or upgrade to Pro to access our AI Bullet Rewrites.
            </p>
          </FadeUpSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            
            {/* Free Plan Box */}
            <FadeUpSection delay={80}>
              <Card className="h-full border-border bg-surface text-left">
                <CardContent className="pt-8">
                  <h3 className="text-lg font-bold text-text-secondary mb-1">Free Tier</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-black text-text">$0</span>
                    <span className="text-xs text-text-secondary font-medium">/ forever</span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed mb-6 border-b border-border pb-6">
                    Perfect for a quick initial health check of your resume.
                  </p>
                  <ul className="flex flex-col gap-3 mb-8">
                    {["1 ATS Score Scan", "Core Skill Extraction", "Overall ATS Checklist"].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-text-secondary">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant="secondary" className="w-full text-xs font-semibold" onClick={() => navigate('/signup')}>
                    Start Free
                  </Button>
                </CardContent>
              </Card>
            </FadeUpSection>

            {/* Pro Plan Box */}
            <FadeUpSection delay={160}>
              <Card className="h-full border-primary/40 bg-surface relative overflow-hidden text-left shadow-lg">
                <div className="absolute right-0 top-0 bg-primary text-white text-[10px] uppercase font-bold tracking-wider px-3.5 py-1 rounded-bl-lg">
                  Popular
                </div>
                <CardContent className="pt-8">
                  <h3 className="text-lg font-bold text-primary mb-1">Pro Plan</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-black text-text">$19</span>
                    <span className="text-xs text-text-secondary font-medium">/ month</span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed mb-6 border-b border-border pb-6">
                    Unlock full AI matching and bullet optimization rewrites.
                  </p>
                  <ul className="flex flex-col gap-3 mb-8">
                    {[
                      "Unlimited Resume Scans",
                      "Job Description Match Check",
                      "Bullet Rewrites AI Engine",
                      "Full PDF Report Exports"
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-text-secondary">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full text-xs font-semibold shadow-md" onClick={() => navigate('/pricing')}>
                    View Premium Plans
                  </Button>
                </CardContent>
              </Card>
            </FadeUpSection>
          </div>
        </div>
      </section>

      {/* Gradient Final-CTA Band */}
      <section className="relative overflow-hidden py-16 bg-gradient-to-r from-primary to-blue-900 text-white border-t border-border/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent_60%)]" />
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10 flex flex-col items-center gap-6">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight max-w-xl leading-tight">
            Ready to stand out in the recruiting stack?
          </h2>
          <p className="text-sm text-white/80 max-w-md leading-relaxed">
            Stop guessing if your resume works. Get a recruiter-grade analysis in under 10 seconds.
          </p>
          <div className="mt-2 flex flex-col sm:flex-row gap-3">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 active:scale-[0.98] border-none font-bold" onClick={() => navigate('/signup')}>
              Analyze My Resume Free
            </Button>
            <Button variant="outline" size="lg" className="text-white border-white/30 hover:bg-white/10 active:scale-[0.98] font-bold" onClick={() => navigate('/how-it-works')}>
              How It Works
            </Button>
          </div>
        </div>
      </section>



    </div>
  );
};

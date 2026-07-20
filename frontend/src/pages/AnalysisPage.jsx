import React from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  FileText, Calendar, FileCheck, Layers, Award, Sparkles, 
  ArrowLeft, Download, RefreshCw, AlertTriangle, CheckCircle 
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Chip } from '../components/ui/Chip';
import { Accordion } from '../components/ui/Accordion';
import { Skeleton } from '../components/ui/Skeleton';
import { ScoreGauge } from '../components/charts/ScoreGauge';
import { SubScoreBars } from '../components/charts/SubScoreBars';
import { api } from '../lib/api';

export const AnalysisPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch the completed analysis report
  const { data: analysis, isLoading: isLoadingAnalysis, error: analysisError } = useQuery({
    queryKey: ['analysis', id],
    queryFn: () => api.get(`/api/analysis/${id}`),
    enabled: !!id,
  });

  // Fetch resume details based on analysis resume_id to get word/page stats
  const { data: resume, isLoading: isLoadingResume } = useQuery({
    queryKey: ['resume', analysis?.resume_id],
    queryFn: () => api.get(`/api/resumes/${analysis.resume_id}`),
    enabled: !!analysis?.resume_id,
  });

  const handleDownloadPdf = () => {
    window.open(`http://127.0.0.1:8000/api/analysis/${id}/pdf`, '_blank');
  };

  const handleReanalyze = () => {
    navigate('/upload');
  };

  const isLoading = isLoadingAnalysis || isLoadingResume;

  if (analysisError) {
    return (
      <div className="min-h-screen bg-bg text-text flex flex-col justify-center items-center p-6">
        <Card className="max-w-md p-6 text-center border-danger/30">
          <CardContent className="flex flex-col items-center gap-4">
            <AlertTriangle className="w-12 h-12 text-danger" />
            <h2 className="text-xl font-bold">Failed to Load Analysis</h2>
            <p className="text-sm text-text-secondary">
              We couldn't retrieve the analysis report details. It may have been deleted or you might not have permission.
            </p>
            <Button className="w-full mt-2" onClick={() => navigate('/upload')}>
              Go to Upload
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate word count from raw resume text
  const wordCount = resume?.raw_text 
    ? resume.raw_text.trim().split(/\s+/).filter(Boolean).length 
    : 0;

  // Render Skeleton Loader
  if (isLoading || !analysis) {
    return (
      <div className="min-h-screen bg-bg text-text pb-20">
        {/* Header Skeleton */}
        <header className="bg-surface border-b border-border py-4 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton width="40px" height="40px" className="rounded-full" />
              <div className="flex flex-col gap-1.5">
                <Skeleton width="180px" height="20px" />
                <Skeleton width="120px" height="12px" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton width="100px" height="36px" />
              <Skeleton width="120px" height="36px" />
            </div>
          </div>
        </header>

        {/* Main Body Skeleton */}
        <div className="max-w-7xl mx-auto px-6 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left sticky rail skeleton */}
          <div className="lg:col-span-4 sticky top-24 flex flex-col gap-6">
            <Card className="border-border bg-surface p-6 flex flex-col items-center gap-6">
              <Skeleton variant="circle" width="160px" height="160px" />
              <div className="w-full flex flex-col gap-3">
                <Skeleton width="100%" height="44px" />
                <Skeleton width="100%" height="44px" />
                <Skeleton width="100%" height="44px" />
              </div>
            </Card>
          </div>

          {/* Right column content skeleton */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <Card className="border-border bg-surface p-6">
              <Skeleton width="150px" height="20px" className="mb-4" />
              <Skeleton width="100%" height="12px" className="mb-2" />
              <Skeleton width="100%" height="12px" className="mb-2" />
              <Skeleton width="80%" height="12px" />
            </Card>
            <Card className="border-border bg-surface p-6">
              <Skeleton width="180px" height="20px" className="mb-6" />
              <Skeleton width="100%" height="160px" />
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Format suggestions for the Accordion component
  const suggestionItems = (analysis.suggestions || []).map((sug) => ({
    title: `[${sug.category}] ${sug.issue}`,
    content: (
      <div className="flex flex-col gap-3">
        <p className="text-text-secondary leading-relaxed">
          <strong className="text-text">Feedback:</strong> {sug.suggestion}
        </p>
        
        {sug.before && (
          <div className="bg-danger/5 border border-danger/20 rounded p-3 text-xs text-text-secondary font-mono flex flex-col gap-1">
            <span className="text-danger font-extrabold uppercase tracking-wider text-[10px]">
              Original Block
            </span>
            <span className="italic">"{sug.before}"</span>
          </div>
        )}

        {sug.after && (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded p-3 text-xs text-text font-mono flex flex-col gap-1">
            <span className="text-emerald-500 font-extrabold uppercase tracking-wider text-[10px]">
              Suggested Rewrite
            </span>
            <span className="font-semibold">"{sug.after}"</span>
          </div>
        )}
      </div>
    )
  }));

  const uploadDate = resume?.uploaded_at 
    ? new Date(resume.uploaded_at).toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }) 
    : 'Unknown';

  return (
    <div className="min-h-screen bg-bg text-text pb-20 selection:bg-primary/20">
      
      {/* Sticky Top Header */}
      <header className="bg-surface border-b border-border py-4 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <button
              onClick={() => navigate('/upload')}
              className="p-1.5 rounded-full hover:bg-bg border border-border text-text-secondary hover:text-text cursor-pointer transition-colors"
              title="Back to Upload"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="overflow-hidden">
              <h1 className="text-base md:text-lg font-black text-text truncate max-w-[320px] md:max-w-[480px]">
                {resume?.filename || 'Resume Analysis Report'}
              </h1>
              <p className="text-xs text-text-secondary flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Scan Completed on {uploadDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button 
              variant="outline" 
              size="sm" 
              leftIcon={<Download className="w-4 h-4" />}
              onClick={handleDownloadPdf}
            >
              Download PDF
            </Button>
            <Button 
              size="sm" 
              leftIcon={<RefreshCw className="w-4 h-4" />}
              onClick={handleReanalyze}
            >
              Re-analyze
            </Button>
          </div>
        </div>
      </header>

      {/* Grid Container */}
      <div className="max-w-7xl mx-auto px-6 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Sticky Left Column (Rail) */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 flex flex-col gap-6">
          <Card className="border-border bg-surface p-6 shadow-sm flex flex-col items-center gap-6">
            
            {/* Overall Score */}
            <div className="w-full flex flex-col items-center border-b border-border pb-6">
              <ScoreGauge score={analysis.ats_score || 0} />
              <div className="mt-4 text-center">
                <Badge variant={analysis.ats_score >= 80 ? 'emerald' : analysis.ats_score >= 50 ? 'amber' : 'red'}>
                  Overall Score Band
                </Badge>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="w-full flex flex-col gap-3 text-sm">
              <h3 className="font-bold text-xs uppercase tracking-wider text-text-secondary text-left mb-1">
                Resume Statistics
              </h3>
              
              <div className="flex justify-between items-center py-2 border-b border-border/50 text-left">
                <span className="text-text-secondary font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" /> Page Count
                </span>
                <span className="font-bold text-text">{resume?.page_count || 1}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-border/50 text-left">
                <span className="text-text-secondary font-medium flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" /> Word Count
                </span>
                <span className="font-bold text-text">{wordCount}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-border/50 text-left">
                <span className="text-text-secondary font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" /> Upload Date
                </span>
                <span className="font-bold text-text">{uploadDate}</span>
              </div>
            </div>

          </Card>
        </div>

        {/* Scrollable Right Column (Detailed Blocks) */}
        <div className="lg:col-span-8 flex flex-col gap-6 text-left">
          
          {/* Job Description Custom Match (Conditional) */}
          {analysis.job_description && (
            <Card className="border-primary/30 bg-surface shadow-sm relative overflow-hidden">
              <div className="absolute left-0 top-0 h-full w-1.5 bg-primary" />
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" /> Target Job Matching Score
                </CardTitle>
                <CardDescription>How closely your content matches the pasted job description.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="bg-primary/10 border border-primary/20 px-4 py-2 rounded-lg text-left">
                    <span className="text-2xl font-black text-primary block leading-none">
                      {analysis.jd_match_score ? Math.round(analysis.jd_match_score) : 0}%
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
                      Context Similarity
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed max-w-md">
                    Based on language analysis and semantic patterns, this score shows how aligned your experience is with the role description requirements.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Executive Summary */}
          <Card className="border-border bg-surface shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold">Executive Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-secondary leading-relaxed">
                {analysis.summary || 'No summary overview provided.'}
              </p>
            </CardContent>
          </Card>

          {/* Subscores Breakdowns */}
          <Card className="border-border bg-surface shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold">ATS Metrics Audit</CardTitle>
              <CardDescription>Analysis breakdown across five critical recruitment layout factors.</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <SubScoreBars
                formatting={analysis.sub_scores?.Formatting || 0}
                keywordMatch={analysis.sub_scores?.['Keyword Match'] || 0}
                structure={analysis.sub_scores?.Structure || 0}
                readability={analysis.sub_scores?.Readability || 0}
                length={analysis.sub_scores?.Length || 0}
              />
            </CardContent>
          </Card>

          {/* Extracted Skills */}
          <Card className="border-border bg-surface shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold">Identified Skills</CardTitle>
              <CardDescription>Core capabilities and industry keywords extracted from your content.</CardDescription>
            </CardHeader>
            <CardContent>
              {analysis.extracted_skills && analysis.extracted_skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {analysis.extracted_skills.map((skill, idx) => (
                    <Chip key={idx} label={skill} className="text-xs font-semibold" />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-text-secondary">No core skills parsed from text.</p>
              )}
            </CardContent>
          </Card>

          {/* Missing Skills */}
          <Card className="border-border bg-surface shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-text">
                <AlertTriangle className="w-5 h-5 text-score-amber" /> Missing Relevant Keywords
              </CardTitle>
              <CardDescription>
                High-density tags missing from your resume that recruiters frequently search for.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analysis.missing_skills && analysis.missing_skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {analysis.missing_skills.map((skill, idx) => (
                    <span 
                      key={idx} 
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-score-amber/10 border border-score-amber/20 text-score-amber select-none"
                    >
                      + {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-emerald-500 font-bold flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> Perfect keyword matching! No missing tags identified.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Improvement Suggestions */}
          <Card className="border-border bg-surface shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold">Improvement Suggestions</CardTitle>
              <CardDescription>
                Line-by-line metrics and sentence optimization rewrites generated by AI.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {suggestionItems.length > 0 ? (
                <Accordion items={suggestionItems} className="border-border bg-surface/50" />
              ) : (
                <p className="text-xs text-text-secondary">No recommendations needed.</p>
              )}
            </CardContent>
          </Card>

          {/* Recommended Job Roles */}
          <Card className="border-border bg-surface shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" /> Recommended Job Roles
              </CardTitle>
              <CardDescription>
                Roles where your qualifications match the recruiting profile criteria.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {analysis.recommended_roles && analysis.recommended_roles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysis.recommended_roles.map((item, idx) => (
                    <Card key={idx} className="border-border/60 bg-bg/25">
                      <CardContent className="p-4 flex flex-col gap-3 text-left">
                        <div className="flex justify-between items-start gap-3">
                          <h4 className="font-bold text-sm text-text leading-snug">
                            {item.role}
                          </h4>
                          <span className="text-xs font-black text-primary shrink-0 bg-primary/10 px-2 py-0.5 rounded">
                            {item.match_percentage}% Match
                          </span>
                        </div>
                        
                        {/* Match Bar */}
                        <div className="w-full bg-border rounded-full h-1">
                          <div 
                            className="bg-primary h-full rounded-full" 
                            style={{ width: `${item.match_percentage}%` }}
                          />
                        </div>
                        
                        <p className="text-xs text-text-secondary leading-normal">
                          {item.reason}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-text-secondary">No role recommendations generated.</p>
              )}
            </CardContent>
          </Card>

        </div>
      </div>

    </div>
  );
};

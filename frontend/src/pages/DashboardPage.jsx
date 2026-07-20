import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  FileText, Sparkles, Plus, ArrowRight, TrendingUp, TrendingDown, 
  Lightbulb, ShieldCheck, RefreshCw, AlertCircle 
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/Toast';
import { api } from '../lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Chip } from '../components/ui/Chip';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { ScoreGauge } from '../components/charts/ScoreGauge';
import { ScoreTrendChart } from '../components/charts/ScoreTrendChart';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [tipIndex, setTipIndex] = useState(0);
  const [dismissTip, setDismissTip] = useState(false);

  // Fetch dashboard summary
  const { data: summary, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: () => api.get('/api/dashboard/summary'),
    enabled: !!user,
  });

  // Tip rotation logic
  useEffect(() => {
    if (summary?.tips && summary.tips.length > 0) {
      const interval = setInterval(() => {
        setTipIndex((prev) => (prev + 1) % summary.tips.length);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [summary?.tips]);

  const handleNextTip = () => {
    if (summary?.tips) {
      setTipIndex((prev) => (prev + 1) % summary.tips.length);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-bg text-text flex flex-col justify-center items-center p-6">
        <div className="max-w-md w-full">
          <ErrorState
            title="Failed to load dashboard summary"
            message={error.message || "We couldn't retrieve your dashboard analytics."}
            onRetry={refetch}
          />
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg text-text p-6 flex flex-col gap-6 text-left max-w-7xl mx-auto pt-8">
        <div className="flex justify-between items-center flex-wrap gap-4 mb-4">
          <div className="flex flex-col gap-2">
            <Skeleton width="180px" height="28px" />
            <Skeleton width="280px" height="18px" />
          </div>
          <Skeleton width="140px" height="40px" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 h-[320px]">
            <Skeleton width="100%" height="100%" className="rounded-xl" />
          </div>
          <div className="lg:col-span-8 h-[320px]">
            <Skeleton width="100%" height="100%" className="rounded-xl" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton width="100%" height="240px" className="rounded-xl" />
          <Skeleton width="100%" height="240px" className="rounded-xl" />
          <Skeleton width="100%" height="240px" className="rounded-xl" />
        </div>
      </div>
    );
  }

  const hasResumes = summary && summary.total_resumes > 0;

  // Empty state rendering
  if (!hasResumes) {
    return (
      <div className="min-h-screen bg-bg text-text p-6 flex flex-col justify-center items-center">
        <div className="max-w-xl w-full">
          <EmptyState
            icon={<FileText className="w-16 h-16 text-primary animate-pulse" />}
            title="No Resumes Uploaded Yet"
            description="Welcome to ResumeIQ! Get started by uploading your resume to check your ATS compatibility score and pinpoint critical skills gaps."
            actionButton={{
              onClick: () => navigate('/upload'),
              children: 'Analyze Your First Resume',
              className: 'font-bold px-6 shadow-md',
              leftIcon: <Plus className="w-4 h-4 mr-1.5" />
            }}
          />
        </div>
      </div>
    );
  }

  // Active score band mapping
  const getScoreBandBadge = (score) => {
    if (score >= 80) return <Badge variant="emerald">Emerald Band</Badge>;
    if (score >= 50) return <Badge variant="amber">Amber Band</Badge>;
    return <Badge variant="danger">Red Band</Badge>;
  };

  return (
    <div className="min-h-screen bg-bg text-text pb-20 selection:bg-primary/20 text-left">
      <main className="max-w-7xl mx-auto px-6 pt-8 flex flex-col gap-6">
        
        {/* Welcome Header Banner */}
        <div className="flex justify-between items-start md:items-center flex-wrap gap-4 border-b border-border/50 pb-6">
          <div>
            <h1 className="text-2xl font-black text-text tracking-tight">
              Welcome back, {user?.name || 'User'}
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              You have analyzed <span className="font-extrabold text-primary">{summary.total_resumes}</span> resume{summary.total_resumes !== 1 ? 's' : ''} in total.
            </p>
          </div>
          <Button
            onClick={() => navigate('/upload')}
            variant="primary"
            className="font-bold shadow-md cursor-pointer"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            New Analysis
          </Button>
        </div>

        {/* Rotating Tips Card */}
        {summary.tips && summary.tips.length > 0 && !dismissTip && (
          <Card className="border-primary/20 bg-primary/5 shadow-sm relative overflow-hidden">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Lightbulb className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider block">ATS Optimizer Tip</span>
                  <p className="text-sm text-text-secondary font-medium transition-opacity duration-300 mt-0.5">
                    {summary.tips[tipIndex]}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleNextTip} 
                  className="text-xs font-bold text-primary hover:text-primary-hover cursor-pointer"
                >
                  Next Tip
                </button>
                <button 
                  onClick={() => setDismissTip(true)} 
                  className="text-xs font-semibold text-text-secondary hover:text-text cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Section: Radial Score Gauge & Trend Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Average ATS Score */}
          <Card className="lg:col-span-4 border-border bg-surface shadow-sm flex flex-col justify-between">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Average ATS Score</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-6 flex-1">
              <div className="w-[180px] aspect-square flex items-center justify-center">
                <ScoreGauge score={summary.average_score} />
              </div>
              <div className="mt-4 flex flex-col items-center">
                <div className="flex items-center gap-1.5 mb-1">
                  {getScoreBandBadge(summary.average_score)}
                  
                  {summary.score_change_delta !== 0 && (
                    <span className={`text-xs font-bold flex items-center gap-0.5 ${
                      summary.score_change_delta > 0 ? 'text-score-emerald' : 'text-score-red'
                    }`}>
                      {summary.score_change_delta > 0 ? (
                        <>
                          <TrendingUp className="w-3.5 h-3.5" />
                          +{summary.score_change_delta} pts
                        </>
                      ) : (
                        <>
                          <TrendingDown className="w-3.5 h-3.5" />
                          {summary.score_change_delta} pts
                        </>
                      )}
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-secondary font-medium">Calculated across all completed analysis reports</p>
              </div>
            </CardContent>
          </Card>

          {/* Score History Line Chart */}
          <Card className="lg:col-span-8 border-border bg-surface shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Analysis Score Progress</CardTitle>
              <CardDescription>Visualizing compatibility progress across your last 10 uploads</CardDescription>
            </CardHeader>
            <CardContent className="h-[260px] pb-6">
              {summary.score_trend && summary.score_trend.length > 0 ? (
                <ScoreTrendChart data={summary.score_trend} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-text-secondary">
                  <p className="text-sm">Not enough data to display trend. Perform multiple scans to unlock.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Middle Row: Skills Grid & Role Recommendation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Top Extracted Skills */}
          <Card className="border-border bg-surface shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-score-emerald" /> Top Extracted Skills
              </CardTitle>
              <CardDescription>High-frequency competencies parsed from resumes</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              {summary.top_skills && summary.top_skills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {summary.top_skills.map((skill, idx) => (
                    <Chip key={idx} variant="muted" className="text-xs">
                      {skill.text} <span className="text-text-secondary font-bold text-[10px] ml-1">x{skill.value}</span>
                    </Chip>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-text-secondary font-medium">No skills extracted yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Top Missing Skills */}
          <Card className="border-border bg-surface shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-score-amber" /> Top Missing Keywords
              </CardTitle>
              <CardDescription>Target skills identified as missing across runs</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              {summary.top_missing_skills && summary.top_missing_skills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {summary.top_missing_skills.map((skill, idx) => (
                    <Chip key={idx} variant="outline" className="text-xs border-score-amber/35 text-score-amber bg-score-amber/5">
                      {skill.text} <span className="text-score-amber/70 text-[10px] font-bold ml-1">x{skill.value}</span>
                    </Chip>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-text-secondary font-medium">No missing keywords found.</p>
              )}
            </CardContent>
          </Card>

          {/* Recommended Careers */}
          <Card className="border-border bg-surface shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary" /> Recommended Job Roles
              </CardTitle>
              <CardDescription>Tailored pathways from your latest evaluation run</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3.5 pt-2">
              {summary.recommended_roles && summary.recommended_roles.length > 0 ? (
                summary.recommended_roles.map((item, idx) => (
                  <div key={idx} className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-text">{item.role}</span>
                      <span className="text-primary font-bold">{item.match_percentage}% Match</span>
                    </div>
                    <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-primary h-1.5 rounded-full transition-all duration-500" 
                        style={{ width: `${item.match_percentage}%` }}
                      />
                    </div>
                    {item.reason && (
                      <p className="text-[10px] text-text-secondary leading-normal font-medium mt-0.5">
                        {item.reason.length > 90 ? `${item.reason.slice(0, 90)}...` : item.reason}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-text-secondary font-medium">No role recommendations available.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row: Recent Analyses Row */}
        <Card className="border-border bg-surface shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4 border-b border-border/40 pb-4">
            <div>
              <CardTitle className="text-base font-bold text-text">Recent Resume Analyses</CardTitle>
              <CardDescription>Detailed summary reports for your last 5 resume uploads</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="font-bold flex items-center gap-1 cursor-pointer" onClick={() => navigate('/history')}>
              View All History <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {summary.recent_analyses && summary.recent_analyses.length > 0 ? (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-bg/30 text-xs font-bold text-text-secondary uppercase select-none">
                      <th className="px-6 py-3.5">Resume Filename</th>
                      <th className="px-6 py-3.5">Score</th>
                      <th className="px-6 py-3.5">Analysis Date</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {summary.recent_analyses.map((run, idx) => (
                      <tr key={idx} className="hover:bg-bg/25 transition-colors text-sm">
                        <td className="px-6 py-4 font-semibold text-text max-w-[280px] truncate">
                          {run.filename}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            run.ats_score >= 80 ? 'bg-score-emerald/10 text-score-emerald border border-score-emerald/20' :
                            run.ats_score >= 50 ? 'bg-score-amber/10 text-score-amber border border-score-amber/20' :
                            'bg-score-red/10 text-score-red border border-score-red/20'
                          }`}>
                            {run.ats_score || '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-text-secondary">
                          {new Date(run.created_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="font-bold hover:text-primary cursor-pointer text-xs"
                            onClick={() => navigate(`/analysis/${run.id}`)}
                          >
                            View Report
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-text-secondary text-sm">
                No recent analyses found.
              </div>
            )}
          </CardContent>
        </Card>

      </main>
    </div>
  );
};

export default DashboardPage;

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Loader2, Check, AlertCircle, RefreshCw, ChevronLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { useAnalysisPolling } from '../hooks/useAnalysisPolling';
import { api } from '../lib/api';

export const ProcessingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fakeProgress, setFakeProgress] = useState(0);
  const [analysisDetails, setAnalysisDetails] = useState(null);
  const [restarting, setRestarting] = useState(false);

  // Poll analysis status
  const { data: statusData, error: pollingError } = useAnalysisPolling(id);
  const status = statusData?.status || 'PENDING';

  // Fetch the full details in case we need to restart/re-run
  useEffect(() => {
    if (id) {
      api.get(`/api/analysis/${id}`)
        .then(setAnalysisDetails)
        .catch(console.error);
    }
  }, [id]);

  // Fake progress ring incrementer
  useEffect(() => {
    if (status === 'COMPLETED') {
      setFakeProgress(100);
      return;
    }
    if (status === 'FAILED') {
      return;
    }

    const interval = setInterval(() => {
      setFakeProgress((prev) => {
        if (prev < 30) return prev + 2;
        if (prev < 65) return prev + 1;
        if (prev < 92) return prev + 0.5;
        return prev;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [status]);

  // Navigation on completion
  useEffect(() => {
    if (status === 'COMPLETED' && fakeProgress === 100) {
      const timer = setTimeout(() => {
        navigate(`/analysis/${id}`);
      }, 800); // Small buffer to show checkmarks
      return () => clearTimeout(timer);
    }
  }, [status, fakeProgress, id, navigate]);

  const handleRestartAnalysis = async () => {
    if (!analysisDetails) {
      navigate('/upload');
      return;
    }

    setRestarting(true);
    try {
      const response = await api.post('/api/analysis/run', {
        resume_id: analysisDetails.resume_id,
        job_description: analysisDetails.job_description || null
      });
      // Redirect to the new analysis ID
      navigate(`/processing/${response.id}`);
      setFakeProgress(0);
    } catch (err) {
      console.error('Failed to restart analysis:', err);
      navigate('/upload');
    } finally {
      setRestarting(false);
    }
  };

  // Determine state for each of the 4 stages
  // States: 'pending', 'active', 'completed'
  const getStageState = (stageIndex) => {
    if (status === 'FAILED') return 'pending';
    
    switch (stageIndex) {
      case 0: // Extracting text
        if (fakeProgress >= 25) return 'completed';
        return 'active';
      case 1: // Identifying skills
        if (fakeProgress >= 55) return 'completed';
        if (fakeProgress >= 25) return 'active';
        return 'pending';
      case 2: // Comparing ATS rules
        if (fakeProgress >= 85) return 'completed';
        if (fakeProgress >= 55) return 'active';
        return 'pending';
      case 3: // Generating suggestions
        if (fakeProgress === 100) return 'completed';
        if (fakeProgress >= 85) return 'active';
        return 'pending';
      default:
        return 'pending';
    }
  };

  // Circular progress ring parameters
  const radius = 60;
  const stroke = 6;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (fakeProgress / 100) * circumference;

  const stages = [
    { label: 'Extracting text content...' },
    { label: 'Identifying professional skills...' },
    { label: 'Comparing ATS alignment rules...' },
    { label: 'Generating tailored suggestions...' }
  ];

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col justify-center items-center p-6 selection:bg-primary/20">
      
      {/* Brand logo */}
      <div className="flex items-center gap-2 cursor-pointer mb-6" onClick={() => navigate('/')}>
        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-extrabold text-lg">
          R
        </div>
        <span className="font-extrabold text-lg tracking-tight text-text">
          Resume<span className="text-primary">IQ</span>
        </span>
      </div>

      <Card className="w-full max-w-[440px] shadow-elevated border-border bg-surface text-center">
        <CardContent className="pt-8 pb-8 px-6 flex flex-col items-center gap-6">
          
          {status === 'FAILED' || pollingError ? (
            // Error Card View
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-14 h-14 rounded-full bg-danger/10 text-danger flex items-center justify-center shadow-sm">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-bold text-text">Analysis Failed</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Something went wrong while compiling your resume suggestions. Please try running the scanner again.
                </p>
              </div>
              <div className="flex gap-3 w-full mt-2">
                <Button variant="secondary" className="flex-1 text-xs" onClick={() => navigate('/upload')}>
                  Back to Upload
                </Button>
                <Button 
                  className="flex-1 text-xs" 
                  isLoading={restarting} 
                  onClick={handleRestartAnalysis}
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : (
            // Processing View
            <>
              {/* Animated Progress Ring */}
              <div className="relative flex items-center justify-center">
                <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
                  <circle
                    stroke="var(--color-border)"
                    fill="transparent"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    className="opacity-30"
                  />
                  <circle
                    stroke="var(--color-primary)"
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset }}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    className="transition-all duration-300 ease-out stroke-linecap-round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-black text-text">{Math.round(fakeProgress)}%</span>
                  <span className="text-[9px] uppercase tracking-wider font-bold text-text-secondary">Analyzing</span>
                </div>
              </div>

              {/* Title Header */}
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-bold text-text">Processing Resume</h3>
                <p className="text-xs text-text-secondary">
                  Auditing keywords, formatting guidelines, and parsing rules.
                </p>
              </div>

              {/* Stage Checklist */}
              <div className="w-full flex flex-col gap-3.5 border-t border-border/60 pt-5 text-left">
                {stages.map((stage, idx) => {
                  const stageState = getStageState(idx);

                  return (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-6 h-6 flex items-center justify-center shrink-0">
                        {stageState === 'completed' ? (
                          <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm animate-scale-in">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : stageState === 'active' ? (
                          <Loader2 className="w-5 h-5 text-primary animate-spin" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-border bg-bg/50" />
                        )}
                      </div>
                      <span className={`text-sm font-semibold transition-colors duration-200 ${
                        stageState === 'completed' ? 'text-text' : stageState === 'active' ? 'text-primary' : 'text-text-secondary'
                      }`}>
                        {stage.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}

        </CardContent>
      </Card>

    </div>
  );
};

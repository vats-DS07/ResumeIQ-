import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Modal } from './ui/Modal';
import { useToast } from './ui/Toast';
import { Badge } from './ui/Badge';
import { Chip } from './ui/Chip';
import { Accordion } from './ui/Accordion';
import { Tabs } from './ui/Tabs';
import { Skeleton } from './ui/Skeleton';
import { ProgressBar } from './ui/ProgressBar';
import { Avatar } from './ui/Avatar';
import { ToggleSwitch } from './ui/ToggleSwitch';
import { DropZone } from './ui/DropZone';
import { EmptyState } from './ui/EmptyState';
import { ErrorState } from './ui/ErrorState';

// Chart components
import { ScoreGauge } from './charts/ScoreGauge';
import { ScoreTrendChart } from './charts/ScoreTrendChart';
import { SubScoreBars } from './charts/SubScoreBars';

import {
  Sparkles,
  Search,
  Mail,
  User,
  FolderOpen,
  Smile,
  Laptop,
  TrendingUp
} from 'lucide-react';

export const ComponentPlayground = () => {
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toggleChecked, setToggleChecked] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');
  const [progressBarVal, setProgressBarVal] = useState(65);
  const [chipsList, setChipsList] = useState(['React', 'Tailwind', 'FastAPI', 'Vite', 'Gemini']);
  const [isButtonLoading, setIsButtonLoading] = useState(false);

  // Chart values
  const [gaugeScore, setGaugeScore] = useState(82);
  const [formattingScore, setFormattingScore] = useState(90);
  const [keywordMatchScore, setKeywordMatchScore] = useState(75);
  const [structureScore, setStructureScore] = useState(80);
  const [readabilityScore, setReadabilityScore] = useState(60);
  const [lengthScore, setLengthScore] = useState(45);

  const accordionItems = [
    {
      title: 'What is ResumeIQ?',
      content: 'ResumeIQ is an AI-powered resume analyzer that scans resumes, extracts structured sections, scores content quality, and provides actionable improvement feedback using Gemini models.',
    },
    {
      title: 'How are the score bands distributed?',
      content: 'ResumeIQ uses a color-coded scoring system locked across the platform: Red for critical issues (<50), Amber for moderate suggestions (50-79), and Emerald for highly polished candidates (>=80).',
    },
    {
      title: 'Is my data secure?',
      content: 'Yes! Guest sessions are temporary and easily claimed upon signing up. All parsed resumes and detailed results are bound to authenticated account permissions, and support cascading hard-deletes.',
    }
  ];

  const handleSimulateLoading = () => {
    setIsButtonLoading(true);
    toast.info('Loading Simulated', 'Triggering a 2-second mock loading state...');
    setTimeout(() => {
      setIsButtonLoading(false);
      toast.success('Complete!', 'Mock loading process finished successfully.');
    }, 2000);
  };

  const playgroundTabs = [
    {
      id: 'actions-inputs',
      label: 'Actions & Inputs',
      icon: <Mail className="w-4 h-4" />,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {/* Buttons Section */}
          <Card>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
              <CardDescription>Various styles and loading indicators</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" size="sm">Small</Button>
                <Button variant="primary" size="md">Medium</Button>
                <Button variant="primary" size="lg">Large</Button>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="primary"
                  isLoading={isButtonLoading}
                  onClick={handleSimulateLoading}
                >
                  Click to Load
                </Button>
                <Button variant="outline" leftIcon={<Sparkles className="w-4 h-4" />}>
                  With Left Icon
                </Button>
                <Button variant="secondary" rightIcon={<Search className="w-4 h-4" />}>
                  With Right Icon
                </Button>
                <Button variant="primary" disabled>
                  Disabled
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Inputs Section */}
          <Card>
            <CardHeader>
              <CardTitle>Text Inputs</CardTitle>
              <CardDescription>Inputs and textareas with labels, errors, and icons</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Input
                label="Full Name"
                placeholder="John Doe"
                leftIcon={<User className="w-4 h-4" />}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                helperText="Enter your name as it appears on official docs"
              />
              <Input
                label="Email Address (Simulated Error)"
                placeholder="john@example.com"
                type="email"
                leftIcon={<Mail className="w-4 h-4" />}
                error={inputValue.length > 0 && !inputValue.includes('@') ? 'Please enter a valid email address' : null}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <Textarea
                label="Professional Summary"
                placeholder="Briefly detail your experience and core skills..."
                value={textareaValue}
                onChange={(e) => setTextareaValue(e.target.value)}
                helperText="Maximum 500 characters"
              />
            </CardContent>
          </Card>

          {/* DropZone Section */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>DropZone File Upload</CardTitle>
              <CardDescription>Interactive drag and drop file field with validation</CardDescription>
            </CardHeader>
            <CardContent>
              <DropZone
                onFileDrop={(file) => {
                  toast.success('File Uploaded!', `Selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
                }}
                acceptedTypes={['application/pdf']}
                maxSize={5 * 1024 * 1024}
                helperText="Only PDF resumes are supported. Max size 5MB."
              />
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 'data-display',
      label: 'Data & Badges',
      icon: <Sparkles className="w-4 h-4" />,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {/* Progress Bars & Score Bands */}
          <Card>
            <CardHeader>
              <CardTitle>Progress & Score Bands</CardTitle>
              <CardDescription>Platform-wide score color states matching strict ranges</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-text">Interactive Adjuster: {progressBarVal}%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progressBarVal}
                  onChange={(e) => setProgressBarVal(Number(e.target.value))}
                  className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <ProgressBar
                label="Dynamic Resume Score"
                value={progressBarVal}
                showValue
                colorMode="score-banded"
              />

              <div className="grid grid-cols-3 gap-2 text-center text-xs mt-2 border border-border p-3 rounded-md bg-bg">
                <div>
                  <span className="block font-bold text-score-red">&lt; 50</span>
                  <span className="text-text-secondary">Red band</span>
                </div>
                <div>
                  <span className="block font-bold text-score-amber">50 - 79</span>
                  <span className="text-text-secondary">Amber band</span>
                </div>
                <div>
                  <span className="block font-bold text-score-emerald">&gt;= 80</span>
                  <span className="text-text-secondary">Emerald band</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <ProgressBar label="Static Neutral Score (Static Mode)" value={progressBarVal} showValue colorMode="static" />
              </div>
            </CardContent>
          </Card>

          {/* Badges, Chips & Avatars */}
          <Card>
            <CardHeader>
              <CardTitle>Badges, Chips & Avatars</CardTitle>
              <CardDescription>Sleek visual descriptors and selection chips</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div>
                <h4 className="text-sm font-semibold text-text mb-2.5">Badge Variants</h4>
                <div className="flex flex-wrap gap-2.5">
                  <Badge variant="primary">Primary</Badge>
                  <Badge variant="neutral">Neutral</Badge>
                  <Badge variant="emerald">Emerald (&gt;=80)</Badge>
                  <Badge variant="amber">Amber (50-79)</Badge>
                  <Badge variant="red">Red (&lt;50)</Badge>
                </div>
                <div className="flex flex-wrap gap-2.5 mt-2">
                  <Badge variant="primary" outline>Outline Primary</Badge>
                  <Badge variant="emerald" outline>Outline Emerald</Badge>
                  <Badge variant="red" outline>Outline Red</Badge>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-text mb-2.5">Chips & Active States</h4>
                <div className="flex flex-wrap gap-2.5">
                  {chipsList.map((c) => (
                    <Chip
                      key={c}
                      label={c}
                      onDelete={() => {
                        setChipsList(prev => prev.filter(item => item !== c));
                        toast.warning('Chip Removed', `Removed skill badge: ${c}`);
                      }}
                      onClick={() => toast.info('Chip Clicked', `Selected chip: ${c}`)}
                    />
                  ))}
                  {chipsList.length === 0 && (
                    <Button variant="outline" size="sm" onClick={() => setChipsList(['React', 'Tailwind', 'FastAPI'])}>
                      Reset Chips
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-text mb-2.5">Avatars & Status Indicators</h4>
                <div className="flex flex-wrap items-center gap-4">
                  <Avatar name="Alex Mercer" status="online" size="sm" />
                  <Avatar name="Betty Cooper" status="away" size="md" />
                  <Avatar name="Charlie Brown" status="busy" size="lg" />
                  <Avatar src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Sarah" status="online" size="md" />
                  <Avatar name="Invalid Image Initials Fallback" src="https://invalid-url-here.xyz/img.jpg" status="offline" size="md" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 'containers-nav',
      label: 'Layouts & Dynamic UI',
      icon: <Laptop className="w-4 h-4" />,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {/* Accordion Card */}
          <Card>
            <CardHeader>
              <CardTitle>Accordion Panel</CardTitle>
              <CardDescription>Collapsible panels with smooth height adjustments</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion items={accordionItems} />
            </CardContent>
          </Card>

          {/* Interactive Triggers */}
          <Card>
            <CardHeader>
              <CardTitle>Triggers & Toggles</CardTitle>
              <CardDescription>Toggle controls and modal actions</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <ToggleSwitch
                  checked={toggleChecked}
                  onChange={(checked) => {
                    setToggleChecked(checked);
                    toast.success('Toggle Updated', `Switch is now ${checked ? 'ON' : 'OFF'}`);
                  }}
                  label="Receive weekly analysis summary reports"
                />
                <ToggleSwitch
                  checked={true}
                  disabled
                  label="Two-factor authentication (Enforced)"
                />
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="text-sm font-semibold text-text mb-3">Modal Demonstrator</h4>
                <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                  Launch Interactive Modal
                </Button>
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="text-sm font-semibold text-text mb-3">Toast Dispatchers</h4>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => toast.success('Success Notification', 'Resume analysis parsing finished successfully.')}>
                    Success Toast
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toast.error('Parsing Failed', 'PDF file structure could not be parsed.')}>
                    Error Toast
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toast.warning('Missing Sections', 'Your resume is missing a clear Skills list.')}>
                    Warning Toast
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toast.info('Update Available', 'System maintenance tonight at 12:00 AM.')}>
                    Info Toast
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 'feedback-loading',
      label: 'Feedback states',
      icon: <Smile className="w-4 h-4" />,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {/* Skeleton Loaders */}
          <Card>
            <CardHeader>
              <CardTitle>Skeleton Loaders</CardTitle>
              <CardDescription>Pulsing shapes simulating pending API payloads</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Skeleton variant="circle" width="48px" height="48px" />
                <div className="flex-1 flex flex-col gap-2">
                  <Skeleton variant="text" width="60%" height="16px" />
                  <Skeleton variant="text" width="40%" height="12px" />
                </div>
              </div>
              <div className="mt-2 flex flex-col gap-3">
                <Skeleton variant="rectangle" width="100%" height="100px" />
                <Skeleton variant="text" height="12px" />
                <Skeleton variant="text" height="12px" />
                <Skeleton variant="text" width="80%" height="12px" />
              </div>
            </CardContent>
          </Card>

          {/* Error States card */}
          <Card>
            <CardHeader>
              <CardTitle>Error Display State</CardTitle>
              <CardDescription>Rendered when networks timeout or validations fail</CardDescription>
            </CardHeader>
            <CardContent>
              <ErrorState
                title="Failed to fetch Resume score"
                message="The connection to the AI processing service timed out. Please check your internet connectivity and try again."
                onRetry={() => toast.success('Retrying...', 'Re-establishing secure API tunnel...')}
              />
            </CardContent>
          </Card>

          {/* Empty States card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Empty Dashboard State</CardTitle>
              <CardDescription>Shown when user accounts do not have uploaded files yet</CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={<FolderOpen className="w-12 h-12" />}
                title="No resumes analyzed yet"
                description="Upload your resume in PDF format to receive instant AI scoring, suggestions, and career path alignment details."
                actionButton={{
                  variant: 'primary',
                  onClick: () => setIsModalOpen(true),
                  children: 'Analyze First Resume'
                }}
              />
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 'charts',
      label: 'Charts & Analytics',
      icon: <TrendingUp className="w-4 h-4" />,
      content: (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Circular Score Gauge */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Score Gauge</CardTitle>
              <CardDescription>Radial progress bar with dynamic colors and count-up animation</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-between gap-6">
              <ScoreGauge score={gaugeScore} />
              
              <div className="w-full flex flex-col gap-2 mt-4">
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-text">Adjust Score:</span>
                  <span className="text-primary">{gaugeScore}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={gaugeScore}
                  onChange={(e) => setGaugeScore(Number(e.target.value))}
                  className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            </CardContent>
          </Card>

          {/* Sub-Score Bars */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Resume Sub-Scores</CardTitle>
              <CardDescription>Horizontal comparisons across key evaluation pillars</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-center">
                <SubScoreBars
                  formatting={formattingScore}
                  keywordMatch={keywordMatchScore}
                  structure={structureScore}
                  readability={readabilityScore}
                  length={lengthScore}
                />
              </div>
              
              <div className="flex flex-col gap-4">
                <h4 className="font-bold text-sm text-text border-b border-border pb-2">Adjust Sub-Scores</h4>
                {[
                  { label: 'Formatting', val: formattingScore, set: setFormattingScore },
                  { label: 'Keyword Match', val: keywordMatchScore, set: setKeywordMatchScore },
                  { label: 'Structure', val: structureScore, set: setStructureScore },
                  { label: 'Readability', val: readabilityScore, set: setReadabilityScore },
                  { label: 'Length', val: lengthScore, set: setLengthScore },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col gap-1 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span className="text-text-secondary">{s.label}</span>
                      <span className="text-text font-bold">{s.val}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={s.val}
                      onChange={(e) => s.set(Number(e.target.value))}
                      className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Score Trend Line Chart */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Score History Trend</CardTitle>
              <CardDescription>Monotone curve showing performance across historical resume revisions</CardDescription>
            </CardHeader>
            <CardContent>
              <ScoreTrendChart
                data={[
                  { label: 'v1.0 (Draft)', score: 42 },
                  { label: 'v1.1 (Reformatted)', score: 58 },
                  { label: 'v1.2 (Keywords Added)', score: 65 },
                  { label: 'v1.3 (Structure Mod)', score: 82 },
                  { label: 'v1.4 (Latest)', score: gaugeScore },
                ]}
              />
            </CardContent>
          </Card>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-bg p-6 md:p-12 flex flex-col gap-8">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold border border-primary/20">
              Developer Sandbox
            </span>
            <span className="bg-score-emerald/10 text-score-emerald px-3 py-1 rounded-full text-xs font-bold border border-score-emerald/20">
              Vite + Tailwind v4
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text md:text-4xl">
            ResumeIQ UI Playground
          </h1>
          <p className="text-text-secondary mt-1 max-w-xl">
            Interactive playground demonstrating 17 premium custom UI primitives built from scratch using our CSS token system.
          </p>
        </div>
      </header>

      {/* Main Sandbox Tabs */}
      <Tabs tabs={playgroundTabs} variant="pills" />

      {/* Interactive Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Resume Analysis Setup"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setIsModalOpen(false);
                toast.success('Configuration Saved', 'Your preferences have been successfully updated.');
              }}
            >
              Analyze Resume
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-text-secondary">
            Provide the required details to begin parsing and scoring. AI will check grammatical structure, formatting, keywords density, and section completeness.
          </p>
          <Input label="Target Job Description / Title" placeholder="e.g. Senior Software Engineer" />
          <ToggleSwitch
            checked={toggleChecked}
            onChange={setToggleChecked}
            label="Incorporate candidate experience level scoring"
          />
        </div>
      </Modal>
    </div>
  );
};
export default ComponentPlayground;

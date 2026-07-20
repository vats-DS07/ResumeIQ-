import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FileText, UploadCloud, Trash2, ArrowRight, Sparkles, 
  HelpCircle, AlertCircle, FileCheck2, Info, ChevronDown, ChevronUp 
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { DropZone } from '../components/ui/DropZone';
import { api } from '../lib/api';

export const UploadPage = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedResume, setUploadedResume] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const [jobDescription, setJobDescription] = useState('');
  const [showJd, setShowJd] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileDrop = (selectedFile) => {
    setUploadError(null);
    setUploadedResume(null);
    setFile(selectedFile);
    setIsUploading(true);
    setUploadProgress(0);

    // Progressive upload using XMLHttpRequest
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://127.0.0.1:8000/api/resumes/upload');
    xhr.withCredentials = true;

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percentage = Math.round((e.loaded / e.total) * 100);
        setUploadProgress(percentage);
      }
    });

    xhr.addEventListener('load', () => {
      setIsUploading(false);
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          setUploadedResume(response);
        } catch (err) {
          setUploadError('Failed to parse upload response.');
          setFile(null);
        }
      } else {
        try {
          const errData = JSON.parse(xhr.responseText);
          setUploadError(errData.detail || 'Upload failed.');
        } catch (_) {
          setUploadError('Upload failed.');
        }
        setFile(null);
      }
    });

    xhr.addEventListener('error', () => {
      setIsUploading(false);
      setUploadError('Network error during file upload.');
      setFile(null);
    });

    const formData = new FormData();
    formData.append('file', selectedFile);
    xhr.send(formData);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setUploadedResume(null);
    setUploadProgress(0);
    setIsUploading(false);
    setUploadError(null);
  };

  const handleAnalyze = async () => {
    if (!uploadedResume) return;

    setIsAnalyzing(true);
    try {
      const response = await api.post('/api/analysis/run', {
        resume_id: uploadedResume.id,
        job_description: jobDescription.trim() || null
      });
      navigate(`/processing/${response.id}`);
    } catch (err) {
      setUploadError(err.message || 'Failed to initiate analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text selection:bg-primary/20">
      
      {/* Header */}
      <header className="bg-surface border-b border-border py-4 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-extrabold text-lg">
              R
            </div>
            <span className="font-extrabold text-lg tracking-tight text-text">
              Resume<span className="text-primary">IQ</span>
            </span>
          </div>
          
          <nav className="flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-text-secondary hover:text-text transition-colors">
              Home
            </Link>
            <Link to="/how-it-works" className="text-sm font-medium text-text-secondary hover:text-text transition-colors">
              How It Works
            </Link>
          </nav>

          <Button size="sm" variant="secondary" onClick={() => navigate('/')}>
            Exit
          </Button>
        </div>
      </header>

      {/* Upload Flow Container */}
      <main className="max-w-xl mx-auto px-6 py-12 flex flex-col gap-8 text-left">
        
        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              Step 1 of 2
            </span>
            <h2 className="text-xl font-extrabold text-text">
              Upload Resume
            </h2>
          </div>
          <div className="text-xs font-medium text-text-secondary">
            Next: Review & Analyze
          </div>
        </div>

        {/* Info Notification */}
        <div className="bg-primary/5 border border-primary/10 rounded-lg p-3.5 flex items-start gap-2.5 text-xs text-text-secondary leading-relaxed">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <span>
            For optimal scores, use a standard layout without textboxes, icons, or complex tables. Ensure it contains your name, email, and clear experience blocks.
          </span>
        </div>

        {/* Upload Action */}
        {!file && (
          <div className="flex flex-col gap-1.5">
            <DropZone
              onFileDrop={handleFileDrop}
              acceptedTypes={[
                'application/pdf',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/msword'
              ]}
              maxSize={5 * 1024 * 1024}
              helperText="PDF, DOCX formats up to 5MB"
              className="py-12"
            />
          </div>
        )}

        {/* File Preview Card & Progress */}
        {file && (
          <Card className="border-border bg-surface relative overflow-hidden shadow-sm">
            <CardContent className="p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-bold text-sm text-text truncate max-w-[280px]">
                      {file.name}
                    </h4>
                    <p className="text-xs text-text-secondary">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                {!isUploading && (
                  <button
                    onClick={handleRemoveFile}
                    className="text-text-secondary hover:text-danger p-1.5 rounded hover:bg-bg transition-colors cursor-pointer"
                    title="Remove file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Progress bar */}
              <div className="flex flex-col gap-1 mt-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-text-secondary">
                    {isUploading ? 'Uploading file...' : 'Upload complete'}
                  </span>
                  <span className="text-primary">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-300 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Inline API / Upload Errors */}
        {uploadError && (
          <div className="bg-danger/10 border border-danger/20 rounded-md p-3.5 flex items-start gap-2.5 text-danger text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Collapsible Job Description Textarea */}
        <div className="border border-border rounded-lg overflow-hidden bg-surface shadow-sm">
          <button
            type="button"
            onClick={() => setShowJd(!showJd)}
            className="w-full px-5 py-3.5 flex items-center justify-between font-bold text-sm hover:bg-bg/20 transition-colors cursor-pointer select-none"
          >
            <span className="flex items-center gap-2 text-text">
              <Sparkles className="w-4 h-4 text-primary" />
              Paste Job Description for match scoring (Optional)
            </span>
            {showJd ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {showJd && (
            <div className="px-5 pb-5 border-t border-border/60 pt-4 flex flex-col gap-2">
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value.slice(0, 5000))}
                placeholder="Paste the target job description details here to calculate matching keywords and skills gaps..."
                rows={6}
                className="w-full rounded-md border border-border bg-bg/25 px-3 py-2 text-sm text-text placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent resize-none"
              />
              <div className="flex justify-end text-xs text-text-secondary font-semibold">
                {jobDescription.length} / 5000 characters
              </div>
            </div>
          )}
        </div>

        {/* Analyze Button */}
        <Button
          size="lg"
          className="w-full font-bold shadow-md py-3.5 flex items-center justify-center gap-2 group"
          disabled={!uploadedResume || isUploading || isAnalyzing}
          isLoading={isAnalyzing}
          onClick={handleAnalyze}
        >
          Analyze My Resume
          <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
        </Button>
      </main>

      {/* Footer */}
      <footer className="bg-surface border-t border-border py-8 text-center mt-20">
        <p className="text-xs text-text-secondary">
          © {new Date().getFullYear()} ResumeIQ. All rights reserved.
        </p>
      </footer>

    </div>
  );
};

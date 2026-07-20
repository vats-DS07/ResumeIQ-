import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, SlidersHorizontal, ArrowUpDown, Trash2, FileText, 
  ExternalLink, Calendar, Award, RefreshCw 
} from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../components/ui/Toast';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';

export const HistoryPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();

  // Filter and Sorting state
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date-desc'); // date-desc, date-asc, score-desc, score-asc
  const [filterBand, setFilterBand] = useState('all'); // all, emerald, amber, red

  // Delete Resume State
  const [deleteTarget, setDeleteTarget] = useState(null); // resume ID
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch resumes list
  const { data: resumes = [], isLoading, error, refetch } = useQuery({
    queryKey: ['resumesHistory'],
    queryFn: () => api.get('/api/resumes'),
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/api/resumes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['resumesHistory']);
      queryClient.invalidateQueries(['dashboardSummary']);
      toast.success('Resume Deleted', 'The resume and its analyses were permanently removed.');
      setDeleteTarget(null);
    },
    onError: (err) => {
      toast.error('Deletion Failed', err.message || 'Unable to delete the resume.');
    },
    onSettled: () => {
      setIsDeleting(false);
    }
  });

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      setIsDeleting(true);
      deleteMutation.mutate(deleteTarget);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-bg text-text flex flex-col justify-center items-center p-6">
        <div className="max-w-md w-full">
          <ErrorState
            title="Failed to load resume history"
            message={error.message || "We couldn't retrieve your previous uploads."}
            onRetry={refetch}
          />
        </div>
      </div>
    );
  }

  // Score band detection
  const getScoreBand = (score) => {
    if (score === null || score === undefined) return 'none';
    if (score >= 80) return 'emerald';
    if (score >= 50) return 'amber';
    return 'red';
  };

  const getScoreBadge = (score) => {
    if (score === null || score === undefined) {
      return <Badge variant="neutral">Pending / Failed</Badge>;
    }
    if (score >= 80) return <Badge variant="emerald">{score}</Badge>;
    if (score >= 50) return <Badge variant="amber">{score}</Badge>;
    return <Badge variant="danger">{score}</Badge>;
  };

  // Filter and sort logic
  const filteredResumes = resumes
    .filter((r) => {
      const matchesSearch = r.filename.toLowerCase().includes(search.toLowerCase());
      const band = getScoreBand(r.ats_score);
      const matchesBand = filterBand === 'all' || band === filterBand;
      return matchesSearch && matchesBand;
    })
    .sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.uploaded_at) - new Date(a.uploaded_at);
      }
      if (sortBy === 'date-asc') {
        return new Date(a.uploaded_at) - new Date(b.uploaded_at);
      }
      if (sortBy === 'score-desc') {
        const scoreA = a.ats_score ?? -1;
        const scoreB = b.ats_score ?? -1;
        return scoreB - scoreA;
      }
      if (sortBy === 'score-asc') {
        const scoreA = a.ats_score ?? 101;
        const scoreB = b.ats_score ?? 101;
        return scoreA - scoreB;
      }
      return 0;
    });

  return (
    <div className="min-h-screen bg-bg text-text pb-20 selection:bg-primary/20 text-left">
      <main className="max-w-6xl mx-auto px-6 pt-8 flex flex-col gap-6">
        
        {/* Header */}
        <div className="border-b border-border/50 pb-6 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-text">Resume Audit History</h1>
            <p className="text-sm text-text-secondary mt-1">Browse, search, sort, and manage all your historical resume uploads.</p>
          </div>
          <Button
            onClick={() => navigate('/upload')}
            variant="primary"
            className="font-bold shadow-md cursor-pointer"
          >
            Upload Resume
          </Button>
        </div>

        {/* Controls: Search, Filter & Sort */}
        <Card className="border-border bg-surface shadow-sm">
          <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:max-w-xs">
              <Search className="w-4 h-4 text-text-secondary absolute left-3 top-3.5" />
              <input
                type="text"
                placeholder="Search resumes by filename..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-bg text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            {/* Filter and Sort Selects */}
            <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
              <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary shrink-0">
                <SlidersHorizontal className="w-3.5 h-3.5" /> Filter score:
              </div>
              <select
                value={filterBand}
                onChange={(e) => setFilterBand(e.target.value)}
                className="text-sm px-3 py-1.5 border border-border bg-bg text-text rounded-lg cursor-pointer focus:outline-none focus:border-primary"
              >
                <option value="all">All Score Bands</option>
                <option value="emerald">Emerald (80+)</option>
                <option value="amber">Amber (50-79)</option>
                <option value="red">Red (&lt;50)</option>
              </select>

              <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary shrink-0">
                <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm px-3 py-1.5 border border-border bg-bg text-text rounded-lg cursor-pointer focus:outline-none focus:border-primary"
              >
                <option value="date-desc">Newest Uploads</option>
                <option value="date-asc">Oldest Uploads</option>
                <option value="score-desc">Highest Score</option>
                <option value="score-asc">Lowest Score</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="flex flex-col gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} width="100%" height="70px" className="rounded-xl" />
            ))}
          </div>
        )}

        {/* Table & Cards List View */}
        {!isLoading && filteredResumes.length > 0 && (
          <>
            {/* Desktop Table View */}
            <Card className="hidden md:block border-border bg-surface shadow-sm overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border bg-bg/30 text-xs font-bold text-text-secondary uppercase select-none">
                    <th className="px-6 py-4">Filename</th>
                    <th className="px-6 py-4">ATS Match Score</th>
                    <th className="px-6 py-4">Upload Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-sm">
                  {filteredResumes.map((resume) => (
                    <tr key={resume.id} className="hover:bg-bg/25 transition-colors">
                      <td className="px-6 py-4 font-semibold text-text max-w-[320px] truncate">
                        {resume.filename}
                      </td>
                      <td className="px-6 py-4">
                        {getScoreBadge(resume.ats_score)}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-text-secondary">
                        {new Date(resume.uploaded_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                        {resume.analysis_id ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="font-bold hover:text-primary cursor-pointer text-xs"
                            onClick={() => navigate(`/analysis/${resume.analysis_id}`)}
                            leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                          >
                            View Report
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="font-bold hover:text-primary cursor-pointer text-xs"
                            onClick={() => navigate(`/processing/${resume.id}`)}
                            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                          >
                            Analyze
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="font-bold text-danger hover:bg-danger/5 cursor-pointer text-xs"
                          onClick={() => setDeleteTarget(resume.id)}
                          leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            {/* Mobile Stacked Card View */}
            <div className="flex flex-col gap-4 md:hidden">
              {filteredResumes.map((resume) => (
                <Card key={resume.id} className="border-border bg-surface shadow-sm">
                  <div className="p-5 flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="max-w-[200px] truncate">
                        <h3 className="font-extrabold text-text text-base leading-tight break-all">
                          {resume.filename}
                        </h3>
                        <span className="text-[10px] text-text-secondary font-semibold flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3 text-primary" />
                          {new Date(resume.uploaded_at).toLocaleDateString()}
                        </span>
                      </div>
                      {getScoreBadge(resume.ats_score)}
                    </div>
                    <div className="flex items-center gap-2 border-t border-border/60 pt-3.5">
                      {resume.analysis_id ? (
                        <Button
                          size="sm"
                          className="flex-1 text-xs font-bold shadow-sm"
                          onClick={() => navigate(`/analysis/${resume.analysis_id}`)}
                        >
                          View Report
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="flex-1 text-xs font-bold shadow-sm"
                          onClick={() => navigate(`/processing/${resume.id}`)}
                        >
                          Run Analysis
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="secondary"
                        className="text-danger border-danger/10 hover:bg-danger/5 shadow-sm"
                        onClick={() => setDeleteTarget(resume.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Empty States */}
        {!isLoading && filteredResumes.length === 0 && (
          <EmptyState
            icon={<FileText className="w-12 h-12 text-primary" />}
            title={resumes.length === 0 ? "No Resumes Uploaded Yet" : "No Match Found"}
            description={
              resumes.length === 0
                ? "You haven't uploaded any resumes to check yet. Start building your portfolio now!"
                : "No resumes match your search queries or selected score band. Try clearing filters."
            }
            actionButton={
              resumes.length === 0
                ? {
                    onClick: () => navigate('/upload'),
                    children: 'Upload Your Resume',
                    className: 'font-bold px-5'
                  }
                : {
                    onClick: () => {
                      setSearch('');
                      setFilterBand('all');
                    },
                    children: 'Reset Filter Settings',
                    className: 'font-bold px-5 bg-border hover:bg-border/80 border-none text-text'
                  }
            }
          />
        )}

        {/* Confirmation Modal */}
        <Modal 
          isOpen={!!deleteTarget} 
          onClose={() => setDeleteTarget(null)}
          size="sm"
          title="Permanently Delete Resume?"
          footer={
            <>
              <Button variant="ghost" onClick={() => setDeleteTarget(null)} className="font-semibold text-xs text-text-secondary">
                Cancel
              </Button>
              <Button
                variant="primary"
                className="bg-danger hover:bg-danger/90 hover:scale-[1.02] border-none font-bold text-xs"
                onClick={handleDeleteConfirm}
                isLoading={isDeleting}
                disabled={isDeleting}
              >
                Permanently Delete
              </Button>
            </>
          }
        >
          <p className="text-sm text-text-secondary leading-relaxed">
            Are you sure you want to delete this resume audit? Doing so will permanently wipe the file from storage and remove all historical analysis metrics and score outputs. This action is irreversible.
          </p>
        </Modal>

      </main>
    </div>
  );
};

export default HistoryPage;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  User, Award, FileText, Calendar, Star, Briefcase, 
  ArrowLeft, Save, Sparkles, AlertCircle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/Toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Skeleton } from '../components/ui/Skeleton';
import { Textarea } from '../components/ui/Textarea';
import { ErrorState } from '../components/ui/ErrorState';
import { api } from '../lib/api';

export const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // Fetch statistics
  const { data: stats, isLoading: isLoadingStats, error: statsError, refetch: refetchStats } = useQuery({
    queryKey: ['userStats'],
    queryFn: () => api.get('/api/users/me/stats'),
    enabled: !!user,
  });

  // Profile fields state
  const [name, setName] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [bio, setBio] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Sync state with user context on load/change
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setTargetRole(user.target_role || '');
      setBio(user.bio || '');
    }
  }, [user]);

  // Check if form is dirty
  const isDirty = 
    name !== (user?.name || '') || 
    targetRole !== (user?.target_role || '') || 
    bio !== (user?.bio || '');

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Validation Error', 'Full Name is a required field.');
      return;
    }

    setIsSaving(true);
    try {
      await api.put('/api/users/me', {
        name: name.trim(),
        target_role: targetRole.trim() || null,
        bio: bio.trim() || null
      });
      await refreshUser();
      await refetchStats();
      toast.success('Profile Saved', 'Your profile details have been updated.');
    } catch (err) {
      toast.error('Save Failed', err.message || 'Unable to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const memberSinceDate = stats?.member_since
    ? new Date(stats.member_since).toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : 'Unknown';

  if (statsError) {
    return (
      <div className="min-h-screen bg-bg text-text flex flex-col justify-center items-center p-6">
        <div className="max-w-md w-full">
          <ErrorState
            title="Failed to load profile stats"
            message={statsError.message || "We couldn't load your profile statistics."}
            onRetry={refetchStats}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text pb-20 selection:bg-primary/20">
      
      {/* Header */}
      <header className="bg-surface border-b border-border py-4 sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 text-left">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-1.5 rounded-full hover:bg-bg border border-border text-text-secondary hover:text-text cursor-pointer transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-lg font-black text-text">User Profile</h1>
              <p className="text-xs text-text-secondary">View stats and customize your targeted career role</p>
            </div>
          </div>
          <Button size="sm" variant="secondary" onClick={() => navigate('/dashboard')}>
            Exit
          </Button>
        </div>
      </header>

      {/* Main Profile Grid */}
      <main className="max-w-4xl mx-auto px-6 pt-8 flex flex-col gap-8 text-left">
        
        {/* Profile Card Header */}
        <Card className="border-border bg-surface shadow-sm">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <Avatar name={user?.name} size="lg" className="border-2 border-primary/20" />
            <div className="flex-1 flex flex-col">
              <h2 className="text-xl font-extrabold text-text leading-tight">{user?.name}</h2>
              <p className="text-sm text-text-secondary flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
                <User className="w-3.5 h-3.5" /> {user?.email}
              </p>
              {user?.target_role && (
                <div className="mt-2.5 self-center sm:self-start flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 border border-primary/20 text-primary">
                  <Briefcase className="w-3.5 h-3.5" /> Targeting: {user.target_role}
                </div>
              )}
            </div>
            <div className="text-xs font-semibold text-text-secondary self-center sm:self-end mt-2 sm:mt-0 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-primary" /> Member since {memberSinceDate}
            </div>
          </CardContent>
        </Card>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { 
              label: 'Total Analyzed', 
              val: stats?.total_analyzed, 
              icon: <FileText className="w-4 h-4 text-primary" />,
              color: 'text-text'
            },
            { 
              label: 'Average Score', 
              val: stats?.average_score, 
              icon: <Star className="w-4 h-4 text-score-amber" />,
              color: stats?.average_score >= 80 ? 'text-score-emerald' : stats?.average_score >= 50 ? 'text-score-amber' : 'text-score-red'
            },
            { 
              label: 'Best Score', 
              val: stats?.best_score, 
              icon: <Award className="w-4 h-4 text-score-emerald" />,
              color: stats?.best_score >= 80 ? 'text-score-emerald' : stats?.best_score >= 50 ? 'text-score-amber' : 'text-score-red'
            },
            { 
              label: 'Success Band', 
              val: stats?.best_score >= 80 ? 'Excellent' : stats?.best_score >= 50 ? 'Good' : stats?.best_score > 0 ? 'Review Needed' : 'N/A', 
              icon: <Sparkles className="w-4 h-4 text-primary" />,
              color: 'text-primary'
            }
          ].map((tile, i) => (
            <Card key={i} className="border-border bg-surface text-left">
              <CardContent className="p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between text-text-secondary">
                  <span className="text-xs font-semibold uppercase tracking-wider">{tile.label}</span>
                  {tile.icon}
                </div>
                {isLoadingStats ? (
                  <Skeleton width="60%" height="24px" className="mt-1" />
                ) : (
                  <div className={`text-xl font-black ${tile.color}`}>
                    {tile.val ?? '—'}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Edit Profile Form */}
        <Card className="border-border bg-surface shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold">Profile Customizations</CardTitle>
            <CardDescription>
              Provide your details and primary targeted job roles to adapt suggestions and skills gap calculation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Mercer"
                />
                <Input
                  label="Target Career Role"
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Backend Engineer"
                  helperText="Helps tailoring AI analysis suggestions for your desired job title."
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-text select-none cursor-pointer">
                  Professional Bio / Profile Summary
                </label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, 1000))}
                  placeholder="Tell us about your background, strengths, and experience..."
                  rows={4}
                />
                <div className="flex justify-end text-xs text-text-secondary font-semibold">
                  {bio.length} / 1000 characters
                </div>
              </div>
              <Button
                type="submit"
                variant="primary"
                className="w-fit font-bold self-start mt-2"
                disabled={!isDirty || isSaving}
                isLoading={isSaving}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save Profile Changes
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ProfilePage;

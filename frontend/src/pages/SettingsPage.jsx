import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, User, Shield, Sliders, Trash2, ArrowLeft,
  Mail, Lock, Bell, CheckCircle, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/Toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Tabs } from '../components/ui/Tabs';
import { ToggleSwitch } from '../components/ui/ToggleSwitch';
import { api } from '../lib/api';

export const SettingsPage = () => {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // Account State
  const [name, setName] = useState(user?.name || '');
  const [isUpdatingAccount, setIsUpdatingAccount] = useState(false);

  // Security State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Preferences State (placeholder state)
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // Danger Zone State
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Handle Account Update
  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    if (!name.trim() || name === user?.name) return;

    setIsUpdatingAccount(true);
    try {
      await api.put('/api/users/me', { name: name.trim() });
      await refreshUser();
      toast.success('Success', 'Account details updated successfully.');
    } catch (err) {
      toast.error('Error', err.message || 'Failed to update account details.');
    } finally {
      setIsUpdatingAccount(false);
    }
  };

  // Handle Password Update
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError('All password fields are required.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await api.put('/api/users/me/password', {
        old_password: oldPassword,
        new_password: newPassword,
      });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Success', 'Password changed successfully.');
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password.');
      toast.error('Error', err.message || 'Failed to change password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Handle Delete Account
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;

    setIsDeletingAccount(true);
    try {
      await api.delete('/api/users/me');
      toast.success('Account Deleted', 'Your account has been deleted successfully.');
      await logout();
      navigate('/');
    } catch (err) {
      toast.error('Error', err.message || 'Failed to delete your account.');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const tabsConfig = [
    {
      id: 'account',
      label: 'Account',
      icon: <User className="w-4 h-4" />,
      content: (
        <form onSubmit={handleUpdateAccount} className="flex flex-col gap-4 mt-2">
          <Input
            label="Email Address (Read-only)"
            type="email"
            value={user?.email || ''}
            disabled
            leftIcon={<Mail className="w-4 h-4 text-text-secondary" />}
          />
          <Input
            label="Full Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            leftIcon={<User className="w-4 h-4 text-text-secondary" />}
          />
          <Button
            type="submit"
            className="w-fit font-bold self-start mt-2"
            disabled={name === user?.name || !name.trim() || isUpdatingAccount}
            isLoading={isUpdatingAccount}
          >
            Save Account Details
          </Button>
        </form>
      ),
    },
    {
      id: 'security',
      label: 'Security',
      icon: <Shield className="w-4 h-4" />,
      content: (
        <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4 mt-2">
          <Input
            label="Current Password"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4 text-text-secondary" />}
          />
          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4 text-text-secondary" />}
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4 text-text-secondary" />}
          />
          {passwordError && (
            <p className="text-xs font-semibold text-danger flex items-center gap-1.5 mt-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              {passwordError}
            </p>
          )}
          <Button
            type="submit"
            className="w-fit font-bold self-start mt-2"
            disabled={!oldPassword || !newPassword || !confirmPassword || isUpdatingPassword}
            isLoading={isUpdatingPassword}
          >
            Change Password
          </Button>
        </form>
      ),
    },
    {
      id: 'preferences',
      label: 'Preferences',
      icon: <Sliders className="w-4 h-4" />,
      content: (
        <div className="flex flex-col gap-6 mt-4">
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-bold text-text">Interface Settings</h4>
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <div>
                <p className="text-sm font-semibold text-text">Dark Mode</p>
                <p className="text-xs text-text-secondary">Switch between light and dark UI themes.</p>
              </div>
              <ToggleSwitch checked={darkMode} onChange={setDarkMode} />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-bold text-text">Notification Subscriptions</h4>
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <div>
                <p className="text-sm font-semibold text-text">Email Alerts</p>
                <p className="text-xs text-text-secondary">Receive analysis reports and tips via email.</p>
              </div>
              <ToggleSwitch checked={emailNotifications} onChange={setEmailNotifications} />
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <div>
                <p className="text-sm font-semibold text-text">Product Updates</p>
                <p className="text-xs text-text-secondary">Occasional newsletters and features highlights.</p>
              </div>
              <ToggleSwitch checked={marketingEmails} onChange={setMarketingEmails} />
            </div>
          </div>
        </div>
      ),
    },
  ];

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
              <h1 className="text-lg font-black text-text flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" /> Settings
              </h1>
              <p className="text-xs text-text-secondary">
                Manage your ResumeIQ account credentials and settings preferences
              </p>
            </div>
          </div>
          <Button size="sm" variant="secondary" onClick={() => navigate('/dashboard')}>
            Back
          </Button>
        </div>
      </header>

      {/* Main Settings Grid */}
      <main className="max-w-4xl mx-auto px-6 pt-8 flex flex-col gap-8 text-left">
        
        {/* Core Configuration Panel */}
        <Card className="border-border bg-surface shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold">Account Configurations</CardTitle>
            <CardDescription>Update your personal details, credentials, and settings.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs tabs={tabsConfig} defaultTabId="account" />
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-danger/30 bg-surface shadow-sm relative overflow-hidden">
          <div className="absolute left-0 top-0 h-full w-1.5 bg-danger" />
          <CardHeader>
            <CardTitle className="text-base font-bold text-danger flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Danger Zone
            </CardTitle>
            <CardDescription>Permanently delete your account. This action cannot be undone.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="bg-danger/5 border border-danger/10 p-3 rounded text-xs text-text-secondary leading-relaxed">
              When you delete your account, all uploaded resume files, analysis summaries, match scores, and account configurations will be permanently removed.
            </div>
            <div className="flex flex-col sm:flex-row items-end gap-3">
              <Input
                label="Confirm Account Deletion"
                type="text"
                placeholder="Type 'DELETE' to confirm"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="max-w-xs"
              />
              <Button
                variant="danger"
                disabled={deleteConfirmText !== 'DELETE' || isDeletingAccount}
                isLoading={isDeletingAccount}
                onClick={handleDeleteAccount}
                leftIcon={<Trash2 className="w-4 h-4" />}
                className="font-bold sm:mb-0.5 shrink-0"
              >
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SettingsPage;

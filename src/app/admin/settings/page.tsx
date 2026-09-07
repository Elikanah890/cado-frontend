'use client';

import { useState, useEffect } from 'react';
import { Save, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';

interface SettingGroup { key: string; label: string; type: string; group: string; }

const settingFields = [
  { key: 'company_name', label: 'Company Name', type: 'text', group: 'company' },
  { key: 'company_tagline', label: 'Tagline', type: 'text', group: 'company' },
  { key: 'company_description', label: 'Description', type: 'textarea', group: 'company' },
  { key: 'company_email', label: 'Email', type: 'email', group: 'company' },
  { key: 'company_phone', label: 'Phone', type: 'text', group: 'company' },
  { key: 'company_address', label: 'Address', type: 'text', group: 'company' },
  { key: 'facebook_url', label: 'Facebook URL', type: 'url', group: 'social' },
  { key: 'instagram_url', label: 'Instagram URL', type: 'url', group: 'social' },
  { key: 'twitter_url', label: 'Twitter/X URL', type: 'url', group: 'social' },
  { key: 'linkedin_url', label: 'LinkedIn URL', type: 'url', group: 'social' },
  { key: 'youtube_url', label: 'YouTube URL', type: 'url', group: 'social' },
  { key: 'whatsapp_number', label: 'WhatsApp Number', type: 'text', group: 'social' },
  { key: 'seo_title', label: 'SEO Title', type: 'text', group: 'seo' },
  { key: 'seo_description', label: 'SEO Description', type: 'textarea', group: 'seo' },
  { key: 'seo_keywords', label: 'SEO Keywords', type: 'text', group: 'seo' },
  { key: 'google_analytics_id', label: 'Google Analytics ID', type: 'text', group: 'analytics' },
];

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Password change state
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<Partial<Record<keyof PasswordForm, string>>>({});
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    adminApi.getSettings().then((res) => {
      const map: Record<string, string> = {};
      if (res.data && typeof res.data === 'object' && !Array.isArray(res.data)) {
        Object.entries(res.data).forEach(([key, value]) => {
          map[key] = (value as string) || '';
        });
      } else if (Array.isArray(res.data)) {
        res.data.forEach((s: any) => { map[s.key] = s.value || ''; });
      }
      setSettings(map);
    }).catch(() => toast.error('Failed to load settings')).finally(() => setLoading(false));
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminApi.updateSettings(settings);
      if (typeof window !== 'undefined') window.location.reload();
      toast.success('Settings saved');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const validatePasswordForm = (): boolean => {
    const errors: Partial<Record<keyof PasswordForm, string>> = {};
    
    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = 'New password must be at least 8 characters';
    }
    
    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) return;
    
    setPasswordSaving(true);
    try {
      await adminApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });
      toast.success('Password updated successfully. Please log in again.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordErrors({});
      // Log out and redirect to login
      await adminApi.logout();
      window.location.href = '/admin/login';
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to change password';
      if (message.includes('Current password is incorrect')) {
        setPasswordErrors({ currentPassword: 'Current password is incorrect' });
      } else {
        toast.error(message);
      }
    } finally {
      setPasswordSaving(false);
    }
  };

  const handlePasswordChangeInput = (field: keyof PasswordForm, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
    if (passwordErrors[field]) {
      setPasswordErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const groups = [...new Set(settingFields.map((f) => f.group))];

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold text-primary-900">Settings</h1><p className="text-gray-500 mt-1">Configure website settings and security.</p></div>
        <button onClick={handleSave} disabled={saving} className="btn-primary gap-2"><Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save All'}</button>
      </div>

      {/* Change Password Section */}
      <div className="card p-6 mb-8">
        <h2 className="text-lg font-bold text-primary-900 mb-6 flex items-center gap-2">
          <Lock className="w-5 h-5 text-gold-500" />
          Change Password
        </h2>
        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordForm.currentPassword}
                onChange={(e) => handlePasswordChangeInput('currentPassword', e.target.value)}
                className="input-field pr-10"
                placeholder="Enter current password"
                disabled={passwordSaving}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {passwordErrors.currentPassword && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {passwordErrors.currentPassword}
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={passwordForm.newPassword}
                onChange={(e) => handlePasswordChangeInput('newPassword', e.target.value)}
                className="input-field pr-10"
                placeholder="Enter new password (min 8 characters)"
                disabled={passwordSaving}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {passwordErrors.newPassword && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {passwordErrors.newPassword}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordForm.confirmPassword}
                onChange={(e) => handlePasswordChangeInput('confirmPassword', e.target.value)}
                className="input-field pr-10"
                placeholder="Confirm new password"
                disabled={passwordSaving}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {passwordErrors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {passwordErrors.confirmPassword}
              </p>
            )}
          </div>

          <button type="submit" disabled={passwordSaving} className="btn-primary gap-2 w-full">
            {passwordSaving ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                Updating...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" /> Update Password
              </>
            )}
          </button>
        </form>
      </div>

      {groups.map((group) => (
        <div key={group} className="card p-6 mb-6">
          <h2 className="text-lg font-bold capitalize mb-4 text-primary-900">{group}</h2>
          <div className="space-y-4">
            {settingFields.filter((f) => f.group === group).map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea value={settings[field.key] || ''} onChange={(e) => handleChange(field.key, e.target.value)} className="input-field" rows={3} />
                ) : (
                  <input type={field.type} value={settings[field.key] || ''} onChange={(e) => handleChange(field.key, e.target.value)} className="input-field" />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

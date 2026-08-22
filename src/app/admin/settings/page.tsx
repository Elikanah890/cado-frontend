'use client';

import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';

interface SettingGroup { key: string; label: string; type: string; group: string; }

const settingFields: SettingGroup[] = [
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

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      toast.success('Settings saved');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const groups = [...new Set(settingFields.map((f) => f.group))];

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold text-primary-900">Settings</h1><p className="text-gray-500 mt-1">Configure website settings.</p></div>
        <button onClick={handleSave} disabled={saving} className="btn-primary gap-2"><Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save All'}</button>
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

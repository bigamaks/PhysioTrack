
import { useEffect, useState } from 'react';
import { Save, Bell, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function Settings() {
  const { session } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [notifications, setNotifications] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      if (!session?.user?.id) return;

      setLoading(true);

      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email, phone')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching settings:', error);
      } else if (data) {
        setFullName(data.full_name || '');
        setEmail(data.email || '');
        setPhone(data.phone || '');
      }

      setLoading(false);
    }

    fetchSettings();
  }, [session]);

  async function handleSave(e) {
    e.preventDefault();

    if (!session?.user?.id) return;

    setSaving(true);
    setSaved(false);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        email,
        phone,
      })
      .eq('id', session.user.id);

    if (error) {
      console.error('Error saving settings:', error);
      alert('Unable to save settings. Please try again.');
    } else {
      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2500);
    }

    setSaving(false);
  }

  async function handleChangePassword() {
    if (!session?.user?.email) return;

    const { error } = await supabase.auth.resetPasswordForEmail(
      session.user.email
    );

    if (error) {
      console.error('Password reset error:', error);
      alert('Unable to send password reset email. Please try again.');
      return;
    }

    alert(
      'A password reset link has been sent to your email address.'
    );
  }

  if (loading) {
    return (
      <div className="text-sm text-muted">
        Loading settings...
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-6"
      style={{ maxWidth: 560 }}
    >
      <div>
        <h1 className="font-display font-semibold text-2xl text-ink">
          Settings
        </h1>

        <p className="text-sm mt-1 text-muted">
          Manage your account and notification preferences.
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="flex flex-col gap-6"
      >
        {/* Account */}
        <div className="rounded-xl p-5 flex flex-col gap-4 bg-white border border-[#E4E9E8]">
          <p className="text-sm font-medium text-ink">
            Account
          </p>

          <div>
            <label className="text-xs mb-1.5 block text-muted">
              Full name
            </label>

            <input
              value={fullName}
              onChange={(e) =>
                setFullName(e.target.value)
              }
              className="w-full px-3 py-2.5 rounded-lg text-sm border border-[#E4E9E8]"
            />
          </div>

          <div>
            <label className="text-xs mb-1.5 block text-muted">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full px-3 py-2.5 rounded-lg text-sm border border-[#E4E9E8]"
            />
          </div>

          <div>
            <label className="text-xs mb-1.5 block text-muted">
              Phone
            </label>

            <input
              type="tel"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value)
              }
              className="w-full px-3 py-2.5 rounded-lg text-sm border border-[#E4E9E8]"
            />
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-xl p-5 flex flex-col gap-4 bg-white border border-[#E4E9E8]">
          <div className="flex items-center gap-2">
            <Bell
              size={16}
              className="text-primary"
            />

            <p className="text-sm font-medium text-ink">
              Notifications
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) =>
                setNotifications(e.target.checked)
              }
            />

            Notify me about clinical alerts and missed
            exercise logs
          </label>
        </div>

        {/* Security */}
        <div className="rounded-xl p-5 flex flex-col gap-3 bg-white border border-[#E4E9E8]">
          <div className="flex items-center gap-2">
            <Lock
              size={16}
              className="text-primary"
            />

            <p className="text-sm font-medium text-ink">
              Security
            </p>
          </div>

          <button
            type="button"
            onClick={handleChangePassword}
            className="text-sm text-left text-primary w-fit"
          >
            Change password
          </button>
        </div>

        {/* Save */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-primary text-white disabled:opacity-50"
          >
            <Save size={16} />

            {saving ? 'Saving...' : 'Save settings'}
          </button>

          {saved && (
            <span
              className="text-sm"
              style={{ color: '#7FA893' }}
            >
              Saved
            </span>
          )}
        </div>
      </form>
    </div>
  );
}


import { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Heart,
  Save,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

function Field({
  icon: Icon,
  label,
  value,
  onChange,
  type = 'text',
  disabled = false,
}) {
  return (
    <div>
      <label className="text-xs mb-1.5 flex items-center gap-1.5 text-muted">
        <Icon size={13} />
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full px-3 py-2.5 rounded-lg text-sm text-ink border border-[#E4E9E8] ${
          disabled
            ? 'bg-[#F7F9F8] cursor-not-allowed'
            : 'bg-white'
        }`}
      />
    </div>
  );
}

export default function Profile() {
  const { session } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select(
            'full_name, email, phone, address, emergency_contact_name, emergency_contact_phone'
          )
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          throw profileError;
        }

        if (data) {
          setFullName(data.full_name || '');
          setEmail(data.email || session.user.email || '');
          setPhone(data.phone || '');
          setAddress(data.address || '');
          setEmergencyName(
            data.emergency_contact_name || ''
          );
          setEmergencyPhone(
            data.emergency_contact_phone || ''
          );
        }
      } catch (err) {
        console.error(
          'Error fetching profile:',
          err
        );

        setError(
          err.message ||
            'Failed to load your profile.'
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [session]);

  async function handleSave(e) {
    e.preventDefault();

    if (!session?.user?.id) {
      setError('You must be logged in to save changes.');
      return;
    }

    setSaving(true);
    setSaved(false);
    setError('');

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          emergency_contact_name:
            emergencyName.trim(),
          emergency_contact_phone:
            emergencyPhone.trim(),
        })
        .eq('id', session.user.id);

      if (updateError) {
        throw updateError;
      }

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (err) {
      console.error(
        'Error saving profile:',
        err
      );

      setError(
        err.message ||
          'Failed to save your changes.'
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="text-sm text-muted">
        Loading profile...
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-6"
      style={{ maxWidth: 640 }}
    >
      {/* Header */}
      <div>
        <h1 className="font-display font-semibold text-2xl text-ink">
          Your profile
        </h1>

        <p className="text-sm mt-1 text-muted">
          Keep your contact and emergency details up to
          date.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl p-4 bg-white border border-[#E4E9E8]">
          <div className="flex items-start gap-2">
            <AlertCircle
              size={17}
              className="text-coral mt-0.5 shrink-0"
            />

            <p className="text-sm text-coral">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Profile summary */}
      <div className="rounded-xl p-5 flex items-center gap-4 bg-white border border-[#E4E9E8]">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-semibold bg-primary text-white">
          {fullName
            ? fullName
                .split(' ')
                .filter(Boolean)
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()
            : '?'}
        </div>

        <div>
          <p className="text-base font-semibold text-ink">
            {fullName || 'Unnamed patient'}
          </p>

          <p className="text-xs mt-0.5 text-muted">
            Patient
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSave}
        className="flex flex-col gap-6"
      >
        {/* Contact information */}
        <div className="rounded-xl p-5 flex flex-col gap-4 bg-white border border-[#E4E9E8]">
          <p className="text-sm font-medium text-ink">
            Contact information
          </p>

          <Field
            icon={User}
            label="Full name"
            value={fullName}
            onChange={setFullName}
          />

          <Field
            icon={Mail}
            label="Email"
            value={email}
            onChange={setEmail}
            type="email"
            disabled
          />

          <p className="text-xs text-muted -mt-2">
            Email is managed through your account and
            cannot be changed here.
          </p>

          <Field
            icon={Phone}
            label="Phone"
            value={phone}
            onChange={setPhone}
          />

          <Field
            icon={MapPin}
            label="Address"
            value={address}
            onChange={setAddress}
          />
        </div>

        {/* Emergency contact */}
        <div className="rounded-xl p-5 flex flex-col gap-4 bg-white border border-[#E4E9E8]">
          <div className="flex items-center gap-2">
            <Heart
              size={16}
              color="#D96B54"
            />

            <p className="text-sm font-medium text-ink">
              Emergency contact
            </p>
          </div>

          <Field
            icon={User}
            label="Contact name"
            value={emergencyName}
            onChange={setEmergencyName}
          />

          <Field
            icon={Phone}
            label="Contact phone"
            value={emergencyPhone}
            onChange={setEmergencyPhone}
          />
        </div>

        {/* Save */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-primary text-white ${
              saving
                ? 'opacity-60 cursor-not-allowed'
                : ''
            }`}
          >
            <Save size={16} />

            {saving ? 'Saving...' : 'Save changes'}
          </button>

          {saved && (
            <span
              className="text-sm"
              style={{ color: '#7FA893' }}
            >
              Changes saved
            </span>
          )}
        </div>
      </form>
    </div>
  );
}


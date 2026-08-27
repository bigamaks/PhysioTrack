import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function AcceptInvite() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    async function checkInvite() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError(
          'This invitation link is invalid or has expired. Please ask the administrator to send a new invitation.',
        );
      }

      setLoading(false);
    }

    checkInvite();
  }, []);

  async function handleSetPassword(e) {
    e.preventDefault();

    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSaving(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError('Could not verify your account. Please try again.');
      setSaving(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.role) {
      setError('Your account role could not be found. Please contact an admin.');
      setSaving(false);
      return;
    }

    if (profile.role === 'therapist') {
      navigate('/therapist/dashboard', { replace: true });
    } else if (profile.role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <p className="text-sm text-muted">Verifying your invitation...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <form
        onSubmit={handleSetPassword}
        className="bg-white p-8 rounded-xl border border-[#E4E9E8] w-full max-w-sm flex flex-col gap-4"
      >
        <div>
          <h1 className="font-display font-semibold text-xl text-ink">
            Set up your account
          </h1>

          <p className="text-sm text-muted mt-1">
            Welcome to PhysioTrack. Create a password to finish setting up
            your account.
          </p>
        </div>

        {error && (
          <p className="text-sm text-coral">
            {error}
          </p>
        )}

        {!error && (
          <>
            <div>
              <label className="text-xs mb-1.5 block text-muted">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a password"
                className="w-full px-3 py-2.5 rounded-lg border border-[#E4E9E8] text-sm"
                required
              />
            </div>

            <div>
              <label className="text-xs mb-1.5 block text-muted">
                Confirm password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="w-full px-3 py-2.5 rounded-lg border border-[#E4E9E8] text-sm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-primary text-white rounded-lg py-2.5 text-sm font-medium"
            >
              {saving ? 'Setting up account...' : 'Complete setup'}
            </button>
          </>
        )}
      </form>
    </div>
  );
}


import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshRole } = useAuth();

  async function handleSignup(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const userId = data.user?.id;
    if (userId) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({ id: userId, role: 'patient', full_name: fullName });

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }
       }
   await refreshRole();
   navigate('/patient/dashboard');
    // navigate('/patient/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <form onSubmit={handleSignup} className="bg-white p-8 rounded-xl border border-[#E4E9E8] w-full max-w-sm flex flex-col gap-4">
        <h1 className="font-display font-semibold text-xl text-ink">Create your PhysioTrack account</h1>

        {error && <p className="text-sm text-coral">{error}</p>}

        <input type="text" placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="px-3 py-2.5 rounded-lg border border-[#E4E9E8] text-sm" required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="px-3 py-2.5 rounded-lg border border-[#E4E9E8] text-sm" required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="px-3 py-2.5 rounded-lg border border-[#E4E9E8] text-sm" required />

        <button type="submit" disabled={loading} className="bg-primary text-white rounded-lg py-2.5 text-sm font-medium">
          {loading ? 'Creating account...' : 'Sign up'}
        </button>

        <p className="text-sm text-muted text-center">
          Already have an account? <Link to="/login" className="text-primary font-medium">Log in</Link>
        </p>
      </form>
    </div>
  );
}
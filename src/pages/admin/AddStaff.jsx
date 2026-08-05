import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function AddStaff() {
  const [userId, setUserId] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('therapist');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

async function handleAdd(e) {
  e.preventDefault();
  setLoading(true);
  setMessage(null);

  // Check if this user already has a profile
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (existing) {
    setMessage({ type: 'error', text: 'This user already has a role assigned. Use the edit option instead (coming soon).' });
    setLoading(false);
    return;
  }

  const { error } = await supabase.from('profiles').insert({ id: userId, role, full_name: fullName });

  if (error) {
    setMessage({ type: 'error', text: error.message });
  } else {
    setMessage({ type: 'success', text: `${fullName} added as ${role}.` });
    setUserId('');
    setFullName('');
  }
  setLoading(false);
}

  return (
    <div className="max-w-md">
      <h1 className="font-display font-semibold text-xl text-ink mb-1">Add staff member</h1>
      <p className="text-sm text-muted mb-4">
        Create the login in Supabase's Authentication → Users first, then paste their user ID here to assign a role.
      </p>

      <form onSubmit={handleAdd} className="bg-white p-6 rounded-xl border border-[#E4E9E8] flex flex-col gap-4">
        {message && (
          <p className="text-sm" style={{ color: message.type === 'error' ? '#D96B54' : '#1F4E4A' }}>{message.text}</p>
        )}

        <input type="text" placeholder="User ID (UUID from Supabase)" value={userId} onChange={(e) => setUserId(e.target.value)} className="px-3 py-2.5 rounded-lg border border-[#E4E9E8] text-sm" required />
        <input type="text" placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="px-3 py-2.5 rounded-lg border border-[#E4E9E8] text-sm" required />

        <select value={role} onChange={(e) => setRole(e.target.value)} className="px-3 py-2.5 rounded-lg border border-[#E4E9E8] text-sm">
          <option value="therapist">Therapist</option>
          <option value="admin">Admin</option>
        </select>

        <button type="submit" disabled={loading} className="bg-primary text-white rounded-lg py-2.5 text-sm font-medium">
          {loading ? 'Adding...' : 'Add staff member'}
        </button>
      </form>
    </div>
  );
}
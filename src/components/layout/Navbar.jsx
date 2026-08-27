import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';


export default function Navbar({ roleLabel }) {
  const navigate = useNavigate();
    const { session } = useAuth();
    const [fullName, setFullName] = useState('');

    useEffect(() => {
      async function fetchName() {
        const {data, error} = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', session.user.id)
        .single()

        if(!error) setFullName(data.full_name)
      }
    if(session) fetchName()
    }, [session])

async function handleLogout() {
  await supabase.auth.signOut();
  navigate('/login');
}

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border-b">
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg w-72">
        <span className="text-sm text-muted">Search patients, sessions...</span>
      </div>
      <div>
        <p className="text-sm font-medium text-ink">{fullName}</p>
        <p className="text-xs text-muted">{roleLabel}</p>
      </div>
      <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-muted hover:text-ink">
  <LogOut size={16} />
  Log out
</button>
    </div>
  );
}
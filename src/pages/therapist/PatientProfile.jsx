import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, Calendar, FileText, } from 'lucide-react';
import { supabase } from '../../lib/supabase';

function RangeArc({ value, size = 120, color = '#1F4E4A' }) {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const circumference = Math.PI * r;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={size / 2 + stroke} viewBox={`0 0 ${size} ${size / 2 + stroke}`}>
        <path d={`M ${stroke / 2} ${size / 2} A ${r} ${r} 0 0 1 ${size - stroke / 2} ${size / 2}`} fill="none" stroke="#E4E9E8" strokeWidth={stroke} strokeLinecap="round" />
        <path d={`M ${stroke / 2} ${size / 2} A ${r} ${r} 0 0 1 ${size - stroke / 2} ${size / 2}`} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} />
      </svg>
      <span className="font-mono font-semibold text-xl text-ink" style={{ marginTop: -22 }}>{value}%</span>
    </div>
  );
}

export default function PatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPatient() {
      const { data, error } = await supabase.from('patients').select('*').eq('id', id).single();
      if (!error) setPatient(data);
      setLoading(false);
    }
    fetchPatient();
  }, [id]);

  if (loading) return <div className="text-muted">Loading patient...</div>;
  if (!patient) return <div className="text-muted">Patient not found.</div>;

  const initials = patient.name.split(' ').map(n => n[0]).join('');

  return (
    <div className="flex flex-col gap-6">
      <button onClick={() => navigate('/therapist/patients')} className="flex items-center gap-1.5 text-sm text-muted w-fit">
        <ArrowLeft size={16} /> Back to patients
      </button>

      <div className="rounded-xl p-5 flex items-center gap-4 bg-white border border-[#E4E9E8]">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-semibold bg-primary text-white">{initials}</div>
        <div className="flex-1">
          <p className="text-lg font-semibold text-ink">{patient.name}</p>
          <p className="text-sm text-muted">{patient.age} · {patient.gender} · {patient.condition}</p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: '#E1F0EA', color: '#1F4E4A' }}>{patient.status}</span>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 rounded-xl p-5 flex flex-col items-center bg-white border border-[#E4E9E8]">
          <p className="text-sm font-medium text-ink self-start mb-3">Recovery</p>
          <RangeArc value={62} />
        </div>

        <div className="col-span-2 rounded-xl p-4 bg-white border border-[#E4E9E8]">
          <p className="text-sm font-medium text-ink mb-3">Contact & visit info</p>
          <div className="flex flex-col gap-2.5 text-sm text-muted">
            <span className="flex items-center gap-2"><Phone size={14} /> {patient.phone || 'Not on file'}</span>
            <span className="flex items-center gap-2"><Mail size={14} /> {patient.email || 'Not on file'}</span>
            <span className="flex items-center gap-2"><Calendar size={14} /> Last visit: {patient.last_visit || '—'}</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl p-4 bg-white border border-[#E4E9E8]">
        <div className="flex items-center gap-2 mb-3">
          <FileText size={16} className="text-primary" />
          <p className="text-sm font-medium text-ink">Recent session notes</p>
        </div>
        {[
          { date: 'Jul 28, 2026', note: 'Improved range of motion in flexion. Continues home exercise programme.' },
          { date: 'Jul 21, 2026', note: 'Reported mild discomfort during bridging. Adjusted rep count.' },
        ].map((s, i) => (
          <div key={i} className={`flex gap-4 py-2.5 ${i > 0 ? 'border-t border-[#E4E9E8]' : ''}`}>
            <span className="text-xs font-mono w-24 text-muted flex-shrink-0">{s.date}</span>
            <span className="text-sm text-muted">{s.note}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
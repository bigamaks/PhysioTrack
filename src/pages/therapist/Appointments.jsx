import { useState } from 'react';
import { Search, Calendar, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

function StatusPill({ status }) {
  const map = {
    Confirmed: { bg: '#E1F0EA', text: '#1F4E4A' },
    'In Progress': { bg: '#EAF1F0', text: '#2F6E67' },
    Pending: { bg: '#FBEEE0', text: '#9A6423' },
    Cancelled: { bg: '#FBEAE5', text: '#D96B54' },
  };
  const s = map[status] || map.Confirmed;
  return (
    <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: s.bg, color: s.text }}>
      {status}
    </span>
  );
}

function Avatar({ initials, tint }) {
  return (
    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs text-white font-semibold shrink-0" style={{ background: tint }}>
      {initials}
    </div>
  );
}

const appointments = [
  { time: '09:00 AM', patient: 'Chinedu Okafor', type: 'Follow-up', condition: 'Lower back pain', duration: '60 min', status: 'Confirmed', tint: '#1F4E4A' },
  { time: '10:30 AM', patient: 'Adaeze Eze', type: 'Session 4', condition: 'Knee rehabilitation', duration: '45 min', status: 'Confirmed', tint: '#7FA893' },
  { time: '12:00 PM', patient: 'Emeka Nwosu', type: 'Session 6', condition: 'Post-surgery recovery', duration: '60 min', status: 'In Progress', tint: '#D96B54' },
  { time: '02:00 PM', patient: 'Funmi Adebayo', type: 'Initial Assessment', condition: 'Shoulder pain', duration: '45 min', status: 'Pending', tint: '#E2984F' },
  { time: '03:30 PM', patient: 'Ibrahim Hassan', type: 'Follow-up', condition: 'Sports injury', duration: '45 min', status: 'Confirmed', tint: '#2F6E67' },
];

export default function Appointments() {
  const [selectedDate] = useState('Wednesday, August 5, 2026');

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-semibold text-2xl text-ink">Appointments</h1>
          <p className="text-sm mt-1 text-muted">Manage your daily schedule and bookings.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-white font-medium bg-primary">
          <Plus size={16} /> Book appointment
        </button>
      </div>

      <div className="flex items-center gap-3 rounded-xl p-3 bg-white border border-[#E4E9E8]">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-white">
          <ChevronLeft size={16} className="cursor-pointer" />
          <Calendar size={16} />
          <span className="text-sm font-medium">{selectedDate}</span>
          <ChevronRight size={16} className="cursor-pointer" />
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 bg-bg">
          <Search size={16} className="text-muted" />
          <span className="text-sm text-muted">Search by patient name...</span>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden bg-white border border-[#E4E9E8]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E4E9E8]">
              {['Time', 'Patient', 'Type', 'Condition', 'Duration', 'Status'].map((h, i) => (
                <th key={i} className="text-left px-4 py-3 text-xs text-muted font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {appointments.map((a, i) => (
              <tr key={i} className={i > 0 ? 'border-t border-[#E4E9E8]' : ''}>
                <td className="px-4 py-3 font-mono text-[13px] text-primary font-medium">{a.time}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar initials={a.patient.split(' ').map(n => n[0]).join('')} tint={a.tint} />
                    <span className="text-ink font-medium">{a.patient}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted">{a.type}</td>
                <td className="px-4 py-3 text-muted">{a.condition}</td>
                <td className="px-4 py-3 text-muted font-mono text-[13px]">{a.duration}</td>
                <td className="px-4 py-3"><StatusPill status={a.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
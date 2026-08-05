import { C } from './colors';

function StatusPill({ status }) {
  const map = {
    Confirmed: { bg: '#E1F0EA', text: C.primary },
    'In Progress': { bg: '#EAF1F0', text: C.primaryLight },
    Pending: { bg: '#FBEEE0', text: '#9A6423' },
  };
  const s = map[status] || map.Confirmed;
  return (
    <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: s.bg, color: s.text, fontWeight: 500 }}>
      {status}
    </span>
  );
}

function Avatar({ initials, tint }) {
  return (
    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs shrink-0" style={{ background: tint, color: '#FFFFFF', fontWeight: 600 }}>
      {initials}
    </div>
  );
}

const appointments = [
  { time: '09:00 AM', name: 'Chinedu Okafor', note: 'Lower back pain \u00b7 Follow-up', status: 'Confirmed', tint: C.primary },
  { time: '10:30 AM', name: 'Adaeze Eze', note: 'Knee rehab \u00b7 Session 4', status: 'Confirmed', tint: C.sage },
  { time: '12:00 PM', name: 'Emeka Nwosu', note: 'Post-surgery \u00b7 Session 6', status: 'In Progress', tint: C.coral },
  { time: '02:00 PM', name: 'Funmi Adebayo', note: 'Shoulder pain \u00b7 Initial', status: 'Pending', tint: C.accent },
];

export default function AppointmentsList() {
  return (
    <div className="rounded-xl p-4" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm" style={{ fontWeight: 500, color: C.ink }}>Today's appointments</p>
        <span className="text-xs" style={{ color: C.primaryLight }}>View full schedule</span>
      </div>
      {appointments.map((a, i) => (
        <div key={i} className="flex items-center gap-3 py-2.5" style={{ borderTop: i > 0 ? `1px solid ${C.border}` : 'none' }}>
          <Avatar initials={a.name.split(' ').map(n => n[0]).join('')} tint={a.tint} />
          <div className="flex-1 min-w-0">
            <p className="text-sm truncate" style={{ color: C.ink, fontWeight: 500 }}>{a.name}</p>
            <p className="text-xs truncate" style={{ color: C.muted }}>{a.time} \u00b7 {a.note}</p>
          </div>
          <StatusPill status={a.status} />
        </div>
      ))}
    </div>
  );
}
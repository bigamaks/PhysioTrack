import { Calendar, Clock, MapPin, Plus, CheckCircle2, XCircle } from 'lucide-react';

function UpcomingCard({ date, time, type, therapist, location }) {
  return (
    <div className="rounded-xl p-4 flex items-center gap-4 bg-white border border-[#E4E9E8]">
      <div className="rounded-lg flex flex-col items-center justify-center flex-shrink-0 bg-primary" style={{ width: 56, height: 56 }}>
        <span className="text-xs text-white" style={{ opacity: 0.8 }}>{date.month}</span>
        <span className="font-mono font-semibold text-xl text-white">{date.day}</span>
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-ink">{type}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs flex items-center gap-1 text-muted"><Clock size={12} /> {time}</span>
          <span className="text-xs flex items-center gap-1 text-muted"><MapPin size={12} /> {location}</span>
        </div>
        <p className="text-xs mt-1 text-primary-light">with {therapist}</p>
      </div>
      <button className="text-xs px-3 py-2 rounded-lg border border-[#E4E9E8] text-ink">Reschedule</button>
    </div>
  );
}

const upcoming = [
  { date: { month: 'JUL', day: '19' }, time: '10:00 AM', type: 'Follow-up session', therapist: 'Dr. Amaka Obi', location: 'Proactive Physio Clinic' },
  { date: { month: 'JUL', day: '26' }, time: '10:00 AM', type: 'Progress review', therapist: 'Dr. Amaka Obi', location: 'Proactive Physio Clinic' },
];

const past = [
  { date: 'Jul 12, 2026', type: 'Follow-up session', status: 'Completed' },
  { date: 'Jul 5, 2026', type: 'Session 5 – Manual therapy', status: 'Completed' },
  { date: 'Jun 28, 2026', type: 'Session 4 – Exercise progression', status: 'Completed' },
  { date: 'Jun 21, 2026', type: 'Initial assessment', status: 'Completed' },
  { date: 'Jun 14, 2026', type: 'Session 2', status: 'Cancelled' },
];

export default function Appointments() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-semibold text-2xl text-ink">Appointments</h1>
          <p className="text-sm mt-1 text-muted">Your upcoming and past visits.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-primary text-white">
          <Plus size={16} /> Request appointment
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-ink">Upcoming</p>
        {upcoming.map((a, i) => <UpcomingCard key={i} {...a} />)}
      </div>

      <div className="rounded-xl p-4 bg-white border border-[#E4E9E8]">
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={16} className="text-muted" />
          <p className="text-sm font-medium text-ink">Past appointments</p>
        </div>
        {past.map((p, i) => (
          <div key={i} className={`flex items-center gap-3 py-2.5 ${i > 0 ? 'border-t border-[#E4E9E8]' : ''}`}>
            {p.status === 'Completed'
              ? <CheckCircle2 size={16} color="#7FA893" />
              : <XCircle size={16} color="#D96B54" />
            }
            <span className="text-xs font-mono w-24 flex-shrink-0 text-muted">{p.date}</span>
            <span className="text-sm flex-1 text-ink">{p.type}</span>
            <span className="text-xs" style={{ color: p.status === 'Completed' ? '#7FA893' : '#D96B54' }}>{p.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
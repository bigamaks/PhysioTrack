import { Calendar, Activity, CheckCircle2, MessageCircle, Footprints } from 'lucide-react';

function RangeArc({ value, size = 160, color = '#1F4E4A', label }) {
  const stroke = 14;
  const r = (size - stroke) / 2;
  const circumference = Math.PI * r;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={size / 2 + stroke} viewBox={`0 0 ${size} ${size / 2 + stroke}`}>
        <path d={`M ${stroke / 2} ${size / 2} A ${r} ${r} 0 0 1 ${size - stroke / 2} ${size / 2}`} fill="none" stroke="#E4E9E8" strokeWidth={stroke} strokeLinecap="round" />
        <path d={`M ${stroke / 2} ${size / 2} A ${r} ${r} 0 0 1 ${size - stroke / 2} ${size / 2}`} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} />
      </svg>
      <span className="font-mono font-semibold text-3xl text-ink" style={{ marginTop: -28 }}>{value}%</span>
      {label && <span className="text-sm mt-1 text-muted">{label}</span>}
    </div>
  );
}

function ExerciseRow({ name, sets, done }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-t border-[#E4E9E8]">
      <CheckCircle2 size={18} color={done ? '#7FA893' : '#E4E9E8'} fill={done ? '#7FA893' : 'none'} />
      <div className="flex-1">
        <p className={`text-sm font-medium ${done ? 'text-muted line-through' : 'text-ink'}`}>{name}</p>
        <p className="text-xs text-muted">{sets}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display font-semibold text-2xl text-ink">Good morning, Chinedu</h1>
        <p className="text-sm mt-1 text-muted">Day 18 of your recovery programme. Keep it up.</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 rounded-xl p-6 flex flex-col items-center bg-white border border-[#E4E9E8]">
          <p className="text-sm mb-4 self-start font-medium text-ink">Your recovery</p>
          <RangeArc value={62} color="#1F4E4A" label="Lower back pain" />
          <p className="text-xs mt-3 text-center text-muted">Based on your last assessment, Jul 28</p>
        </div>

        <div className="col-span-1 rounded-xl p-4 bg-white border border-[#E4E9E8]">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium text-ink">Today's exercises</p>
            <span className="text-xs text-muted">2 of 4 done</span>
          </div>
          <ExerciseRow name="Pelvic tilts" sets="3 sets × 15 reps" done={true} />
          <ExerciseRow name="Bird dog" sets="3 sets × 10 reps each side" done={true} />
          <ExerciseRow name="Bridging" sets="3 sets × 12 reps" done={false} />
          <ExerciseRow name="Cat-cow stretch" sets="2 sets × 60 sec" done={false} />
        </div>

        <div className="col-span-1 flex flex-col gap-6">
          <div className="rounded-xl p-4 bg-white border border-[#E4E9E8]">
            <p className="text-sm mb-3 font-medium text-ink">Next appointment</p>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#E1F0EA' }}>
                <Calendar size={18} color="#1F4E4A" />
              </div>
              <div>
                <p className="text-sm font-medium text-ink">Follow-up with Dr. Amaka</p>
                <p className="text-xs mt-0.5 text-muted">Jul 19, 2026 · 10:00 AM</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl p-4 flex flex-col gap-2 bg-white border border-[#E4E9E8]">
            <p className="text-sm mb-1 font-medium text-ink">Quick actions</p>
            {[
              { icon: Activity, label: 'Log symptoms' },
              { icon: Footprints, label: 'View exercises' },
              { icon: MessageCircle, label: 'Message therapist' },
            ].map((a, i) => (
              <div key={i} className="flex items-center gap-2 text-sm cursor-pointer text-primary">
                <a.icon size={16} strokeWidth={1.75} />
                <span>{a.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl p-4 bg-white border border-[#E4E9E8]">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-ink">Recent symptom logs</p>
          <span className="text-xs text-primary-light">View history</span>
        </div>
        {[
          { date: 'Aug 4, 2026', pain: 3, note: 'Mild stiffness in the morning, eased after stretching' },
          { date: 'Aug 2, 2026', pain: 4, note: 'Slight discomfort after sitting for long periods' },
          { date: 'Jul 30, 2026', pain: 5, note: 'Noticeable pain during pelvic tilts' },
        ].map((s, i) => (
          <div key={i} className={`flex items-center gap-4 py-2.5 ${i > 0 ? 'border-t border-[#E4E9E8]' : ''}`}>
            <span className="text-xs font-mono w-20 text-muted">{s.date}</span>
            <span className="text-xs px-2 py-1 rounded-full font-mono font-medium" style={{ background: s.pain <= 3 ? '#E1F0EA' : '#FBEEE0', color: s.pain <= 3 ? '#1F4E4A' : '#9A6423' }}>
              Pain {s.pain}/10
            </span>
            <span className="text-sm flex-1 text-muted">{s.note}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
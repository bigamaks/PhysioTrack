import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Award } from 'lucide-react';

function RangeArc({ value, size = 140, color = '#1F4E4A', label }) {
  const stroke = 12;
  const r = (size - stroke) / 2;
  const circumference = Math.PI * r;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={size / 2 + stroke} viewBox={`0 0 ${size} ${size / 2 + stroke}`}>
        <path d={`M ${stroke / 2} ${size / 2} A ${r} ${r} 0 0 1 ${size - stroke / 2} ${size / 2}`} fill="none" stroke="#E4E9E8" strokeWidth={stroke} strokeLinecap="round" />
        <path d={`M ${stroke / 2} ${size / 2} A ${r} ${r} 0 0 1 ${size - stroke / 2} ${size / 2}`} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} />
      </svg>
      <span className="font-mono font-semibold text-2xl text-ink" style={{ marginTop: -24 }}>{value}%</span>
      {label && <span className="text-xs mt-1 text-muted">{label}</span>}
    </div>
  );
}

const trend = [
  { week: 'Wk 1', recovery: 15 },
  { week: 'Wk 2', recovery: 22 },
  { week: 'Wk 3', recovery: 31 },
  { week: 'Wk 4', recovery: 38 },
  { week: 'Wk 5', recovery: 47 },
  { week: 'Wk 6', recovery: 55 },
  { week: 'Wk 7', recovery: 62 },
];

const history = [
  { date: 'Jul 28, 2026', measure: 'Oswestry Disability Index', score: '32%', note: 'Moderate disability, improving' },
  { date: 'Jul 7, 2026', measure: 'Oswestry Disability Index', score: '44%', note: 'Moderate disability' },
  { date: 'Jun 16, 2026', measure: 'Oswestry Disability Index', score: '58%', note: 'Severe disability at intake' },
];

const milestones = [
  { label: 'Started programme', date: 'Jun 16, 2026', done: true },
  { label: 'First pain-free morning', date: 'Jul 9, 2026', done: true },
  { label: '50% recovery', date: 'Jul 25, 2026', done: true },
  { label: 'Return to light activity', date: 'Target: Aug 20, 2026', done: false },
];

export default function MyRecovery() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display font-semibold text-2xl text-ink">My recovery</h1>
        <p className="text-sm mt-1 text-muted">Lower back pain · Programme started Jun 16, 2026</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 rounded-xl p-6 flex flex-col items-center bg-white border border-[#E4E9E8]">
          <p className="text-sm mb-4 self-start font-medium text-ink">Current recovery</p>
          <RangeArc value={62} color="#1F4E4A" label="up from 15% at start" />
        </div>

        <div className="col-span-2 rounded-xl p-4 bg-white border border-[#E4E9E8]">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} color="#1F4E4A" />
            <p className="text-sm font-medium text-ink">Recovery trend</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={trend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#E4E9E8" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#5C6B6E' }} axisLine={{ stroke: '#E4E9E8' }} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#5C6B6E' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E4E9E8', fontSize: 13 }} />
              <Line type="monotone" dataKey="recovery" stroke="#1F4E4A" strokeWidth={2.5} dot={{ r: 3 }} name="Recovery %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 rounded-xl p-4 bg-white border border-[#E4E9E8]">
          <p className="text-sm mb-3 font-medium text-ink">Assessment history</p>
          {history.map((h, i) => (
            <div key={i} className={`flex items-center gap-4 py-3 ${i > 0 ? 'border-t border-[#E4E9E8]' : ''}`}>
              <span className="text-xs font-mono w-24 flex-shrink-0 text-muted">{h.date}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-ink">{h.measure}</p>
                <p className="text-xs mt-0.5 text-muted">{h.note}</p>
              </div>
              <span className="text-sm font-mono font-semibold text-primary">{h.score}</span>
            </div>
          ))}
        </div>

        <div className="col-span-1 rounded-xl p-4 bg-white border border-[#E4E9E8]">
          <div className="flex items-center gap-2 mb-3">
            <Award size={16} color="#E2984F" />
            <p className="text-sm font-medium text-ink">Milestones</p>
          </div>
          {milestones.map((m, i) => (
            <div key={i} className="flex items-start gap-2.5 py-2">
              <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: m.done ? '#7FA893' : '#E4E9E8' }} />
              <div>
                <p className={`text-sm ${m.done ? 'text-ink font-medium' : 'text-muted'}`}>{m.label}</p>
                <p className="text-xs text-muted">{m.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
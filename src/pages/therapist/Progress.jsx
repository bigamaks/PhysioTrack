import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

const byCondition = [
  { condition: 'Lower back', avgRecovery: 58 },
  { condition: 'Knee rehab', avgRecovery: 71 },
  { condition: 'Shoulder', avgRecovery: 44 },
  { condition: 'Post-surgery', avgRecovery: 39 },
  { condition: 'Sports injury', avgRecovery: 66 },
];

const topImproving = [
  { name: 'Adaeze Eze', condition: 'Knee rehabilitation', change: '+18%' },
  { name: 'Ibrahim Hassan', condition: 'Sports injury', change: '+15%' },
  { name: 'Chinedu Okafor', condition: 'Lower back pain', change: '+12%' },
];

export default function Progress() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display font-semibold text-2xl text-ink">Progress overview</h1>
        <p className="text-sm mt-1 text-muted">Recovery trends across your active patients.</p>
      </div>

      <div className="rounded-xl p-4 bg-white border border-[#E4E9E8]">
        <p className="text-sm font-medium text-ink mb-3">Average recovery by condition</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={byCondition} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="#E4E9E8" vertical={false} />
            <XAxis dataKey="condition" tick={{ fontSize: 12, fill: '#5C6B6E' }} axisLine={{ stroke: '#E4E9E8' }} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#5C6B6E' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E4E9E8', fontSize: 13 }} />
            <Bar dataKey="avgRecovery" fill="#1F4E4A" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl p-4 bg-white border border-[#E4E9E8]">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={16} color="#7FA893" />
          <p className="text-sm font-medium text-ink">Most improved this month</p>
        </div>
        {topImproving.map((p, i) => (
          <div key={i} className={`flex items-center justify-between py-2.5 ${i > 0 ? 'border-t border-[#E4E9E8]' : ''}`}>
            <div>
              <p className="text-sm font-medium text-ink">{p.name}</p>
              <p className="text-xs text-muted">{p.condition}</p>
            </div>
            <span className="text-sm font-mono font-semibold" style={{ color: '#7FA893' }}>{p.change}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
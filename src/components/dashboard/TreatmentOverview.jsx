import { PieChart, Pie, Cell } from 'recharts';
import { C } from './colors';

const donutData = [
  { name: 'Lower back pain', value: 35, color: C.primary },
  { name: 'Knee rehab', value: 28, color: C.sage },
  { name: 'Shoulder pain', value: 15, color: C.accent },
  { name: 'Post-surgery', value: 12, color: C.coral },
  { name: 'Sports injury', value: 10, color: C.primaryLight },
];

export default function TreatmentOverview() {
  return (
    <div className="rounded-xl p-4" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
      <p className="text-sm mb-3" style={{ fontWeight: 500, color: C.ink }}>Treatment overview</p>
      <div className="flex items-center justify-center relative" style={{ height: 140 }}>
        <PieChart width={140} height={140}>
          <Pie data={donutData} innerRadius={45} outerRadius={65} paddingAngle={2} dataKey="value" stroke="none">
            {donutData.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Pie>
        </PieChart>
        <div className="absolute flex flex-col items-center">
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, fontSize: 22, color: C.ink }}>42</span>
          <span className="text-xs" style={{ color: C.muted }}>active</span>
        </div>
      </div>
      <div className="flex flex-col gap-1.5 mt-3">
        {donutData.map((d, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
              <span style={{ color: C.ink }}>{d.name}</span>
            </div>
            <span style={{ color: C.muted, fontFamily: "'IBM Plex Mono', monospace" }}>{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
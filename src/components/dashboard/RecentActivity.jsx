import { C } from './colors';

const activity = [
  { text: 'Session note added for Adaeze Eze', sub: 'Knee rehab \u00b7 Session 4', when: '30m ago' },
  { text: 'Exercise program updated for Chinedu Okafor', sub: 'Lower back pain', when: '2h ago' },
  { text: 'New patient registered: Funmi Adebayo', sub: 'Initial assessment scheduled', when: '3h ago' },
];

export default function RecentActivity() {
  return (
    <div className="rounded-xl p-4" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm" style={{ fontWeight: 500, color: C.ink }}>Recent activity</p>
        <span className="text-xs" style={{ color: C.primaryLight }}>View all activity</span>
      </div>
      {activity.map((a, i) => (
        <div key={i} className="flex items-center justify-between py-2.5" style={{ borderTop: i > 0 ? `1px solid ${C.border}` : 'none' }}>
          <div>
            <p className="text-sm" style={{ color: C.ink, fontWeight: 500 }}>{a.text}</p>
            <p className="text-xs mt-0.5" style={{ color: C.muted }}>{a.sub}</p>
          </div>
          <span className="text-xs shrink-0" style={{ color: C.muted }}>{a.when}</span>
        </div>
      ))}
    </div>
  );
}
import { AlertTriangle, RefreshCcw, Info } from 'lucide-react';
import { C } from './colors';

const alerts = [
  { icon: AlertTriangle, name: 'Emeka Nwosu', note: 'High pain score reported: 8/10', when: '12m ago', bg: '#FBEAE5', color: C.coral },
  { icon: RefreshCcw, name: 'Adaeze Eze', note: 'Missed last exercise log', when: '1h ago', bg: '#FBEEE0', color: C.accent },
  { icon: Info, name: 'Chinedu Okafor', note: 'Re-assessment due Jul 18', when: '2h ago', bg: '#EAF1F0', color: C.primaryLight },
];

export default function ClinicalAlerts() {
  return (
    <div className="rounded-xl p-4" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
      <p className="text-sm mb-3" style={{ fontWeight: 500, color: C.ink }}>Clinical alerts</p>
      {alerts.map((a, i) => (
        <div key={i} className="rounded-lg p-3 mb-2 flex items-start gap-2.5" style={{ background: a.bg }}>
          <a.icon size={16} color={a.color} strokeWidth={2} className="mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm truncate" style={{ color: C.ink, fontWeight: 500 }}>{a.name}</p>
              <span className="text-xs shrink-0" style={{ color: C.muted }}>{a.when}</span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: C.muted }}>{a.note}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
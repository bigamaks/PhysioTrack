import { C } from './colors';

export default function StatCard({ icon: Icon, iconBg, iconColor, label, value, sub, subColor }) {
  return (
    <div className="flex-1 rounded-xl p-4" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
      <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3" style={{ background: iconBg }}>
        <Icon size={18} color={iconColor} strokeWidth={2} />
      </div>
      <p className="text-xs mb-1" style={{ color: C.muted }}>{label}</p>
      <p className="text-2xl" style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, color: C.ink }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: subColor || C.muted }}>{sub}</p>}
    </div>
  );
}
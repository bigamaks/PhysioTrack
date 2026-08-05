import { UserPlus, CalendarPlus, ClipboardList, PenSquare, FootprintsIcon, FileText } from 'lucide-react';
import { C } from './colors';

const actions = [
  { icon: UserPlus, label: 'Add patient' },
  { icon: CalendarPlus, label: 'Book appointment' },
  { icon: ClipboardList, label: 'New assessment' },
  { icon: PenSquare, label: 'Log session note' },
  { icon: FootprintsIcon, label: 'Assign exercises' },
  { icon: FileText, label: 'Generate report' },
];

export default function QuickActions() {
  return (
    <div className="rounded-xl p-4" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
      <p className="text-sm mb-3" style={{ fontWeight: 500, color: C.ink }}>Quick actions</p>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((a, i) => (
          <div key={i} className="rounded-lg p-3 flex flex-col items-center gap-1.5 cursor-pointer" style={{ border: `1px solid ${C.border}` }}>
            <a.icon size={18} color={C.primary} strokeWidth={1.75} />
            <span className="text-xs text-center" style={{ color: C.ink }}>{a.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
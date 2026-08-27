import {
  UserPlus,
  CalendarPlus,
  ClipboardList,
  PenSquare,
  FootprintsIcon,
  FileText,
} from 'lucide-react';
import { C } from './colors';
import { Link } from 'react-router-dom';

const actions = [
  {
    icon: UserPlus,
    label: 'Add patient',
    path: '/therapist/patients/add',
  },
  {
    icon: CalendarPlus,
    label: 'Book appointment',
    path: '/therapist/appointments/book',
  },
  {
    icon: ClipboardList,
    label: 'New assessment',
    path: '/therapist/assessments/new',
  },
  {
    icon: PenSquare,
    label: 'Log session note',
    path: null,
  },
  {
    icon: FootprintsIcon,
    label: 'Assign exercises',
    path: '/therapist/patients',
  },
  {
    icon: FileText,
    label: 'Generate report',
    path: '/therapist/reports',
  },
];

export default function QuickActions() {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
      }}
    >
      <p
        className="text-sm mb-3"
        style={{
          fontWeight: 500,
          color: C.ink,
        }}
      >
        Quick actions
      </p>

      <div className="grid grid-cols-2 gap-2">
        {actions.map((action) => {
          const Icon = action.icon;

          if (!action.path) {
            return (
              <div
                key={action.label}
                className="rounded-lg p-3 flex flex-col items-center gap-1.5 opacity-50 cursor-not-allowed"
                style={{
                  border: `1px solid ${C.border}`,
                }}
              >
                <Icon
                  size={18}
                  color={C.primary}
                  strokeWidth={1.75}
                />

                <span
                  className="text-xs text-center"
                  style={{ color: C.ink }}
                >
                  {action.label}
                </span>
              </div>
            );
          }

          return (
            <Link
              key={action.label}
              to={action.path}
              className="rounded-lg p-3 flex flex-col items-center gap-1.5 transition hover:bg-[#F7F9F8]"
              style={{
                border: `1px solid ${C.border}`,
              }}
            >
              <Icon
                size={18}
                color={C.primary}
                strokeWidth={1.75}
              />

              <span
                className="text-xs text-center"
                style={{ color: C.ink }}
              >
                {action.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
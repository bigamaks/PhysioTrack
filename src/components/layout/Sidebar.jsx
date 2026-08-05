import { NavLink } from 'react-router-dom';
import { Activity } from 'lucide-react';

export default function Sidebar({ links }) {
  return (
    <div className="w-60 shrink p-4 flex flex-col gap-1 bg-primary min-h-screen">
      <div className="flex items-center gap-2 px-2 mb-6">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-accent">
          <Activity size={18} color="#FFFFFF" strokeWidth={2} />
        </div>
        <span className="font-display font-semibold text-white text-base">PhysioTrack</span>
      </div>

      {links.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              isActive ? 'bg-white/10 text-white font-medium' : 'text-white/65 hover:bg-white/5'
            }`
          }
        >
          <Icon size={18} strokeWidth={1.75} />
          <span>{label}</span>
        </NavLink>
      ))}
    </div>
  );
}
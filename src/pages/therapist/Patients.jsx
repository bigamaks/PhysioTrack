import {
  Search,
  ChevronRight,
  ChevronLeft,
  UserPlus,
  Users,
  UserCheck,
  CalendarPlus,
  PackageCheck,
  Eye,
  MoreHorizontal,
  SlidersHorizontal,
  RotateCcw,
  Download,
} from 'lucide-react';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';

function StatCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  sub,
  subColor,
}) {
  return (
    <div className="flex-1 rounded-xl p-4 bg-white border border-[#E4E9E8]">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
        style={{ background: iconBg }}
      >
        <Icon size={18} color={iconColor} strokeWidth={2} />
      </div>
      <p className="text-xs mb-1 text-muted">{label}</p>
      <p className="text-2xl font-mono font-semibold text-ink">{value}</p>
      {sub && (
        <p className="text-xs mt-1" style={{ color: subColor }}>
          {sub}
        </p>
      )}
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    Active: { bg: '#E1F0EA', text: '#1F4E4A' },
    Inactive: { bg: '#F1F1F0', text: '#5C6B6E' },
    Discharged: { bg: '#FBEEE0', text: '#9A6423' },
  };
  const s = map[status] || map.Active;
  return (
    <span
      className="text-xs px-2.5 py-1 rounded-full font-medium"
      style={{ background: s.bg, color: s.text }}
    >
      {status}
    </span>
  );
}

function Avatar({ initials, tint }) {
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-xs text-white font-semibold shrink-0"
      style={{ background: tint }}
    >
      {initials}
    </div>
  );
}

const AVATAR_COLORS = ['#1F4E4A', '#7FA893', '#D96B54', '#E2984F', '#2F6E67'];

function getTint(name) {
  const index = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

function FilterChip({ label }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-ink bg-white border border-[#E4E9E8] cursor-pointer">
      {label}
    </div>
  );
}

// const patients = [
//   { name: 'Chinedu Okafor', age: 35, gender: 'Male', id: 'PT-0001', phone: '+234 801 234 5678', condition: 'Lower back pain', status: 'Active', lastVisit: 'Jul 12, 2026', next: 'Jul 19, 2026 · 10:00 AM', tint: '#1F4E4A' },
//   { name: 'Adaeze Eze', age: 29, gender: 'Female', id: 'PT-0002', phone: '+234 802 345 6789', condition: 'Knee rehabilitation', status: 'Active', lastVisit: 'Jul 14, 2026', next: 'Jul 21, 2026 · 11:30 AM', tint: '#7FA893' },
//   { name: 'Emeka Nwosu', age: 42, gender: 'Male', id: 'PT-0003', phone: '+234 803 456 7890', condition: 'Post-surgery recovery', status: 'Active', lastVisit: 'Jul 10, 2026', next: 'Jul 18, 2026 · 09:00 AM', tint: '#D96B54' },
//   { name: 'Funmi Adebayo', age: 31, gender: 'Female', id: 'PT-0004', phone: '+234 804 567 8901', condition: 'Shoulder pain', status: 'Active', lastVisit: 'Jul 11, 2026', next: 'Jul 20, 2026 · 02:00 PM', tint: '#E2984F' },
//   { name: 'Ibrahim Hassan', age: 28, gender: 'Male', id: 'PT-0005', phone: '+234 805 678 9012', condition: 'Sports injury', status: 'Inactive', lastVisit: 'Jun 30, 2026', next: '—', tint: '#2F6E67' },
//   { name: 'Chioma Umeh', age: 37, gender: 'Female', id: 'PT-0006', phone: '+234 806 789 0123', condition: 'Neck pain', status: 'Active', lastVisit: 'Jul 13, 2026', next: 'Jul 23, 2026 · 10:30 AM', tint: '#7FA893' },
//   { name: 'Tunde Ojo', age: 50, gender: 'Male', id: 'PT-0007', phone: '+234 807 890 1234', condition: 'Hip pain', status: 'Discharged', lastVisit: 'Jun 28, 2026', next: '—', tint: '#5C6B6E' },
// ];

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPatients() {
      const { data, error } = await supabase.from('patients').select('*');
      if (error) {
        console.error('Error fetching patients:', error);
      } else {
        setPatients(data);
      }
      setLoading(false);
    }
    fetchPatients();
  }, []);

  if (loading) return <div className="p-6 text-muted">Loading patients...</div>;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-semibold text-2xl text-ink">
            Patients
          </h1>
          <p className="text-sm mt-1 text-muted">
            Manage patient records and track their treatment journey.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-white font-medium bg-primary">
          {/* <UserPlus size={16} /> Add new patient */}
          <Link
            to="/therapist/patients/add"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-white font-medium bg-primary"
          >
            <UserPlus size={16} /> Add new patient
          </Link>
        </button>
      </div>

      <div className="flex gap-4">
        <StatCard
          icon={Users}
          iconBg="#E1F0EA"
          iconColor="#1F4E4A"
          label="Total patients"
          value="248"
          sub="↑ 12% from last month"
          subColor="#1F4E4A"
        />
        <StatCard
          icon={UserCheck}
          iconBg="#EAF1F0"
          iconColor="#2F6E67"
          label="Active patients"
          value="189"
          sub="↑ 8% from last month"
          subColor="#2F6E67"
        />
        <StatCard
          icon={CalendarPlus}
          iconBg="#FBEEE0"
          iconColor="#E2984F"
          label="New this month"
          value="18"
          sub="↑ 5% from last month"
          subColor="#E2984F"
        />
        <StatCard
          icon={PackageCheck}
          iconBg="#F1F1F0"
          iconColor="#5C6B6E"
          label="Discharged"
          value="59"
          sub="↑ 10% from last month"
          subColor="#5C6B6E"
        />
      </div>

      <div className="flex items-center gap-3 rounded-xl p-3 bg-white border border-[#E4E9E8]">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 bg-bg">
          <Search size={16} className="text-muted" />
          <span className="text-sm text-muted">Search patients...</span>
        </div>
        <FilterChip label="All status" />
        <FilterChip label="All conditions" />
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-ink border border-[#E4E9E8] cursor-pointer">
          <SlidersHorizontal size={14} /> More filters
        </div>
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted cursor-pointer">
          <RotateCcw size={14} /> Reset
        </div>
        <div
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer"
          style={{ background: '#E1F0EA', color: '#1F4E4A' }}
        >
          <Download size={14} /> Export
        </div>
      </div>

      <div className="rounded-xl overflow-hidden bg-white border border-[#E4E9E8]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E4E9E8]">
              {[
                'Patient',
                'ID',
                'Contact',
                'Condition',
                'Status',
                'Last visit',
                'Next appointment',
                'Actions',
              ].map((h, i) => (
                <th
                  key={i}
                  className="text-left px-4 py-3 text-xs text-muted font-medium"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {patients.map((p, i) => (
              <tr key={i} className={i > 0 ? 'border-t border-[#E4E9E8]' : ''}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar
                      initials={p.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                      tint={getTint(p.name)}
                    />
                    <div>
                      <p className="text-ink font-medium">{p.name}</p>
                      <p className="text-xs text-muted">
                        {p.age} · {p.gender}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted font-mono text-[13px]">
                  {p.id}
                </td>
                <td className="px-4 py-3 text-muted text-[13px]">{p.phone}</td>
                <td className="px-4 py-3 text-muted">{p.condition}</td>
                <td className="px-4 py-3">
                  <StatusPill status={p.status} />
                </td>
                <td className="px-4 py-3 text-muted font-mono text-[13px]">
                  {p.last_visit}
                </td>
                <td
                  className="px-4 py-3 text-[13px]"
                  style={{
                    color: p.next_appointment === '—' ? '#5C6B6E' : '#2F6E67',
                  }}
                >
                  {p.next_appointment}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border border-[#E4E9E8]">
                      {/* <Eye size={14} className="text-muted" /> */}

                      <Link
                        to={`/therapist/patients/${p.id}`}
                        className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#E4E9E8]"
                      >
                        <Eye size={14} className="text-muted" />
                      </Link>
                    </div>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border border-[#E4E9E8]">
                      <MoreHorizontal size={14} className="text-muted" />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted">
        <span>Showing 1 to 7 of 248 patients</span>
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#E4E9E8]">
            <ChevronLeft size={14} />
          </div>
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${n === 1 ? 'bg-primary text-white' : 'border border-[#E4E9E8] text-ink'}`}
            >
              {n}
            </div>
          ))}
          <span>...</span>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#E4E9E8]">
            36
          </div>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#E4E9E8]">
            <ChevronRight size={14} />
          </div>
        </div>
      </div>
    </div>
  );
}

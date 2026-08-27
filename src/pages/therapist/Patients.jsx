import {
  Search,
  // ChevronRight,
  // ChevronLeft,
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

function parseAppointmentDateTime(date, time) {
  if (!date || !time) return null;

  const normalizedTime = time.trim().toUpperCase();

  const match = normalizedTime.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/);

  if (!match) {
    return new Date(`${date}T00:00:00`);
  }

  let [, hour, minute = '00', period] = match;

  hour = Number(hour);
  minute = Number(minute);

  if (period === 'PM' && hour !== 12) {
    hour += 12;
  }

  if (period === 'AM' && hour === 12) {
    hour = 0;
  }

  return new Date(
    `${date}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`,
  );
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
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchPatients() {
      setLoading(true);

      try {
        // Fetch patients
        const { data: patientData, error: patientError } = await supabase
          .from('patients')
          .select(
            `
          id,
          created_at,
          name,
          age,
          gender,
          condition,
          status,
          last_visit,
          profile_id
        `,
          )
          .order('created_at', { ascending: false });

        if (patientError) {
          console.error('Error fetching patients:', patientError);
          setPatients([]);
          return;
        }

        // Fetch appointments
        const { data: appointmentData, error: appointmentError } =
          await supabase
            .from('appointments')
            .select(
              `
            id,
            patient_id,
            date,
            time,
            status
          `,
            )
            .order('date', { ascending: true });

        if (appointmentError) {
          console.error('Error fetching appointments:', appointmentError);
        }

        const now = new Date();

// Build patient appointment lookups
const nextAppointmentMap = {};
const lastVisitMap = {};

(appointmentData || []).forEach((appointment) => {
  if (!appointment.patient_id) return;

  if (appointment.status?.toLowerCase() === 'cancelled') {
    return;
  }

  const appointmentDateTime = parseAppointmentDateTime(
    appointment.date,
    appointment.time
  );

  if (!appointmentDateTime) return;

  // Upcoming appointment
  if (appointmentDateTime >= now) {
    const currentNext = nextAppointmentMap[appointment.patient_id];

    if (
      !currentNext ||
      appointmentDateTime <
        parseAppointmentDateTime(
          currentNext.date,
          currentNext.time
        )
    ) {
      nextAppointmentMap[appointment.patient_id] = appointment;
    }
  }

  // Most recent past appointment
  if (appointmentDateTime < now) {
    const currentLast = lastVisitMap[appointment.patient_id];

    if (
      !currentLast ||
      appointmentDateTime >
        parseAppointmentDateTime(
          currentLast.date,
          currentLast.time
        )
    ) {
      lastVisitMap[appointment.patient_id] = appointment;
    }
  }
});

const mergedPatients = (patientData || []).map((patient) => ({
  ...patient,

  nextAppointment:
    nextAppointmentMap[patient.id] || null,

  lastVisit:
    lastVisitMap[patient.id] || null,
}));

setPatients(mergedPatients);

      } catch (error) {
        console.error('Unexpected error:', error);
        setPatients([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPatients();
  }, []);

  const filteredPatients = patients.filter((patient) =>
    patient.name?.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPatients = patients.length;

  const activePatients = patients.filter(
    (patient) => patient.status?.toLowerCase() === 'active',
  ).length;

  const dischargedPatients = patients.filter(
    (patient) => patient.status?.toLowerCase() === 'discharged',
  ).length;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const newThisMonth = patients.filter((patient) => {
    if (!patient.created_at) return false;

    const createdDate = new Date(patient.created_at);

    return (
      createdDate.getMonth() === currentMonth &&
      createdDate.getFullYear() === currentYear
    );
  }).length;

  if (loading) {
    return <div className="p-6 text-sm text-muted">Loading patients...</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-semibold text-2xl text-ink">
            Patients
          </h1>

          <p className="text-sm mt-1 text-muted">
            Manage patient records and track their treatment journey.
          </p>
        </div>

        <Link
          to="/therapist/patients/add"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-white font-medium bg-primary"
        >
          <UserPlus size={16} />
          Add new patient
        </Link>
      </div>

      {/* Stats */}
      <div className="flex gap-4">
        <StatCard
          icon={Users}
          iconBg="#E1F0EA"
          iconColor="#1F4E4A"
          label="Total patients"
          value={totalPatients}
        />

        <StatCard
          icon={UserCheck}
          iconBg="#EAF1F0"
          iconColor="#2F6E67"
          label="Active patients"
          value={activePatients}
        />

        <StatCard
          icon={CalendarPlus}
          iconBg="#FBEEE0"
          iconColor="#E2984F"
          label="New this month"
          value={newThisMonth}
        />

        <StatCard
          icon={PackageCheck}
          iconBg="#F1F1F0"
          iconColor="#5C6B6E"
          label="Discharged"
          value={dischargedPatients}
        />
      </div>

      {/* Search / Filters */}
      <div className="flex items-center gap-3 rounded-xl p-3 bg-white border border-[#E4E9E8]">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 bg-bg">
          <Search size={16} className="text-muted" />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patients..."
            className="w-full bg-transparent outline-none text-sm text-ink placeholder:text-muted"
          />
        </div>

        <FilterChip label="All status" />
        <FilterChip label="All conditions" />

        <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-ink border border-[#E4E9E8] cursor-pointer">
          <SlidersHorizontal size={14} />
          More filters
        </div>

        <button
          type="button"
          onClick={() => setSearch('')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted cursor-pointer"
        >
          <RotateCcw size={14} />
          Reset
        </button>

        <button
          type="button"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium"
          style={{ background: '#E1F0EA', color: '#1F4E4A' }}
        >
          <Download size={14} />
          Export
        </button>
      </div>

      {/* Patients Table */}
      <div className="rounded-xl overflow-hidden bg-white border border-[#E4E9E8]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E4E9E8]">
              {[
                'Patient',
                'ID',
                'Condition',
                'Status',
                'Last visit',
                'Next appointment',
                'Actions',
              ].map((heading) => (
                <th
                  key={heading}
                  className="text-left px-4 py-3 text-xs text-muted font-medium"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filteredPatients.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-sm text-muted"
                >
                  {search ? 'No patients found.' : 'No patients yet.'}
                </td>
              </tr>
            ) : (
              filteredPatients.map((patient, index) => {
                const status =
                  patient.status?.charAt(0).toUpperCase() +
                    patient.status?.slice(1).toLowerCase() || 'Active';

                return (
                  <tr
                    key={patient.id}
                    className={index > 0 ? 'border-t border-[#E4E9E8]' : ''}
                  >
                    {/* Patient */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar
                          initials={
                            patient.name
                              ?.split(' ')
                              .filter(Boolean)
                              .map((name) => name[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase() || '?'
                          }
                          tint={getTint(patient.name || '')}
                        />

                        <div>
                          <p className="text-ink font-medium">
                            {patient.name || 'Unnamed patient'}
                          </p>

                          <p className="text-xs text-muted">
                            {patient.age || '—'} · {patient.gender || '—'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* ID */}
                    <td className="px-4 py-3 text-muted font-mono text-[13px]">
                      PT-{String(patient.id).padStart(4, '0')}
                    </td>

                    {/* Condition */}
                    <td className="px-4 py-3 text-muted">
                      {patient.condition || '—'}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <StatusPill status={status} />
                    </td>

                    {/* Last Visit */}
                    <td className="px-4 py-3 text-muted font-mono text-[13px]">
                      {patient.lastVisit?.date || '—'}
                    </td>

                    {/* Next Appointment */}
                    <td
                      className="px-4 py-3 text-[13px]"
                      style={{
                        color: patient.nextAppointment ? '#2F6E67' : '#5C6B6E',
                      }}
                    >
                      {patient.nextAppointment ? (
                        <>
                          {patient.nextAppointment.date} ·{' '}
                          {patient.nextAppointment.time}
                        </>
                      ) : (
                        '—'
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/therapist/patients/${patient.id}`}
                          className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#E4E9E8]"
                        >
                          <Eye size={14} className="text-muted" />
                        </Link>

                        <button
                          type="button"
                          className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#E4E9E8]"
                        >
                          <MoreHorizontal size={14} className="text-muted" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between text-sm text-muted">
        <span>
          Showing {filteredPatients.length} of {patients.length} patients
        </span>
      </div>
    </div>
  );
}

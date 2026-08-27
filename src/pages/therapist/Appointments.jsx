import { useState, useEffect } from 'react';
import { Search, Plus, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

function StatusPill({ status }) {
  const map = {
    Confirmed: { bg: '#E1F0EA', text: '#1F4E4A' },
    'In Progress': { bg: '#EAF1F0', text: '#2F6E67' },
    Pending: { bg: '#FBEEE0', text: '#9A6423' },
    Cancelled: { bg: '#FBEAE5', text: '#D96B54' },
  };

  const s = map[status] || map.Pending;

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

const AVATAR_COLORS = [
  '#1F4E4A',
  '#7FA893',
  '#D96B54',
  '#E2984F',
  '#2F6E67',
];

function getTint(name) {
  if (!name) return AVATAR_COLORS[0];

  return AVATAR_COLORS[
    name.charCodeAt(0) % AVATAR_COLORS.length
  ];
}

function getInitials(name) {
  if (!name) return '?';

  return name
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function parseAppointmentDateTime(date, time) {
  if (!date || !time) return null;

  const normalizedTime = time.trim().toUpperCase();

  // Handle formats like "8am", "10 AM", "12PM", "11:00AM"
  const match = normalizedTime.match(
    /^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/
  );

  if (!match) return new Date(`${date}T00:00:00`);

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
    `${date}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`
  );
}

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [nextAppointment, setNextAppointment] = useState(null);
  const [therapistName, setTherapistName] = useState('');

  const { session } = useAuth();

  useEffect(() => {
    if (!session?.user?.id) return;

    async function fetchAppointments() {
      setLoading(true);

      try {
        // Get appointments belonging to the logged-in therapist
        const { data: appts, error: apptError } = await supabase
          .from('appointments')
          .select('*')
          .eq('therapist_id', session.user.id)
          .order('date', { ascending: true })
          .order('time', { ascending: true });

        if (apptError) {
          console.error('Error fetching appointments:', apptError);
          setAppointments([]);
          setNextAppointment(null);
          return;
        }

// Get patient IDs from appointments
const patientIds = [
  ...new Set(
    (appts || [])
      .map((appointment) => appointment.patient_id)
      .filter((id) => id !== null && id !== undefined)
  ),
];

// Fetch patients using patients.id
let patients = [];

if (patientIds.length > 0) {
  const { data: patientData, error: patientError } = await supabase
    .from('patients')
    .select('id, name')
    .in('id', patientIds);

  if (patientError) {
    console.error('Error fetching patients:', patientError);
  } else {
    patients = patientData || [];
  }
}

// Build patient ID -> name lookup
const nameMap = {};

patients.forEach((patient) => {
  nameMap[patient.id] = patient.name;
});

// Add patient name to each appointment
const mergedAppointments = (appts || []).map((appointment) => ({
  ...appointment,
  patientName:
    nameMap[appointment.patient_id] || 'Unknown patient',
}));

        setAppointments(mergedAppointments);

        // Find the next upcoming appointment
const now = new Date();

const upcomingAppointments = mergedAppointments
  .filter((appointment) => {
    if (appointment.status === 'Cancelled') return false;

    const appointmentDateTime = parseAppointmentDateTime(
      appointment.date,
      appointment.time
    );

    return appointmentDateTime && appointmentDateTime >= now;
  })
  .sort((a, b) => {
    const dateA = parseAppointmentDateTime(a.date, a.time);
    const dateB = parseAppointmentDateTime(b.date, b.time);

    return dateA - dateB;
  });

const next = upcomingAppointments[0] || null;

setNextAppointment(next);

        // Fetch therapist name if we have a next appointment
        if (next?.therapist_id) {
          const { data: therapistData, error: therapistError } =
            await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', next.therapist_id)
              .single();

          if (!therapistError && therapistData) {
            setTherapistName(therapistData.full_name);
          }
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        setAppointments([]);
        setNextAppointment(null);
      } finally {
        setLoading(false);
      }
    }

    fetchAppointments();
  }, [session]);

  // Filter appointments based on patient name
  const filteredAppointments = appointments.filter((appointment) =>
    appointment.patientName
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="text-sm text-muted">
        Loading appointments...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-semibold text-2xl text-ink">
            Appointments
          </h1>

          <p className="text-sm mt-1 text-muted">
            Manage your daily schedule and bookings.
          </p>
        </div>

        <Link
          to="/therapist/appointments/book"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-white font-medium bg-primary"
        >
          <Plus size={16} />
          Book appointment
        </Link>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 rounded-xl p-3 bg-white border border-[#E4E9E8]">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 bg-bg">
          <Search size={16} className="text-muted" />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patient name..."
            className="w-full bg-transparent outline-none text-sm text-ink placeholder:text-muted"
          />
        </div>
      </div>

      {/* Next Appointment */}
      <div className="rounded-xl p-4 bg-white border border-[#E4E9E8]">
        <p className="text-sm mb-3 font-medium text-ink">
          Next appointment
        </p>

        {nextAppointment ? (
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ background: '#E1F0EA' }}
            >
              <Calendar size={18} color="#1F4E4A" />
            </div>

            <div>
              <p className="text-sm font-medium text-ink">
                {nextAppointment.patientName}
              </p>

              <p className="text-xs mt-0.5 text-muted">
                {nextAppointment.date} · {nextAppointment.time}
              </p>

              {nextAppointment.type && (
                <p className="text-xs mt-0.5 text-muted">
                  {nextAppointment.type}
                </p>
              )}

              {therapistName && (
                <p className="text-xs mt-0.5 text-primary-light">
                  with {therapistName}
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted">
            No upcoming appointments.
          </p>
        )}
      </div>

      {/* Appointments Table */}
      <div className="rounded-xl overflow-hidden bg-white border border-[#E4E9E8]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E4E9E8]">
              {[
                'Date',
                'Time',
                'Patient',
                'Type',
                'Condition',
                'Duration',
                'Status',
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
            {filteredAppointments.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-sm text-muted"
                >
                  {search
                    ? 'No appointments found for this patient.'
                    : 'No appointments yet.'}
                </td>
              </tr>
            ) : (
              filteredAppointments.map((appointment, index) => {
                const patientName =
                  appointment.patientName || 'Unknown patient';

                return (
                  <tr
                    key={appointment.id}
                    className={
                      index > 0
                        ? 'border-t border-[#E4E9E8]'
                        : ''
                    }
                  >
                    {/* Date */}
                    <td className="px-4 py-3 text-muted font-mono text-[13px]">
                      {appointment.date}
                    </td>

                    {/* Time */}
                    <td className="px-4 py-3 font-mono text-[13px] text-primary font-medium">
                      {appointment.time}
                    </td>

                    {/* Patient */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar
                          initials={getInitials(patientName)}
                          tint={getTint(patientName)}
                        />

                        <span className="text-ink font-medium">
                          {patientName}
                        </span>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="px-4 py-3 text-muted">
                      {appointment.type || '—'}
                    </td>

                    {/* Condition */}
                    <td className="px-4 py-3 text-muted">
                      {appointment.condition || '—'}
                    </td>

                    {/* Duration */}
                    <td className="px-4 py-3 text-muted font-mono text-[13px]">
                      {appointment.duration || '—'}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <StatusPill
                        status={appointment.status || 'Pending'}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
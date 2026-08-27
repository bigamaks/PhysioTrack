import { C } from './colors';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';

function StatusPill({ status }) {
  const map = {
    Confirmed: { bg: '#E1F0EA', text: C.primary },
    'In Progress': { bg: '#EAF1F0', text: C.primaryLight },
    Pending: { bg: '#FBEEE0', text: '#9A6423' },
    Completed: { bg: '#E1F0EA', text: '#7FA893' },
    Cancelled: { bg: '#FCEBE7', text: '#D96B54' },
  };

  const s = map[status] || map.Confirmed;

  return (
    <span
      className="text-xs px-2.5 py-1 rounded-full"
      style={{
        background: s.bg,
        color: s.text,
        fontWeight: 500,
      }}
    >
      {status}
    </span>
  );
}

function Avatar({ initials, tint }) {
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-xs shrink-0"
      style={{
        background: tint,
        color: '#FFFFFF',
        fontWeight: 600,
      }}
    >
      {initials}
    </div>
  );
}

export default function AppointmentsList() {
  const { session } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const tints = [
    C.primary,
    C.sage,
    C.coral,
    C.accent,
  ];

  useEffect(() => {
    async function fetchAppointments() {
      if (!session?.user?.id) return;

      setLoading(true);

      const today = new Date()
        .toISOString()
        .split('T')[0];

      // Get today's appointments for the
      // currently logged-in therapist.
      const {
        data: appts,
        error: apptError,
      } = await supabase
        .from('appointments')
        .select(`
          id,
          type,
          condition,
          date,
          time,
          duration,
          status,
          location,
          patient_id
        `)
        .eq('therapist_id', session.user.id)
        .eq('date', today)
        .order('time', { ascending: true });

      if (apptError) {
        console.error(
          'Error fetching appointments:',
          apptError
        );
        setLoading(false);
        return;
      }

      // Get the actual patient records using
      // appointments.patient_id -> patients.id.
      const patientIds = [
        ...new Set(
          (appts || [])
            .map((appointment) => appointment.patient_id)
            .filter(Boolean)
        ),
      ];

      let patients = [];

      if (patientIds.length > 0) {
        const {
          data: patientData,
          error: patientError,
        } = await supabase
          .from('patients')
          .select('id, name')
          .in('id', patientIds);

        if (patientError) {
          console.error(
            'Error fetching patients:',
            patientError
          );
        } else {
          patients = patientData || [];
        }
      }

      // Create a map:
      // patient ID -> patient name
      const nameMap = {};

      patients.forEach((patient) => {
        nameMap[patient.id] = patient.name;
      });

      const merged = (appts || []).map((appointment) => {
        const patientName =
          nameMap[appointment.patient_id] ||
          'Unknown patient';

        const initials = patientName
          .split(' ')
          .filter(Boolean)
          .map((name) => name[0])
          .join('')
          .slice(0, 2)
          .toUpperCase();

        return {
          ...appointment,
          patientName,
          initials,
        };
      });

      setAppointments(merged);
      setLoading(false);
    }

    fetchAppointments();
  }, [session]);

  if (loading) {
    return (
      <div className="text-sm text-muted">
        Loading appointments...
      </div>
    );
  }

  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <p
          className="text-sm"
          style={{
            fontWeight: 500,
            color: C.ink,
          }}
        >
          Today's appointments
        </p>

        <span
          className="text-xs"
          style={{ color: C.primaryLight }}
        >
          View full schedule
        </span>
      </div>

      {appointments.length > 0 ? (
        appointments.slice(0, 5).map((appointment, index) => (
          <div
            key={appointment.id}
            className="flex items-center gap-3 py-2.5"
            style={{
              borderTop:
                index > 0
                  ? `1px solid ${C.border}`
                  : 'none',
            }}
          >
            <Avatar
              initials={appointment.initials}
              tint={tints[index % tints.length]}
            />

            <div className="flex-1 min-w-0">
              <p
                className="text-sm truncate"
                style={{
                  color: C.ink,
                  fontWeight: 500,
                }}
              >
                {appointment.patientName}
              </p>

              <p
                className="text-xs truncate"
                style={{ color: C.muted }}
              >
                {appointment.time} ·{' '}
                {appointment.type}
              </p>
            </div>

            <StatusPill
              status={appointment.status}
            />
          </div>
        ))
      ) : (
        <div className="py-6 text-center">
          <p className="text-sm text-muted">
            No appointments today.
          </p>
        </div>
      )}
    </div>
  );
}
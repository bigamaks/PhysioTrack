import { useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

function UpcomingCard({
  date,
  time,
  type,
  therapist,
  location,
  status,
  duration,
}) {
  return (
    <div className="rounded-xl p-4 flex items-center gap-4 bg-white border border-[#E4E9E8]">
      <div
        className="rounded-lg flex flex-col items-center justify-center flex-shrink-0 bg-primary"
        style={{ width: 56, height: 56 }}
      >
        <span
          className="text-xs text-white"
          style={{ opacity: 0.8 }}
        >
          {date.month}
        </span>

        <span className="font-mono font-semibold text-xl text-white">
          {date.day}
        </span>
      </div>

      <div className="flex-1">
        <p className="text-sm font-medium text-ink">
          {type}
        </p>

        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <span className="text-xs flex items-center gap-1 text-muted">
            <Clock size={12} />
            {time}
          </span>

          {location && (
            <span className="text-xs flex items-center gap-1 text-muted">
              <MapPin size={12} />
              {location}
            </span>
          )}
        </div>

        <p className="text-xs mt-1 text-primary-light">
          with {therapist}
        </p>

        {duration && (
          <p className="text-xs mt-1 text-muted">
            {duration}
          </p>
        )}
      </div>

      <div className="flex flex-col items-end gap-2">
        <span
          className="text-xs px-2.5 py-1 rounded-full font-medium"
          style={{
            background:
              status === 'Confirmed'
                ? '#E1F0EA'
                : '#FBEEE0',
            color:
              status === 'Confirmed'
                ? '#1F4E4A'
                : '#9A6423',
          }}
        >
          {status}
        </span>

        <button className="text-xs px-3 py-2 rounded-lg border border-[#E4E9E8] text-ink">
          Reschedule
        </button>
      </div>
    </div>
  );
}

function formatUpcomingDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);

  return {
    month: date.toLocaleDateString('en-US', {
      month: 'short',
    }).toUpperCase(),

    day: date.toLocaleDateString('en-US', {
      day: 'numeric',
    }),
  };
}

function formatPastDate(dateString) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }
  );
}

export default function Appointments() {
  const { session } = useAuth();

  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAppointments() {
      if (!session?.user?.id) return;

      setLoading(true);
      setError(null);

      try {
        // Find the patient record belonging to
        // the currently logged-in user.
        const {
          data: patient,
          error: patientError,
        } = await supabase
          .from('patients')
          .select('id')
          .eq('profile_id', session.user.id)
          .single();

        if (patientError) {
          throw patientError;
        }

        // Get all appointments belonging to this patient.
        const {
          data: appointments,
          error: appointmentsError,
        } = await supabase
          .from('appointments')
          .select(`
            id,
            therapist_id,
            type,
            condition,
            date,
            time,
            duration,
            status,
            location,
            therapist:profiles!appointments_therapist_id_fkey (
              full_name
            )
          `)
          .eq('patient_id', patient.id)
          .order('date', { ascending: true });

        if (appointmentsError) {
          throw appointmentsError;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcomingAppointments = [];
        const pastAppointments = [];

        (appointments || []).forEach((appointment) => {
          const appointmentDate = new Date(
            `${appointment.date}T00:00:00`
          );

          if (appointmentDate >= today) {
            upcomingAppointments.push(appointment);
          } else {
            pastAppointments.push(appointment);
          }
        });

        // Most recent past appointment first.
        pastAppointments.sort(
          (a, b) =>
            new Date(`${b.date}T00:00:00`) -
            new Date(`${a.date}T00:00:00`)
        );

        setUpcoming(upcomingAppointments);
        setPast(pastAppointments);
      } catch (err) {
        console.error(
          'Error fetching appointments:',
          err
        );

        setError(
          err.message ||
            'Failed to load your appointments.'
        );
      } finally {
        setLoading(false);
      }
    }

    fetchAppointments();
  }, [session]);

  if (loading) {
    return (
      <div className="text-sm text-muted">
        Loading your appointments...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl p-4 bg-white border border-[#E4E9E8]">
        <div className="flex items-center gap-2">
          <AlertCircle
            size={18}
            className="text-coral"
          />

          <p className="text-sm font-medium text-coral">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-semibold text-2xl text-ink">
            Appointments
          </h1>

          <p className="text-sm mt-1 text-muted">
            Your upcoming and past visits.
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-primary text-white">
          <Plus size={16} />
          Request appointment
        </button>
      </div>

      {/* Upcoming */}
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-ink">
          Upcoming
        </p>

        {upcoming.length > 0 ? (
          upcoming.map((appointment) => (
            <UpcomingCard
              key={appointment.id}
              date={formatUpcomingDate(
                appointment.date
              )}
              time={appointment.time}
              type={appointment.type}
              therapist={
                appointment.therapist?.full_name ||
                'Your therapist'
              }
              location={appointment.location}
              status={appointment.status}
              duration={appointment.duration}
            />
          ))
        ) : (
          <div className="rounded-xl p-8 text-center bg-white border border-[#E4E9E8]">
            <Calendar
              size={28}
              className="mx-auto text-muted"
            />

            <p className="text-sm font-medium text-ink mt-3">
              No upcoming appointments
            </p>

            <p className="text-xs mt-1 text-muted">
              You don't have any upcoming visits scheduled.
            </p>
          </div>
        )}
      </div>

      {/* Past */}
      <div className="rounded-xl p-4 bg-white border border-[#E4E9E8]">
        <div className="flex items-center gap-2 mb-3">
          <Calendar
            size={16}
            className="text-muted"
          />

          <p className="text-sm font-medium text-ink">
            Past appointments
          </p>
        </div>

        {past.length > 0 ? (
          past.map((appointment, index) => {
            const completed =
              appointment.status === 'Completed';

            return (
              <div
                key={appointment.id}
                className={`flex items-center gap-3 py-2.5 ${
                  index > 0
                    ? 'border-t border-[#E4E9E8]'
                    : ''
                }`}
              >
                {completed ? (
                  <CheckCircle2
                    size={16}
                    color="#7FA893"
                  />
                ) : (
                  <XCircle
                    size={16}
                    color="#D96B54"
                  />
                )}

                <span className="text-xs font-mono w-28 flex-shrink-0 text-muted">
                  {formatPastDate(
                    appointment.date
                  )}
                </span>

                <span className="text-sm flex-1 text-ink">
                  {appointment.type}
                </span>

                <span
                  className="text-xs"
                  style={{
                    color: completed
                      ? '#7FA893'
                      : '#D96B54',
                  }}
                >
                  {appointment.status}
                </span>
              </div>
            );
          })
        ) : (
          <div className="py-6 text-center">
            <p className="text-sm text-muted">
              No past appointments yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


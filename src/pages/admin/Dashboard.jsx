import { useEffect, useState } from 'react';
import {
  Users,
  UserCog,
  Calendar,
  Activity,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import StatCard from '../../components/dashboard/StatCard';
import { C } from '../../components/dashboard/colors';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalPatients: 0,
    totalTherapists: 0,
    todayAppointments: 0,
    activeEpisodes: 0,
  });

  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);

      const today = new Date()
        .toISOString()
        .split('T')[0];

      const [
        patientsResult,
        therapistsResult,
        appointmentsResult,
        episodesResult,
      ] = await Promise.all([
        // Total patients
        supabase
          .from('profiles')
          .select('*', {
            count: 'exact',
            head: true,
          })
          .eq('role', 'patient'),

        // Total therapists
        supabase
          .from('profiles')
          .select('*', {
            count: 'exact',
            head: true,
          })
          .eq('role', 'therapist'),

        // Today's appointments
        supabase
          .from('appointments')
          .select('*')
          .eq('date', today)
          .order('time', {
            ascending: true,
          }),

        // Active care episodes
        supabase
          .from('care_episodes')
          .select('*', {
            count: 'exact',
            head: true,
          })
          .eq('status', 'active'),
      ]);

      console.log('Admin dashboard data:', {
        patientsResult,
        therapistsResult,
        appointmentsResult,
        episodesResult,
      });

      setStats({
        totalPatients: patientsResult.count || 0,
        totalTherapists: therapistsResult.count || 0,
        todayAppointments:
          appointmentsResult.data?.length || 0,
        activeEpisodes: episodesResult.count || 0,
      });

      if (appointmentsResult.error) {
        console.error(
          'Error fetching appointments:',
          appointmentsResult.error
        );

        setAppointments([]);
        setLoading(false);
        return;
      }

      // Get patient and therapist IDs
      const patientIds = [
        ...new Set(
          (appointmentsResult.data || [])
            .map((appointment) => appointment.patient_id)
            .filter(Boolean)
        ),
      ];

      const therapistIds = [
        ...new Set(
          (appointmentsResult.data || [])
            .map((appointment) => appointment.therapist_id)
            .filter(Boolean)
        ),
      ];

      // Fetch names
      const [patientsResponse, therapistsResponse] =
        await Promise.all([
          patientIds.length
            ? supabase
                .from('profiles')
                .select('id, full_name')
                .in('id', patientIds)
            : Promise.resolve({ data: [] }),

          therapistIds.length
            ? supabase
                .from('profiles')
                .select('id, full_name')
                .in('id', therapistIds)
            : Promise.resolve({ data: [] }),
        ]);

      const patientMap = {};

      (patientsResponse.data || []).forEach((patient) => {
        patientMap[patient.id] = patient.full_name;
      });

      const therapistMap = {};

      (therapistsResponse.data || []).forEach((therapist) => {
        therapistMap[therapist.id] = therapist.full_name;
      });

      const mergedAppointments = (
        appointmentsResult.data || []
      ).map((appointment) => ({
        ...appointment,
        patientName:
          patientMap[appointment.patient_id] ||
          'Unknown patient',
        therapistName:
          therapistMap[appointment.therapist_id] ||
          'Unknown therapist',
      }));

      setAppointments(mergedAppointments);
      setLoading(false);
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div>
        <h1
          className="font-display font-semibold text-2xl"
          style={{ color: C.ink }}
        >
          Admin Dashboard
        </h1>

        <p
          className="text-sm mt-1"
          style={{ color: C.muted }}
        >
          Here's what's happening across your clinic today.
        </p>
      </div>

      {/* Stats */}
      <div className="flex gap-4">

        <StatCard
          icon={Users}
          iconBg="#E1F0EA"
          iconColor={C.primary}
          label="Total patients"
          value={stats.totalPatients}
          sub="Registered patients"
          subColor={C.primary}
        />

        <StatCard
          icon={UserCog}
          iconBg="#EAF1F0"
          iconColor={C.primaryLight}
          label="Therapists"
          value={stats.totalTherapists}
          sub="Active therapists"
          subColor={C.primaryLight}
        />

        <StatCard
          icon={Calendar}
          iconBg="#FBEEE0"
          iconColor={C.accent}
          label="Today's appointments"
          value={stats.todayAppointments}
          sub="Scheduled today"
          subColor={C.accent}
        />

        <StatCard
          icon={Activity}
          iconBg="#F3EFE6"
          iconColor="#9A8158"
          label="Active care episodes"
          value={stats.activeEpisodes}
          sub="Currently active"
          subColor="#9A8158"
        />

      </div>

      {/* Today's appointments */}
      <div
        className="rounded-xl p-4"
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p
              className="text-sm"
              style={{
                fontWeight: 500,
                color: C.ink,
              }}
            >
              Today's appointments
            </p>

            <p
              className="text-xs mt-1"
              style={{ color: C.muted }}
            >
              {appointments.length} appointment
              {appointments.length !== 1 ? 's' : ''} scheduled
            </p>
          </div>
        </div>

        {appointments.length === 0 ? (
          <div className="py-8 text-center">
            <Calendar
              size={28}
              className="mx-auto"
              color={C.muted}
            />

            <p
              className="text-sm mt-3"
              style={{ color: C.muted }}
            >
              No appointments scheduled for today.
            </p>
          </div>
        ) : (
          <div>
            {appointments.map((appointment, index) => (
              <div
                key={appointment.id}
                className="flex items-center gap-4 py-3"
                style={{
                  borderTop:
                    index > 0
                      ? `1px solid ${C.border}`
                      : 'none',
                }}
              >
                {/* Time */}
                <div
                  className="w-20 shrink-0 text-sm"
                  style={{
                    color: C.ink,
                    fontFamily:
                      "'IBM Plex Mono', monospace",
                    fontWeight: 500,
                  }}
                >
                  {appointment.time}
                </div>

                {/* Patient */}
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
                    className="text-xs mt-0.5 truncate"
                    style={{ color: C.muted }}
                  >
                    {appointment.type || 'Appointment'}
                    {appointment.condition
                      ? ` · ${appointment.condition}`
                      : ''}
                  </p>
                </div>

                {/* Therapist */}
                <div className="w-40 min-w-0">
                  <p
                    className="text-xs"
                    style={{ color: C.muted }}
                  >
                    Therapist
                  </p>

                  <p
                    className="text-sm truncate"
                    style={{ color: C.ink }}
                  >
                    {appointment.therapistName}
                  </p>
                </div>

                {/* Status */}
                <span
                  className="text-xs px-2.5 py-1 rounded-full shrink-0"
                  style={{
                    background:
                      appointment.status === 'Confirmed'
                        ? '#E1F0EA'
                        : appointment.status ===
                          'Pending'
                        ? '#FBEEE0'
                        : '#EAF1F0',
                    color:
                      appointment.status === 'Confirmed'
                        ? C.primary
                        : appointment.status ===
                          'Pending'
                        ? '#9A6423'
                        : C.primaryLight,
                    fontWeight: 500,
                  }}
                >
                  {appointment.status || 'Unknown'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
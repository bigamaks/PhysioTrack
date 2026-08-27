import StatCard from '../../components/dashboard/StatCard';
import AppointmentsList from '../../components/dashboard/AppointmentsList';
import ClinicalAlerts from '../../components/dashboard/ClinicalAlerts';
import QuickActions from '../../components/dashboard/QuickActions';
import RecentActivity from '../../components/dashboard/RecentActivity';
import TreatmentOverview from '../../components/dashboard/TreatmentOverview';
import { C } from '../../components/dashboard/colors';
import {
  Users,
  Calendar,
  Activity,
  ClipboardCheck,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const { session } = useAuth();

  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');

const [stats, setStats] = useState({
  totalPatients: 0,
  todayAppointments: 0,
  activeTreatments: 0,
  weeklyAssessments: 0,
});

  useEffect(() => {
    async function fetchName() {
      if (!session?.user?.id) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', session.user.id)
        .single();

      if (!error && data) {
        setFullName(data.full_name || '');
      }
    }

    fetchName();
  }, [session]);


useEffect(() => {
  async function fetchStats() {
    if (!session?.user?.id) return;


    setLoading(true);

    const today = new Date();
    const todayString = today.toISOString().split('T')[0];

    // Find Monday of the current week
    const startOfWeek = new Date(today);
    const day = startOfWeek.getDay();
    const difference = day === 0 ? 6 : day - 1;

    startOfWeek.setDate(
      startOfWeek.getDate() - difference
    );

    const startOfWeekString = startOfWeek
      .toISOString()
      .split('T')[0];

    const [
      patientsResult,
      appointmentsResult,
      activePatientsResult,
      assessmentsResult,
    ] = await Promise.all([
      // Total patients
      supabase
        .from('patients')
        .select('*', {
          count: 'exact',
          head: true,
        }),


      // Today's appointments for this therapist
      supabase
        .from('appointments')
        .select('*', {
          count: 'exact',
          head: true,
        })
        .eq('therapist_id', session.user.id)
        .eq('date', todayString),

      // Active patients
      supabase
        .from('patients')
        .select('*', {
          count: 'exact',
          head: true,
        })
        .eq('status', 'active'),

      // Assessments this week for this therapist
      supabase
        .from('assessments')
        .select('*', {
          count: 'exact',
          head: true,
        })
        .eq('therapist_id', session.user.id)
        .gte('assessment_date', startOfWeekString)
        .lte('assessment_date', todayString),
    ]);

    console.log('Dashboard stats:', {
      patientsResult,
      appointmentsResult,
      activePatientsResult,
      assessmentsResult,
    });

    setStats({
      totalPatients: patientsResult.count || 0,
      todayAppointments: appointmentsResult.count || 0,
      activeTreatments: activePatientsResult.count || 0,
      weeklyAssessments: assessmentsResult.count || 0,
    });

    setLoading(false);
  }

  fetchStats();
}, [session]);

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
  Good morning, {fullName ? `Dr. ${fullName}` : 'Doctor'}
</h1>

        <p
          className="text-sm mt-1"
          style={{ color: C.muted }}
        >
          Here's what's happening at your clinic today.
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
          sub="Current registered patients"
          subColor={C.primary}
        />

        <StatCard
          icon={Calendar}
          iconBg="#EAF1F0"
          iconColor={C.primaryLight}
          label="Today's appointments"
          value={stats.todayAppointments}
          sub="View schedule"
          subColor={C.primaryLight}
        />

        <StatCard
          icon={Activity}
          iconBg="#FBEEE0"
          iconColor={C.accent}
          label="Active treatments"
          value={stats.activeTreatments}
          sub="Current active patients"
          subColor={C.accent}
        />

<StatCard
  icon={ClipboardCheck}
  iconBg="#F3EFE6"
  iconColor="#9A8158"
  label="Assessments this week"
  value={stats.weeklyAssessments}
  sub="Completed this week"
  subColor="#9A8158"
/>

      </div>

      {/* Main dashboard */}
      <div className="grid grid-cols-3 gap-6">
        <AppointmentsList />
        <ClinicalAlerts />
        <QuickActions />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <RecentActivity />
        </div>

        <TreatmentOverview />
      </div>

    </div>
  );
}
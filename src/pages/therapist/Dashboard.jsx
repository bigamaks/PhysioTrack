import StatCard from '../../components/dashboard/StatCard';
import AppointmentsList from '../../components/dashboard/AppointmentsList';
import ClinicalAlerts from '../../components/dashboard/ClinicalAlerts';
import QuickActions from '../../components/dashboard/QuickActions';
import RecentActivity from '../../components/dashboard/RecentActivity';
import TreatmentOverview from '../../components/dashboard/TreatmentOverview';
import { C } from '../../components/dashboard/colors';
import { Users, Calendar, Activity, ClipboardCheck } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display font-semibold text-2xl" style={{ color: C.ink }}>Good morning, Dr. Amaka</h1>
        <p className="text-sm mt-1" style={{ color: C.muted }}>Here's what's happening at your clinic today.</p>
      </div>

      <div className="flex gap-4">
        <StatCard icon={Users} iconBg="#E1F0EA" iconColor={C.primary} label="Total patients" value="248" sub="\u2191 12% from last month" subColor={C.primary} />
        <StatCard icon={Calendar} iconBg="#EAF1F0" iconColor={C.primaryLight} label="Today's appointments" value="8" sub="View schedule" subColor={C.primaryLight} />
        <StatCard icon={Activity} iconBg="#FBEEE0" iconColor={C.accent} label="Active treatments" value="42" sub="\u2191 8% from last month" subColor={C.accent} />
        <StatCard icon={ClipboardCheck} iconBg="#F3EFE6" iconColor="#9A8158" label="Assessments this week" value="16" sub="View all" subColor={C.muted} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <AppointmentsList />
        <ClinicalAlerts />
        <QuickActions />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2"><RecentActivity /></div>
        <TreatmentOverview />
      </div>
    </div>
  );
}
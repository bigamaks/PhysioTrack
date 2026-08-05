import { Outlet } from 'react-router-dom';
import { Home, Users, ClipboardList, Calendar, FileText, Settings } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';

const links = [
  { to: '/therapist/dashboard', icon: Home, label: 'Dashboard' },
  { to: '/therapist/patients', icon: Users, label: 'Patients' },
  { to: '/therapist/assessments', icon: ClipboardList, label: 'Assessments' },
  { to: '/therapist/appointments', icon: Calendar, label: 'Appointments' },
  { to: '/therapist/reports', icon: FileText, label: 'Reports' },
  { to: '/therapist/settings', icon: Settings, label: 'Settings' },
];

export default function TherapistLayout() {
  return (
    <div className="flex bg-bg min-h-screen">
      <Sidebar links={links} />
      <div className="flex-1 flex flex-col">
        <Navbar roleLabel="Physiotherapist" />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
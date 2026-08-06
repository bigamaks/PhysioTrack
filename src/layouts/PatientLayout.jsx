import { Outlet } from 'react-router-dom';
import { Home, Activity, Calendar, Footprints, User } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';

const links = [
  { to: '/patient/dashboard', icon: Home, label: 'Dashboard' },
  { to: '/patient/recovery', icon: Activity, label: 'My recovery' },
  { to: '/patient/appointments', icon: Calendar, label: 'Appointments' },
    { to: '/patient/exercises', icon: Footprints, label: 'Exercises' },
    { to: '/patient/symptoms', icon: Activity, label: 'Symptoms' },
    { to: '/patient/profile', icon: User, label: 'Profile' },
];

export default function PatientLayout() {
  return (
    <div className="flex bg-bg min-h-screen">
      <Sidebar links={links}  />
      <div className="flex-1 flex flex-col">
        <Navbar roleLabel="Patient" />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
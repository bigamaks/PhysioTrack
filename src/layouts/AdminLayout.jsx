import { Outlet } from 'react-router-dom';
import { Home, Users, Settings } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import { UserPlus } from 'lucide-react';

const links = [
  { to: '/admin/dashboard', icon: Home, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
  { to: '/admin/staff', icon: UserPlus, label: 'Add staff' },
];

export default function AdminLayout() {
  return (
    <div className="flex bg-bg min-h-screen">
      <Sidebar links={links} />
      <div className="flex-1 flex flex-col">
        <Navbar roleLabel="Administrator" />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
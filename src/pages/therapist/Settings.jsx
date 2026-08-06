import { useState } from 'react';
import { Save, Bell, Lock } from 'lucide-react';

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [saved, setSaved] = useState(false);

  function handleSave(e) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: 560 }}>
      <div>
        <h1 className="font-display font-semibold text-2xl text-ink">Settings</h1>
        <p className="text-sm mt-1 text-muted">Manage your account and clinic preferences.</p>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <div className="rounded-xl p-5 flex flex-col gap-4 bg-white border border-[#E4E9E8]">
          <p className="text-sm font-medium text-ink">Account</p>
          <div>
            <label className="text-xs mb-1.5 block text-muted">Full name</label>
            <input defaultValue="Dr. Amaka Obi" className="w-full px-3 py-2.5 rounded-lg text-sm border border-[#E4E9E8]" />
          </div>
          <div>
            <label className="text-xs mb-1.5 block text-muted">Clinic</label>
            <input defaultValue="Proactive Physio Clinic" className="w-full px-3 py-2.5 rounded-lg text-sm border border-[#E4E9E8]" />
          </div>
        </div>

        <div className="rounded-xl p-5 flex flex-col gap-4 bg-white border border-[#E4E9E8]">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-primary" />
            <p className="text-sm font-medium text-ink">Notifications</p>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={notifications} onChange={(e) => setNotifications(e.target.checked)} />
            Notify me about clinical alerts and missed exercise logs
          </label>
        </div>

        <div className="rounded-xl p-5 flex flex-col gap-3 bg-white border border-[#E4E9E8]">
          <div className="flex items-center gap-2">
            <Lock size={16} className="text-primary" />
            <p className="text-sm font-medium text-ink">Security</p>
          </div>
          <button type="button" className="text-sm text-left text-primary w-fit">Change password</button>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-primary text-white">
            <Save size={16} /> Save settings
          </button>
          {saved && <span className="text-sm" style={{ color: '#7FA893' }}>Saved</span>}
        </div>
      </form>
    </div>
  );
}
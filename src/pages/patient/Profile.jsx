import { useState } from 'react';
import { User, Mail, Phone, MapPin, Heart, Save } from 'lucide-react';

function Field({ icon: Icon, label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="text-xs mb-1.5 flex items-center gap-1.5 text-muted">
        <Icon size={13} /> {label}
      </label>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-lg text-sm text-ink border border-[#E4E9E8]"
      />
    </div>
  );
}

export default function Profile() {
  const [fullName, setFullName] = useState('Chinedu Okafor');
  const [email, setEmail] = useState('chinedu.okafor@email.com');
  const [phone, setPhone] = useState('+234 801 234 5678');
  const [address, setAddress] = useState('12 Marian Road, Calabar');
  const [emergencyName, setEmergencyName] = useState('Ngozi Okafor');
  const [emergencyPhone, setEmergencyPhone] = useState('+234 809 111 2222');
  const [saved, setSaved] = useState(false);

  function handleSave(e) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: 640 }}>
      <div>
        <h1 className="font-display font-semibold text-2xl text-ink">Your profile</h1>
        <p className="text-sm mt-1 text-muted">Keep your contact and emergency details up to date.</p>
      </div>

      <div className="rounded-xl p-5 flex items-center gap-4 bg-white border border-[#E4E9E8]">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-semibold bg-primary text-white">
          {fullName.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <p className="text-base font-semibold text-ink">{fullName}</p>
          <p className="text-xs mt-0.5 text-muted">Patient · PT-0001</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <div className="rounded-xl p-5 flex flex-col gap-4 bg-white border border-[#E4E9E8]">
          <p className="text-sm font-medium text-ink">Contact information</p>
          <Field icon={User} label="Full name" value={fullName} onChange={setFullName} />
          <Field icon={Mail} label="Email" value={email} onChange={setEmail} type="email" />
          <Field icon={Phone} label="Phone" value={phone} onChange={setPhone} />
          <Field icon={MapPin} label="Address" value={address} onChange={setAddress} />
        </div>

        <div className="rounded-xl p-5 flex flex-col gap-4 bg-white border border-[#E4E9E8]">
          <div className="flex items-center gap-2">
            <Heart size={16} color="#D96B54" />
            <p className="text-sm font-medium text-ink">Emergency contact</p>
          </div>
          <Field icon={User} label="Contact name" value={emergencyName} onChange={setEmergencyName} />
          <Field icon={Phone} label="Contact phone" value={emergencyPhone} onChange={setEmergencyPhone} />
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-primary text-white">
            <Save size={16} /> Save changes
          </button>
          {saved && <span className="text-sm" style={{ color: '#7FA893' }}>Saved</span>}
        </div>
      </form>
    </div>
  );
}
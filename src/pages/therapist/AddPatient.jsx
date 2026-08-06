import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AddPatient() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', age: '', gender: 'Female', condition: '', status: 'Active' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.from('patients').insert({
      name: form.name,
      age: Number(form.age),
      gender: form.gender,
      condition: form.condition,
      status: form.status,
      last_visit: new Date().toISOString().split('T')[0],
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/therapist/patients');
    }
  }

  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: 480 }}>
      <button onClick={() => navigate('/therapist/patients')} className="flex items-center gap-1.5 text-sm text-muted w-fit">
        <ArrowLeft size={16} /> Back to patients
      </button>

      <div>
        <h1 className="font-display font-semibold text-2xl text-ink">Add new patient</h1>
        <p className="text-sm mt-1 text-muted">Enter the patient's details to create their record.</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl p-5 flex flex-col gap-4 bg-white border border-[#E4E9E8]">
        {error && <p className="text-sm" style={{ color: '#D96B54' }}>{error}</p>}

        <div>
          <label className="text-xs mb-1.5 block text-muted">Full name</label>
          <input value={form.name} onChange={(e) => update('name', e.target.value)} className="w-full px-3 py-2.5 rounded-lg text-sm border border-[#E4E9E8]" required />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-xs mb-1.5 block text-muted">Age</label>
            <input type="number" value={form.age} onChange={(e) => update('age', e.target.value)} className="w-full px-3 py-2.5 rounded-lg text-sm border border-[#E4E9E8]" required />
          </div>
          <div className="flex-1">
            <label className="text-xs mb-1.5 block text-muted">Gender</label>
            <select value={form.gender} onChange={(e) => update('gender', e.target.value)} className="w-full px-3 py-2.5 rounded-lg text-sm border border-[#E4E9E8]">
              <option>Female</option>
              <option>Male</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs mb-1.5 block text-muted">Condition</label>
          <input value={form.condition} onChange={(e) => update('condition', e.target.value)} placeholder="e.g. Lower back pain" className="w-full px-3 py-2.5 rounded-lg text-sm border border-[#E4E9E8]" required />
        </div>

        <div>
          <label className="text-xs mb-1.5 block text-muted">Status</label>
          <select value={form.status} onChange={(e) => update('status', e.target.value)} className="w-full px-3 py-2.5 rounded-lg text-sm border border-[#E4E9E8]">
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>

        <button type="submit" disabled={loading} className="bg-primary text-white rounded-lg py-2.5 text-sm font-medium">
          {loading ? 'Adding...' : 'Add patient'}
        </button>
      </form>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AssignExercise() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [form, setForm] = useState({ name: '', target_area: '', sets: 3, reps: '', hold_time: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchPatient() {
      const { data } = await supabase.from('patients').select('name, profile_id').eq('id', id).single();
      setPatient(data);
    }
    fetchPatient();
  }, [id]);

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!patient?.profile_id) {
      setError('This patient has no linked account, so exercises can\'t be assigned yet.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('assigned_exercises').insert({
      patient_id: patient.profile_id,
      name: form.name,
      target_area: form.target_area,
      sets: Number(form.sets),
      reps: form.reps,
      hold_time: form.hold_time || null,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate(`/therapist/patients/${id}`);
    }
  }

  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: 480 }}>
      <button onClick={() => navigate(`/therapist/patients/${id}`)} className="flex items-center gap-1.5 text-sm text-muted w-fit">
        <ArrowLeft size={16} /> Back to patient
      </button>

      <div>
        <h1 className="font-display font-semibold text-2xl text-ink">Assign exercise</h1>
        <p className="text-sm mt-1 text-muted">{patient ? `For ${patient.name}` : 'Loading patient...'}</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl p-5 flex flex-col gap-4 bg-white border border-[#E4E9E8]">
        {error && <p className="text-sm" style={{ color: '#D96B54' }}>{error}</p>}

        <div>
          <label className="text-xs mb-1.5 block text-muted">Exercise name</label>
          <input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. Pelvic tilts" className="w-full px-3 py-2.5 rounded-lg text-sm border border-[#E4E9E8]" required />
        </div>

        <div>
          <label className="text-xs mb-1.5 block text-muted">Target area</label>
          <input value={form.target_area} onChange={(e) => update('target_area', e.target.value)} placeholder="e.g. Core, lower back" className="w-full px-3 py-2.5 rounded-lg text-sm border border-[#E4E9E8]" required />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-xs mb-1.5 block text-muted">Sets</label>
            <input type="number" value={form.sets} onChange={(e) => update('sets', e.target.value)} className="w-full px-3 py-2.5 rounded-lg text-sm border border-[#E4E9E8]" required />
          </div>
          <div className="flex-1">
            <label className="text-xs mb-1.5 block text-muted">Reps</label>
            <input value={form.reps} onChange={(e) => update('reps', e.target.value)} placeholder="e.g. 15 reps" className="w-full px-3 py-2.5 rounded-lg text-sm border border-[#E4E9E8]" required />
          </div>
        </div>

        <div>
          <label className="text-xs mb-1.5 block text-muted">Hold time (optional)</label>
          <input value={form.hold_time} onChange={(e) => update('hold_time', e.target.value)} placeholder="e.g. 5 sec" className="w-full px-3 py-2.5 rounded-lg text-sm border border-[#E4E9E8]" />
        </div>

        <button type="submit" disabled={loading} className="bg-primary text-white rounded-lg py-2.5 text-sm font-medium">
          {loading ? 'Assigning...' : 'Assign exercise'}
        </button>
      </form>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function BookAppointment() {
  const navigate = useNavigate();
  const { session } = useAuth();

  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({
    patient_id_raw: '',
    type: 'Follow-up',
    condition: '',
    date: '',
    time: '',
    duration: '45 min',
    status: 'Confirmed',
    location: 'Proactive Physio Clinic',
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchPatients() {
      const { data, error } = await supabase
        .from('patients')
        .select('id, name')
        .order('name');

      if (error) {
        console.error('Error fetching patients:', error);
        setError('Unable to load patients.');
        return;
      }

      setPatients(data || []);
    }

    fetchPatients();
  }, []);

  function update(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!session?.user?.id) {
      setError('You must be logged in as a therapist to book an appointment.');
      setLoading(false);
      return;
    }

    const selectedPatient = patients.find(
      (patient) => patient.id === Number(form.patient_id_raw)
    );

    if (!selectedPatient) {
      setError('Please select a patient.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('appointments').insert({
      patient_id: selectedPatient.id,
      therapist_id: session.user.id,
      type: form.type,
      condition: form.condition,
      date: form.date,
      time: form.time,
      duration: form.duration,
      status: form.status,
      location: form.location,
    });

    if (error) {
      console.error('Error booking appointment:', error);
      setError(error.message);
      setLoading(false);
      return;
    }

    navigate('/therapist/appointments');
  }

  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: 480 }}>
      <button
        onClick={() => navigate('/therapist/appointments')}
        className="flex items-center gap-1.5 text-sm text-muted w-fit"
      >
        <ArrowLeft size={16} />
        Back to appointments
      </button>

      <div>
        <h1 className="font-display font-semibold text-2xl text-ink">
          Book appointment
        </h1>

        <p className="text-sm mt-1 text-muted">
          Schedule a session for a patient.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl p-5 flex flex-col gap-4 bg-white border border-[#E4E9E8]"
      >
        {error && (
          <p className="text-sm" style={{ color: '#D96B54' }}>
            {error}
          </p>
        )}

        <div>
          <label className="text-xs mb-1.5 block text-muted">
            Patient
          </label>

          <select
            value={form.patient_id_raw}
            onChange={(e) =>
              update('patient_id_raw', e.target.value)
            }
            className="w-full px-3 py-2.5 rounded-lg text-sm border border-[#E4E9E8]"
            required
          >
            <option value="">Select a patient</option>

            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs mb-1.5 block text-muted">
            Type
          </label>

          <select
            value={form.type}
            onChange={(e) => update('type', e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg text-sm border border-[#E4E9E8]"
          >
            <option>Follow-up</option>
            <option>Initial Assessment</option>
            <option>Progress Review</option>
          </select>
        </div>

        <div>
          <label className="text-xs mb-1.5 block text-muted">
            Condition
          </label>

          <input
            value={form.condition}
            onChange={(e) => update('condition', e.target.value)}
            placeholder="e.g. Lower back pain"
            className="w-full px-3 py-2.5 rounded-lg text-sm border border-[#E4E9E8]"
            required
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-xs mb-1.5 block text-muted">
              Date
            </label>

            <input
              type="date"
              value={form.date}
              onChange={(e) => update('date', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-sm border border-[#E4E9E8]"
              required
            />
          </div>

          <div className="flex-1">
            <label className="text-xs mb-1.5 block text-muted">
              Time
            </label>

            <input
              value={form.time}
              onChange={(e) => update('time', e.target.value)}
              placeholder="e.g. 10:00 AM"
              className="w-full px-3 py-2.5 rounded-lg text-sm border border-[#E4E9E8]"
              required
            />
          </div>
        </div>

        <div>
          <label className="text-xs mb-1.5 block text-muted">
            Duration
          </label>

          <select
            value={form.duration}
            onChange={(e) => update('duration', e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg text-sm border border-[#E4E9E8]"
          >
            <option>30 min</option>
            <option>45 min</option>
            <option>60 min</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-50"
        >
          {loading ? 'Booking...' : 'Book appointment'}
        </button>
      </form>
    </div>
  );
}


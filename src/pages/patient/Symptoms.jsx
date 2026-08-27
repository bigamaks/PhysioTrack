import { useState, useEffect } from 'react';
import { Plus, X, TrendingDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

function painColor(pain) {
  if (pain <= 3) return { bg: '#E1F0EA', text: '#1F4E4A' };
  if (pain <= 6) return { bg: '#FBEEE0', text: '#9A6423' };
  return { bg: '#FBEAE5', text: '#D96B54' };
}

export default function Symptoms() {
  const { session } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [pain, setPain] = useState(5);
  const [area, setArea] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchLogs() {
      const { data, error } = await supabase
        .from('symptom_logs')
        .select('id, pain_level, area, note, logged_at')
        .order('logged_at', { ascending: false });

      if (error) {
        console.error('Error fetching symptom logs:', error);
      } else {
        setLogs(data);
      }
      setLoading(false);
    }
    fetchLogs();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    const { data, error } = await supabase
      .from('symptom_logs')
      .insert({
        patient_id: session.user.id,
        pain_level: pain,
        area: area || 'Lower back',
        note,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving symptom log:', error);
    } else {
      setLogs([data, ...logs]);
      setPain(5);
      setArea('');
      setNote('');
      setShowForm(false);
    }
    setSubmitting(false);
  }

  if (loading) return <div className="text-muted">Loading...</div>;

  return (
    <div className="flex flex-col gap-6">
      <style>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 20px; height: 20px; border-radius: 50%;
          background: #1F4E4A; cursor: pointer; margin-top: -8px;
        }
        input[type=range]::-webkit-slider-runnable-track {
          height: 4px; border-radius: 2px; background: #E4E9E8;
        }
      `}</style>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-semibold text-2xl text-ink">Symptom log</h1>
          <p className="text-sm mt-1 text-muted">Track how you're feeling day to day.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium"
          style={{
            background: showForm ? '#FFFFFF' : '#1F4E4A',
            color: showForm ? '#1E2A2E' : '#FFFFFF',
            border: showForm ? '1px solid #E4E9E8' : 'none',
          }}
        >
          {showForm ? <><X size={16} /> Cancel</> : <><Plus size={16} /> Log symptoms</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-xl p-5 flex flex-col gap-4 bg-white border border-[#E4E9E8]">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-ink">Pain level today</label>
              <span className="text-sm px-2.5 py-1 rounded-full font-mono font-semibold" style={{ background: painColor(pain).bg, color: painColor(pain).text }}>
                {pain}/10
              </span>
            </div>
            <input type="range" min="0" max="10" value={pain} onChange={(e) => setPain(Number(e.target.value))} className="w-full" />
            <div className="flex justify-between text-xs mt-1 text-muted">
              <span>No pain</span>
              <span>Worst pain</span>
            </div>
          </div>

          <div>
            <label className="text-sm mb-1.5 block font-medium text-ink">Affected area</label>
            <input
              type="text" value={area} onChange={(e) => setArea(e.target.value)}
              placeholder="e.g. Lower back, left hip"
              className="w-full px-3 py-2.5 rounded-lg text-sm border border-[#E4E9E8]"
            />
          </div>

          <div>
            <label className="text-sm mb-1.5 block font-medium text-ink">Notes</label>
            <textarea
              value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="What did it feel like? What made it better or worse?"
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg text-sm resize-none border border-[#E4E9E8]"
            />
          </div>

          <button type="submit" disabled={submitting} className="self-start px-4 py-2.5 rounded-lg text-sm font-medium bg-primary text-white">
            {submitting ? 'Saving...' : 'Save entry'}
          </button>
        </form>
      )}

      <div className="rounded-xl p-4 bg-white border border-[#E4E9E8]">
        <div className="flex items-center gap-2 mb-3">
          <TrendingDown size={16} color="#7FA893" />
          <p className="text-sm font-medium text-ink">History</p>
        </div>
        {logs.length === 0 ? (
          <p className="text-sm text-muted py-4 text-center">No symptoms logged yet.</p>
        ) : logs.map((log, i) => (
          <div key={log.id} className={`flex items-start gap-4 py-3 ${i > 0 ? 'border-t border-[#E4E9E8]' : ''}`}>
            <span className="text-xs font-mono w-24 shrink-0 mt-1 text-muted">
              {new Date(log.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="text-xs px-2 py-1 rounded-full font-mono font-medium shrink-0" style={{ background: painColor(log.pain_level).bg, color: painColor(log.pain_level).text }}>
              {log.pain_level}/10
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium text-ink">{log.area}</p>
              <p className="text-xs mt-0.5 text-muted">{log.note}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
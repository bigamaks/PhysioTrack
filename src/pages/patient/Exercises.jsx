import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, PlayCircle, Flame, Footprints } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

function StatCard({ icon: Icon, iconBg, iconColor, label, value, sub }) {
  return (
    <div className="flex-1 rounded-xl p-4 bg-white border border-[#E4E9E8]">
      <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3" style={{ background: iconBg }}>
        <Icon size={18} color={iconColor} strokeWidth={2} />
      </div>
      <p className="text-xs mb-1 text-muted">{label}</p>
      <p className="text-2xl font-mono font-semibold text-ink">{value}</p>
      {sub && <p className="text-xs mt-1 text-muted">{sub}</p>}
    </div>
  );
}

function ExerciseCard({ name, target, sets, reps, hold, done, onToggle }) {
  return (
    <div className="rounded-xl p-4 flex items-center gap-4 bg-white" style={{ border: `1px solid ${done ? '#7FA893' : '#E4E9E8'}` }}>
      <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0" style={{ background: done ? '#E1F0EA' : '#F6F8F8' }}>
        <Footprints size={20} color={done ? '#1F4E4A' : '#5C6B6E'} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-ink">{name}</p>
        <p className="text-xs mt-0.5 text-muted">{target}</p>
        <p className="text-xs mt-1 font-mono text-primary-light">
          {sets} sets × {reps}{hold ? ` · hold ${hold}` : ''}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <PlayCircle size={20} className="text-muted cursor-pointer" />
        <button onClick={onToggle} disabled={done}>
          {done
            ? <CheckCircle2 size={24} color="#7FA893" fill="#7FA893" style={{ color: '#FFFFFF' }} />
            : <Circle size={24} className="text-[#E4E9E8]" />
          }
        </button>
      </div>
    </div>
  );
}

export default function Exercises() {
  const { session } = useAuth();
  const [exercises, setExercises] = useState([]);
  const [completedIds, setCompletedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // 1. Get this patient's assigned exercises
      const { data: assigned, error: assignedError } = await supabase
        .from('assigned_exercises')
        .select('*')
        .eq('patient_id', session.user.id);

      if (assignedError) {
        console.error('Error fetching exercises:', assignedError);
        setLoading(false);
        return;
      }

      setExercises(assigned || []);

      // 2. Get today's completions for those exercises
      const exerciseIds = (assigned || []).map(e => e.id);
      const today = new Date().toISOString().split('T')[0];

      if (exerciseIds.length > 0) {
        const { data: completions, error: completionsError } = await supabase
          .from('exercise_completions')
          .select('assigned_exercise_id')
          .in('assigned_exercise_id', exerciseIds)
          .eq('completed_date', today);

        if (!completionsError) {
          setCompletedIds(new Set(completions.map(c => c.assigned_exercise_id)));
        }
      }

      setLoading(false);
    }
    if (session) fetchData();
  }, [session]);

  async function markDone(exerciseId) {
    const today = new Date().toISOString().split('T')[0];
    const { error } = await supabase
      .from('exercise_completions')
      .insert({ assigned_exercise_id: exerciseId, completed_date: today, done: true });

    if (!error) {
      setCompletedIds(prev => new Set(prev).add(exerciseId));
    }
  }

  if (loading) return <div className="text-muted">Loading exercises...</div>;

  const doneCount = exercises.filter(e => completedIds.has(e.id)).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display font-semibold text-2xl text-ink">Your exercises</h1>
        <p className="text-sm mt-1 text-muted">Your assigned rehabilitation programme.</p>
      </div>

      <div className="flex gap-4">
        <StatCard icon={CheckCircle2} iconBg="#E1F0EA" iconColor="#1F4E4A" label="Today's progress" value={`${doneCount}/${exercises.length}`} sub="exercises completed" />
        <StatCard icon={Flame} iconBg="#FBEEE0" iconColor="#E2984F" label="Assigned" value={exercises.length} sub="active exercises" />
        <StatCard icon={Footprints} iconBg="#EAF1F0" iconColor="#2F6E67" label="Status" value={doneCount === exercises.length && exercises.length > 0 ? 'Done' : 'In progress'} />
      </div>

      <div className="flex flex-col gap-3">
        {exercises.length === 0 ? (
          <p className="text-sm text-muted py-4 text-center">No exercises assigned yet.</p>
        ) : exercises.map(e => (
          <ExerciseCard
            key={e.id}
            name={e.name}
            target={e.target_area}
            sets={e.sets}
            reps={e.reps}
            hold={e.hold_time}
            done={completedIds.has(e.id)}
            onToggle={() => markDone(e.id)}
          />
        ))}
      </div>
    </div>
  );
}
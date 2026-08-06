import { useState } from 'react';
import { CheckCircle2, Circle, PlayCircle, Flame, Footprints } from 'lucide-react';

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
      <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: done ? '#E1F0EA' : '#F6F8F8' }}>
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
        <button onClick={onToggle}>
          {done
            ? <CheckCircle2 size={24} color="#7FA893" fill="#7FA893" style={{ color: '#FFFFFF' }} />
            : <Circle size={24} className="text-[#E4E9E8]" />
          }
        </button>
      </div>
    </div>
  );
}

const initialExercises = [
  { name: 'Pelvic tilts', target: 'Core stabilization · Lower back', sets: 3, reps: '15 reps', done: true },
  { name: 'Bird dog', target: 'Core · Balance', sets: 3, reps: '10 reps each side', done: true },
  { name: 'Bridging', target: 'Glutes · Lower back', sets: 3, reps: '12 reps', done: false },
  { name: 'Cat-cow stretch', target: 'Spinal mobility', sets: 2, reps: '8 reps', hold: '5 sec', done: false },
  { name: 'Knee-to-chest stretch', target: 'Lower back · Hips', sets: 2, reps: '10 reps each side', hold: '20 sec', done: false },
];

export default function Exercises() {
  const [exercises, setExercises] = useState(initialExercises);
  const doneCount = exercises.filter(e => e.done).length;

  function toggleExercise(index) {
    setExercises(prev => prev.map((e, i) => i === index ? { ...e, done: !e.done } : e));
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display font-semibold text-2xl text-ink">Your exercises</h1>
        <p className="text-sm mt-1 text-muted">Assigned by Dr. Amaka · Lower back rehabilitation programme</p>
      </div>

      <div className="flex gap-4">
        <StatCard icon={CheckCircle2} iconBg="#E1F0EA" iconColor="#1F4E4A" label="Today's progress" value={`${doneCount}/${exercises.length}`} sub="exercises completed" />
        <StatCard icon={Flame} iconBg="#FBEEE0" iconColor="#E2984F" label="Current streak" value="6" sub="days in a row" />
        <StatCard icon={Footprints} iconBg="#EAF1F0" iconColor="#2F6E67" label="This week" value="18/28" sub="· 64% adherence" />
      </div>

      <div className="flex flex-col gap-3">
        {exercises.map((e, i) => (
          <ExerciseCard key={i} {...e} onToggle={() => toggleExercise(i)} />
        ))}
      </div>
    </div>
  );
}
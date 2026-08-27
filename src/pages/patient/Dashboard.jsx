import {
  Calendar,
  Activity,
  CheckCircle2,
  // MessageCircle,
  Footprints,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function RangeArc({ value, size = 160, color = '#1F4E4A', label }) {
  const stroke = 14;
  const r = (size - stroke) / 2;
  const circumference = Math.PI * r;
  const offset =
    circumference - (value / 100) * circumference;

  return (
    <div
      className="flex flex-col items-center"
      style={{ width: size }}
    >
      <svg
        width={size}
        height={size / 2 + stroke}
        viewBox={`0 0 ${size} ${size / 2 + stroke}`}
      >
        <path
          d={`M ${stroke / 2} ${size / 2} A ${r} ${r} 0 0 1 ${
            size - stroke / 2
          } ${size / 2}`}
          fill="none"
          stroke="#E4E9E8"
          strokeWidth={stroke}
          strokeLinecap="round"
        />

        <path
          d={`M ${stroke / 2} ${size / 2} A ${r} ${r} 0 0 1 ${
            size - stroke / 2
          } ${size / 2}`}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>

      <span
        className="font-mono font-semibold text-3xl text-ink"
        style={{ marginTop: -28 }}
      >
        {value}%
      </span>

      {label && (
        <span className="text-sm mt-1 text-muted">
          {label}
        </span>
      )}
    </div>
  );
}

function ExerciseRow({ name, sets, done }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-t border-[#E4E9E8]">
      <CheckCircle2
        size={18}
        color={done ? '#7FA893' : '#E4E9E8'}
        fill={done ? '#7FA893' : 'none'}
      />

      <div className="flex-1">
        <p
          className={`text-sm font-medium ${
            done
              ? 'text-muted line-through'
              : 'text-ink'
          }`}
        >
          {name}
        </p>

        <p className="text-xs text-muted">
          {sets}
        </p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { session } = useAuth();
   const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [patient, setPatient] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [completedIds, setCompletedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [nextAppointment, setNextAppointment] = useState(null);
  const [latestAssessment, setLatestAssessment] = useState(null);
  const [symptomLogs, setSymptomLogs] = useState([]);

  // Get patient profile/name
  useEffect(() => {
    async function fetchPatient() {
      if (!session?.user?.id) return;

      const { data, error } = await supabase
        .from('patients')
        .select('id, name, condition, profile_id')
        .eq('profile_id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching patient:', error);
        return;
      }

      setPatient(data);
      setFullName(data.name);
    }

    fetchPatient();
  }, [session]);

  // Get dashboard data
  useEffect(() => {
    async function fetchData() {
      if (!session?.user?.id) return;

      setLoading(true);

      try {
        // Find patient record
        const { data: patientData, error: patientError } =
          await supabase
            .from('patients')
            .select('id, name, condition, profile_id')
            .eq('profile_id', session.user.id)
            .single();

        if (patientError) {
          throw patientError;
        }

        setPatient(patientData);
        setFullName(patientData.name);

        // Get assigned exercises
        const { data: assigned, error: assignedError } =
          await supabase
            .from('assigned_exercises')
            .select('*')
            .eq('patient_id', session.user.id);

        if (assignedError) {
          throw assignedError;
        }

        setExercises(assigned || []);

        // Get today's exercise completions
        const exerciseIds = (assigned || []).map(
          (exercise) => exercise.id
        );

        const today = new Date()
          .toISOString()
          .split('T')[0];

        if (exerciseIds.length > 0) {
          const {
            data: completions,
            error: completionsError,
          } = await supabase
            .from('exercise_completions')
            .select('assigned_exercise_id')
            .in('assigned_exercise_id', exerciseIds)
            .eq('completed_date', today);

          if (completionsError) {
            console.error(
              'Error fetching completions:',
              completionsError
            );
          } else {
            setCompletedIds(
              new Set(
                (completions || []).map(
                  (completion) =>
                    completion.assigned_exercise_id
                )
              )
            );
          }
        }

        // Get latest assessment
        const {
          data: assessment,
          error: assessmentError,
        } = await supabase
          .from('assessments')
          .select(`
            id,
            assessment_date,
            pain_level,
            chief_complaint,
            clinical_impression
          `)
          .eq('patient_id', patientData.id)
          .order('assessment_date', {
            ascending: false,
          })
          .limit(1)
          .maybeSingle();

        if (assessmentError) {
          console.error(
            'Error fetching assessment:',
            assessmentError
          );
        } else {
          setLatestAssessment(assessment);
        }

        // Get recent symptom logs
        const {
          data: symptoms,
          error: symptomsError,
        } = await supabase
          .from('symptom_logs')
          .select(`
            id,
            pain_level,
            area,
            note,
            logged_at
          `)
          .eq('patient_id', session.user.id)
          .order('logged_at', {
            ascending: false,
          })
          .limit(3);

        if (symptomsError) {
          console.error(
            'Error fetching symptoms:',
            symptomsError
          );
        } else {
          setSymptomLogs(symptoms || []);
        }

        // Get next appointment
        const {
          data: appointment,
          error: appointmentError,
        } = await supabase
          .from('appointments')
          .select('*')
          .eq('patient_id', session.user.id)
          .gte('date', today)
          .order('date', {
            ascending: true,
          })
          .limit(1)
          .maybeSingle();

        if (appointmentError) {
          console.error(
            'Error fetching appointment:',
            appointmentError
          );
        } else {
          setNextAppointment(appointment);
        }
      } catch (error) {
        console.error(
          'Error fetching dashboard data:',
          error
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [session]);

  if (loading) {
    return (
      <div className="text-muted">
        Loading dashboard...
      </div>
    );
  }

  // Convert pain level to a simple recovery percentage.
  // Pain 10 = 0% recovery
  // Pain 0 = 100% recovery
  const recovery =
    latestAssessment?.pain_level !== null &&
    latestAssessment?.pain_level !== undefined
      ? Math.max(
          0,
          Math.min(
            100,
            Math.round(
              ((10 -
                Number(latestAssessment.pain_level)) /
                10) *
                100
            )
          )
        )
      : 0;

  const assessmentDate = latestAssessment
    ? new Date(
        `${latestAssessment.assessment_date}T00:00:00`
      ).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div>
        <h1 className="font-display font-semibold text-2xl text-ink">
          Good morning, {fullName}
        </h1>

        <p className="text-sm mt-1 text-muted">
          Keep up with your recovery programme.
        </p>
      </div>

      {/* Main cards */}
      <div className="grid grid-cols-3 gap-6">

        {/* Recovery */}
        <div className="col-span-1 rounded-xl p-6 flex flex-col items-center bg-white border border-[#E4E9E8]">
          <p className="text-sm mb-4 self-start font-medium text-ink">
            Your recovery
          </p>

          <RangeArc
            value={recovery}
            color="#1F4E4A"
            label={
              patient?.condition ||
              'Recovery progress'
            }
          />

          <p className="text-xs mt-3 text-center text-muted">
            {assessmentDate
              ? `Based on your latest assessment, ${assessmentDate}`
              : 'No assessment recorded yet'}
          </p>
        </div>

        {/* Exercises */}
        <div className="col-span-1 rounded-xl p-4 bg-white border border-[#E4E9E8]">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium text-ink">
              Today's exercises
            </p>

            <span className="text-xs text-muted">
              {
                exercises.filter((exercise) =>
                  completedIds.has(exercise.id)
                ).length
              }{' '}
              of {exercises.length} done
            </span>
          </div>

          {exercises.length > 0 ? (
            exercises.map((exercise) => (
              <ExerciseRow
                key={exercise.id}
                name={exercise.name}
                sets={`${exercise.sets} sets × ${exercise.reps}`}
                done={completedIds.has(exercise.id)}
              />
            ))
          ) : (
            <p className="text-sm text-muted mt-4">
              No exercises assigned yet.
            </p>
          )}
        </div>

        {/* Appointment + actions */}
        <div className="col-span-1 flex flex-col gap-6">

          {/* Appointment */}
          <div className="rounded-xl p-4 bg-white border border-[#E4E9E8]">
            <p className="text-sm mb-3 font-medium text-ink">
              Next appointment
            </p>

            {nextAppointment ? (
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: '#E1F0EA' }}
                >
                  <Calendar
                    size={18}
                    color="#1F4E4A"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium text-ink">
                    {nextAppointment.type}
                  </p>

                  <p className="text-xs mt-0.5 text-muted">
                    {nextAppointment.date} ·{' '}
                    {nextAppointment.time}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted">
                No upcoming appointments.
              </p>
            )}
          </div>

          {/* Quick actions */}
<div className="rounded-xl p-4 flex flex-col gap-2 bg-white border border-[#E4E9E8]">
  <p className="text-sm mb-1 font-medium text-ink">
    Quick actions
  </p>

  <button
    type="button"
    onClick={() => navigate('/patient/symptoms')}
    className="flex items-center gap-2 text-sm text-primary text-left hover:opacity-80 transition-opacity"
  >
    <Activity size={16} strokeWidth={1.75} />
    <span>Log symptoms</span>
  </button>

  <button
    type="button"
    onClick={() => navigate('/patient/exercises')}
    className="flex items-center gap-2 text-sm text-primary text-left hover:opacity-80 transition-opacity"
  >
    <Footprints size={16} strokeWidth={1.75} />
    <span>View exercises</span>
  </button>

 
</div>
        </div>
      </div>

      {/* Recent symptoms */}
      <div className="rounded-xl p-4 bg-white border border-[#E4E9E8]">

        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-ink">
            Recent symptom logs
          </p>

       <button
  type="button"
  onClick={() => navigate('/patient/symptoms')}
  className="text-xs text-primary-light hover:opacity-80 transition-opacity cursor-pointer"
>
  View history
</button>
        </div>

        {symptomLogs.length > 0 ? (
          symptomLogs.map((symptom, index) => (
            <div
              key={symptom.id}
              className={`flex items-center gap-4 py-2.5 ${
                index > 0
                  ? 'border-t border-[#E4E9E8]'
                  : ''
              }`}
            >
              <span className="text-xs font-mono w-20 text-muted">
                {new Date(
                  symptom.logged_at
                ).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>

              <span
                className="text-xs px-2 py-1 rounded-full font-mono font-medium"
                style={{
                  background:
                    symptom.pain_level <= 3
                      ? '#E1F0EA'
                      : '#FBEEE0',
                  color:
                    symptom.pain_level <= 3
                      ? '#1F4E4A'
                      : '#9A6423',
                }}
              >
                Pain {symptom.pain_level}/10
              </span>

              <span className="text-sm flex-1 text-muted">
                {symptom.note ||
                  symptom.area ||
                  'No note recorded'}
              </span>
            </div>
          ))
        ) : (
          <div className="py-4">
            <p className="text-sm text-muted">
              No symptom logs yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
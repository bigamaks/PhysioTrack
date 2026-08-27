import {
  Calendar,
  Activity,
  CheckCircle2,
  MessageCircle,
  Footprints,
  ClipboardCheck,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function RangeArc({
  value,
  size = 160,
  color = '#1F4E4A',
  label,
}) {
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
            done ? 'text-muted line-through' : 'text-ink'
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

function recoveryFromPain(pain) {
  return Math.max(
    0,
    Math.min(
      100,
      Math.round(((10 - Number(pain)) / 10) * 100)
    )
  );
}

function formatDate(date) {
  return new Date(
    `${date}T00:00:00`
  ).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function Dashboard() {
  const { session } = useAuth();

  const [fullName, setFullName] = useState('');
  const [patient, setPatient] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [completedIds, setCompletedIds] = useState(new Set());
  const [nextAppointment, setNextAppointment] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!session?.user?.id) return;

      setLoading(true);
      setError(null);

      try {
        const userId = session.user.id;

        // -----------------------------------------
        // 1. Get patient profile
        // -----------------------------------------

        const {
          data: profile,
          error: profileError,
        } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', userId)
          .single();

        if (profileError) {
          throw profileError;
        }

        setFullName(profile?.full_name || '');

        // -----------------------------------------
        // 2. Get patient record
        // -----------------------------------------

        const {
          data: patientData,
          error: patientError,
        } = await supabase
          .from('patients')
          .select(`
            id,
            name,
            condition,
            profile_id
          `)
          .eq('profile_id', userId)
          .single();

        if (patientError) {
          throw patientError;
        }

        setPatient(patientData);

        // -----------------------------------------
        // 3. Get patient's assessments
        // -----------------------------------------

        const {
          data: assessmentData,
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
            ascending: true,
          });

        if (assessmentError) {
          throw assessmentError;
        }

        setAssessments(assessmentData || []);

        // -----------------------------------------
        // 4. Get recent symptom logs
        // -----------------------------------------

        const {
          data: symptomData,
          error: symptomError,
        } = await supabase
          .from('symptom_logs')
          .select(`
            id,
            pain_level,
            area,
            note,
            logged_at
          `)
          .eq('patient_id', userId)
          .order('logged_at', {
            ascending: false,
          })
          .limit(3);

        if (symptomError) {
          console.error(
            'Error fetching symptoms:',
            symptomError
          );
        }

        setSymptoms(symptomData || []);

        // -----------------------------------------
        // 5. Get assigned exercises
        // -----------------------------------------

        const {
          data: assigned,
          error: assignedError,
        } = await supabase
          .from('assigned_exercises')
          .select('*')
          .eq('patient_id', userId);

        if (assignedError) {
          console.error(
            'Error fetching exercises:',
            assignedError
          );
        }

        setExercises(assigned || []);

        // -----------------------------------------
        // 6. Get today's exercise completions
        // -----------------------------------------

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
            .in(
              'assigned_exercise_id',
              exerciseIds
            )
            .eq('completed_date', today);

          if (!completionsError) {
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

        // -----------------------------------------
        // 7. Get next appointment
        // -----------------------------------------

        const {
          data: appointment,
          error: appointmentError,
        } = await supabase
          .from('appointments')
          .select('*')
          .eq('patient_id', userId)
          .gte('date', today)
          .order('date', {
            ascending: true,
          })
          .limit(1)
          .maybeSingle();

        if (!appointmentError) {
          setNextAppointment(appointment);
        }
      } catch (err) {
        console.error(
          'Error fetching patient dashboard:',
          err
        );

        setError(
          err.message ||
            'Failed to load your dashboard.'
        );
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [session]);

  if (loading) {
    return (
      <div className="text-sm text-muted">
        Loading your dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl p-4 bg-white border border-[#E4E9E8]">
        <p className="text-sm font-medium text-coral">
          {error}
        </p>
      </div>
    );
  }

  // -----------------------------------------
  // Recovery calculations
  // -----------------------------------------

  const assessmentsWithPain = assessments.filter(
    (assessment) =>
      assessment.pain_level !== null &&
      assessment.pain_level !== undefined
  );

  const latestAssessment =
    assessmentsWithPain.length > 0
      ? assessmentsWithPain[
          assessmentsWithPain.length - 1
        ]
      : null;

  const currentRecovery = latestAssessment
    ? recoveryFromPain(
        latestAssessment.pain_level
      )
    : 0;

  // -----------------------------------------
  // Programme day
  // -----------------------------------------

  const firstAssessment = assessments[0];

  const programmeStart =
    firstAssessment?.assessment_date;

  const programmeDay = programmeStart
    ? Math.max(
        1,
        Math.floor(
          (
            new Date() -
            new Date(`${programmeStart}T00:00:00`)
          ) /
            (1000 * 60 * 60 * 24)
        ) + 1
      )
    : null;

  const completedToday = exercises.filter(
    (exercise) =>
      completedIds.has(exercise.id)
  ).length;

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div>
        <h1 className="font-display font-semibold text-2xl text-ink">
          Good morning, {fullName || patient?.name}
        </h1>

        <p className="text-sm mt-1 text-muted">
          {programmeDay
            ? `Day ${programmeDay} of your recovery programme. Keep it up.`
            : 'Keep up with your recovery programme.'}
        </p>
      </div>

      {/* Main dashboard */}
      <div className="grid grid-cols-3 gap-6">

        {/* Recovery */}
        <div className="col-span-1 rounded-xl p-6 flex flex-col items-center bg-white border border-[#E4E9E8]">

          <p className="text-sm mb-4 self-start font-medium text-ink">
            Your recovery
          </p>

          {latestAssessment ? (
            <>
              <RangeArc
                value={currentRecovery}
                color="#1F4E4A"
                label={
                  patient?.condition ||
                  'Current progress'
                }
              />

              <p className="text-xs mt-3 text-center text-muted">
                Based on your last assessment,{' '}
                {formatDate(
                  latestAssessment.assessment_date
                )}
              </p>
            </>
          ) : (
            <div className="py-8 text-center">
              <ClipboardCheck
                size={32}
                className="mx-auto text-muted"
              />

              <p className="text-sm mt-3 text-muted">
                No assessment recorded yet.
              </p>
            </div>
          )}
        </div>

        {/* Today's exercises */}
        <div className="col-span-1 rounded-xl p-4 bg-white border border-[#E4E9E8]">

          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium text-ink">
              Today's exercises
            </p>

            <span className="text-xs text-muted">
              {completedToday} of {exercises.length} done
            </span>
          </div>

          {exercises.length > 0 ? (
            exercises.map((exercise) => (
              <ExerciseRow
                key={exercise.id}
                name={exercise.name}
                sets={`${exercise.sets} sets × ${exercise.reps}`}
                done={completedIds.has(
                  exercise.id
                )}
              />
            ))
          ) : (
            <p className="text-sm text-muted py-4">
              No exercises assigned yet.
            </p>
          )}
        </div>

        {/* Appointment + quick actions */}
        <div className="col-span-1 flex flex-col gap-6">

          <div className="rounded-xl p-4 bg-white border border-[#E4E9E8]">

            <p className="text-sm mb-3 font-medium text-ink">
              Next appointment
            </p>

            {nextAppointment ? (
              <div className="flex items-start gap-3">

                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: '#E1F0EA',
                  }}
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

          <div className="rounded-xl p-4 flex flex-col gap-2 bg-white border border-[#E4E9E8]">

            <p className="text-sm mb-1 font-medium text-ink">
              Quick actions
            </p>

            <Link
              to="/patient/symptoms"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Activity
                size={16}
                strokeWidth={1.75}
              />
              <span>Log symptoms</span>
            </Link>

            <Link
              to="/patient/exercises"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Footprints
                size={16}
                strokeWidth={1.75}
              />
              <span>View exercises</span>
            </Link>

            <Link
              to="/patient/appointments"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <MessageCircle
                size={16}
                strokeWidth={1.75}
              />
              <span>View appointments</span>
            </Link>

          </div>
        </div>
      </div>

      {/* Recent symptoms */}
      <div className="rounded-xl p-4 bg-white border border-[#E4E9E8]">

        <div className="flex items-center justify-between mb-3">

          <p className="text-sm font-medium text-ink">
            Recent symptom logs
          </p>

          <Link
            to="/patient/symptoms"
            className="text-xs text-primary-light hover:underline"
          >
            View history
          </Link>

        </div>

        {symptoms.length > 0 ? (
          symptoms.map((symptom, index) => (

            <div
              key={symptom.id}
              className={`flex items-center gap-4 py-2.5 ${
                index > 0
                  ? 'border-t border-[#E4E9E8]'
                  : ''
              }`}
            >

              <span className="text-xs font-mono w-24 text-muted">
                {new Date(
                  symptom.logged_at
                ).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
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

              <span className="text-xs text-muted">
                {symptom.area}
              </span>

              <span className="text-sm flex-1 text-muted">
                {symptom.note || 'No note added'}
              </span>

            </div>
          ))
        ) : (
          <div className="py-8 text-center">

            <Activity
              size={28}
              className="mx-auto text-muted"
            />

            <p className="text-sm mt-2 text-muted">
              No symptom logs yet.
            </p>

            <Link
              to="/patient/symptoms"
              className="text-xs mt-1 inline-block text-primary hover:underline"
            >
              Log your first symptom
            </Link>

          </div>
        )}
      </div>
    </div>
  );
}


import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  // Clock,
  Activity,
  Dumbbell,
  ClipboardList,
  TrendingUp,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

function RangeArc({ value, size = 120, color = '#1F4E4A' }) {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const circumference = Math.PI * r;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
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
        className="font-mono font-semibold text-xl text-ink"
        style={{ marginTop: -22 }}
      >
        {value}%
      </span>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, count }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Icon size={17} className="text-primary" />

        <h2 className="text-sm font-semibold text-ink">
          {title}
        </h2>

        {typeof count === 'number' && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-bg text-muted">
            {count}
          </span>
        )}
      </div>
    </div>
  );
}

function formatDate(date) {
  if (!date) return '—';

  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateTime(date) {
  if (!date) return '—';

  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function StatusPill({ status }) {
  const styles = {
    Confirmed: {
      background: '#E1F0EA',
      color: '#1F4E4A',
    },
    Completed: {
      background: '#E1F0EA',
      color: '#1F4E4A',
    },
    Pending: {
      background: '#FBEEE0',
      color: '#9A6423',
    },
    Cancelled: {
      background: '#FBEAE5',
      color: '#D96B54',
    },
    'In Progress': {
      background: '#EAF1F0',
      color: '#2F6E67',
    },
  };

  const style = styles[status] || styles.Pending;

  return (
    <span
      className="text-xs px-2.5 py-1 rounded-full font-medium"
      style={style}
    >
      {status || 'Pending'}
    </span>
  );
}

export default function PatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [goals, setGoals] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPatientRecord() {
      setLoading(true);
      setError(null);

      try {
        // --------------------------------------------------
        // 1. PATIENT
        // --------------------------------------------------

        const {
          data: patientData,
          error: patientError,
        } = await supabase
          .from('patients')
          .select('*')
          .eq('id', id)
          .single();

        if (patientError) {
          throw patientError;
        }

        setPatient(patientData);

        // --------------------------------------------------
        // 2. APPOINTMENTS
        // appointments.patient_id -> patients.id
        // --------------------------------------------------

        const {
          data: appointmentData,
          error: appointmentError,
        } = await supabase
          .from('appointments')
          .select(
            'id, type, condition, date, time, duration, status, location, therapist_id'
          )
          .eq('patient_id', patientData.id)
          .order('date', { ascending: false });

        if (appointmentError) {
          console.error(
            'Error fetching appointments:',
            appointmentError
          );
        } else {
          setAppointments(appointmentData || []);
        }

        // --------------------------------------------------
        // 3. SYMPTOMS
        // symptom_logs.patient_id -> patients.profile_id
        // --------------------------------------------------

        if (patientData.profile_id) {
          const {
            data: symptomData,
            error: symptomError,
          } = await supabase
            .from('symptom_logs')
            .select('*')
            .eq('patient_id', patientData.profile_id)
            .order('logged_at', { ascending: false });

          if (symptomError) {
            console.error(
              'Error fetching symptoms:',
              symptomError
            );
          } else {
            setSymptoms(symptomData || []);
          }

          // ------------------------------------------------
          // 4. ASSIGNED EXERCISES
          // assigned_exercises.patient_id -> profile_id
          // ------------------------------------------------

          const {
            data: exerciseData,
            error: exerciseError,
          } = await supabase
            .from('assigned_exercises')
            .select('*')
            .eq('patient_id', patientData.profile_id)
            .order('created_at', { ascending: false });

          if (exerciseError) {
            console.error(
              'Error fetching exercises:',
              exerciseError
            );
          } else {
            setExercises(exerciseData || []);
          }
        }

        // --------------------------------------------------
        // 5. ASSESSMENTS
        // assessments.patient_id -> patients.id
        // --------------------------------------------------

        const {
          data: assessmentData,
          error: assessmentError,
        } = await supabase
          .from('assessments')
          .select(
            'id, assessment_date, chief_complaint, clinical_impression, pain_level, pain_location, functional_limitations, patient_goals, therapist_id'
          )
          .eq('patient_id', patientData.id)
          .order('assessment_date', { ascending: false });

        if (assessmentError) {
          console.error(
            'Error fetching assessments:',
            assessmentError
          );
        } else {
          setAssessments(assessmentData || []);
        }

        // --------------------------------------------------
        // 6. TREATMENT SESSIONS
        // treatment_sessions.patient_id -> patients.id
        // --------------------------------------------------

        const {
          data: sessionData,
          error: sessionError,
        } = await supabase
          .from('treatment_sessions')
          .select(
            'id, session_number, session_date, pain_level, subjective_notes, objective_findings, interventions, exercises_performed'
          )
          .eq('patient_id', patientData.id)
          .order('session_date', { ascending: false });

        if (sessionError) {
          console.error(
            'Error fetching treatment sessions:',
            sessionError
          );
        } else {
          setSessions(sessionData || []);
        }

        // --------------------------------------------------
        // 7. TREATMENT GOALS
        // treatment_goals -> assessment_id -> assessments
        // --------------------------------------------------

        if (assessmentData?.length) {
          const assessmentIds = assessmentData.map(
            (assessment) => assessment.id
          );

          const {
            data: goalData,
            error: goalError,
          } = await supabase
            .from('treatment_goals')
            .select('*')
            .in('assessment_id', assessmentIds)
            .order('created_at', { ascending: false });

          if (goalError) {
            console.error(
              'Error fetching treatment goals:',
              goalError
            );
          } else {
            setGoals(goalData || []);
          }
        }
      } catch (err) {
        console.error('Error loading patient record:', err);
        setError(err.message || 'Failed to load patient record.');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchPatientRecord();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="text-sm text-muted">
        Loading patient record...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm" style={{ color: '#D96B54' }}>
          {error}
        </p>

        <button
          onClick={() => navigate('/therapist/patients')}
          className="text-sm text-primary w-fit"
        >
          Back to patients
        </button>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-sm text-muted">
        Patient not found.
      </div>
    );
  }

  const initials = patient.name
    ?.split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const completedAppointments = appointments.filter(
    (appointment) =>
      appointment.status === 'Completed'
  ).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Back */}
      <button
        onClick={() => navigate('/therapist/patients')}
        className="flex items-center gap-1.5 text-sm text-muted w-fit"
      >
        <ArrowLeft size={16} />
        Back to patients
      </button>

      {/* ==================================================
          PATIENT HEADER
      ================================================== */}

      <div className="rounded-xl p-5 bg-white border border-[#E4E9E8]">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-semibold bg-primary text-white">
            {initials || '?'}
          </div>

          <div className="flex-1">
            <p className="text-lg font-semibold text-ink">
              {patient.name}
            </p>

            <p className="text-sm text-muted mt-0.5">
              {patient.age} · {patient.gender} ·{' '}
              {patient.condition || 'Condition not recorded'}
            </p>

            <div className="flex items-center gap-2 mt-2">
              <StatusPill status={patient.status} />

              {patient.last_visit && (
                <span className="text-xs text-muted">
                  Last visit {formatDate(patient.last_visit)}
                </span>
              )}
            </div>
          </div>

          <Link
            to={`/therapist/patients/${id}/assign-exercise`}
            className="text-sm px-4 py-2.5 rounded-lg font-medium bg-primary text-white"
          >
            Assign exercise
          </Link>
        </div>
      </div>

      {/* ==================================================
          OVERVIEW
      ================================================== */}

      <section>
        <SectionHeader
          icon={ClipboardList}
          title="Overview"
        />

        <div className="grid grid-cols-3 gap-6">
          {/* Recovery */}
          <div className="rounded-xl p-5 flex flex-col items-center bg-white border border-[#E4E9E8]">
            <p className="text-sm font-medium text-ink self-start mb-3">
              Recovery
            </p>

            <RangeArc value={62} />

            <p className="text-xs text-muted mt-2 text-center">
              Overall recovery progress
            </p>
          </div>

          {/* Contact */}
          <div className="col-span-2 rounded-xl p-5 bg-white border border-[#E4E9E8]">
            <p className="text-sm font-medium text-ink mb-4">
              Contact & visit information
            </p>

            <div className="grid grid-cols-2 gap-y-4 text-sm">
              <span className="flex items-center gap-2 text-muted">
                <Phone size={14} />
                {patient.phone || 'Not on file'}
              </span>

              <span className="flex items-center gap-2 text-muted">
                <Mail size={14} />
                {patient.email || 'Not on file'}
              </span>

              <span className="flex items-center gap-2 text-muted">
                <Calendar size={14} />
                Last visit: {formatDate(patient.last_visit)}
              </span>

              <span className="flex items-center gap-2 text-muted">
                <Calendar size={14} />
                Next appointment:{' '}
                {patient.next_appointment
                  ? formatDateTime(patient.next_appointment)
                  : '—'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          APPOINTMENTS
      ================================================== */}

      <section>
        <SectionHeader
          icon={Calendar}
          title="Appointments"
          count={appointments.length}
        />

        <div className="rounded-xl overflow-hidden bg-white border border-[#E4E9E8]">
          {appointments.length === 0 ? (
            <div className="p-6 text-sm text-muted text-center">
              No appointment history yet.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E4E9E8]">
                  <th className="text-left px-4 py-3 text-xs text-muted font-medium">
                    Date
                  </th>

                  <th className="text-left px-4 py-3 text-xs text-muted font-medium">
                    Time
                  </th>

                  <th className="text-left px-4 py-3 text-xs text-muted font-medium">
                    Type
                  </th>

                  <th className="text-left px-4 py-3 text-xs text-muted font-medium">
                    Condition
                  </th>

                  <th className="text-left px-4 py-3 text-xs text-muted font-medium">
                    Duration
                  </th>

                  <th className="text-left px-4 py-3 text-xs text-muted font-medium">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {appointments.map((appointment, index) => (
                  <tr
                    key={appointment.id}
                    className={
                      index > 0
                        ? 'border-t border-[#E4E9E8]'
                        : ''
                    }
                  >
                    <td className="px-4 py-3 text-muted font-mono text-[13px]">
                      {formatDate(appointment.date)}
                    </td>

                    <td className="px-4 py-3 text-primary font-medium font-mono text-[13px]">
                      {appointment.time || '—'}
                    </td>

                    <td className="px-4 py-3 text-muted">
                      {appointment.type || '—'}
                    </td>

                    <td className="px-4 py-3 text-muted">
                      {appointment.condition || '—'}
                    </td>

                    <td className="px-4 py-3 text-muted">
                      {appointment.duration || '—'}
                    </td>

                    <td className="px-4 py-3">
                      <StatusPill
                        status={appointment.status}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* ==================================================
          SYMPTOMS
      ================================================== */}

      <section>
        <SectionHeader
          icon={Activity}
          title="Symptoms"
          count={symptoms.length}
        />

        <div className="rounded-xl p-4 bg-white border border-[#E4E9E8]">
          {symptoms.length === 0 ? (
            <p className="text-sm text-muted">
              No symptoms logged yet.
            </p>
          ) : (
            symptoms.map((symptom, index) => (
              <div
                key={symptom.id}
                className={`flex gap-4 py-3 ${
                  index > 0
                    ? 'border-t border-[#E4E9E8]'
                    : ''
                }`}
              >
                <div className="w-24 shrink-0">
                  <p className="text-xs font-mono text-muted">
                    {formatDateTime(symptom.logged_at)}
                  </p>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    {symptom.area && (
                      <span className="text-sm font-medium text-ink">
                        {symptom.area}
                      </span>
                    )}

                    {symptom.pain_level !== null &&
                      symptom.pain_level !== undefined && (
                        <span className="text-xs text-muted">
                          Pain {symptom.pain_level}/10
                        </span>
                      )}
                  </div>

                  {symptom.note && (
                    <p className="text-sm text-muted mt-1">
                      {symptom.note}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ==================================================
          EXERCISES
      ================================================== */}

      <section>
        <SectionHeader
          icon={Dumbbell}
          title="Exercises"
          count={exercises.length}
        />

        <div className="rounded-xl p-4 bg-white border border-[#E4E9E8]">
          {exercises.length === 0 ? (
            <p className="text-sm text-muted">
              No exercises assigned yet.
            </p>
          ) : (
            exercises.map((exercise, index) => (
              <div
                key={exercise.id}
                className={`flex items-center justify-between py-3 ${
                  index > 0
                    ? 'border-t border-[#E4E9E8]'
                    : ''
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-ink">
                    {exercise.name}
                  </p>

                  <p className="text-xs text-muted mt-0.5">
                    {exercise.target_area || 'General'}
                  </p>
                </div>

                <div className="flex items-center gap-5 text-xs font-mono text-muted">
                  {exercise.sets && (
                    <span>
                      {exercise.sets} sets
                    </span>
                  )}

                  {exercise.reps && (
                    <span>
                      {exercise.reps} reps
                    </span>
                  )}

                  {exercise.hold_time && (
                    <span>
                      {exercise.hold_time}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ==================================================
          PROGRESS
      ================================================== */}

      <section>
        <SectionHeader
          icon={TrendingUp}
          title="Progress"
        />

        <div className="flex flex-col gap-6">
          {/* Treatment summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl p-4 bg-white border border-[#E4E9E8]">
              <p className="text-xs text-muted">
                Assessments
              </p>

              <p className="text-2xl font-semibold text-ink mt-1">
                {assessments.length}
              </p>
            </div>

            <div className="rounded-xl p-4 bg-white border border-[#E4E9E8]">
              <p className="text-xs text-muted">
                Treatment sessions
              </p>

              <p className="text-2xl font-semibold text-ink mt-1">
                {sessions.length}
              </p>
            </div>

            <div className="rounded-xl p-4 bg-white border border-[#E4E9E8]">
              <p className="text-xs text-muted">
                Completed appointments
              </p>

              <p className="text-2xl font-semibold text-ink mt-1">
                {completedAppointments}
              </p>
            </div>
          </div>

          {/* Assessments */}
          <div className="rounded-xl p-4 bg-white border border-[#E4E9E8]">
            <p className="text-sm font-medium text-ink mb-3">
              Assessments
            </p>

            {assessments.length === 0 ? (
              <p className="text-sm text-muted">
                No assessments recorded yet.
              </p>
            ) : (
              assessments.map((assessment, index) => (
                <div
                  key={assessment.id}
                  className={`py-3 ${
                    index > 0
                      ? 'border-t border-[#E4E9E8]'
                      : ''
                  }`}
                >
                  <div className="flex justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-ink">
                        {assessment.chief_complaint ||
                          'Assessment'}
                      </p>

                      {assessment.clinical_impression && (
                        <p className="text-xs text-muted mt-1">
                          {assessment.clinical_impression}
                        </p>
                      )}
                    </div>

                    <span className="text-xs font-mono text-muted shrink-0">
                      {formatDate(assessment.assessment_date)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted">
                    {assessment.pain_level !== null &&
                      assessment.pain_level !== undefined && (
                        <span>
                          Pain: {assessment.pain_level}/10
                        </span>
                      )}

                    {assessment.pain_location && (
                      <span>
                        Location: {assessment.pain_location}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Treatment sessions */}
          <div className="rounded-xl p-4 bg-white border border-[#E4E9E8]">
            <p className="text-sm font-medium text-ink mb-3">
              Treatment sessions
            </p>

            {sessions.length === 0 ? (
              <p className="text-sm text-muted">
                No treatment sessions recorded yet.
              </p>
            ) : (
              sessions.map((session, index) => (
                <div
                  key={session.id}
                  className={`py-3 ${
                    index > 0
                      ? 'border-t border-[#E4E9E8]'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-ink">
                        Session {session.session_number || '—'}
                      </span>

                      {session.pain_level !== null &&
                        session.pain_level !== undefined && (
                          <span className="text-xs text-muted">
                            Pain: {session.pain_level}/10
                          </span>
                        )}
                    </div>

                    <span className="text-xs font-mono text-muted">
                      {formatDate(session.session_date)}
                    </span>
                  </div>

                  {session.subjective_notes && (
                    <p className="text-xs text-muted mt-2">
                      <span className="font-medium text-ink">
                        Subjective:
                      </span>{' '}
                      {session.subjective_notes}
                    </p>
                  )}

                  {session.objective_findings && (
                    <p className="text-xs text-muted mt-1">
                      <span className="font-medium text-ink">
                        Objective:
                      </span>{' '}
                      {session.objective_findings}
                    </p>
                  )}

                  {session.interventions && (
                    <p className="text-xs text-muted mt-1">
                      <span className="font-medium text-ink">
                        Interventions:
                      </span>{' '}
                      {session.interventions}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Goals */}
          <div className="rounded-xl p-4 bg-white border border-[#E4E9E8]">
            <p className="text-sm font-medium text-ink mb-3">
              Treatment goals
            </p>

            {goals.length === 0 ? (
              <p className="text-sm text-muted">
                No treatment goals recorded yet.
              </p>
            ) : (
              goals.map((goal, index) => (
                <div
                  key={goal.id}
                  className={`py-3 ${
                    index > 0
                      ? 'border-t border-[#E4E9E8]'
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-ink">
                        {goal.description}
                      </p>

                      {goal.target_value && (
                        <p className="text-xs text-muted mt-1">
                          Target: {goal.target_value}
                        </p>
                      )}
                    </div>

                    {goal.status && (
                      <StatusPill status={goal.status} />
                    )}
                  </div>

                  {goal.target_date && (
                    <p className="text-xs text-muted mt-2">
                      Target date:{' '}
                      {formatDate(goal.target_date)}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}


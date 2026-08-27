import { useEffect, useMemo, useState } from 'react';
import {
  TrendingUp,
  ClipboardCheck,
  Users,
  Activity,
  UserRound,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { supabase } from '../../lib/supabase';

function formatDate(date) {
  if (!date) return '—';

  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function Progress() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState('all');

  useEffect(() => {
    async function fetchProgress() {
      setLoading(true);
      setError(null);

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;

        if (!user) {
          throw new Error('You must be logged in.');
        }

        const { data, error: assessmentError } = await supabase
          .from('assessments')
          .select(`
            id,
            patient_id,
            assessment_date,
            chief_complaint,
            clinical_impression,
            pain_level,
            pain_location,
            patient:patients (
              name,
              condition
            )
          `)
          .eq('therapist_id', user.id)
          .order('assessment_date', { ascending: true });

        if (assessmentError) {
          throw assessmentError;
        }

        setAssessments(data || []);
      } catch (err) {
        console.error('Error fetching progress:', err);
        setError(err.message || 'Failed to load progress data.');
      } finally {
        setLoading(false);
      }
    }

    fetchProgress();
  }, []);

  const patients = useMemo(() => {
    const patientMap = new Map();

    assessments.forEach((assessment) => {
      if (!assessment.patient_id) return;

      if (!patientMap.has(assessment.patient_id)) {
        patientMap.set(assessment.patient_id, {
          id: assessment.patient_id,
          name: assessment.patient?.name || 'Unknown patient',
          condition: assessment.patient?.condition || '',
        });
      }
    });

    return Array.from(patientMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [assessments]);

  const filteredAssessments = useMemo(() => {
    if (selectedPatientId === 'all') {
      return assessments;
    }

    return assessments.filter(
      (assessment) =>
        String(assessment.patient_id) === String(selectedPatientId)
    );
  }, [assessments, selectedPatientId]);

  const selectedPatient = useMemo(() => {
    if (selectedPatientId === 'all') return null;

    return patients.find(
      (patient) =>
        String(patient.id) === String(selectedPatientId)
    );
  }, [patients, selectedPatientId]);

  const assessmentsWithPain = filteredAssessments.filter(
    (assessment) =>
      assessment.pain_level !== null &&
      assessment.pain_level !== undefined
  );

  const averagePain =
    assessmentsWithPain.length > 0
      ? (
          assessmentsWithPain.reduce(
            (total, assessment) =>
              total + Number(assessment.pain_level),
            0
          ) / assessmentsWithPain.length
        ).toFixed(1)
      : '—';

  const firstPain =
    assessmentsWithPain.length > 0
      ? Number(assessmentsWithPain[0].pain_level)
      : null;

  const latestPain =
    assessmentsWithPain.length > 0
      ? Number(
          assessmentsWithPain[assessmentsWithPain.length - 1]
            .pain_level
        )
      : null;

  const painChange =
    firstPain !== null && latestPain !== null
      ? latestPain - firstPain
      : null;

  const painChangeLabel =
    painChange === null
      ? 'No comparison available'
      : painChange < 0
        ? `${Math.abs(painChange)} point improvement`
        : painChange > 0
          ? `${painChange} point increase`
          : 'No change';

  const latestAssessment =
    filteredAssessments.length > 0
      ? filteredAssessments[filteredAssessments.length - 1]
      : null;

  const painTrend = assessmentsWithPain.map((assessment) => ({
    date: formatDate(assessment.assessment_date),
    pain: Number(assessment.pain_level),
  }));

  if (loading) {
    return (
      <div className="text-sm text-muted">
        Loading progress...
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

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div>
        <h1 className="font-display font-semibold text-2xl text-ink">
          Progress
        </h1>

        <p className="text-sm mt-1 text-muted">
          Review clinical progress and outcome trends across your
          patients.
        </p>
      </div>

      {/* Patient selector */}
      <div className="rounded-xl p-4 bg-white border border-[#E4E9E8]">
        <div className="flex items-center gap-2 mb-2">
          <UserRound size={16} className="text-muted" />

          <label className="text-sm font-medium text-ink">
            Patient
          </label>
        </div>

        <select
          value={selectedPatientId}
          onChange={(e) => setSelectedPatientId(e.target.value)}
          className="w-full md:w-96 px-3 py-2.5 rounded-lg text-sm border border-[#E4E9E8] bg-white text-ink"
        >
          <option value="all">
            All patients
          </option>

          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.name}
              {patient.condition
                ? ` — ${patient.condition}`
                : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Selected patient summary */}
      {selectedPatient && (
        <div className="rounded-xl p-4 bg-white border border-[#E4E9E8]">
          <p className="text-xs text-muted">
            Currently viewing
          </p>

          <div className="flex items-center justify-between mt-1">
            <div>
              <p className="text-lg font-semibold text-ink">
                {selectedPatient.name}
              </p>

              <p className="text-sm text-muted">
                {selectedPatient.condition ||
                  'Condition not recorded'}
              </p>
            </div>

            <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-[#E1F0EA] text-primary">
              {filteredAssessments.length}{' '}
              {filteredAssessments.length === 1
                ? 'assessment'
                : 'assessments'}
            </span>
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">

        <div className="rounded-xl p-4 bg-white border border-[#E4E9E8]">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted">
              Assessments
            </p>

            <ClipboardCheck
              size={18}
              className="text-muted"
            />
          </div>

          <p className="text-2xl font-semibold text-ink mt-2">
            {filteredAssessments.length}
          </p>

          <p className="text-xs text-muted mt-1">
            {selectedPatient
              ? 'For this patient'
              : 'Across all patients'}
          </p>
        </div>

        <div className="rounded-xl p-4 bg-white border border-[#E4E9E8]">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted">
              {selectedPatient ? 'Latest pain' : 'Patients assessed'}
            </p>

            {selectedPatient ? (
              <Activity size={18} className="text-muted" />
            ) : (
              <Users size={18} className="text-muted" />
            )}
          </div>

          <p className="text-2xl font-semibold text-ink mt-2">
            {selectedPatient
              ? latestPain !== null
                ? `${latestPain}/10`
                : '—'
              : new Set(
                  filteredAssessments.map(
                    (assessment) => assessment.patient_id
                  )
                ).size}
          </p>

          <p className="text-xs text-muted mt-1">
            {selectedPatient
              ? 'Most recent recorded score'
              : 'Unique patients'}
          </p>
        </div>

        <div className="rounded-xl p-4 bg-white border border-[#E4E9E8]">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted">
              {selectedPatient ? 'Pain change' : 'Average pain'}
            </p>

            <TrendingUp
              size={18}
              className="text-muted"
            />
          </div>

          <p className="text-2xl font-semibold text-ink mt-2">
            {selectedPatient
              ? painChange !== null
                ? `${painChange > 0 ? '+' : ''}${painChange}`
                : '—'
              : averagePain}
          </p>

          <p className="text-xs text-muted mt-1">
            {selectedPatient
              ? painChangeLabel
              : 'Based on recorded pain scores'}
          </p>
        </div>

      </div>

      {/* Latest clinical impression */}
      {selectedPatient && latestAssessment && (
        <div className="rounded-xl p-4 bg-white border border-[#E4E9E8]">
          <p className="text-sm font-medium text-ink">
            Latest clinical assessment
          </p>

          <div className="grid grid-cols-2 gap-6 mt-4">

            <div>
              <p className="text-xs text-muted">
                Assessment date
              </p>

              <p className="text-sm text-ink mt-1">
                {formatDate(latestAssessment.assessment_date)}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted">
                Pain location
              </p>

              <p className="text-sm text-ink mt-1">
                {latestAssessment.pain_location || '—'}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted">
                Chief complaint
              </p>

              <p className="text-sm text-ink mt-1">
                {latestAssessment.chief_complaint || '—'}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted">
                Clinical impression
              </p>

              <p className="text-sm text-ink mt-1">
                {latestAssessment.clinical_impression || '—'}
              </p>
            </div>

          </div>
        </div>
      )}

      {/* Pain trend */}
      <div className="rounded-xl p-4 bg-white border border-[#E4E9E8]">

        <div className="flex items-center gap-2 mb-4">
          <TrendingUp
            size={16}
            className="text-sage"
          />

          <div>
            <p className="text-sm font-medium text-ink">
              {selectedPatient
                ? 'Patient pain trend'
                : 'Pain trend'}
            </p>

            <p className="text-xs text-muted">
              {selectedPatient
                ? `Pain scores recorded for ${selectedPatient.name}`
                : 'Pain scores recorded during assessments'}
            </p>
          </div>
        </div>

        {painTrend.length > 0 ? (
          <ResponsiveContainer
            width="100%"
            height={240}
          >
            <LineChart
              data={painTrend}
              margin={{
                top: 5,
                right: 10,
                left: -20,
                bottom: 0,
              }}
            >
              <CartesianGrid
                stroke="#E4E9E8"
                vertical={false}
              />

              <XAxis
                dataKey="date"
                tick={{
                  fontSize: 12,
                  fill: '#5C6B6E',
                }}
                axisLine={{
                  stroke: '#E4E9E8',
                }}
                tickLine={false}
              />

              <YAxis
                domain={[0, 10]}
                ticks={[0, 2, 4, 6, 8, 10]}
                tick={{
                  fontSize: 12,
                  fill: '#5C6B6E',
                }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                formatter={(value) => [`${value}/10`, 'Pain']}
                contentStyle={{
                  borderRadius: 8,
                  border: '1px solid #E4E9E8',
                  fontSize: 13,
                }}
              />

              <Line
                type="monotone"
                dataKey="pain"
                stroke="#1F4E4A"
                strokeWidth={2}
                dot={{
                  r: 4,
                }}
                activeDot={{
                  r: 6,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="py-12 text-center">
            <p className="text-sm text-muted">
              No pain scores have been recorded yet.
            </p>

            <p className="text-xs text-muted mt-1">
              Add a pain score when completing an assessment
              to see the trend here.
            </p>
          </div>
        )}

      </div>

      {/* Assessment history */}
      <div className="rounded-xl overflow-hidden bg-white border border-[#E4E9E8]">

        <div className="p-4 border-b border-[#E4E9E8]">
          <p className="text-sm font-medium text-ink">
            Assessment history
          </p>

          <p className="text-xs text-muted mt-1">
            {selectedPatient
              ? `Clinical assessments for ${selectedPatient.name}`
              : 'Recent clinical assessments'}
          </p>
        </div>

        {filteredAssessments.length > 0 ? (
          <div>
            {[...filteredAssessments]
              .reverse()
              .map((assessment, index) => (
                <div
                  key={assessment.id}
                  className={`px-4 py-4 ${
                    index > 0
                      ? 'border-t border-[#E4E9E8]'
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">

                    <div>
                      {!selectedPatient && (
                        <p className="text-sm font-medium text-ink">
                          {assessment.patient?.name ||
                            'Unknown patient'}
                        </p>
                      )}

                      <p
                        className={`text-sm ${
                          selectedPatient
                            ? 'font-medium text-ink'
                            : 'text-muted mt-1'
                        }`}
                      >
                        {assessment.chief_complaint ||
                          assessment.patient?.condition ||
                          'No complaint recorded'}
                      </p>

                      {assessment.clinical_impression && (
                        <p className="text-xs text-muted mt-1">
                          Impression:{' '}
                          {assessment.clinical_impression}
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs font-mono text-muted">
                        {formatDate(
                          assessment.assessment_date
                        )}
                      </p>

                      {assessment.pain_level !== null &&
                        assessment.pain_level !== undefined && (
                          <p className="text-xs font-medium text-ink mt-1">
                            Pain: {assessment.pain_level}/10
                          </p>
                        )}
                    </div>

                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm text-muted">
              {selectedPatient
                ? 'No assessments recorded for this patient yet.'
                : 'No assessments recorded yet.'}
            </p>
          </div>
        )}

      </div>

    </div>
  );
}


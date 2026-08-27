import { useEffect, useState } from 'react';
import { Search, Plus, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

function StatusPill({ status }) {
  const map = {
    Completed: { bg: '#E1F0EA', text: '#1F4E4A' },
    Scheduled: { bg: '#FBEEE0', text: '#9A6423' },
    Overdue: { bg: '#FBEAE5', text: '#D96B54' },
  };

  const s = map[status] || map.Completed;

  return (
    <span
      className="text-xs px-2.5 py-1 rounded-full font-medium"
      style={{
        background: s.bg,
        color: s.text,
      }}
    >
      {status}
    </span>
  );
}

function formatDate(date) {
  if (!date) return '—';

  return new Date(`${date}T00:00:00`).toLocaleDateString(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }
  );
}

function getAssessmentStatus(assessment) {
  if (!assessment.assessment_date) {
    return 'Completed';
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const assessmentDate = new Date(
    `${assessment.assessment_date}T00:00:00`
  );

  return assessmentDate > today
    ? 'Scheduled'
    : 'Completed';
}

export default function Assessments() {
  const { session } = useAuth();

  const [assessments, setAssessments] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!session?.user?.id) return;

    async function fetchAssessments() {
      setLoading(true);
      setError(null);

      try {
        // Get assessments belonging to the logged-in therapist
        const {
          data: assessmentData,
          error: assessmentError,
        } = await supabase
          .from('assessments')
          .select('*')
          .eq('therapist_id', session.user.id)
          .order('assessment_date', {
            ascending: false,
          });

        if (assessmentError) {
          throw assessmentError;
        }

        const assessmentRows = assessmentData || [];

        // Get patient IDs
        const patientIds = [
          ...new Set(
            assessmentRows
              .map((assessment) => assessment.patient_id)
              .filter(Boolean)
          ),
        ];

        // Fetch patients
        let patientRows = [];

        if (patientIds.length > 0) {
          const {
            data: patientsData,
            error: patientsError,
          } = await supabase
            .from('patients')
            .select('id, name, condition')
            .in('id', patientIds);

          if (patientsError) {
            throw patientsError;
          }

          patientRows = patientsData || [];
        }

        // Build patient ID -> patient lookup
        const patientMap = {};

        patientRows.forEach((patient) => {
          patientMap[patient.id] = patient;
        });

        // Merge assessment + patient information
        const merged = assessmentRows.map(
          (assessment) => {
            const patient =
              patientMap[assessment.patient_id];

            return {
              ...assessment,
              patientName:
                patient?.name || 'Unknown patient',
              patientCondition:
                patient?.condition || null,
              status:
                getAssessmentStatus(assessment),
            };
          }
        );

        setAssessments(merged);
      } catch (err) {
        console.error(
          'Error fetching assessments:',
          err
        );

        setError(
          err.message ||
            'Failed to load assessments.'
        );

        setAssessments([]);
      } finally {
        setLoading(false);
      }
    }

    fetchAssessments();
  }, [session]);

  const filteredAssessments = assessments.filter(
    (assessment) => {
      const query = search.toLowerCase();

      return (
        assessment.patientName
          ?.toLowerCase()
          .includes(query) ||
        assessment.chief_complaint
          ?.toLowerCase()
          .includes(query) ||
        assessment.patientCondition
          ?.toLowerCase()
          .includes(query) ||
        assessment.clinical_impression
          ?.toLowerCase()
          .includes(query)
      );
    }
  );

  if (loading) {
    return (
      <div className="text-sm text-muted">
        Loading assessments...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-semibold text-2xl text-ink">
            Assessments
          </h1>

          <p className="text-sm mt-1 text-muted">
            Track clinical assessments and outcome
            measures across your patients.
          </p>
        </div>

  <Link
  to="/therapist/assessments/new"
  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-white font-medium bg-primary"
>
  <Plus size={16} />
  New assessment
</Link>
      </div>

      {/* Error */}
      {error && (
        <div
          className="rounded-lg px-4 py-3 text-sm"
          style={{
            background: '#FBEAE5',
            color: '#D96B54',
          }}
        >
          {error}
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#E4E9E8] max-w-105">
        <Search
          size={16}
          className="text-muted shrink-0"
        />

        <input
          type="text"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search patients or assessments..."
          className="w-full outline-none text-sm text-ink placeholder:text-muted"
        />
      </div>

      {/* Assessments Table */}
      <div className="rounded-xl overflow-hidden bg-white border border-[#E4E9E8]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E4E9E8]">
              {[
                'Patient',
                'Chief complaint',
                'Clinical impression',
                'Pain',
                'Date',
                'Status',
                '',
              ].map((heading, index) => (
                <th
                  key={index}
                  className="text-left px-4 py-3 text-xs text-muted font-medium"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filteredAssessments.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center"
                >
                  <div className="flex flex-col items-center gap-2">
                    <FileText
                      size={24}
                      className="text-muted"
                    />

                    <p className="text-sm text-muted">
                      {search
                        ? 'No assessments found.'
                        : 'No assessments yet.'}
                    </p>

                    {!search && (
                      <Link
                        to="/therapist/assessments/new"
                        className="text-sm font-medium text-primary"
                      >
                        Create your first assessment
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredAssessments.map(
                (assessment, index) => (
                  <tr
                    key={assessment.id}
                    className={
                      index > 0
                        ? 'border-t border-[#E4E9E8]'
                        : ''
                    }
                  >
                    {/* Patient */}
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-ink font-medium">
                          {assessment.patientName}
                        </p>

                        {assessment.patientCondition && (
                          <p className="text-xs text-muted mt-0.5">
                            {assessment.patientCondition}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Chief complaint */}
                    <td className="px-4 py-3 text-muted">
                      {assessment.chief_complaint ||
                        '—'}
                    </td>

                    {/* Clinical impression */}
                    <td className="px-4 py-3 text-muted">
                      {assessment.clinical_impression ||
                        '—'}
                    </td>

                    {/* Pain */}
                    <td className="px-4 py-3 font-mono text-[13px] text-ink">
                      {assessment.pain_level !==
                        null &&
                      assessment.pain_level !==
                        undefined
                        ? `${assessment.pain_level}/10`
                        : '—'}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-muted font-mono text-[13px]">
                      {formatDate(
                        assessment.assessment_date
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <StatusPill
                        status={
                          assessment.status
                        }
                      />
                    </td>

                    {/* View */}
                    <td className="px-4 py-3">
                      <Link
                        to={`/therapist/assessments/${assessment.id}`}
                        className="inline-flex"
                        title="View assessment"
                      >
                        <FileText
                          size={16}
                          className="text-muted hover:text-primary"
                        />
                      </Link>
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


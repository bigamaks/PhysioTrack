import { useEffect, useState } from 'react';
import {
  Search,
  Plus,
  FileText,
  X,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function Reports() {
  const { session } = useAuth();

  const [patients, setPatients] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [search, setSearch] = useState('');
  const [showGenerator, setShowGenerator] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [reportType, setReportType] = useState('Progress Report');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReportData() {
      if (!session?.user?.id) return;

      setLoading(true);

      const [
        patientsResult,
        assessmentsResult,
      ] = await Promise.all([
        supabase
          .from('patients')
          .select(
            'id, name, condition, status'
          )
          .order('name'),

        supabase
          .from('assessments')
          .select(
            `
              id,
              patient_id,
              therapist_id,
              assessment_date,
              chief_complaint,
              clinical_impression,
              pain_level
            `
          )
          .eq(
            'therapist_id',
            session.user.id
          )
          .order('assessment_date', {
            ascending: true,
          }),
      ]);

      if (patientsResult.error) {
        console.error(
          'Error fetching patients:',
          patientsResult.error
        );
      }

      if (assessmentsResult.error) {
        console.error(
          'Error fetching assessments:',
          assessmentsResult.error
        );
      }

      setPatients(
        patientsResult.data || []
      );

      setAssessments(
        assessmentsResult.data || []
      );

      setLoading(false);
    }

    fetchReportData();
  }, [session]);

  function formatDate(date) {
    if (!date) return '';

    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  // function getPatientName(patientId) {
  //   return (
  //     patients.find(
  //       (patient) => patient.id === patientId
  //     )?.name || 'Unknown patient'
  //   );
  // }

  function getReportType(patientId) {
    const patientAssessments =
      assessments.filter(
        (assessment) =>
          assessment.patient_id === patientId
      );

    if (patientAssessments.length === 1) {
      return 'Initial Assessment Report';
    }

    return 'Progress Report';
  }

  function getReportPeriod(patientId) {
    const patientAssessments =
      assessments.filter(
        (assessment) =>
          assessment.patient_id === patientId
      );

    if (!patientAssessments.length) {
      return 'No assessment data';
    }

    const first =
      patientAssessments[0].assessment_date;

    const latest =
      patientAssessments[
        patientAssessments.length - 1
      ].assessment_date;

    if (first === latest) {
      return formatDate(first);
    }

    return `${formatDate(first)} – ${formatDate(
      latest
    )}`;
  }

  function getGeneratedDate(patientId) {
    const patientAssessments =
      assessments.filter(
        (assessment) =>
          assessment.patient_id === patientId
      );

    if (!patientAssessments.length) {
      return null;
    }

    return patientAssessments[
      patientAssessments.length - 1
    ].assessment_date;
  }

  const reportPatients = patients
    .filter((patient) =>
      assessments.some(
        (assessment) =>
          assessment.patient_id === patient.id
      )
    )
    .map((patient) => ({
      id: patient.id,
      patient: patient.name,
      type: getReportType(patient.id),
      period: getReportPeriod(patient.id),
      generated: getGeneratedDate(patient.id),
    }));

  const filteredReports =
    reportPatients.filter((report) =>
      report.patient
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  function handleGenerate() {
    if (!selectedPatient) {
      return;
    }

    const patient = patients.find(
      (p) =>
        p.id === Number(selectedPatient)
    );

    if (!patient) return;

    const patientAssessments =
      assessments.filter(
        (assessment) =>
          assessment.patient_id ===
          patient.id
      );

    if (!patientAssessments.length) {
      alert(
        'This patient does not have any assessments yet.'
      );
      return;
    }

    const latestAssessment =
      patientAssessments[
        patientAssessments.length - 1
      ];

    const report = `
${reportType}

Patient: ${patient.name}
Condition: ${patient.condition || 'Not recorded'}

Assessment period:
${getReportPeriod(patient.id)}

Latest assessment:
${formatDate(
  latestAssessment.assessment_date
)}

Chief complaint:
${latestAssessment.chief_complaint || 'Not recorded'}

Clinical impression:
${latestAssessment.clinical_impression || 'Not recorded'}

Pain level:
${
  latestAssessment.pain_level !== null &&
  latestAssessment.pain_level !== undefined
    ? `${latestAssessment.pain_level}/10`
    : 'Not recorded'
}
    `.trim();

    const blob = new Blob([report], {
      type: 'text/plain',
    });

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement('a');

    link.href = url;
    link.download = `${patient.name
      .replace(/\s+/g, '_')
      .toLowerCase()}_report.txt`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    setShowGenerator(false);
    setSelectedPatient('');
  }

  if (loading) {
    return (
      <div className="text-sm text-muted">
        Loading reports...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-semibold text-2xl text-ink">
            Reports
          </h1>

          <p className="text-sm mt-1 text-muted">
            Generate and review patient progress
            reports.
          </p>
        </div>

        <button
          onClick={() =>
            setShowGenerator(true)
          }
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-white font-medium bg-primary"
        >
          <Plus size={16} />
          Generate report
        </button>
      </div>

      {/* Search */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#E4E9E8]"
        style={{ width: 320 }}
      >
        <Search
          size={16}
          className="text-muted"
        />

        <input
          type="text"
          placeholder="Search reports..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="w-full outline-none text-sm text-ink"
        />
      </div>

      {/* Reports table */}
      <div className="rounded-xl overflow-hidden bg-white border border-[#E4E9E8]">
        {filteredReports.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E4E9E8]">
                {[
                  'Patient',
                  'Report type',
                  'Period covered',
                  'Generated',
                  '',
                ].map((heading) => (
                  <th
                    key={heading}
                    className="text-left px-4 py-3 text-xs text-muted font-medium"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredReports.map(
                (report, index) => (
                  <tr
                    key={report.id}
                    className={
                      index > 0
                        ? 'border-t border-[#E4E9E8]'
                        : ''
                    }
                  >
                    <td className="px-4 py-3 text-ink font-medium">
                      {report.patient}
                    </td>

                    <td className="px-4 py-3 text-muted">
                      <div className="flex items-center gap-2">
                        <FileText
                          size={14}
                          className="text-primary"
                        />

                        {report.type}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-muted text-[13px]">
                      {report.period}
                    </td>

                    <td className="px-4 py-3 text-muted font-mono text-[13px]">
                      {formatDate(
                        report.generated
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          setSelectedPatient(
                            String(report.id)
                          );
                          setReportType(
                            report.type
                          );
                          setShowGenerator(true);
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#E4E9E8] hover:bg-[#F7F9F8]"
                      >
                        <FileText
                          size={14}
                          className="text-muted"
                        />
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        ) : (
          <div className="py-12 text-center">
            <FileText
              size={28}
              className="mx-auto text-muted"
            />

            <p className="text-sm mt-3 text-muted">
              No reports available yet.
            </p>

            <p className="text-xs mt-1 text-muted">
              Reports will appear after patient
              assessments are recorded.
            </p>
          </div>
        )}
      </div>

      {/* Generate report modal */}
      {showGenerator && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="w-full max-w-md rounded-xl p-6 bg-white shadow-lg">

            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-display font-semibold text-lg text-ink">
                  Generate report
                </h2>

                <p className="text-xs mt-1 text-muted">
                  Select a patient and report type.
                </p>
              </div>

              <button
                onClick={() =>
                  setShowGenerator(false)
                }
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F7F9F8]"
              >
                <X
                  size={16}
                  className="text-muted"
                />
              </button>
            </div>

            <div className="flex flex-col gap-4">

              <div>
                <label className="text-xs text-muted">
                  Patient
                </label>

                <select
                  value={selectedPatient}
                  onChange={(e) =>
                    setSelectedPatient(
                      e.target.value
                    )
                  }
                  className="w-full mt-1 px-3 py-2.5 rounded-lg text-sm text-ink border border-[#E4E9E8] bg-white"
                >
                  <option value="">
                    Select patient
                  </option>

                  {patients
                    .filter((patient) =>
                      assessments.some(
                        (assessment) =>
                          assessment.patient_id ===
                          patient.id
                      )
                    )
                    .map((patient) => (
                      <option
                        key={patient.id}
                        value={patient.id}
                      >
                        {patient.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-muted">
                  Report type
                </label>

                <select
                  value={reportType}
                  onChange={(e) =>
                    setReportType(
                      e.target.value
                    )
                  }
                  className="w-full mt-1 px-3 py-2.5 rounded-lg text-sm text-ink border border-[#E4E9E8] bg-white"
                >
                  <option>
                    Progress Report
                  </option>

                  <option>
                    Initial Assessment Report
                  </option>

                  <option>
                    Discharge Summary
                  </option>

                  <option>
                    Post-op Recovery Report
                  </option>
                </select>
              </div>

              <button
                onClick={handleGenerate}
                disabled={!selectedPatient}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm text-white font-medium bg-primary disabled:opacity-50"
              >
                <FileText size={16} />
                Generate & download
              </button>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
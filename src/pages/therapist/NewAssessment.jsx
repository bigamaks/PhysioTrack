import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function NewAssessment() {
  const navigate = useNavigate();
  const { session } = useAuth();

  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    patient_id: '',
    assessment_date: new Date().toISOString().split('T')[0],
    referral_source: '',
    chief_complaint: '',
    history_of_present_condition: '',
    past_medical_history: '',
    past_surgical_history: '',
    medications: '',
    allergies: '',
    pain_level: '',
    pain_location: '',
    pain_description: '',
    aggravating_factors: '',
    easing_factors: '',
    functional_limitations: '',
    patient_goals: '',
    observation: '',
    palpation: '',
    clinical_impression: '',
    precautions: '',
    contraindications: '',
    additional_notes: '',
  });

  useEffect(() => {
    async function fetchPatients() {
      setLoadingPatients(true);

      const { data, error } = await supabase
        .from('patients')
        .select('id, name, age, gender, condition')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching patients:', error);
        setError('Unable to load patients.');
      } else {
        setPatients(data || []);
      }

      setLoadingPatients(false);
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

    if (!session?.user?.id) {
      setError('You must be logged in to create an assessment.');
      return;
    }

    if (!form.patient_id) {
      setError('Please select a patient.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: assessmentError } = await supabase
        .from('assessments')
        .insert({
          patient_id: Number(form.patient_id),
          therapist_id: session.user.id,
          assessment_date: form.assessment_date || null,
          referral_source: form.referral_source || null,
          chief_complaint: form.chief_complaint || null,
          history_of_present_condition:
            form.history_of_present_condition || null,
          past_medical_history:
            form.past_medical_history || null,
          past_surgical_history:
            form.past_surgical_history || null,
          medications: form.medications || null,
          allergies: form.allergies || null,
          pain_level:
            form.pain_level !== ''
              ? Number(form.pain_level)
              : null,
          pain_location: form.pain_location || null,
          pain_description: form.pain_description || null,
          aggravating_factors:
            form.aggravating_factors || null,
          easing_factors: form.easing_factors || null,
          functional_limitations:
            form.functional_limitations || null,
          patient_goals: form.patient_goals || null,
          observation: form.observation || null,
          palpation: form.palpation || null,
          clinical_impression:
            form.clinical_impression || null,
          precautions: form.precautions || null,
          contraindications:
            form.contraindications || null,
          additional_notes:
            form.additional_notes || null,
        })
        .select('id')
        .single();

      if (assessmentError) {
        throw assessmentError;
      }

      navigate(`/therapist/assessments/${data.id}`);
    } catch (err) {
      console.error('Error creating assessment:', err);
      setError(
        err.message || 'Failed to create assessment.'
      );
    } finally {
      setLoading(false);
    }
  }

  if (loadingPatients) {
    return (
      <div className="text-sm text-muted">
        Loading patients...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Back */}
      <button
        onClick={() => navigate('/therapist/assessments')}
        className="flex items-center gap-1.5 text-sm text-muted w-fit"
      >
        <ArrowLeft size={16} />
        Back to assessments
      </button>

      {/* Header */}
      <div>
        <h1 className="font-display font-semibold text-2xl text-ink">
          New assessment
        </h1>

        <p className="text-sm mt-1 text-muted">
          Create a clinical assessment for a patient.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6"
      >
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

        {/* Patient & Assessment */}
        <section className="rounded-xl p-5 bg-white border border-[#E4E9E8]">
          <h2 className="text-sm font-semibold text-ink mb-4">
            Patient & assessment
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs mb-1.5 block text-muted">
                Patient
              </label>

              <select
                value={form.patient_id}
                onChange={(e) =>
                  update('patient_id', e.target.value)
                }
                className="w-full px-3 py-2.5 rounded-lg text-sm border border-[#E4E9E8]"
                required
              >
                <option value="">
                  Select a patient
                </option>

                {patients.map((patient) => (
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
              <label className="text-xs mb-1.5 block text-muted">
                Assessment date
              </label>

              <input
                type="date"
                value={form.assessment_date}
                onChange={(e) =>
                  update(
                    'assessment_date',
                    e.target.value
                  )
                }
                className="w-full px-3 py-2.5 rounded-lg text-sm border border-[#E4E9E8]"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="text-xs mb-1.5 block text-muted">
                Referral source
              </label>

              <input
                value={form.referral_source}
                onChange={(e) =>
                  update(
                    'referral_source',
                    e.target.value
                  )
                }
                placeholder="e.g. Orthopaedic clinic, GP, self-referral"
                className="w-full px-3 py-2.5 rounded-lg text-sm border border-[#E4E9E8]"
              />
            </div>
          </div>
        </section>

        {/* Subjective Assessment */}
        <section className="rounded-xl p-5 bg-white border border-[#E4E9E8]">
          <h2 className="text-sm font-semibold text-ink mb-4">
            Subjective assessment
          </h2>

          <div className="flex flex-col gap-4">
            <TextArea
              label="Chief complaint"
              value={form.chief_complaint}
              onChange={(value) =>
                update('chief_complaint', value)
              }
              placeholder="What is the patient's main complaint?"
              required
            />

            <TextArea
              label="History of present condition"
              value={form.history_of_present_condition}
              onChange={(value) =>
                update(
                  'history_of_present_condition',
                  value
                )
              }
              placeholder="Describe onset, duration, progression, previous treatment, etc."
            />

            <div className="grid grid-cols-2 gap-4">
              <TextArea
                label="Past medical history"
                value={form.past_medical_history}
                onChange={(value) =>
                  update(
                    'past_medical_history',
                    value
                  )
                }
                placeholder="Relevant medical history"
              />

              <TextArea
                label="Past surgical history"
                value={form.past_surgical_history}
                onChange={(value) =>
                  update(
                    'past_surgical_history',
                    value
                  )
                }
                placeholder="Relevant surgical history"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <TextArea
                label="Medications"
                value={form.medications}
                onChange={(value) =>
                  update('medications', value)
                }
                placeholder="Current medications"
              />

              <TextArea
                label="Allergies"
                value={form.allergies}
                onChange={(value) =>
                  update('allergies', value)
                }
                placeholder="Known allergies"
              />
            </div>
          </div>
        </section>

        {/* Pain Assessment */}
        <section className="rounded-xl p-5 bg-white border border-[#E4E9E8]">
          <h2 className="text-sm font-semibold text-ink mb-4">
            Pain assessment
          </h2>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-xs mb-1.5 block text-muted">
                Pain level
              </label>

              <select
                value={form.pain_level}
                onChange={(e) =>
                  update('pain_level', e.target.value)
                }
                className="w-full px-3 py-2.5 rounded-lg text-sm border border-[#E4E9E8]"
              >
                <option value="">Select</option>
                {Array.from({ length: 11 }, (_, i) => (
                  <option key={i} value={i}>
                    {i} / 10
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="text-xs mb-1.5 block text-muted">
                Pain location
              </label>

              <input
                value={form.pain_location}
                onChange={(e) =>
                  update('pain_location', e.target.value)
                }
                placeholder="e.g. Lower lumbar region"
                className="w-full px-3 py-2.5 rounded-lg text-sm border border-[#E4E9E8]"
              />
            </div>
          </div>

          <TextArea
            label="Pain description"
            value={form.pain_description}
            onChange={(value) =>
              update('pain_description', value)
            }
            placeholder="Describe the quality, behaviour, and pattern of the pain."
          />

          <div className="grid grid-cols-2 gap-4 mt-4">
            <TextArea
              label="Aggravating factors"
              value={form.aggravating_factors}
              onChange={(value) =>
                update(
                  'aggravating_factors',
                  value
                )
              }
              placeholder="What makes the symptoms worse?"
            />

            <TextArea
              label="Easing factors"
              value={form.easing_factors}
              onChange={(value) =>
                update('easing_factors', value)
              }
              placeholder="What makes the symptoms better?"
            />
          </div>
        </section>

        {/* Functional Assessment */}
        <section className="rounded-xl p-5 bg-white border border-[#E4E9E8]">
          <h2 className="text-sm font-semibold text-ink mb-4">
            Functional assessment
          </h2>

          <div className="flex flex-col gap-4">
            <TextArea
              label="Functional limitations"
              value={form.functional_limitations}
              onChange={(value) =>
                update(
                  'functional_limitations',
                  value
                )
              }
              placeholder="Describe activities, movements, or daily tasks affected."
            />

            <TextArea
              label="Patient goals"
              value={form.patient_goals}
              onChange={(value) =>
                update('patient_goals', value)
              }
              placeholder="What does the patient want to achieve?"
            />
          </div>
        </section>

        {/* Objective Assessment */}
        <section className="rounded-xl p-5 bg-white border border-[#E4E9E8]">
          <h2 className="text-sm font-semibold text-ink mb-4">
            Objective assessment
          </h2>

          <div className="flex flex-col gap-4">
            <TextArea
              label="Observation"
              value={form.observation}
              onChange={(value) =>
                update('observation', value)
              }
              placeholder="Posture, gait, swelling, deformity, movement patterns, etc."
            />

            <TextArea
              label="Palpation"
              value={form.palpation}
              onChange={(value) =>
                update('palpation', value)
              }
              placeholder="Tenderness, temperature, tone, tissue changes, etc."
            />

            <TextArea
              label="Clinical impression"
              value={form.clinical_impression}
              onChange={(value) =>
                update(
                  'clinical_impression',
                  value
                )
              }
              placeholder="Clinical interpretation of your findings."
            />
          </div>
        </section>

        {/* Safety */}
        <section className="rounded-xl p-5 bg-white border border-[#E4E9E8]">
          <h2 className="text-sm font-semibold text-ink mb-4">
            Safety & clinical considerations
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <TextArea
              label="Precautions"
              value={form.precautions}
              onChange={(value) =>
                update('precautions', value)
              }
              placeholder="Precautions to observe during treatment."
            />

            <TextArea
              label="Contraindications"
              value={form.contraindications}
              onChange={(value) =>
                update(
                  'contraindications',
                  value
                )
              }
              placeholder="Any contraindications."
            />
          </div>
        </section>

        {/* Notes */}
        <section className="rounded-xl p-5 bg-white border border-[#E4E9E8]">
          <h2 className="text-sm font-semibold text-ink mb-4">
            Additional notes
          </h2>

          <TextArea
            label="Notes"
            value={form.additional_notes}
            onChange={(value) =>
              update('additional_notes', value)
            }
            placeholder="Any additional clinical information."
          />
        </section>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() =>
              navigate('/therapist/assessments')
            }
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-muted border border-[#E4E9E8] bg-white"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-primary disabled:opacity-60"
          >
            {loading
              ? 'Saving assessment...'
              : 'Save assessment'}
          </button>
        </div>
      </form>
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}) {
  return (
    <div>
      <label className="text-xs mb-1.5 block text-muted">
        {label}
      </label>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        rows={4}
        className="w-full px-3 py-2.5 rounded-lg text-sm border border-[#E4E9E8] resize-y outline-none"
      />
    </div>
  );
}


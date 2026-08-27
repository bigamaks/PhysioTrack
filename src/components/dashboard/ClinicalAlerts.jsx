import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { C } from './colors';
import { supabase } from '../../lib/supabase';

function formatDate(date) {
  if (!date) return '';

  return new Date(`${date}T00:00:00`).toLocaleDateString(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
    }
  );
}

export default function ClinicalAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const {
          data: assessments,
          error: assessmentError,
        } = await supabase
          .from('assessments')
          .select(`
            id,
            patient_id,
            pain_level,
            assessment_date
          `)
          .gte('pain_level', 7)
          .order('assessment_date', {
            ascending: false,
          })
          .limit(5);

        if (assessmentError) {
          console.error(
            'Error fetching clinical alerts:',
            assessmentError
          );
          setLoading(false);
          return;
        }

        const patientIds = [
          ...new Set(
            (assessments || [])
              .map((assessment) => assessment.patient_id)
              .filter(Boolean)
          ),
        ];

        let patients = [];

        if (patientIds.length > 0) {
          const {
            data,
            error: patientError,
          } = await supabase
            .from('patients')
            .select('id, name')
            .in('id', patientIds);

          if (patientError) {
            console.error(
              'Error fetching patients:',
              patientError
            );
          }

          patients = data || [];
        }

        const patientMap = {};

        patients.forEach((patient) => {
          patientMap[patient.id] = patient.name;
        });

        const highPainAlerts = (assessments || []).map(
          (assessment) => ({
            icon: AlertTriangle,
            name:
              patientMap[assessment.patient_id] ||
              'Unknown patient',
            note: `High pain score reported: ${assessment.pain_level}/10`,
            when: formatDate(
              assessment.assessment_date
            ),
            bg: '#FBEAE5',
            color: C.coral,
          })
        );

        setAlerts(highPainAlerts);
      } catch (error) {
        console.error(
          'Error loading clinical alerts:',
          error
        );
      } finally {
        setLoading(false);
      }
    }

    fetchAlerts();
  }, []);

  if (loading) {
    return (
      <div
        className="rounded-xl p-4"
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
        }}
      >
        <p
          className="text-sm"
          style={{
            fontWeight: 500,
            color: C.ink,
          }}
        >
          Clinical alerts
        </p>

        <p
          className="text-xs mt-3"
          style={{ color: C.muted }}
        >
          Loading alerts...
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
      }}
    >
      <p
        className="text-sm mb-3"
        style={{
          fontWeight: 500,
          color: C.ink,
        }}
      >
        Clinical alerts
      </p>

      {alerts.length > 0 ? (
        alerts.map((alert, index) => {
          const Icon = alert.icon;

          return (
            <div
              key={index}
              className="rounded-lg p-3 mb-2 flex items-start gap-2.5"
              style={{ background: alert.bg }}
            >
              <Icon
                size={16}
                color={alert.color}
                strokeWidth={2}
                className="mt-0.5 shrink-0"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p
                    className="text-sm truncate"
                    style={{
                      color: C.ink,
                      fontWeight: 500,
                    }}
                  >
                    {alert.name}
                  </p>

                  <span
                    className="text-xs shrink-0"
                    style={{ color: C.muted }}
                  >
                    {alert.when}
                  </span>
                </div>

                <p
                  className="text-xs mt-0.5"
                  style={{ color: C.muted }}
                >
                  {alert.note}
                </p>
              </div>
            </div>
          );
        })
      ) : (
        <div className="py-6 text-center">
          <p
            className="text-sm"
            style={{ color: C.muted }}
          >
            No clinical alerts right now.
          </p>
        </div>
      )}
    </div>
  );
}
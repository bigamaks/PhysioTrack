import { useEffect, useState } from 'react';
import { C } from './colors';
import { supabase } from '../../lib/supabase';

function getTimeAgo(date) {
  if (!date) return '';

  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

export default function RecentActivity() {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivity() {
      try {
        // Get recent assessments
        const {
          data: assessments,
          error: assessmentError,
        } = await supabase
          .from('assessments')
          .select(`
            id,
            patient_id,
            assessment_date,
            created_at,
            chief_complaint
          `)
          .order('created_at', {
            ascending: false,
          })
          .limit(5);

        if (assessmentError) {
          console.error(
            'Error fetching assessments:',
            assessmentError
          );
        }

        // Get recent exercise assignments
        const {
          data: exercises,
          error: exerciseError,
        } = await supabase
          .from('assigned_exercises')
          .select(`
            id,
            patient_id,
            name,
            target_area,
            created_at
          `)
          .order('created_at', {
            ascending: false,
          })
          .limit(5);

        if (exerciseError) {
          console.error(
            'Error fetching exercises:',
            exerciseError
          );
        }

        // Get recently registered patients
        const {
          data: patients,
          error: patientError,
        } = await supabase
          .from('patients')
          .select(`
            id,
            name,
            condition,
            created_at
          `)
          .order('created_at', {
            ascending: false,
          })
          .limit(5);

        if (patientError) {
          console.error(
            'Error fetching patients:',
            patientError
          );
        }

        // Collect all patient IDs
        const patientIds = [
          ...new Set([
            ...(assessments || []).map(
              (a) => a.patient_id
            ),
            ...(exercises || []).map(
              (e) => e.patient_id
            ),
          ]),
        ].filter(Boolean);

        let patientMap = {};

        if (patientIds.length > 0) {
          const {
            data: patientData,
            error: patientDataError,
          } = await supabase
            .from('patients')
            .select('id, name')
            .in('id', patientIds);

          if (patientDataError) {
            console.error(
              'Error fetching patient names:',
              patientDataError
            );
          }

          (patientData || []).forEach((patient) => {
            patientMap[patient.id] = patient.name;
          });
        }

        const activities = [];

        // Assessment activity
        (assessments || []).forEach((assessment) => {
          activities.push({
            text: `Clinical assessment recorded for ${
              patientMap[assessment.patient_id] ||
              'Unknown patient'
            }`,
            sub:
              assessment.chief_complaint ||
              'Assessment recorded',
            when: getTimeAgo(assessment.created_at),
            timestamp: new Date(
              assessment.created_at
            ).getTime(),
          });
        });

        // Exercise activity
        (exercises || []).forEach((exercise) => {
          activities.push({
            text: `Exercise program updated for ${
              patientMap[exercise.patient_id] ||
              'Unknown patient'
            }`,
            sub:
              exercise.target_area ||
              exercise.name ||
              'Exercise assigned',
            when: getTimeAgo(exercise.created_at),
            timestamp: new Date(
              exercise.created_at
            ).getTime(),
          });
        });

        // Patient registration activity
        (patients || []).forEach((patient) => {
          activities.push({
            text: `New patient registered: ${patient.name}`,
            sub:
              patient.condition ||
              'Patient registered',
            when: getTimeAgo(patient.created_at),
            timestamp: new Date(
              patient.created_at
            ).getTime(),
          });
        });

        // Sort everything by newest first
        activities.sort(
          (a, b) => b.timestamp - a.timestamp
        );

        // Show only the latest 5 activities
        setActivity(activities.slice(0, 5));
      } catch (error) {
        console.error(
          'Error loading recent activity:',
          error
        );
      } finally {
        setLoading(false);
      }
    }

    fetchActivity();
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
          Recent activity
        </p>

        <p
          className="text-xs mt-3"
          style={{ color: C.muted }}
        >
          Loading activity...
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
      <div className="flex items-center justify-between mb-3">
        <p
          className="text-sm"
          style={{
            fontWeight: 500,
            color: C.ink,
          }}
        >
          Recent activity
        </p>

        <span
          className="text-xs"
          style={{ color: C.primaryLight }}
        >
          View all activity
        </span>
      </div>

      {activity.length > 0 ? (
        activity.map((a, i) => (
          <div
            key={`${a.timestamp}-${i}`}
            className="flex items-center justify-between py-2.5"
            style={{
              borderTop:
                i > 0
                  ? `1px solid ${C.border}`
                  : 'none',
            }}
          >
            <div className="min-w-0">
              <p
                className="text-sm truncate"
                style={{
                  color: C.ink,
                  fontWeight: 500,
                }}
              >
                {a.text}
              </p>

              <p
                className="text-xs mt-0.5 truncate"
                style={{ color: C.muted }}
              >
                {a.sub}
              </p>
            </div>

            <span
              className="text-xs shrink-0 ml-4"
              style={{ color: C.muted }}
            >
              {a.when}
            </span>
          </div>
        ))
      ) : (
        <div className="py-6 text-center">
          <p
            className="text-sm"
            style={{ color: C.muted }}
          >
            No recent activity.
          </p>
        </div>
      )}
    </div>
  );
}
import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { C } from './colors';
import { supabase } from '../../lib/supabase';

const chartColors = [
  C.primary,
  C.sage,
  C.accent,
  C.coral,
  C.primaryLight,
];

export default function TreatmentOverview() {
  const [treatments, setTreatments] = useState([]);
  const [activePatients, setActivePatients] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTreatmentOverview() {
      const { data, error } = await supabase
        .from('patients')
        .select('condition, status')
        .eq('status', 'active');

      if (error) {
        console.error(
          'Error fetching treatment overview:',
          error
        );
        setLoading(false);
        return;
      }

      const patients = data || [];

      setActivePatients(patients.length);

      // Count patients by condition
      const conditionCounts = {};

      patients.forEach((patient) => {
        const condition =
          patient.condition?.trim() ||
          'Other';

        conditionCounts[condition] =
          (conditionCounts[condition] || 0) + 1;
      });

      const total = patients.length;

      const treatmentData = Object.entries(
        conditionCounts
      )
        .map(([name, count], index) => ({
          name,
          value:
            total > 0
              ? Math.round((count / total) * 100)
              : 0,
          count,
          color:
            chartColors[index % chartColors.length],
        }))
        .sort((a, b) => b.value - a.value);

      setTreatments(treatmentData);
      setLoading(false);
    }

    fetchTreatmentOverview();
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
          Treatment overview
        </p>

        <p
          className="text-xs mt-3"
          style={{ color: C.muted }}
        >
          Loading treatment data...
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
        Treatment overview
      </p>

      {activePatients > 0 ? (
        <>
          <div
            className="flex items-center justify-center relative"
            style={{ height: 140 }}
          >
            <PieChart width={140} height={140}>
              <Pie
                data={treatments}
                innerRadius={45}
                outerRadius={65}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {treatments.map((treatment) => (
                  <Cell
                    key={treatment.name}
                    fill={treatment.color}
                  />
                ))}
              </Pie>

              <Tooltip
                formatter={(value, name) => [
                  `${value}%`,
                  name,
                ]}
              />
            </PieChart>

            <div className="absolute flex flex-col items-center">
              <span
                style={{
                  fontFamily:
                    "'IBM Plex Mono', monospace",
                  fontWeight: 600,
                  fontSize: 22,
                  color: C.ink,
                }}
              >
                {activePatients}
              </span>

              <span
                className="text-xs"
                style={{ color: C.muted }}
              >
                active
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 mt-3">
            {treatments.map((treatment) => (
              <div
                key={treatment.name}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{
                      background: treatment.color,
                    }}
                  />

                  <span
                    className="truncate"
                    style={{ color: C.ink }}
                  >
                    {treatment.name}
                  </span>
                </div>

                <span
                  className="ml-2 shrink-0"
                  style={{
                    color: C.muted,
                    fontFamily:
                      "'IBM Plex Mono', monospace",
                  }}
                >
                  {treatment.value}%
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="py-10 text-center">
          <p
            className="text-sm"
            style={{ color: C.muted }}
          >
            No active treatments yet.
          </p>
        </div>
      )}
    </div>
  );
}
import { Search, Plus, FileText } from 'lucide-react';

function StatusPill({ status }) {
  const map = {
    Completed: { bg: '#E1F0EA', text: '#1F4E4A' },
    Scheduled: { bg: '#FBEEE0', text: '#9A6423' },
    Overdue: { bg: '#FBEAE5', text: '#D96B54' },
  };
  const s = map[status] || map.Completed;
  return (
    <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: s.bg, color: s.text }}>
      {status}
    </span>
  );
}

const assessments = [
  { patient: 'Chinedu Okafor', type: 'Initial Assessment', measure: 'Oswestry Disability Index', score: '32%', date: 'Jul 28, 2026', status: 'Completed' },
  { patient: 'Adaeze Eze', type: 'Progress Review', measure: 'Knee Injury Outcome Score (KOOS)', score: '68/100', date: 'Jul 29, 2026', status: 'Completed' },
  { patient: 'Emeka Nwosu', type: 'Post-op Review', measure: 'Range of Motion (Flexion)', score: '95\u00b0', date: 'Jul 30, 2026', status: 'Completed' },
  { patient: 'Funmi Adebayo', type: 'Initial Assessment', measure: 'Shoulder Pain and Disability Index', score: '\u2014', date: 'Aug 6, 2026', status: 'Scheduled' },
  { patient: 'Ibrahim Hassan', type: 'Progress Review', measure: 'Lower Extremity Functional Scale', score: '\u2014', date: 'Aug 1, 2026', status: 'Overdue' },
];

export default function Assessments() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-semibold text-2xl text-ink">Assessments</h1>
          <p className="text-sm mt-1 text-muted">Track clinical outcome measures across your patients.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-white font-medium bg-primary">
          <Plus size={16} /> New assessment
        </button>
      </div>

      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#E4E9E8]" style={{ width: 320 }}>
        <Search size={16} className="text-muted" />
        <span className="text-sm text-muted">Search patients or outcome measures...</span>
      </div>

      <div className="rounded-xl overflow-hidden bg-white border border-[#E4E9E8]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E4E9E8]">
              {['Patient', 'Type', 'Outcome measure', 'Score', 'Date', 'Status', ''].map((h, i) => (
                <th key={i} className="text-left px-4 py-3 text-xs text-muted font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {assessments.map((a, i) => (
              <tr key={i} className={i > 0 ? 'border-t border-[#E4E9E8]' : ''}>
                <td className="px-4 py-3 text-ink font-medium">{a.patient}</td>
                <td className="px-4 py-3 text-muted">{a.type}</td>
                <td className="px-4 py-3 text-muted">{a.measure}</td>
                <td className="px-4 py-3 font-mono text-[13px] text-ink">{a.score}</td>
                <td className="px-4 py-3 text-muted font-mono text-[13px]">{a.date}</td>
                <td className="px-4 py-3"><StatusPill status={a.status} /></td>
                <td className="px-4 py-3"><FileText size={16} className="text-muted cursor-pointer" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
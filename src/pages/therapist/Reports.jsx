import { Search, Plus, Download, FileText } from 'lucide-react';

const reports = [
  { patient: 'Chinedu Okafor', type: 'Progress Report', generated: 'Jul 30, 2026', period: 'Jun 12 \u2013 Jul 30' },
  { patient: 'Adaeze Eze', type: 'Discharge Summary', generated: 'Jul 28, 2026', period: 'May 1 \u2013 Jul 28' },
  { patient: 'Emeka Nwosu', type: 'Post-op Recovery Report', generated: 'Jul 25, 2026', period: 'Jun 1 \u2013 Jul 25' },
  { patient: 'Funmi Adebayo', type: 'Initial Assessment Report', generated: 'Jul 20, 2026', period: 'Jul 20, 2026' },
];

export default function Reports() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-semibold text-2xl text-ink">Reports</h1>
          <p className="text-sm mt-1 text-muted">Generate and review patient progress reports.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-white font-medium bg-primary">
          <Plus size={16} /> Generate report
        </button>
      </div>

      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#E4E9E8]" style={{ width: 320 }}>
        <Search size={16} className="text-muted" />
        <span className="text-sm text-muted">Search reports...</span>
      </div>

      <div className="rounded-xl overflow-hidden bg-white border border-[#E4E9E8]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E4E9E8]">
              {['Patient', 'Report type', 'Period covered', 'Generated', ''].map((h, i) => (
                <th key={i} className="text-left px-4 py-3 text-xs text-muted font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reports.map((r, i) => (
              <tr key={i} className={i > 0 ? 'border-t border-[#E4E9E8]' : ''}>
                <td className="px-4 py-3 text-ink font-medium">{r.patient}</td>
                <td className="px-4 py-3 text-muted">
                  <div className="flex items-center gap-2">
                    <FileText size={14} className="text-primary" />
                    {r.type}
                  </div>
                </td>
                <td className="px-4 py-3 text-muted text-[13px]">{r.period}</td>
                <td className="px-4 py-3 text-muted font-mono text-[13px]">{r.generated}</td>
                <td className="px-4 py-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border border-[#E4E9E8]">
                    <Download size={14} className="text-muted" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
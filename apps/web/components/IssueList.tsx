interface Issue { severity: "error" | "warning" | "info"; message: string; }
export default function IssueList({ issues }: { issues: Issue[] }) {
  if (!issues.length) return <div className="bg-[#1F2937] rounded-xl p-4 text-[#14B8A6] text-sm">✓ No issues detected.</div>;
  const colors = { error: "text-red-400 bg-red-400/10", warning: "text-yellow-400 bg-yellow-400/10", info: "text-blue-400 bg-blue-400/10" };
  const icons = { error: "✕", warning: "⚠", info: "ℹ" };
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wide">Issues Detected</h3>
      {issues.map((issue, i) => (
        <div key={i} className={`flex items-start gap-3 px-4 py-3 rounded-lg ${colors[issue.severity]}`}>
          <span className="font-bold">{icons[issue.severity]}</span>
          <span className="text-sm">{issue.message}</span>
        </div>
      ))}
    </div>
  );
}

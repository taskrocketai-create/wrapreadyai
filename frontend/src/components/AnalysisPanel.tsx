import StatusBadge from './StatusBadge'

interface Check {
  label: string
  status: 'ready' | 'warning' | 'error' | 'processing' | 'pending'
  detail: string
}

interface AnalysisPanelProps {
  checks: Check[]
  loading?: boolean
}

export default function AnalysisPanel({ checks, loading = false }: AnalysisPanelProps) {
  return (
    <div className="panel">
      <h3 className="text-brand-text font-bold text-base mb-5">File Analysis</h3>
      <div className="flex flex-col gap-3">
        {checks.map((check, i) => (
          <div key={i} className="check-item">
            <div>
              <p className="text-brand-text font-semibold text-sm mb-1">{check.label}</p>
              <p className="text-brand-subtle text-xs">{check.detail}</p>
            </div>
            <StatusBadge
              status={loading ? 'processing' : check.status}
              label={loading ? 'Scanning…' : check.status.charAt(0).toUpperCase() + check.status.slice(1)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

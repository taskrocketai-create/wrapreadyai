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
    <div style={{
      backgroundColor: '#111827',
      border: '1px solid #1F2937',
      borderRadius: '12px',
      padding: '24px',
    }}>
      <h3 style={{ color: '#E5E7EB', fontWeight: '700', fontSize: '16px', marginBottom: '20px', margin: '0 0 20px 0' }}>
        File Analysis
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {checks.map((check, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            padding: '12px 16px',
            backgroundColor: '#0B0F14',
            borderRadius: '8px',
            border: '1px solid #1F2937',
          }}>
            <div>
              <p style={{ color: '#E5E7EB', fontWeight: '600', fontSize: '14px', margin: '0 0 4px 0' }}>{check.label}</p>
              <p style={{ color: '#6B7280', fontSize: '13px', margin: 0 }}>{check.detail}</p>
            </div>
            <StatusBadge status={loading ? 'processing' : check.status} label={loading ? 'Scanning...' : check.status.charAt(0).toUpperCase() + check.status.slice(1)} />
          </div>
        ))}
      </div>
    </div>
  )
}

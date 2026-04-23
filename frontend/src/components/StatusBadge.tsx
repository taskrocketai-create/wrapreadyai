type Status = 'ready' | 'warning' | 'error' | 'processing' | 'pending'

interface StatusBadgeProps {
  status: Status
  label: string
}

const statusConfig: Record<Status, { bg: string; color: string; dot: string }> = {
  ready: { bg: '#052e16', color: '#4ade80', dot: '#22c55e' },
  warning: { bg: '#451a03', color: '#fb923c', dot: '#f97316' },
  error: { bg: '#450a0a', color: '#f87171', dot: '#ef4444' },
  processing: { bg: '#0c1a2e', color: '#60a5fa', dot: '#3b82f6' },
  pending: { bg: '#1f2937', color: '#9ca3af', dot: '#6b7280' },
}

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const cfg = statusConfig[status]
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '3px 10px',
      borderRadius: '9999px',
      fontSize: '12px',
      fontWeight: '600',
      backgroundColor: cfg.bg,
      color: cfg.color,
    }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: cfg.dot, display: 'inline-block' }} />
      {label}
    </span>
  )
}

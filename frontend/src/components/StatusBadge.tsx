type Status = 'ready' | 'warning' | 'error' | 'processing' | 'pending'

interface StatusBadgeProps {
  status: Status
  label: string
}

const statusConfig: Record<Status, { bg: string; color: string; dot: string }> = {
  ready:      { bg: '#052e16', color: '#4ade80', dot: '#22c55e' },
  warning:    { bg: '#451a03', color: '#fb923c', dot: '#f97316' },
  error:      { bg: '#450a0a', color: '#f87171', dot: '#ef4444' },
  processing: { bg: '#0c1a2e', color: '#60a5fa', dot: '#3b82f6' },
  pending:    { bg: '#1f2937', color: '#9ca3af', dot: '#6b7280' },
}

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const { bg, color, dot } = statusConfig[status]
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ backgroundColor: bg, color }}
    >
      <span className="w-1.5 h-1.5 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: dot }} />
      {label}
    </span>
  )
}

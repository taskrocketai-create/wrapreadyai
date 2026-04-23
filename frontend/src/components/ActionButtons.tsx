import React from 'react'

interface ActionButtonsProps {
  onApprove?: () => void
  onReject?: () => void
  onDownload?: () => void
  onReprocess?: () => void
  showApproval?: boolean
}

export default function ActionButtons({
  onApprove,
  onReject,
  onDownload,
  onReprocess,
  showApproval = false,
}: ActionButtonsProps) {
  const btnBase: React.CSSProperties = {
    padding: '10px 20px',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.15s',
  }

  return (
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
      {showApproval && (
        <>
          <button onClick={onApprove} style={{ ...btnBase, backgroundColor: '#14B8A6', color: '#0B0F14' }}>
            ✓ Approve
          </button>
          <button onClick={onReject} style={{ ...btnBase, backgroundColor: '#1F2937', color: '#F87171', border: '1px solid #374151' }}>
            ✗ Reject
          </button>
        </>
      )}
      {onDownload && (
        <button onClick={onDownload} style={{ ...btnBase, backgroundColor: '#1F2937', color: '#E5E7EB', border: '1px solid #374151' }}>
          ↓ Download
        </button>
      )}
      {onReprocess && (
        <button onClick={onReprocess} style={{ ...btnBase, backgroundColor: 'transparent', color: '#9CA3AF', border: '1px solid #374151' }}>
          ↺ Reprocess
        </button>
      )}
    </div>
  )
}

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
  return (
    <div className="flex gap-2.5 flex-wrap">
      {showApproval && (
        <>
          <button
            onClick={onApprove}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold cursor-pointer border-none transition-all duration-150 bg-teal text-brand-bg hover:bg-teal-dark"
          >
            ✓ Approve
          </button>
          <button
            onClick={onReject}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-150 bg-brand-surface text-red-400 border border-brand-muted hover:border-red-500"
          >
            ✗ Reject
          </button>
        </>
      )}
      {onDownload && (
        <button
          onClick={onDownload}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-150 bg-brand-surface text-brand-text border border-brand-muted hover:border-teal"
        >
          ↓ Download
        </button>
      )}
      {onReprocess && (
        <button
          onClick={onReprocess}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-150 bg-transparent text-brand-secondary border border-brand-muted hover:border-teal hover:text-brand-text"
        >
          ↺ Reprocess
        </button>
      )}
    </div>
  )
}

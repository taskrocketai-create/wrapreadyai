import { useState, useEffect, useCallback } from 'react'
import StatusBadge from '../components/StatusBadge'
import ActionButtons from '../components/ActionButtons'
import { getReviewQueue, approveJob, rejectJob, downloadJobFile, timeAgo, type Job } from '../api'

export default function ReviewDashboard() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)

  const fetchQueue = useCallback(() => {
    setLoading(true)
    getReviewQueue()
      .then(data => { setJobs(data); setLoading(false) })
      .catch(() => { setError('Failed to load review queue.'); setLoading(false) })
  }, [])

  useEffect(() => { fetchQueue() }, [fetchQueue])

  const handleApprove = async (id: string) => {
    await approveJob(id)
    setJobs(prev => prev.filter(j => j.id !== id))
    if (selected === id) setSelected(null)
  }

  const handleReject = async (id: string) => {
    await rejectJob(id)
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status: 'error' as const } : j))
  }

  const selectedJob = jobs.find(j => j.id === selected)
  const issueCount  = (job: Job) => job.checks.filter(c => c.status === 'error' || c.status === 'warning').length

  if (loading) {
    return (
      <div className="page-wide text-center mt-20">
        <div className="w-10 h-10 border-[3px] border-brand-border border-t-teal rounded-full animate-spin mx-auto" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-narrow text-center mt-20">
        <p className="text-red-400 text-base mb-6">{error}</p>
        <button onClick={fetchQueue} className="btn-primary">Retry</button>
      </div>
    )
  }

  return (
    <div className="page-wide">
      {/* Page header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="page-title">Review Queue</h1>
          <p className="page-subtitle">
            {jobs.length} job{jobs.length !== 1 ? 's' : ''} waiting for approval
          </p>
        </div>
        <div className="flex gap-2">
          <StatusBadge status="ready"   label={`${jobs.filter(j => j.status === 'ready').length} Ready`} />
          <StatusBadge status="warning" label={`${jobs.filter(j => j.status === 'warning').length} Warning`} />
          <StatusBadge status="error"   label={`${jobs.filter(j => j.status === 'error').length} Error`} />
        </div>
      </div>

      <div
        className="grid gap-6"
        style={{ gridTemplateColumns: selected ? '1fr 380px' : '1fr' }}
      >
        {/* Job list */}
        <div className="flex flex-col gap-2">
          {jobs.map(job => {
            const issues     = issueCount(job)
            const isSelected = selected === job.id
            return (
              <div
                key={job.id}
                onClick={() => setSelected(job.id === selected ? null : job.id)}
                className="rounded-[10px] px-5 py-4 cursor-pointer transition-all duration-150 grid gap-4 items-center"
                style={{
                  backgroundColor: isSelected ? '#0F2027' : '#111827',
                  border: `1px solid ${isSelected ? '#14B8A6' : '#1F2937'}`,
                  gridTemplateColumns: '1fr auto',
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-brand-bg flex items-center justify-center text-lg flex-shrink-0">
                    🚗
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-brand-text font-semibold text-sm">{job.filename}</span>
                      <span className="text-brand-subtle text-xs">— {job.id}</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-brand-secondary text-xs">{job.vehicle_type}</span>
                      <span className="text-brand-subtle text-xs">·</span>
                      <span className="text-brand-secondary text-xs">{job.print_width}</span>
                      <span className="text-brand-subtle text-xs">·</span>
                      <span className="text-brand-subtle text-xs">{timeAgo(job.updated_at)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {issues > 0 && (
                    <span className="text-red-400 text-xs font-semibold">
                      {issues} issue{issues !== 1 ? 's' : ''}
                    </span>
                  )}
                  <StatusBadge status={job.status} label={job.status.charAt(0).toUpperCase() + job.status.slice(1)} />
                </div>
              </div>
            )
          })}

          {jobs.length === 0 && (
            <div className="text-center py-20 text-brand-subtle">
              <div className="text-5xl mb-4">✓</div>
              <p className="text-base font-semibold text-brand-secondary mb-2">Queue cleared</p>
              <p className="text-sm">All jobs have been processed</p>
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selectedJob && (
          <div className="panel h-fit">
            <h3 className="text-brand-text font-bold text-base mb-5">Job Detail</h3>

            <div className="flex flex-col mb-5">
              {([
                ['Job ID',      selectedJob.id],
                ['File',        selectedJob.filename],
                ['Vehicle',     selectedJob.vehicle_type],
                ['Print Width', selectedJob.print_width],
                ['File Size',   `${selectedJob.file_size_mb} MB`],
                ['Submitted',   timeAgo(selectedJob.created_at)],
                ['Issues',      String(issueCount(selectedJob))],
              ] as [string, string][]).map(([key, value]) => (
                <div key={key} className="data-row">
                  <span className="data-key">{key}</span>
                  <span className="data-val">{value}</span>
                </div>
              ))}
            </div>

            {selectedJob.checks.length > 0 && (
              <div className="mb-5">
                <p className="section-label">Checks</p>
                <div className="flex flex-col gap-1.5">
                  {selectedJob.checks.map(c => (
                    <div key={c.label} className="flex justify-between items-center">
                      <span className="text-brand-secondary text-xs">{c.label}</span>
                      <StatusBadge status={c.status} label={c.status.charAt(0).toUpperCase() + c.status.slice(1)} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4">
              <StatusBadge
                status={selectedJob.status}
                label={
                  selectedJob.status === 'ready'   ? 'Print Ready' :
                  selectedJob.status === 'warning' ? 'Review Required' :
                  selectedJob.status === 'error'   ? 'Blocked — Fix Issues' : 'Pending'
                }
              />
            </div>

            {selectedJob.status === 'error' && (
              <div
                className="rounded-lg p-3 mb-4"
                style={{ backgroundColor: '#1a0505', border: '1px solid #7f1d1d' }}
              >
                <p className="text-red-400 text-xs font-semibold mb-1">This file won't print correctly.</p>
                <p className="text-brand-secondary text-xs">Resolve all critical issues before approving.</p>
              </div>
            )}

            <ActionButtons
              onApprove={() => handleApprove(selectedJob.id)}
              onReject={() => handleReject(selectedJob.id)}
              onDownload={() => downloadJobFile(selectedJob.id)}
              showApproval={true}
            />
          </div>
        )}
      </div>
    </div>
  )
}

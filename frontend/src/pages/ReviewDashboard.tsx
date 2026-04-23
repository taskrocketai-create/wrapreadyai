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
      .then(data => {
        setJobs(data)
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load review queue.')
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    fetchQueue()
  }, [fetchQueue])

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

  if (loading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #1F2937', borderTop: '3px solid #14B8A6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ maxWidth: '680px', margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <p style={{ color: '#F87171', fontSize: '16px', marginBottom: '24px' }}>{error}</p>
        <button
          onClick={fetchQueue}
          style={{ padding: '12px 24px', backgroundColor: '#14B8A6', border: 'none', color: '#0B0F14', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
        >
          Retry
        </button>
      </div>
    )
  }

  const issueCount = (job: Job) =>
    job.checks.filter(c => c.status === 'error' || c.status === 'warning').length

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ color: '#E5E7EB', fontWeight: '800', fontSize: '28px', margin: '0 0 8px 0' }}>
            Review Queue
          </h1>
          <p style={{ color: '#6B7280', fontSize: '15px', margin: 0 }}>
            {jobs.length} job{jobs.length !== 1 ? 's' : ''} waiting for approval
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <StatusBadge status="ready" label={`${jobs.filter(j => j.status === 'ready').length} Ready`} />
          <StatusBadge status="warning" label={`${jobs.filter(j => j.status === 'warning').length} Warning`} />
          <StatusBadge status="error" label={`${jobs.filter(j => j.status === 'error').length} Error`} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: '24px' }}>
        {/* Job list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {jobs.map(job => {
            const issues = issueCount(job)
            return (
              <div
                key={job.id}
                onClick={() => setSelected(job.id === selected ? null : job.id)}
                style={{
                  backgroundColor: selected === job.id ? '#0F2027' : '#111827',
                  border: `1px solid ${selected === job.id ? '#14B8A6' : '#1F2937'}`,
                  borderRadius: '10px',
                  padding: '16px 20px',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: '16px',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    backgroundColor: '#0B0F14',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    flexShrink: 0,
                  }}>
                    🚗
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ color: '#E5E7EB', fontWeight: '600', fontSize: '14px' }}>{job.filename}</span>
                      <span style={{ color: '#6B7280', fontSize: '12px' }}>— {job.id}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <span style={{ color: '#9CA3AF', fontSize: '13px' }}>{job.vehicle_type}</span>
                      <span style={{ color: '#6B7280', fontSize: '13px' }}>·</span>
                      <span style={{ color: '#9CA3AF', fontSize: '13px' }}>{job.print_width}</span>
                      <span style={{ color: '#6B7280', fontSize: '13px' }}>·</span>
                      <span style={{ color: '#6B7280', fontSize: '13px' }}>{timeAgo(job.updated_at)}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {issues > 0 && (
                    <span style={{ color: '#F87171', fontSize: '12px', fontWeight: '600' }}>{issues} issue{issues !== 1 ? 's' : ''}</span>
                  )}
                  <StatusBadge status={job.status} label={job.status.charAt(0).toUpperCase() + job.status.slice(1)} />
                </div>
              </div>
            )
          })}

          {jobs.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 40px', color: '#6B7280' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✓</div>
              <p style={{ fontSize: '16px', fontWeight: '600', color: '#9CA3AF', margin: '0 0 8px 0' }}>Queue cleared</p>
              <p style={{ fontSize: '14px', margin: 0 }}>All jobs have been processed</p>
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selectedJob && (
          <div style={{ backgroundColor: '#111827', border: '1px solid #1F2937', borderRadius: '12px', padding: '24px', height: 'fit-content' }}>
            <h3 style={{ color: '#E5E7EB', fontWeight: '700', fontSize: '16px', margin: '0 0 20px 0' }}>Job Detail</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {([
                ['Job ID', selectedJob.id],
                ['File', selectedJob.filename],
                ['Vehicle', selectedJob.vehicle_type],
                ['Print Width', selectedJob.print_width],
                ['File Size', `${selectedJob.file_size_mb} MB`],
                ['Submitted', timeAgo(selectedJob.created_at)],
                ['Issues', String(issueCount(selectedJob))],
              ] as [string, string][]).map(([key, value]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1F2937' }}>
                  <span style={{ color: '#6B7280', fontSize: '13px' }}>{key}</span>
                  <span style={{ color: '#E5E7EB', fontSize: '13px', fontWeight: '500' }}>{value}</span>
                </div>
              ))}
            </div>

            {selectedJob.checks.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <p style={{ color: '#9CA3AF', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px 0' }}>Checks</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {selectedJob.checks.map(c => (
                    <div key={c.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#9CA3AF', fontSize: '12px' }}>{c.label}</span>
                      <StatusBadge status={c.status} label={c.status.charAt(0).toUpperCase() + c.status.slice(1)} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <StatusBadge status={selectedJob.status} label={
                selectedJob.status === 'ready' ? 'Print Ready' :
                selectedJob.status === 'warning' ? 'Review Required' :
                selectedJob.status === 'error' ? 'Blocked — Fix Issues' : 'Pending'
              } />
            </div>

            {selectedJob.status === 'error' && (
              <div style={{ backgroundColor: '#1a0505', border: '1px solid #7f1d1d', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px' }}>
                <p style={{ color: '#F87171', fontSize: '13px', fontWeight: '600', margin: '0 0 4px 0' }}>This file won't print correctly.</p>
                <p style={{ color: '#9CA3AF', fontSize: '12px', margin: 0 }}>Resolve all critical issues before approving.</p>
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


import { useState } from 'react'
import StatusBadge from '../components/StatusBadge'
import ActionButtons from '../components/ActionButtons'

interface Job {
  id: string
  filename: string
  client: string
  vehicle: string
  submitted: string
  status: 'ready' | 'warning' | 'error' | 'pending'
  issues: number
}

const MOCK_JOBS: Job[] = [
  { id: 'JOB-001', filename: 'dodge_ram_fullwrap.ai', client: 'FastLane Motors', vehicle: 'Full Wrap', submitted: '2 min ago', status: 'ready', issues: 0 },
  { id: 'JOB-002', filename: 'sprinter_partial.eps', client: 'Urban Freight Co.', vehicle: 'Partial Wrap', submitted: '18 min ago', status: 'warning', issues: 2 },
  { id: 'JOB-003', filename: 'trailer_side_panel.pdf', client: 'Apex Logistics', vehicle: 'Trailer Side', submitted: '1 hr ago', status: 'error', issues: 5 },
  { id: 'JOB-004', filename: 'food_truck_hood.png', client: 'Bites on Wheels', vehicle: 'Hood Only', submitted: '3 hr ago', status: 'ready', issues: 0 },
  { id: 'JOB-005', filename: 'cargo_van_roof.tiff', client: 'City Couriers', vehicle: 'Roof Only', submitted: '5 hr ago', status: 'pending', issues: 0 },
]

export default function ReviewDashboard() {
  const [jobs, setJobs] = useState(MOCK_JOBS)
  const [selected, setSelected] = useState<string | null>(null)

  const handleApprove = (id: string) => {
    setJobs(prev => prev.filter(j => j.id !== id))
    if (selected === id) setSelected(null)
  }

  const handleReject = (id: string) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status: 'error' as const } : j))
  }

  const selectedJob = jobs.find(j => j.id === selected)

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
          {jobs.map(job => (
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
                    <span style={{ color: '#9CA3AF', fontSize: '13px' }}>{job.client}</span>
                    <span style={{ color: '#6B7280', fontSize: '13px' }}>·</span>
                    <span style={{ color: '#9CA3AF', fontSize: '13px' }}>{job.vehicle}</span>
                    <span style={{ color: '#6B7280', fontSize: '13px' }}>·</span>
                    <span style={{ color: '#6B7280', fontSize: '13px' }}>{job.submitted}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {job.issues > 0 && (
                  <span style={{ color: '#F87171', fontSize: '12px', fontWeight: '600' }}>{job.issues} issue{job.issues !== 1 ? 's' : ''}</span>
                )}
                <StatusBadge status={job.status} label={job.status.charAt(0).toUpperCase() + job.status.slice(1)} />
              </div>
            </div>
          ))}

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
              {[
                ['Job ID', selectedJob.id],
                ['File', selectedJob.filename],
                ['Client', selectedJob.client],
                ['Vehicle', selectedJob.vehicle],
                ['Submitted', selectedJob.submitted],
                ['Issues', selectedJob.issues.toString()],
              ].map(([key, value]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1F2937' }}>
                  <span style={{ color: '#6B7280', fontSize: '13px' }}>{key}</span>
                  <span style={{ color: '#E5E7EB', fontSize: '13px', fontWeight: '500' }}>{value}</span>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <StatusBadge status={selectedJob.status} label={
                selectedJob.status === 'ready' ? 'Print Ready' :
                selectedJob.status === 'warning' ? 'Review Required' :
                selectedJob.status === 'error' ? 'Blocked — Fix Issues' : 'Pending'
              } />
            </div>

            {selectedJob.status === 'error' && (
              <div style={{ backgroundColor: '#1a0505', border: '1px solid #7f1d1d', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px' }}>
                <p style={{ color: '#F87171', fontSize: '13px', fontWeight: '600', margin: '0 0 4px 0' }}>This file won't print correctly.</p>
                <p style={{ color: '#9CA3AF', fontSize: '12px', margin: 0 }}>5 critical issues must be resolved before approval.</p>
              </div>
            )}

            <ActionButtons
              onApprove={() => handleApprove(selectedJob.id)}
              onReject={() => handleReject(selectedJob.id)}
              onDownload={() => {}}
              showApproval={true}
            />
          </div>
        )}
      </div>
    </div>
  )
}

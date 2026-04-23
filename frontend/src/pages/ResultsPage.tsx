import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BeforeAfterSlider from '../components/BeforeAfterSlider'
import ActionButtons from '../components/ActionButtons'
import StatusBadge from '../components/StatusBadge'
import { getJob, downloadJobFile, type Job } from '../api'

export default function ResultsPage() {
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const jobId = sessionStorage.getItem('job_id')
    if (!jobId) {
      navigate('/upload')
      return
    }
    getJob(jobId)
      .then(data => {
        setJob(data)
        setLoading(false)
      })
      .catch(() => {
        setError('Could not load results. Please re-upload your file.')
        setLoading(false)
      })
  }, [navigate])

  if (loading) {
    return (
      <div style={{ maxWidth: '1100px', margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #1F2937', borderTop: '3px solid #14B8A6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div style={{ maxWidth: '680px', margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <p style={{ color: '#F87171', fontSize: '16px', marginBottom: '24px' }}>{error ?? 'No results found.'}</p>
        <button
          onClick={() => navigate('/upload')}
          style={{ padding: '12px 24px', backgroundColor: '#14B8A6', border: 'none', color: '#0B0F14', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
        >
          Back to Upload
        </button>
      </div>
    )
  }

  const allReady = job.checks.every(c => c.status === 'ready')
  const issueCount = job.checks.filter(c => c.status === 'error' || c.status === 'warning').length

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ color: '#E5E7EB', fontWeight: '800', fontSize: '28px', margin: '0 0 8px 0' }}>
            Results
          </h1>
          <p style={{ color: '#6B7280', fontSize: '15px', margin: 0 }}>
            {allReady
              ? 'All issues fixed. File is print-ready.'
              : `${issueCount} issue${issueCount !== 1 ? 's' : ''} detected. Review before printing.`}
          </p>
        </div>
        <StatusBadge
          status={job.status === 'ready' ? 'ready' : job.status === 'warning' ? 'warning' : 'error'}
          label={job.status === 'ready' ? 'Print Ready' : job.status === 'warning' ? 'Review Required' : 'Blocked'}
        />
      </div>

      <div style={{ backgroundColor: '#111827', border: '1px solid #1F2937', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ color: '#9CA3AF', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 16px 0' }}>
          Before / After
        </h3>
        <BeforeAfterSlider beforeLabel="Original (Source)" afterLabel="Output (Processed)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#111827', border: '1px solid #1F2937', borderRadius: '12px', padding: '24px' }}>
          <h3 style={{ color: '#E5E7EB', fontWeight: '700', fontSize: '16px', margin: '0 0 16px 0' }}>Check Results</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {job.checks.map((check) => (
              <div key={check.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: '#0B0F14', borderRadius: '6px' }}>
                <div>
                  <p style={{ color: '#E5E7EB', fontWeight: '600', fontSize: '13px', margin: '0 0 2px 0' }}>{check.label}</p>
                  <p style={{ color: '#6B7280', fontSize: '12px', margin: 0 }}>{check.detail}</p>
                </div>
                <StatusBadge
                  status={check.status}
                  label={check.status === 'ready' ? 'Passed' : check.status === 'warning' ? 'Warning' : 'Error'}
                />
              </div>
            ))}
          </div>
        </div>

        <div style={{ backgroundColor: '#111827', border: '1px solid #1F2937', borderRadius: '12px', padding: '24px' }}>
          <h3 style={{ color: '#E5E7EB', fontWeight: '700', fontSize: '16px', margin: '0 0 16px 0' }}>Output File</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              ['Filename', job.filename],
              ['Vehicle', job.vehicle_type],
              ['Print Width', job.print_width],
              ['File Size', `${job.file_size_mb} MB`],
              ['Job ID', job.id],
              ['Status', job.status.charAt(0).toUpperCase() + job.status.slice(1)],
            ].map(([key, value]) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1F2937' }}>
                <span style={{ color: '#6B7280', fontSize: '13px' }}>{key}</span>
                <span style={{ color: '#E5E7EB', fontSize: '13px', fontWeight: '500' }}>{value}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '20px' }}>
            <button
              onClick={() => downloadJobFile(job.id)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#14B8A6',
                border: 'none',
                borderRadius: '8px',
                color: '#0B0F14',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              ↓ Download File
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <ActionButtons
          onReprocess={() => navigate('/analysis')}
          showApproval={false}
        />
        <button
          onClick={() => navigate('/review')}
          style={{ padding: '12px 24px', backgroundColor: 'transparent', border: '1px solid #374151', color: '#9CA3AF', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}
        >
          Send for Review →
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}


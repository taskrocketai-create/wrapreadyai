import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AnalysisPanel from '../components/AnalysisPanel'
import StatusBadge from '../components/StatusBadge'
import { analyzeJob, type CheckResult, type Job } from '../api'

export default function AnalysisPage() {
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [job, setJob] = useState<Job | null>(null)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const jobId = sessionStorage.getItem('job_id')
    if (!jobId) {
      navigate('/upload')
      return
    }

    // Animate progress bar up to 90% while waiting for the API
    const interval = setInterval(() => {
      setProgress(p => (p < 90 ? p + 2 : p))
    }, 120)

    analyzeJob(jobId)
      .then(result => {
        clearInterval(interval)
        setProgress(100)
        setJob(result)
        setLoading(false)
      })
      .catch(() => {
        clearInterval(interval)
        setError('Analysis failed. Please try uploading your file again.')
        setLoading(false)
      })

    return () => clearInterval(interval)
  }, [navigate])

  const checks: CheckResult[] = job?.checks ?? []
  const issueCount = checks.filter(c => c.status === 'error' || c.status === 'warning').length
  const overallStatus = job?.status ?? 'pending'

  if (error) {
    return (
      <div style={{ maxWidth: '680px', margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <p style={{ color: '#F87171', fontSize: '16px', marginBottom: '24px' }}>{error}</p>
        <button
          onClick={() => navigate('/upload')}
          style={{ padding: '12px 24px', backgroundColor: '#14B8A6', border: 'none', color: '#0B0F14', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
        >
          Back to Upload
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ color: '#E5E7EB', fontWeight: '800', fontSize: '28px', margin: '0 0 8px 0' }}>
            {loading ? 'Analyzing file...' : 'Analysis complete'}
          </h1>
          <p style={{ color: '#6B7280', fontSize: '15px', margin: 0 }}>
            {loading
              ? 'Checking resolution, color mode, bleed, and embedded elements.'
              : issueCount > 0
                ? `${issueCount} issue${issueCount !== 1 ? 's' : ''} found. Fix them before sending to print.`
                : 'All checks passed. File is print-ready.'}
          </p>
        </div>
        {!loading && job && (
          <StatusBadge
            status={overallStatus === 'warning' ? 'warning' : overallStatus === 'error' ? 'error' : 'ready'}
            label={overallStatus === 'warning' ? 'Action Required' : overallStatus === 'error' ? 'Blocked' : 'Print Ready'}
          />
        )}
      </div>

      {loading && (
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#9CA3AF', fontSize: '13px' }}>Processing...</span>
            <span style={{ color: '#14B8A6', fontSize: '13px', fontWeight: '600' }}>{progress}%</span>
          </div>
          <div style={{ height: '4px', backgroundColor: '#1F2937', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ height: '100%', backgroundColor: '#14B8A6', width: `${progress}%`, transition: 'width 0.1s linear', borderRadius: '2px' }} />
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Left: file info */}
        <div style={{ backgroundColor: '#111827', border: '1px solid #1F2937', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #1F2937', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#9CA3AF', fontSize: '13px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Original</span>
            <StatusBadge status="pending" label="Source File" />
          </div>
          <div style={{ height: '360px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0B0F14' }}>
            <div style={{ textAlign: 'center', opacity: 0.3 }}>
              <div style={{ fontSize: '64px', marginBottom: '12px' }}>🖼</div>
              <p style={{ color: '#9CA3AF', fontSize: '14px', margin: 0 }}>{job?.filename ?? '—'}</p>
              <p style={{ color: '#6B7280', fontSize: '13px', margin: '4px 0 0 0' }}>{job ? `${job.file_size_mb} MB` : ''}</p>
            </div>
          </div>
        </div>

        {/* Right: output preview */}
        <div style={{ backgroundColor: '#111827', border: '1px solid #1F2937', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #1F2937', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#9CA3AF', fontSize: '13px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Output Preview</span>
            <StatusBadge
              status={loading ? 'processing' : overallStatus === 'warning' ? 'warning' : overallStatus === 'error' ? 'error' : 'ready'}
              label={loading ? 'Processing' : overallStatus === 'warning' ? 'Needs Review' : overallStatus === 'error' ? 'Blocked' : 'Ready'}
            />
          </div>
          <div style={{ height: '360px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0B0F14' }}>
            {loading ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', border: '3px solid #1F2937', borderTop: '3px solid #14B8A6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>Building output...</p>
              </div>
            ) : (
              <div style={{ textAlign: 'center', opacity: 0.4 }}>
                <div style={{ fontSize: '64px', marginBottom: '12px' }}>✨</div>
                <p style={{ color: '#9CA3AF', fontSize: '14px', margin: 0 }}>Processed output ready</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '24px' }}>
        <AnalysisPanel checks={checks} loading={loading} />
      </div>

      {!loading && (
        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            onClick={() => navigate('/upload')}
            style={{ padding: '12px 24px', backgroundColor: 'transparent', border: '1px solid #374151', color: '#9CA3AF', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}
          >
            Upload Different File
          </button>
          <button
            onClick={() => navigate('/results')}
            style={{ padding: '12px 24px', backgroundColor: '#14B8A6', border: 'none', color: '#0B0F14', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
          >
            View Results →
          </button>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}


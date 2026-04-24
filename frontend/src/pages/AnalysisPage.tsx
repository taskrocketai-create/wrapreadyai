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
    if (!jobId) { navigate('/upload'); return }

    const interval = setInterval(() => setProgress(p => p < 90 ? p + 2 : p), 120)

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
      <div className="page-narrow text-center mt-20">
        <p className="text-red-400 text-base mb-6">{error}</p>
        <button onClick={() => navigate('/upload')} className="btn-primary">
          Back to Upload
        </button>
      </div>
    )
  }

  return (
    <div className="page">
      {/* Page header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="page-title">
            {loading ? 'Analyzing file…' : 'Analysis complete'}
          </h1>
          <p className="page-subtitle">
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

      {/* Progress bar */}
      {loading && (
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-brand-secondary text-xs">Processing…</span>
            <span className="text-teal text-xs font-semibold">{progress}%</span>
          </div>
          <div className="h-1 bg-brand-border rounded-full overflow-hidden">
            <div
              className="h-full bg-teal rounded-full transition-[width] duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Before / After preview */}
      <div className="grid grid-cols-2 gap-6">
        {/* Original */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-brand-border flex justify-between items-center">
            <span className="section-label mb-0">Original</span>
            <StatusBadge status="pending" label="Source File" />
          </div>
          <div className="h-[360px] flex items-center justify-center bg-brand-bg">
            <div className="text-center opacity-30">
              <div className="text-6xl mb-3">🖼</div>
              <p className="text-brand-secondary text-sm">{job?.filename ?? '—'}</p>
              <p className="text-brand-subtle text-xs mt-1">{job ? `${job.file_size_mb} MB` : ''}</p>
            </div>
          </div>
        </div>

        {/* Output */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-brand-border flex justify-between items-center">
            <span className="section-label mb-0">Output Preview</span>
            <StatusBadge
              status={loading ? 'processing' : overallStatus === 'warning' ? 'warning' : overallStatus === 'error' ? 'error' : 'ready'}
              label={loading ? 'Processing' : overallStatus === 'warning' ? 'Needs Review' : overallStatus === 'error' ? 'Blocked' : 'Ready'}
            />
          </div>
          <div className="h-[360px] flex items-center justify-center bg-brand-bg">
            {loading ? (
              <div className="text-center">
                <div className="w-12 h-12 border-[3px] border-brand-border border-t-teal rounded-full animate-spin mx-auto mb-4" />
                <p className="text-brand-subtle text-sm">Building output…</p>
              </div>
            ) : (
              <div className="text-center opacity-40">
                <div className="text-6xl mb-3">✨</div>
                <p className="text-brand-secondary text-sm">Processed output ready</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <AnalysisPanel checks={checks} loading={loading} />
      </div>

      {!loading && (
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={() => navigate('/upload')} className="btn-ghost">
            Upload Different File
          </button>
          <button onClick={() => navigate('/results')} className="btn-primary">
            View Results →
          </button>
        </div>
      )}
    </div>
  )
}

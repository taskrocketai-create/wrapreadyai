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
    if (!jobId) { navigate('/upload'); return }
    getJob(jobId)
      .then(data => { setJob(data); setLoading(false) })
      .catch(() => { setError('Could not load results. Please re-upload your file.'); setLoading(false) })
  }, [navigate])

  if (loading) {
    return (
      <div className="page text-center mt-20">
        <div className="w-10 h-10 border-[3px] border-brand-border border-t-teal rounded-full animate-spin mx-auto" />
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="page-narrow text-center mt-20">
        <p className="text-red-400 text-base mb-6">{error ?? 'No results found.'}</p>
        <button onClick={() => navigate('/upload')} className="btn-primary">
          Back to Upload
        </button>
      </div>
    )
  }

  const allReady  = job.checks.every(c => c.status === 'ready')
  const issueCount = job.checks.filter(c => c.status === 'error' || c.status === 'warning').length

  return (
    <div className="page">
      {/* Page header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="page-title">Results</h1>
          <p className="page-subtitle">
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

      {/* Before / After slider */}
      <div className="panel mb-6">
        <h3 className="section-label">Before / After</h3>
        <BeforeAfterSlider beforeLabel="Original (Source)" afterLabel="Output (Processed)" />
      </div>

      {/* Check results + output file info */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="panel">
          <h3 className="text-brand-text font-bold text-base mb-4">Check Results</h3>
          <div className="flex flex-col gap-2.5">
            {job.checks.map(check => (
              <div key={check.label} className="flex justify-between items-center px-3.5 py-2.5 bg-brand-bg rounded-md">
                <div>
                  <p className="text-brand-text font-semibold text-xs mb-0.5">{check.label}</p>
                  <p className="text-brand-subtle text-xs">{check.detail}</p>
                </div>
                <StatusBadge
                  status={check.status}
                  label={check.status === 'ready' ? 'Passed' : check.status === 'warning' ? 'Warning' : 'Error'}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <h3 className="text-brand-text font-bold text-base mb-4">Output File</h3>
          <div className="flex flex-col">
            {([
              ['Filename',    job.filename],
              ['Vehicle',     job.vehicle_type],
              ['Print Width', job.print_width],
              ['File Size',   `${job.file_size_mb} MB`],
              ['Job ID',      job.id],
              ['Status',      job.status.charAt(0).toUpperCase() + job.status.slice(1)],
            ] as [string, string][]).map(([key, value]) => (
              <div key={key} className="data-row">
                <span className="data-key">{key}</span>
                <span className="data-val">{value}</span>
              </div>
            ))}
          </div>
          <div className="mt-5">
            <button
              onClick={() => downloadJobFile(job.id)}
              className="w-full py-3 bg-teal text-brand-bg font-bold text-sm rounded-lg cursor-pointer border-none hover:bg-teal-dark transition-colors duration-150"
            >
              ↓ Download File
            </button>
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex justify-between items-center">
        <ActionButtons onReprocess={() => navigate('/analysis')} showApproval={false} />
        <button onClick={() => navigate('/review')} className="btn-ghost">
          Send for Review →
        </button>
      </div>
    </div>
  )
}

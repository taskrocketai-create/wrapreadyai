import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AnalysisPanel from '../components/AnalysisPanel'
import StatusBadge from '../components/StatusBadge'

const CHECKS = [
  { label: 'Resolution', status: 'ready' as const, detail: '300 DPI — within print spec' },
  { label: 'Color Mode', status: 'warning' as const, detail: 'RGB detected — converting to CMYK' },
  { label: 'Embedded Text', status: 'error' as const, detail: '3 text layers found — needs outlining' },
  { label: 'Bleed Area', status: 'ready' as const, detail: '0.125" bleed detected on all sides' },
  { label: 'Vector Elements', status: 'ready' as const, detail: 'All logos and icons are vectorized' },
  { label: 'File Integrity', status: 'ready' as const, detail: 'No corruption detected' },
]

export default function AnalysisPage() {
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval)
          setLoading(false)
          return 100
        }
        return p + 4
      })
    }, 120)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ color: '#E5E7EB', fontWeight: '800', fontSize: '28px', margin: '0 0 8px 0' }}>
            {loading ? 'Analyzing file...' : 'Analysis complete'}
          </h1>
          <p style={{ color: '#6B7280', fontSize: '15px', margin: 0 }}>
            {loading ? 'Checking resolution, color mode, bleed, and embedded elements.' : '2 issues found. Fix them before sending to print.'}
          </p>
        </div>
        {!loading && (
          <StatusBadge status="warning" label="Action Required" />
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
        {/* Left: file preview */}
        <div style={{ backgroundColor: '#111827', border: '1px solid #1F2937', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #1F2937', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#9CA3AF', fontSize: '13px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Original</span>
            <StatusBadge status="pending" label="Source File" />
          </div>
          <div style={{ height: '360px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0B0F14' }}>
            <div style={{ textAlign: 'center', opacity: 0.3 }}>
              <div style={{ fontSize: '64px', marginBottom: '12px' }}>🖼</div>
              <p style={{ color: '#9CA3AF', fontSize: '14px', margin: 0 }}>vehicle_wrap_v3_FINAL.ai</p>
              <p style={{ color: '#6B7280', fontSize: '13px', margin: '4px 0 0 0' }}>147.3 MB</p>
            </div>
          </div>
        </div>

        {/* Right: processed preview */}
        <div style={{ backgroundColor: '#111827', border: '1px solid #1F2937', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #1F2937', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#9CA3AF', fontSize: '13px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Output Preview</span>
            <StatusBadge status={loading ? 'processing' : 'warning'} label={loading ? 'Processing' : 'Needs Review'} />
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
        <AnalysisPanel checks={CHECKS} loading={loading} />
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

import { useNavigate } from 'react-router-dom'
import BeforeAfterSlider from '../components/BeforeAfterSlider'
import ActionButtons from '../components/ActionButtons'
import StatusBadge from '../components/StatusBadge'

const FIXES = [
  { label: 'Color Conversion', desc: 'RGB → CMYK (Fogra39 profile)', status: 'ready' as const },
  { label: 'Text Outlining', desc: '3 layers converted to paths', status: 'ready' as const },
  { label: 'Resolution Upscale', desc: '72 DPI → 300 DPI via Real-ESRGAN', status: 'ready' as const },
  { label: 'Bleed Verification', desc: '0.125" bleed confirmed on all sides', status: 'ready' as const },
]

export default function ResultsPage() {
  const navigate = useNavigate()

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ color: '#E5E7EB', fontWeight: '800', fontSize: '28px', margin: '0 0 8px 0' }}>
            Results
          </h1>
          <p style={{ color: '#6B7280', fontSize: '15px', margin: 0 }}>
            All issues fixed. File is print-ready.
          </p>
        </div>
        <StatusBadge status="ready" label="Print Ready" />
      </div>

      <div style={{ backgroundColor: '#111827', border: '1px solid #1F2937', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ color: '#9CA3AF', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 16px 0' }}>
          Before / After
        </h3>
        <BeforeAfterSlider beforeLabel="Original (Broken)" afterLabel="Output (Fixed)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#111827', border: '1px solid #1F2937', borderRadius: '12px', padding: '24px' }}>
          <h3 style={{ color: '#E5E7EB', fontWeight: '700', fontSize: '16px', margin: '0 0 16px 0' }}>Fixes Applied</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {FIXES.map((fix) => (
              <div key={fix.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: '#0B0F14', borderRadius: '6px' }}>
                <div>
                  <p style={{ color: '#E5E7EB', fontWeight: '600', fontSize: '13px', margin: '0 0 2px 0' }}>{fix.label}</p>
                  <p style={{ color: '#6B7280', fontSize: '12px', margin: 0 }}>{fix.desc}</p>
                </div>
                <StatusBadge status={fix.status} label="Fixed" />
              </div>
            ))}
          </div>
        </div>

        <div style={{ backgroundColor: '#111827', border: '1px solid #1F2937', borderRadius: '12px', padding: '24px' }}>
          <h3 style={{ color: '#E5E7EB', fontWeight: '700', fontSize: '16px', margin: '0 0 16px 0' }}>Output File</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              ['Filename', 'vehicle_wrap_v3_FINAL_PRINT.pdf'],
              ['Format', 'PDF/X-4'],
              ['Color', 'CMYK (Fogra39)'],
              ['Resolution', '300 DPI'],
              ['Bleed', '0.125" all sides'],
              ['File Size', '89.2 MB'],
            ].map(([key, value]) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1F2937' }}>
                <span style={{ color: '#6B7280', fontSize: '13px' }}>{key}</span>
                <span style={{ color: '#E5E7EB', fontSize: '13px', fontWeight: '500' }}>{value}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '20px' }}>
            <button
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
              ↓ Download Print File
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
    </div>
  )
}

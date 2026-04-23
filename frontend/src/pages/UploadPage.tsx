import UploadCard from '../components/UploadCard'

export default function UploadPage() {
  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ color: '#E5E7EB', fontWeight: '800', fontSize: '32px', margin: '0 0 12px 0', letterSpacing: '-0.5px' }}>
          Upload your file
        </h1>
        <p style={{ color: '#6B7280', fontSize: '16px', margin: 0 }}>
          Drop a graphic file. We'll check it, fix what's broken, and prep it for print.
        </p>
      </div>

      <div style={{ backgroundColor: '#111827', border: '1px solid #1F2937', borderRadius: '12px', padding: '32px' }}>
        <UploadCard />
      </div>

      <div style={{ marginTop: '32px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        {[
          { icon: '⚡', title: 'Fast', desc: 'Analysis in under 60 seconds' },
          { icon: '🎯', title: 'Accurate', desc: 'Print-spec checks, no guesswork' },
          { icon: '📤', title: 'Export', desc: 'Print-ready files on output' },
        ].map(({ icon, title, desc }) => (
          <div key={title} style={{ backgroundColor: '#111827', border: '1px solid #1F2937', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>{icon}</div>
            <p style={{ color: '#E5E7EB', fontWeight: '600', fontSize: '14px', margin: '0 0 4px 0' }}>{title}</p>
            <p style={{ color: '#6B7280', fontSize: '13px', margin: 0 }}>{desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

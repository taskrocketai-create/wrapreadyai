import UploadCard from '../components/UploadCard'

const features = [
  { icon: '⚡', title: 'Fast',     desc: 'Analysis in under 60 seconds' },
  { icon: '🎯', title: 'Accurate', desc: 'Print-spec checks, no guesswork' },
  { icon: '📤', title: 'Export',   desc: 'Print-ready files on output' },
]

export default function UploadPage() {
  return (
    <div className="page-narrow">
      <div className="mb-10">
        <h1 className="page-title">Upload your file</h1>
        <p className="page-subtitle">
          Drop a graphic file. We'll check it, fix what's broken, and prep it for print.
        </p>
      </div>

      <div className="panel mb-8">
        <UploadCard />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {features.map(({ icon, title, desc }) => (
          <div key={title} className="card p-5 text-center">
            <div className="text-2xl mb-2">{icon}</div>
            <p className="text-brand-text font-semibold text-sm mb-1">{title}</p>
            <p className="text-brand-subtle text-xs">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

import { Link, useLocation } from 'react-router-dom'
import logoSvg from '../assets/logo.svg'

const workflow = [
  { path: '/upload',   label: 'Upload',   step: 1 },
  { path: '/analysis', label: 'Analysis', step: 2 },
  { path: '/results',  label: 'Results',  step: 3 },
]

export default function Header() {
  const { pathname } = useLocation()
  const activeStep = workflow.find(s => s.path === pathname)?.step ?? 0

  return (
    <header className="bg-brand-bg border-b border-brand-border sticky top-0 z-50">
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center gap-8">
        {/* Logo */}
        <Link to="/upload" className="flex-shrink-0">
          <img src={logoSvg} alt="WrapReady AI" className="h-9" />
        </Link>

        {/* Workflow step indicator (upload → analysis → results) */}
        {activeStep > 0 ? (
          <div className="flex items-center flex-1 justify-center">
            {workflow.map((s, idx) => {
              const isActive = s.step === activeStep
              const isDone   = s.step < activeStep
              return (
                <div key={s.path} className="flex items-center">
                  <Link
                    to={s.path}
                    className="flex items-center gap-2 px-2 py-1 rounded-lg no-underline"
                    style={{ textDecoration: 'none' }}
                  >
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-150"
                      style={{
                        backgroundColor: isActive ? '#14B8A6' : isDone ? '#0F766E' : '#1F2937',
                        color: isActive || isDone ? '#0B0F14' : '#6B7280',
                      }}
                    >
                      {isDone ? '✓' : s.step}
                    </span>
                    <span
                      className="text-sm font-semibold transition-colors duration-150"
                      style={{ color: isActive ? '#E5E7EB' : isDone ? '#9CA3AF' : '#4B5563' }}
                    >
                      {s.label}
                    </span>
                  </Link>
                  {idx < workflow.length - 1 && (
                    <div
                      className="w-10 h-px mx-1 flex-shrink-0 transition-colors duration-150"
                      style={{ backgroundColor: isDone ? '#14B8A6' : '#1F2937' }}
                    />
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex-1" />
        )}

        {/* Review Queue link (admin / separate from main flow) */}
        <Link
          to="/review"
          className="text-sm font-medium flex-shrink-0 transition-colors duration-150"
          style={{
            textDecoration: 'none',
            color: pathname === '/review' ? '#14B8A6' : '#6B7280',
          }}
        >
          Review Queue
        </Link>
      </div>
    </header>
  )
}

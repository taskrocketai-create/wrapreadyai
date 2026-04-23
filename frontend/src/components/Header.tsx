import { Link, useLocation } from 'react-router-dom'
import logoSvg from '../assets/logo.svg'

const navItems = [
  { path: '/upload', label: 'Upload' },
  { path: '/analysis', label: 'Analysis' },
  { path: '/results', label: 'Results' },
  { path: '/review', label: 'Review' },
]

export default function Header() {
  const location = useLocation()

  return (
    <header style={{ backgroundColor: '#0B0F14', borderBottom: '1px solid #1F2937' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
        <Link to="/upload">
          <img src={logoSvg} alt="WrapReady AI" style={{ height: '40px' }} />
        </Link>
        <nav style={{ display: 'flex', gap: '4px' }}>
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                padding: '6px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                textDecoration: 'none',
                transition: 'all 0.15s',
                backgroundColor: location.pathname === item.path ? '#14B8A6' : 'transparent',
                color: location.pathname === item.path ? '#0B0F14' : '#9CA3AF',
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}

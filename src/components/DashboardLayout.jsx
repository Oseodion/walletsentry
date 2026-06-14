import { Link, useLocation } from 'react-router-dom'
import '../styles/dashboard.css'

const NAV_ITEMS = [
  { label: 'Dashboard',     path: '/dashboard' },
  { label: 'Token Scanner', path: '/scanner'   },
  { label: 'Approvals',     path: '/approvals' },
  { label: 'History',       path: '/history'   },
  { label: 'Proof Receipts',path: '/proofs'    },
]

const TAB_LABELS = ['Dashboard', 'Scanner', 'Approvals', 'History', 'Proofs']

export default function DashboardLayout({ children }) {
  const { pathname } = useLocation()

  return (
    <>
      <div className="dbl-layout">
        <aside className="dbl-sidebar">
          <div className="dbl-sidebar-logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
            WALLET<span>SENTRY</span>
          </div>
          <nav className="dbl-nav">
            {NAV_ITEMS.map(({ label, path }) => (
              <Link
                key={path}
                to={path}
                className={`dbl-nav-link${pathname === path ? ' active' : ''}`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="dbl-main">{children}</div>
      </div>

      <nav className="mobile-tabs">
        {NAV_ITEMS.map(({ path }, i) => (
          <Link
            key={path}
            to={path}
            className={`mobile-tab${pathname === path ? ' active' : ''}`}
          >
            {TAB_LABELS[i]}
          </Link>
        ))}
      </nav>
    </>
  )
}

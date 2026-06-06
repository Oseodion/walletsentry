import { useContext } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ThemeContext } from '../context'

export default function Navbar() {
  const { theme, toggleTheme } = useContext(ThemeContext)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const onDashboard = pathname !== '/'

  return (
    <nav className="landing-nav">
      <div className="logo">WALLET<span>SENTRY</span></div>
      {!onDashboard && (
        <div className="nav-links">
          <a href="#">Dashboard</a>
          <a href="#">Scanner</a>
          <a href="#">Approvals</a>
          <a href="#">Docs</a>
        </div>
      )}
      <div className="nav-right">
        <button className="theme-toggle" onClick={toggleTheme} title="Toggle dark mode">
          {theme === 'dark' ? '○' : '◑'}
        </button>
        {onDashboard ? (
          <button className="btn-connect" onClick={() => navigate('/')}>Disconnect</button>
        ) : (
          <button className="btn-connect" onClick={() => navigate('/dashboard')}>Connect Wallet</button>
        )}
      </div>
    </nav>
  )
}

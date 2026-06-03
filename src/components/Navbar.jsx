import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { ThemeContext } from '../context'

export default function Navbar() {
  const { theme, toggleTheme } = useContext(ThemeContext)
  const navigate = useNavigate()

  return (
    <nav>
      <div className="logo">WALLET<span>SENTRY</span></div>
      <div className="nav-links">
        <a href="#">Dashboard</a>
        <a href="#">Scanner</a>
        <a href="#">Approvals</a>
        <a href="#">Docs</a>
      </div>
      <div className="nav-right">
        <button className="theme-toggle" onClick={toggleTheme} title="Toggle dark mode">
          {theme === 'dark' ? '○' : '◑'}
        </button>
        <button className="btn-connect" onClick={() => navigate('/dashboard')}>
          Connect Wallet
        </button>
      </div>
    </nav>
  )
}

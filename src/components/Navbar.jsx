import { useContext, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ThemeContext, WalletContext } from '../context'
import WalletDropdown from './WalletDropdown'

function PhantomModal({ isOpen, message, onClose }) {
  if (!isOpen) return null
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        background: '#111', border: '1px solid #222', borderRadius: 16, padding: 32,
        fontFamily: "'IBM Plex Mono', monospace", maxWidth: 480, color: '#fff'
      }}>
        <div style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>{message}</div>
        {message.includes('not found') && (
          <a href="https://phantom.app" target="_blank" rel="noreferrer"
            style={{ color: '#00cc55', textDecoration: 'none', fontWeight: 600 }}>
            Download Phantom Wallet
          </a>
        )}
        <button onClick={onClose} style={{
          display: 'block', marginTop: 24, background: '#00cc55', color: '#000',
          border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer',
          fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}>
          {message.includes('not found') ? 'Close' : 'OK'}
        </button>
      </div>
    </div>
  )
}

export default function Navbar() {
  const { theme, toggleTheme } = useContext(ThemeContext)
  const { walletAddress, setWalletAddress } = useContext(WalletContext)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const onDashboard = pathname !== '/'
  const [connecting, setConnecting] = useState(false)
  const [modal, setModal] = useState(null)

  const handleConnect = async () => {
    setConnecting(true)
    try {
      if (!window.solana || !window.solana.isPhantom) {
        setModal('Phantom wallet not found. Please install it from phantom.app')
        setConnecting(false)
        return
      }
      const resp = await window.solana.connect()
      const addr = resp.publicKey.toString()
      setWalletAddress(addr)
      navigate('/dashboard')
    } catch (err) {
      if (err.message.includes('User rejected')) {
        setModal('Wallet connection cancelled')
      } else {
        setModal('Connection failed: ' + (err.message || 'Unknown error'))
      }
      setConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      await window.solana.disconnect()
    } catch (err) {
      console.error('Disconnect error:', err)
    }
    setWalletAddress(null)
    navigate('/')
  }

  const shortAddress = walletAddress ? walletAddress.slice(0, 4) + '...' + walletAddress.slice(-4) : ''

  const handleNavClick = (targetId) => {
    const el = document.getElementById(targetId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleDocsClick = () => {
    window.open('https://docs.ambient.xyz', '_blank')
  }

  return (
    <>
      <nav className="landing-nav">
        <div className="logo">WALLET<span>SENTRY</span></div>
        {!onDashboard && (
          <div className="nav-links">
            {walletAddress ? (
              <>
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/dashboard') }}>Dashboard</a>
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/scanner') }}>Scanner</a>
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/approvals') }}>Approvals</a>
                <a href="#" onClick={(e) => { e.preventDefault(); handleDocsClick() }}>Docs</a>
              </>
            ) : (
              <>
                <a href="#" onClick={(e) => { e.preventDefault(); handleNavClick('features') }}>How it works</a>
                <a href="#" onClick={(e) => { e.preventDefault(); handleDocsClick() }}>Docs</a>
              </>
            )}
          </div>
        )}
        <div className="nav-right">
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle dark mode">
            {theme === 'dark' ? '○' : '◑'}
          </button>
          {walletAddress ? (
            <>
              <WalletDropdown walletAddress={walletAddress} shortAddress={shortAddress} />
              {!onDashboard && (
                <button className="btn-connect" onClick={() => navigate('/dashboard')}>
                  Go to Dashboard
                </button>
              )}
            </>
          ) : (
            <button className="btn-connect" onClick={handleConnect} disabled={connecting}>
              {connecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </nav>
      <PhantomModal isOpen={!!modal} message={modal || ''} onClose={() => setModal(null)} />
    </>
  )
}

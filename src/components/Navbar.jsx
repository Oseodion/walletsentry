import { useContext, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ThemeContext, WalletContext } from '../context'

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

  return (
    <>
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
          {walletAddress ? (
            <>
              <div style={{
                background: 'var(--surface2)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '6px 12px', fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 12, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8
              }}>
                <div style={{
                  width: 6, height: 6, background: '#00cc55', borderRadius: '50%',
                  animation: 'livepulse 2s infinite'
                }} />
                {shortAddress}
              </div>
              <button className="btn-connect" onClick={handleDisconnect}>Disconnect</button>
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

import { useState, useRef, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { WalletContext } from '../context'
import { walletStorage } from '../context'

export default function WalletDropdown({ walletAddress, shortAddress }) {
  const navigate = useNavigate()
  const { setWalletAddress } = useContext(WalletContext)
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy address:', err)
    }
  }

  const handleDisconnect = async () => {
    try {
      if (window.solana) {
        await window.solana.disconnect()
      }
    } catch (err) {
      console.error('Disconnect error:', err)
    }
    walletStorage.clear()
    setWalletAddress(null)
    setIsOpen(false)
    navigate('/')
  }

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'var(--surface2)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '6px 12px',
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 12,
          color: 'var(--text)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
          userSelect: 'none',
        }}
        className="wallet-badge"
      >
        <div
          style={{
            width: 6,
            height: 6,
            background: '#00cc55',
            borderRadius: '50%',
            animation: 'livepulse 2s infinite',
          }}
        />
        {shortAddress}
      </div>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            left: 'auto',
            marginTop: 8,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            minWidth: 220,
            maxWidth: 280,
            zIndex: 100,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          {/* Full Address */}
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--border)',
              fontSize: 11,
              fontFamily: "'IBM Plex Mono', monospace",
              color: 'var(--muted)',
              wordBreak: 'break-all',
              lineHeight: 1.4,
            }}
          >
            {walletAddress}
          </div>

          {/* Copy Address */}
          <div
            onClick={handleCopy}
            style={{
              padding: '10px 16px',
              fontSize: 13,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: 'var(--text)',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--border)',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            {copied ? '✓ Copied!' : 'Copy Address'}
          </div>

          {/* Disconnect */}
          <div
            onClick={handleDisconnect}
            style={{
              padding: '10px 16px',
              fontSize: 13,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: 'var(--red)',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 68, 68, 0.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            Disconnect
          </div>
        </div>
      )}
    </div>
  )
}

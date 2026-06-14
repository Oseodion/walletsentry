import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { WalletContext } from '../context'
import DashboardLayout from '../components/DashboardLayout'
import { analyzeApprovals } from '../services/ambientAI'
import '../styles/approvals.css'

const APPROVALS_DATA = [
  { id: 1, token: 'USD Coin', symbol: 'USDC', amount: 'Unlimited', spender: '7xK9...mR2p', risk: 'CRITICAL', date: '2 days ago', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' },
  { id: 2, token: 'Solana', symbol: 'SOL', amount: '1000', spender: '3bN8...qW4s', risk: 'MEDIUM', date: '5 days ago', mint: 'So11111111111111111111111111111111111111112' },
  { id: 3, token: 'BONK', symbol: 'BONK', amount: 'Unlimited', spender: '9pL2...kX8d', risk: 'CRITICAL', date: '1 week ago', mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263' },
  { id: 4, token: 'Raydium', symbol: 'RAY', amount: '500', spender: '4mQ6...hF3c', risk: 'MEDIUM', date: '2 weeks ago', mint: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R' },
  { id: 5, token: 'Jupiter', symbol: 'JUP', amount: 'Unlimited', spender: '2rT9...vP7k', risk: 'CRITICAL', date: '3 weeks ago', mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN' },
  { id: 6, token: 'Tether', symbol: 'USDT', amount: 'Unlimited', spender: '8nL4...mK1j', risk: 'CRITICAL', date: '1 month ago', mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB' },
  { id: 7, token: 'dogwifhat', symbol: 'WIF', amount: '10000', spender: '5xR3...bN6p', risk: 'SAFE', date: '2 months ago', mint: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm' },
  { id: 8, token: 'Marinade', symbol: 'mSOL', amount: '50', spender: '1kP7...cQ2w', risk: 'SAFE', date: '3 months ago', mint: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So' },
]

function TokenLogo({ mint, symbol }) {
  const [src, setSrc] = useState(`https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/${mint}/logo.png`)
  const [failed, setFailed] = useState(false)

  return (
    <div
      style={{
        width: 40, height: 40, borderRadius: 8, display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        background: failed ? '#444' : '#fff', overflow: 'hidden'
      }}
    >
      {!failed ? (
        <img
          src={src}
          alt={symbol}
          onError={() => { setFailed(true); setSrc(''); }}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <div style={{ fontSize: 14, fontWeight: 700, color: '#888' }}>
          {symbol.slice(0, 2).toUpperCase()}
        </div>
      )}
    </div>
  )
}

export default function Approvals() {
  const navigate = useNavigate()
  const { walletAddress } = useContext(WalletContext)
  const [filter, setFilter] = useState('all')

  const walletShort = walletAddress ? walletAddress.slice(0, 4) + '...' + walletAddress.slice(-4) : '...'
  const [approvals, setApprovals] = useState(APPROVALS_DATA)
  const [revokingId, setRevokingId] = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const [toast, setToast] = useState(null)

  const riskyCnt = approvals.filter(a => a.risk === 'CRITICAL' || a.risk === 'MEDIUM').length
  const safeCnt = approvals.filter(a => a.risk === 'SAFE').length

  const filtered = filter === 'all' ? approvals : filter === 'risky' ? approvals.filter(a => a.risk !== 'SAFE') : approvals.filter(a => a.risk === 'SAFE')

  const handleRevoke = (id) => {
    if (confirmId === id) {
      setRevokingId(id)
      setTimeout(() => {
        setApprovals(approvals.map(a => a.id === id ? { ...a, revoked: true } : a))
        setRevokingId(null)
        setConfirmId(null)
        setToast('Approval revoked successfully')
        setTimeout(() => setToast(null), 3000)
      }, 300)
    } else {
      setConfirmId(id)
    }
  }

  return (
    <DashboardLayout>
      <div className="dash-topbar">
        <div className="wallet-badge">
          <div className="wallet-dot" />
          {walletShort}
        </div>
        <button className="btn-disconnect" onClick={() => navigate('/')}>
          Disconnect
        </button>
      </div>

      <div className="approvals-wrap">
        <div className="approvals-header">
          <div className="approvals-title-group">
            <div className="approvals-title">APPROVAL MANAGER</div>
            <div className="approvals-subtitle">Review and revoke active token approvals for your wallet</div>
          </div>
          <button className="analyze-btn">Analyze All with AI</button>
        </div>

        <div className="approvals-stats">
          <div className="stat-chip">
            <div className="stat-label">Total Approvals</div>
            <div className="stat-value">{approvals.length}</div>
          </div>
          <div className="stat-chip risky">
            <div className="stat-label">Risky</div>
            <div className="stat-value">{riskyCnt}</div>
          </div>
          <div className="stat-chip safe">
            <div className="stat-label">Safe</div>
            <div className="stat-value">{safeCnt}</div>
          </div>
        </div>

        <div className="approvals-filter">
          <button className={`filter-btn${filter === 'all' ? ' active' : ''}`} onClick={() => setFilter('all')}>
            All <span className="badge">({approvals.length})</span>
          </button>
          <button className={`filter-btn${filter === 'risky' ? ' active' : ''}`} onClick={() => setFilter('risky')}>
            Risky <span className="badge">({riskyCnt})</span>
          </button>
          <button className={`filter-btn${filter === 'safe' ? ' active' : ''}`} onClick={() => setFilter('safe')}>
            Safe <span className="badge">({safeCnt})</span>
          </button>
        </div>

        <div className="approvals-list">
          {filtered.map(a => (
            <div key={a.id} className={`approval-card${a.revoked ? ' revoked' : ''}`}>
              <div className={`approval-bar ${a.risk.toLowerCase()}`} />
              <TokenLogo mint={a.mint} symbol={a.symbol} />
              <div className="approval-info">
                <div className="approval-token">{a.token}</div>
                <div className="approval-spender">Spender: {a.spender}</div>
              </div>
              <div className="approval-amount" style={{ minWidth: 120 }}>
                {a.amount === 'Unlimited' ? <strong style={{ color: 'var(--red)' }}>Unlimited</strong> : a.amount + ' ' + a.symbol}
              </div>
              <div className="approval-meta">
                <span className={`risk-badge ${a.risk.toLowerCase()}`}>{a.risk}</span>
                <span className="approval-date">{a.date}</span>
              </div>
              <button
                className={`btn-revoke${confirmId === a.id ? ' confirming' : ''}`}
                onClick={() => handleRevoke(a.id)}
                disabled={revokingId === a.id || a.revoked}
              >
                {a.revoked ? 'Revoked' : confirmId === a.id ? 'Confirm?' : 'Revoke'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </DashboardLayout>
  )
}

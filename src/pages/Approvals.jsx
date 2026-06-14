import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import { analyzeApprovals } from '../services/ambientAI'
import '../styles/approvals.css'

const WALLET_SHORT = '4xK9...mR2p'

const APPROVALS_DATA = [
  { id: 1, token: 'USD Coin', symbol: 'USDC', amount: 'Unlimited', spender: '7xK9...mR2p', risk: 'CRITICAL', date: '2 days ago', bg: '#2563eb' },
  { id: 2, token: 'Solana', symbol: 'SOL', amount: '1000', spender: '3bN8...qW4s', risk: 'MEDIUM', date: '5 days ago', bg: '#9333ea' },
  { id: 3, token: 'BONK', symbol: 'BONK', amount: 'Unlimited', spender: '9pL2...kX8d', risk: 'CRITICAL', date: '1 week ago', bg: '#dc2626' },
  { id: 4, token: 'Raydium', symbol: 'RAY', amount: '500', spender: '4mQ6...hF3c', risk: 'MEDIUM', date: '2 weeks ago', bg: '#2563eb' },
  { id: 5, token: 'Jupiter', symbol: 'JUP', amount: 'Unlimited', spender: '2rT9...vP7k', risk: 'CRITICAL', date: '3 weeks ago', bg: '#7c3aed' },
  { id: 6, token: 'Tether', symbol: 'USDT', amount: 'Unlimited', spender: '8nL4...mK1j', risk: 'CRITICAL', date: '1 month ago', bg: '#16a34a' },
  { id: 7, token: 'dogwifhat', symbol: 'WIF', amount: '10000', spender: '5xR3...bN6p', risk: 'SAFE', date: '2 months ago', bg: '#ea580c' },
  { id: 8, token: 'Marinade', symbol: 'mSOL', amount: '50', spender: '1kP7...cQ2w', risk: 'SAFE', date: '3 months ago', bg: '#06b6d4' },
]

export default function Approvals() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
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
          {WALLET_SHORT}
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
              <div className="token-icon" style={{ backgroundColor: a.bg }}>
                {a.symbol.slice(0, 2).toUpperCase()}
              </div>
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

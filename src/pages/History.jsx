import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { WalletContext } from '../context'
import DashboardLayout from '../components/DashboardLayout'
import '../styles/history.css'

const TRANSACTIONS = [
  { id: 1, hash: '4xK9...mR2p', type: 'SWAP', amount: '120 SOL', token: 'USDC', time: '2 min ago', risk: 'SAFE' },
  { id: 2, hash: '7bN3...qW8s', type: 'APPROVAL', amount: 'Unlimited', token: 'USDC', time: '18 min ago', risk: 'CRITICAL' },
  { id: 3, hash: '2pL5...kX4d', type: 'TRANSFER', amount: '0.5 SOL', token: 'SOL', time: '1 hour ago', risk: 'SAFE' },
  { id: 4, hash: '9mQ7...hF1c', type: 'NFT', amount: '0.1 SOL', token: 'NFT', time: '2 hours ago', risk: 'MEDIUM' },
  { id: 5, hash: '5rT2...vP9k', type: 'STAKE', amount: '50 SOL', token: 'SOL', time: '3 hours ago', risk: 'SAFE' },
  { id: 6, hash: '8nL6...mK3j', type: 'SWAP', amount: '500 BONK', token: 'SOL', time: '5 hours ago', risk: 'MEDIUM' },
  { id: 7, hash: '3jX4...rS8t', type: 'TRANSFER', amount: '10 USDC', token: 'USDC', time: '1 day ago', risk: 'SAFE' },
  { id: 8, hash: '6kW1...cU5p', type: 'APPROVAL', amount: '1000 USDC', token: 'USDC', time: '2 days ago', risk: 'MEDIUM' },
  { id: 9, hash: '1yF9...bL2m', type: 'SWAP', amount: '200 RAY', token: 'SOL', time: '3 days ago', risk: 'SAFE' },
  { id: 10, hash: '4dH8...nG6w', type: 'NFT', amount: '0.5 SOL', token: 'NFT', time: '1 week ago', risk: 'SAFE' },
]

export default function History() {
  const navigate = useNavigate()
  const { walletAddress } = useContext(WalletContext)
  const [search, setSearch] = useState('')

  const walletShort = walletAddress ? walletAddress.slice(0, 4) + '...' + walletAddress.slice(-4) : '...'
  const [typeFilter, setTypeFilter] = useState('all')
  const [riskFilter, setRiskFilter] = useState('all')
  const [page, setPage] = useState(0)
  const perPage = 10

  let filtered = TRANSACTIONS
  if (typeFilter !== 'all') filtered = filtered.filter(t => t.type === typeFilter)
  if (riskFilter !== 'all') filtered = filtered.filter(t => t.risk === riskFilter)
  if (search) filtered = filtered.filter(t => t.hash.includes(search) || t.type.toLowerCase().includes(search.toLowerCase()))

  const paged = filtered.slice(page * perPage, (page + 1) * perPage)
  const maxPages = Math.ceil(filtered.length / perPage)

  const handleExport = () => {
    const csv = ['Hash,Type,Amount,Token,Time,Risk', ...TRANSACTIONS.map(t => `${t.hash},${t.type},${t.amount},${t.token},${t.time},${t.risk}`)].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'wallet-history.csv'
    a.click()
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

      <div className="history-wrap">
        <div className="history-header">
          <div>
            <div className="history-title">TRANSACTION HISTORY</div>
            <div className="history-subtitle">AI-rated timeline of your wallet activity</div>
          </div>
          <button className="export-btn" onClick={handleExport}>Export CSV</button>
        </div>

        <div className="history-controls">
          <input
            className="search-input"
            type="text"
            placeholder="Search by hash or type..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select className="filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="all">All Types</option>
            <option value="SWAP">Swap</option>
            <option value="TRANSFER">Transfer</option>
            <option value="APPROVAL">Approval</option>
            <option value="NFT">NFT Mint</option>
            <option value="STAKE">Stake</option>
          </select>
          <select className="filter-select" value={riskFilter} onChange={e => setRiskFilter(e.target.value)}>
            <option value="all">All Risk</option>
            <option value="CRITICAL">Critical</option>
            <option value="MEDIUM">Medium</option>
            <option value="SAFE">Safe</option>
          </select>
        </div>

        <div className="risk-summary">
          Your wallet activity in the last 30 days: 8 safe transactions, 2 medium risk, 0 critical.
        </div>

        <div className="history-table">
          <div className="table-header">
            <span>Transaction Hash</span>
            <span>Type</span>
            <span>Amount</span>
            <span>Token</span>
            <span>Time</span>
            <span>AI Risk</span>
            <span></span>
          </div>
          {paged.map(t => (
            <div className="table-row" key={t.id}>
              <div className="txn-hash">
                {t.hash}
              </div>
              <div className={`type-badge type-${t.type.toLowerCase()}`}>{t.type}</div>
              <span>{t.amount}</span>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>{t.token}</span>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>{t.time}</span>
              <span className={`risk-chip rc-${t.risk === 'SAFE' ? 'green' : t.risk === 'MEDIUM' ? 'amber' : 'red'}`}>{t.risk}</span>
            </div>
          ))}
        </div>

        {maxPages > 1 && (
          <div className="pagination">
            <button className="pagination-btn" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
              Previous
            </button>
            <span className="pagination-info">Page {page + 1} of {maxPages}</span>
            <button className="pagination-btn" onClick={() => setPage(p => Math.min(maxPages - 1, p + 1))} disabled={page === maxPages - 1}>
              Next
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

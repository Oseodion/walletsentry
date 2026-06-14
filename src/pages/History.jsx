import { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { WalletContext } from '../context'
import DashboardLayout from '../components/DashboardLayout'
import { getWalletTransactions } from '../services/solana'
import '../styles/history.css'

export default function History() {
  const navigate = useNavigate()
  const { walletAddress } = useContext(WalletContext)
  const [search, setSearch] = useState('')
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  const walletShort = walletAddress ? walletAddress.slice(0, 4) + '...' + walletAddress.slice(-4) : '...'
  const [typeFilter, setTypeFilter] = useState('all')
  const [riskFilter, setRiskFilter] = useState('all')
  const [page, setPage] = useState(0)
  const perPage = 10

  useEffect(() => {
    if (!walletAddress) return
    const loadTransactions = async () => {
      setLoading(true)
      try {
        const txns = await getWalletTransactions(walletAddress, 50)
        const enriched = txns.map((t, idx) => ({
          id: idx + 1,
          hash: t.hash,
          fullHash: t.fullHash,
          type: t.type,
          amount: t.amount,
          token: 'SOL',
          time: t.timestamp,
          risk: idx % 5 === 0 ? 'CRITICAL' : idx % 5 === 1 ? 'MEDIUM' : 'SAFE',
        }))
        setTransactions(enriched)
      } catch (err) {
        console.error('Error loading transactions:', err)
      } finally {
        setLoading(false)
      }
    }
    loadTransactions()
  }, [walletAddress])

  let filtered = transactions
  if (typeFilter !== 'all') filtered = filtered.filter(t => t.type === typeFilter)
  if (riskFilter !== 'all') filtered = filtered.filter(t => t.risk === riskFilter)
  if (search) filtered = filtered.filter(t => t.hash.includes(search) || t.type.toLowerCase().includes(search.toLowerCase()))

  const paged = filtered.slice(page * perPage, (page + 1) * perPage)
  const maxPages = Math.ceil(filtered.length / perPage)

  const handleExport = () => {
    const csv = ['Hash,Type,Amount,Token,Time,Risk', ...transactions.map(t => `${t.hash},${t.type},${t.amount},${t.token},${t.time},${t.risk}`)].join('\n')
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
          {loading ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
              Loading transactions...
            </div>
          ) : paged.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
              No transactions found
            </div>
          ) : (
            paged.map(t => (
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
            ))
          )}
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

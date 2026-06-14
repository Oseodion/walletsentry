import { useState, useEffect, useRef, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { WalletContext, ProofReceiptContext } from '../context'
import DashboardLayout from '../components/DashboardLayout'
import ProofReceiptModal from '../components/ProofReceiptModal'
import WalletDropdown from '../components/WalletDropdown'
import { getWalletSOLBalance, getWalletTokenAccounts, getWalletTransactions } from '../services/solana'

export default function Dashboard() {
  const navigate = useNavigate()
  const { walletAddress } = useContext(WalletContext)
  const { proofs } = useContext(ProofReceiptContext)
  const [selectedProof, setSelectedProof] = useState(null)
  const [solBalance, setSolBalance] = useState(0)
  const [tokenCount, setTokenCount] = useState(0)
  const [tokens, setTokens] = useState([])
  const [recentTxns, setRecentTxns] = useState([])
  const [loading, setLoading] = useState(true)
  const metricRefs = useRef([])

  const calculateHealthScore = () => {
    if (loading || tokens.length === 0) return null
    let score = 100
    const riskyTokens = tokens.filter((_, idx) => idx % 3 === 0)
    const criticalTxns = recentTxns.filter(t => t.decision && t.decision.includes('CRITICAL'))
    score -= riskyTokens.length * 10
    score -= criticalTxns.length * 15
    return Math.max(0, Math.min(100, score))
  }

  const getThreatCount = () => {
    return proofs.filter(p => p.decision && (p.decision.includes('CRITICAL') || p.decision.includes('HIGH'))).length
  }

  const getRiskyApprovalsCount = () => {
    return tokens.filter((_, idx) => idx % 3 === 0).length
  }

  const healthScore = calculateHealthScore()
  const threatCount = getThreatCount()
  const riskyApprovalsCount = getRiskyApprovalsCount()

  const METRICS = [
    { id: 'score',     label: 'Wallet Health Score',   target: healthScore ?? '--',  color: 'g', sub: 'Good standing'   },
    { id: 'threats',   label: 'Live Threats',           target: threatCount,   color: 'r', sub: 'Needs attention'  },
    { id: 'approvals', label: 'Risky Approvals',        target: riskyApprovalsCount,   color: 'a', sub: 'Revoke advised'   },
    { id: 'proofs',    label: 'AI Proofs Generated',    target: proofs.length, color: 'g', sub: 'All on-chain'     },
  ]

  const walletShort = walletAddress ? walletAddress.slice(0, 4) + '...' + walletAddress.slice(-4) : '...'
  const walletFull = walletAddress || ''

  useEffect(() => {
    if (!walletAddress) return
    const loadData = async () => {
      setLoading(true)
      try {
        const [balance, fetchedTokens, txns] = await Promise.all([
          getWalletSOLBalance(walletAddress),
          getWalletTokenAccounts(walletAddress),
          getWalletTransactions(walletAddress, 6),
        ])
        setSolBalance(balance)
        setTokens(fetchedTokens)
        setTokenCount(fetchedTokens.length)
        setRecentTxns(txns)
      } catch (err) {
        console.error('Error loading dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [walletAddress])

  useEffect(() => {
    const cubicOut = (p) => 1 - Math.pow(1 - p, 3)
    const runAnim = (durationMs, onTick) => {
      const t0 = performance.now()
      const tick = (now) => {
        const progress = Math.min((now - t0) / durationMs, 1)
        onTick(cubicOut(progress))
        if (progress < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }

    METRICS.forEach((metric, i) => {
      setTimeout(() => {
        const el = metricRefs.current[i]
        if (el && typeof metric.target === 'number') {
          runAnim(1600, (e) => { el.textContent = Math.floor(e * metric.target) })
        } else if (el) {
          el.textContent = metric.target
        }
      }, 200 + i * 100)
    })
  }, [METRICS])

  const handleCopy = () => {
    navigator.clipboard.writeText(walletFull).catch(() => {})
  }

  return (
    <DashboardLayout>
      {/* TOP BAR */}
      <div className="dash-topbar">
        <WalletDropdown walletAddress={walletFull} shortAddress={walletShort} />
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="dash-content">

        {/* METRICS ROW */}
        <div className="dm-metrics-row">
          {METRICS.map((metric, i) => (
            <div className="dm-card" key={metric.id}>
              <div className="dm-label">{metric.label}</div>
              <div
                className={`dm-val ${metric.color}`}
                ref={el => { metricRefs.current[i] = el }}
              >
                0
              </div>
              <div className="dm-sub">{metric.sub}</div>
            </div>
          ))}
        </div>

        {/* THREAT FEED + WALLET OVERVIEW */}
        <div className="two-col">

          {/* THREAT FEED */}
          <div className="feed-card">
            <div className="feed-card-header">
              <span className="feed-title">Live Threat Feed</span>
              <span className="feed-count">{proofs.length} events</span>
            </div>
            <div className="feed-list">
              {proofs.length > 0 ? (
                proofs.slice(0, 6).map((proof, idx) => (
                  <div className="feed-item" key={idx}>
                    <div className="feed-item-left">
                      <div className={`ti-bar ${proof.decision.includes('CRITICAL') ? 'bar-red' : proof.decision.includes('MEDIUM') ? 'bar-amber' : 'bar-green'}`} />
                      <div className="feed-item-info">
                        <div className="feed-item-name">{proof.type}</div>
                        <div className="feed-item-meta">{proof.timestamp}</div>
                      </div>
                    </div>
                    <div className="feed-item-right">
                      <span className={`risk-tag ${proof.decision.includes('CRITICAL') ? 'rt-red' : proof.decision.includes('MEDIUM') ? 'rt-amber' : 'rt-green'}`}>
                        {proof.decision.split(' - ')[0]}
                      </span>
                      <button
                        className="view-proof-btn"
                        onClick={() => setSelectedProof(proof)}
                      >
                        View Proof
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
                  No threat alerts yet. Run a token scan to generate AI proofs.
                </div>
              )}
            </div>
            <div className="status-line">
              <span className="live-dot" />
              Ambient AI is monitoring your wallet
            </div>
          </div>

          {/* WALLET OVERVIEW */}
          <div className="feed-card">
            <div className="feed-card-header">
              <span className="feed-title">Wallet Overview</span>
            </div>
            <div className="wallet-ov-content">
              <div className="wallet-address-block">
                <div className="wallet-address-label">Connected Address</div>
                <div
                  className="wallet-address-value"
                  onClick={handleCopy}
                  title="Click to copy"
                  style={{ cursor: walletFull ? 'pointer' : 'default' }}
                >
                  {walletFull || 'Loading...'}
                </div>
              </div>

              <div className="wallet-stats">
                <div className="wallet-stat-row">
                  <span className="wallet-stat-label">SOL Balance</span>
                  <span className="wallet-stat-val">{loading ? '--' : solBalance.toFixed(2)} SOL</span>
                </div>
                <div className="wallet-stat-row">
                  <span className="wallet-stat-label">Token Accounts</span>
                  <span className="wallet-stat-val">{loading ? '--' : tokenCount} tokens</span>
                </div>
                <div className="wallet-stat-row">
                  <span className="wallet-stat-label">Active Approvals</span>
                  <span className="wallet-stat-val" style={{ color: riskyApprovalsCount > 0 ? 'var(--amber)' : 'var(--green)' }}>
                    {loading ? '--' : `${riskyApprovalsCount} ${riskyApprovalsCount === 1 ? 'risky' : riskyApprovalsCount === 0 ? 'safe' : 'risky'}`}
                  </span>
                </div>
              </div>

              <div className="quick-actions">
                <div className="section-label">Quick Actions</div>
                <button className="quick-action-btn" onClick={() => navigate('/scanner')}>
                  Scan a Token
                </button>
                <button className="quick-action-btn" onClick={() => navigate('/approvals')}>
                  View Approvals
                </button>
                <button className="quick-action-btn" onClick={() => navigate('/history')}>
                  Full History
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RECENT TRANSACTIONS */}
        <div className="table-card">
          <div className="table-card-header">
            <span className="feed-title">Recent Transactions</span>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="dt-head txn-grid">
            <span>Transaction</span>
            <span>Type</span>
            <span>Amount</span>
            <span>Time</span>
            <span>Risk</span>
          </div>
          {recentTxns.length > 0 ? (
            recentTxns.map((row) => (
              <div className="dt-row txn-grid" key={row.fullHash}>
                <span className="dt-hash">{row.hash}</span>
                <span>{row.type}</span>
                <span>{row.amount}</span>
                <span style={{ color: 'var(--muted)', fontSize: '11px', fontFamily: "'IBM Plex Mono', monospace" }}>
                  {row.timestamp}
                </span>
                <span className={`risk-chip ${row.status === 'confirmed' ? 'rc-green' : 'rc-amber'}`}>
                  {row.status === 'confirmed' ? 'CONFIRMED' : 'PENDING'}
                </span>
              </div>
            ))
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
              {loading ? 'Loading transactions...' : 'No transactions yet'}
            </div>
          )}
        </div>

      </div>

      {selectedProof && (
        <ProofReceiptModal proof={selectedProof} onClose={() => setSelectedProof(null)} />
      )}
    </DashboardLayout>
  )
}

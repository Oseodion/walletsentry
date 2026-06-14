import { useState, useEffect, useRef, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { WalletContext } from '../context'
import DashboardLayout from '../components/DashboardLayout'
import ProofReceiptModal from '../components/ProofReceiptModal'

const METRICS = [
  { id: 'score',     label: 'Wallet Health Score',   target: 84,  color: 'g', sub: 'Good standing'   },
  { id: 'threats',   label: 'Live Threats',           target: 2,   color: 'r', sub: 'Needs attention'  },
  { id: 'approvals', label: 'Risky Approvals',        target: 3,   color: 'a', sub: 'Revoke advised'   },
  { id: 'proofs',    label: 'AI Proofs Generated',    target: 147, color: 'g', sub: 'All on-chain'     },
]

const THREATS = [
  {
    id: 1,
    name: 'Unlimited USDC Approval',
    time: '2 min ago',
    address: '0x7f3a...c9d2',
    risk: 'CRITICAL',
    bar: 'bar-red',
    tag: 'rt-red',
    decision: 'HIGH RISK - Unlimited Token Approval Detected',
    timestamp: '2026-06-03 14:32:07 UTC',
    hash: 'sha256:a4f2c8d91b3e7f5629c4a1b8e3d2f701...',
  },
  {
    id: 2,
    name: 'Unverified Contract Interaction',
    time: '18 min ago',
    address: '0x2b8e...f441',
    risk: 'MEDIUM',
    bar: 'bar-amber',
    tag: 'rt-amber',
    decision: 'MEDIUM RISK - Unaudited Contract Deployment',
    timestamp: '2026-06-03 14:14:22 UTC',
    hash: 'sha256:b7e3d5f02c9a8174d3e6c2b1a0f9e845...',
  },
  {
    id: 3,
    name: 'Large SOL Transfer Detected',
    time: '1 hr ago',
    address: '9mQ7...hF1c',
    risk: 'MEDIUM',
    bar: 'bar-amber',
    tag: 'rt-amber',
    decision: 'MEDIUM RISK - Unusually Large Transfer Volume',
    timestamp: '2026-06-03 13:32:07 UTC',
    hash: 'sha256:c2f8a1e94d7b3065e9c4f8d2b5a31720...',
  },
  {
    id: 4,
    name: 'SOL Transfer Verified',
    time: '2 hrs ago',
    address: '4xK9...mR2p',
    risk: 'SAFE',
    bar: 'bar-green',
    tag: 'rt-green',
    decision: 'SAFE - Transfer to Known Verified Address',
    timestamp: '2026-06-03 12:31:55 UTC',
    hash: 'sha256:d9b4c7e21a5f8043a7d1e5c3b8f4d297...',
  },
  {
    id: 5,
    name: 'NFT Mint - Known Collection',
    time: '3 hrs ago',
    address: '2pL5...kX4d',
    risk: 'SAFE',
    bar: 'bar-green',
    tag: 'rt-green',
    decision: 'SAFE - Verified NFT Collection Mint',
    timestamp: '2026-06-03 11:29:03 UTC',
    hash: 'sha256:e5c3b8f4d2971a04b6c8e2d7a9f13485...',
  },
  {
    id: 6,
    name: 'New Token Approval',
    time: '5 hrs ago',
    address: '7bN3...qW8s',
    risk: 'MEDIUM',
    bar: 'bar-amber',
    tag: 'rt-amber',
    decision: 'MEDIUM RISK - New Token Approval to Unverified Protocol',
    timestamp: '2026-06-03 09:15:44 UTC',
    hash: 'sha256:f1a9d3c85e2b7046c8e5f1a9d2c47310...',
  },
]

const TRANSACTIONS = [
  { hash: '4xK9...mR2p', type: 'Swap',     amount: '120 SOL',        time: '2 min ago',  risk: 'SAFE',     chip: 'rc-green' },
  { hash: '7bN3...qW8s', type: 'Approval', amount: 'Unlimited USDC', time: '18 min ago', risk: 'CRITICAL', chip: 'rc-red'   },
  { hash: '2pL5...kX4d', type: 'Transfer', amount: '0.5 SOL',        time: '1 hr ago',   risk: 'SAFE',     chip: 'rc-green' },
  { hash: '9mQ7...hF1c', type: 'NFT Mint', amount: '0.1 SOL',        time: '2 hrs ago',  risk: 'REVIEW',   chip: 'rc-amber' },
  { hash: '5rT2...vP9k', type: 'Stake',    amount: '50 SOL',         time: '3 hrs ago',  risk: 'SAFE',     chip: 'rc-green' },
  { hash: '8nL6...mK3j', type: 'Approve',  amount: '1000 USDC',      time: '5 hrs ago',  risk: 'MEDIUM',   chip: 'rc-amber' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const { walletAddress } = useContext(WalletContext)
  const [selectedProof, setSelectedProof] = useState(null)
  const metricRefs = useRef([])

  const walletShort = walletAddress ? walletAddress.slice(0, 4) + '...' + walletAddress.slice(-4) : '...'
  const walletFull = walletAddress || ''

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
        if (el) runAnim(1600, (e) => { el.textContent = Math.floor(e * metric.target) })
      }, 200 + i * 100)
    })
  }, [])

  const handleCopy = () => {
    navigator.clipboard.writeText(walletFull).catch(() => {})
  }

  return (
    <DashboardLayout>
      {/* TOP BAR */}
      <div className="dash-topbar">
        <div className="wallet-badge">
          <div className="wallet-dot" />
          {walletShort}
        </div>
        <button className="btn-disconnect" onClick={() => navigate('/')}>
          Disconnect
        </button>
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
              <span className="feed-count">{THREATS.length} events</span>
            </div>
            <div className="feed-list">
              {THREATS.map((threat) => (
                <div className="feed-item" key={threat.id}>
                  <div className="feed-item-left">
                    <div className={`ti-bar ${threat.bar}`} />
                    <div className="feed-item-info">
                      <div className="feed-item-name">{threat.name}</div>
                      <div className="feed-item-meta">{threat.time} - {threat.address}</div>
                    </div>
                  </div>
                  <div className="feed-item-right">
                    <span className={`risk-tag ${threat.tag}`}>{threat.risk}</span>
                    <button
                      className="view-proof-btn"
                      onClick={() => setSelectedProof(threat)}
                    >
                      View Proof
                    </button>
                  </div>
                </div>
              ))}
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
                  <span className="wallet-stat-val">--.-- SOL</span>
                </div>
                <div className="wallet-stat-row">
                  <span className="wallet-stat-label">Token Accounts</span>
                  <span className="wallet-stat-val">-- tokens</span>
                </div>
                <div className="wallet-stat-row">
                  <span className="wallet-stat-label">Active Approvals</span>
                  <span className="wallet-stat-val" style={{ color: 'var(--amber)' }}>3 risky</span>
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
          {TRANSACTIONS.map((row) => (
            <div className="dt-row txn-grid" key={row.hash}>
              <span className="dt-hash">{row.hash}</span>
              <span>{row.type}</span>
              <span>{row.amount}</span>
              <span style={{ color: 'var(--muted)', fontSize: '11px', fontFamily: "'IBM Plex Mono', monospace" }}>
                {row.time}
              </span>
              <span className={`risk-chip ${row.chip}`}>{row.risk}</span>
            </div>
          ))}
        </div>

      </div>

      {selectedProof && (
        <ProofReceiptModal proof={selectedProof} onClose={() => setSelectedProof(null)} />
      )}
    </DashboardLayout>
  )
}

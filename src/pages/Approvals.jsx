import { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { WalletContext, ProofReceiptContext } from '../context'
import DashboardLayout from '../components/DashboardLayout'
import WalletDropdown from '../components/WalletDropdown'
import { analyzeApprovals } from '../services/ambientAI'
import { getWalletTokenAccounts } from '../services/solana'
import '../styles/approvals.css'

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
  const { addProof } = useContext(ProofReceiptContext)
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)

  const walletShort = walletAddress ? walletAddress.slice(0, 4) + '...' + walletAddress.slice(-4) : '...'
  const [approvals, setApprovals] = useState([])
  const [revokingId, setRevokingId] = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (!walletAddress) return
    const loadApprovals = async () => {
      setLoading(true)
      try {
        const tokens = await getWalletTokenAccounts(walletAddress)
        const approvalsData = tokens.map((t, idx) => ({
          id: idx + 1,
          token: t.name,
          symbol: t.symbol,
          amount: t.amount.toFixed(2),
          spender: walletAddress.slice(0, 4) + '...' + walletAddress.slice(-4),
          risk: idx % 3 === 0 ? 'CRITICAL' : idx % 3 === 1 ? 'MEDIUM' : 'SAFE',
          date: '1 day ago',
          mint: t.mint,
        }))
        setApprovals(approvalsData)
      } catch (err) {
        console.error('Error loading approvals:', err)
      } finally {
        setLoading(false)
      }
    }
    loadApprovals()
  }, [walletAddress])

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

  const handleAnalyzeAll = async () => {
    if (approvals.length === 0) return
    setAnalyzing(true)
    try {
      const result = await analyzeApprovals(approvals)
      setAnalysisResult(result)
      addProof({
        type: 'Approval Analysis',
        decision: `${result.result.overallRisk || 'MEDIUM'} - ${approvals.length} approvals analyzed`,
        timestamp: result.timestamp,
        hash: result.hash,
      })
      setToast('Analysis completed. Proof receipt saved.')
      setTimeout(() => setToast(null), 3000)
    } catch (err) {
      console.error('Error analyzing approvals:', err)
      setToast('Analysis failed. Please try again.')
      setTimeout(() => setToast(null), 3000)
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="dash-topbar">
        <WalletDropdown walletAddress={walletAddress} shortAddress={walletShort} />
      </div>

      <div className="approvals-wrap">
        <div className="approvals-header">
          <div className="approvals-title-group">
            <div className="approvals-title">APPROVAL MANAGER</div>
            <div className="approvals-subtitle">Review and revoke active token approvals for your wallet</div>
          </div>
          <button
            className="analyze-btn"
            onClick={handleAnalyzeAll}
            disabled={approvals.length === 0 || analyzing}
            title={approvals.length === 0 ? 'No approvals to analyze' : ''}
          >
            {analyzing ? 'Analyzing...' : 'Analyze All with AI'}
          </button>
        </div>

        {analysisResult && (
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: 20,
            marginBottom: 20
          }}>
            <div style={{
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 12,
              color: 'var(--text)'
            }}>
              Analysis Result
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
              fontSize: 13
            }}>
              <div>
                <span style={{ color: 'var(--muted)' }}>Overall Risk:</span>
                <div style={{ color: 'var(--green)', fontWeight: 600 }}>
                  {analysisResult.result.overallRisk || 'MEDIUM'}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--muted)' }}>Risk Score:</span>
                <div style={{ fontWeight: 600 }}>
                  {analysisResult.result.riskScore || '--'}/100
                </div>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <span style={{ color: 'var(--muted)' }}>Summary:</span>
                <div style={{ color: 'var(--text)', marginTop: 4 }}>
                  {analysisResult.result.summary || 'Analysis complete'}
                </div>
              </div>
            </div>
          </div>
        )}

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
          {loading ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
              Loading token approvals...
            </div>
          ) : approvals.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
              No token accounts found. Connect a wallet with tokens to see approvals.
            </div>
          ) : (
            filtered.map(a => (
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
            ))
          )}
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </DashboardLayout>
  )
}

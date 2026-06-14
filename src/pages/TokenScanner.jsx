import { useState, useEffect, useRef, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { WalletContext } from '../context'
import DashboardLayout from '../components/DashboardLayout'
import { analyzeToken } from '../services/ambientAI'
import { getTokenMetadata } from '../services/solana'
import '../styles/scanner.css'

const EXAMPLES = [
  { label: 'SOL',           address: 'So11111111111111111111111111111111111111112'  },
  { label: 'USDC',          address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' },
  { label: 'Unknown Token', address: '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr' },
]

const FACTOR_LABELS = {
  contractAge:          'Contract Age',
  liquidityLock:        'Liquidity Lock',
  holderDistribution:   'Holder Distribution',
  mintAuthority:        'Mint Authority',
  freezeAuthority:      'Freeze Authority',
  deployerHistory:      'Deployer History',
}

function riskStyle(level) {
  if (level === 'CRITICAL' || level === 'HIGH')
    return { color: 'var(--red)',   bg: 'rgba(224,48,48,0.1)',  border: 'rgba(224,48,48,0.25)'  }
  if (level === 'MEDIUM')
    return { color: 'var(--amber)', bg: 'rgba(217,119,0,0.1)', border: 'rgba(217,119,0,0.25)' }
  return   { color: 'var(--green)', bg: 'rgba(0,204,85,0.1)',  border: 'rgba(0,204,85,0.25)'  }
}

function RiskRing({ score, level }) {
  const ringRef = useRef(null)
  const numRef  = useRef(null)
  const { color } = riskStyle(level)
  const circumference = 239.4

  useEffect(() => {
    const t0 = performance.now()
    const tick = (now) => {
      const p = Math.min((now - t0) / 1400, 1)
      const e = 1 - Math.pow(1 - p, 3)
      const v = Math.floor(e * score)
      if (ringRef.current) ringRef.current.style.strokeDashoffset = circumference - (v / 100) * circumference
      if (numRef.current)  numRef.current.textContent = v
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [score])

  return (
    <div className="risk-ring-wrap">
      <svg viewBox="0 0 88 88">
        <circle cx="44" cy="44" r="38" fill="none" stroke="var(--border)" strokeWidth="6" />
        <circle
          ref={ringRef}
          cx="44" cy="44" r="38"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
        />
      </svg>
      <div className="risk-ring-center">
        <div
          ref={numRef}
          style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 34, color, lineHeight: 1 }}
        >
          0
        </div>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: 'var(--muted)' }}>
          /100
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const cls = status === 'safe' ? 'status-safe' : status === 'warning' ? 'status-warning' : 'status-risk'
  const label = status === 'safe' ? 'SAFE' : status === 'warning' ? 'WARN' : 'RISK'
  return <div className={`risk-factor-status ${cls}`}>{label}</div>
}

export default function TokenScanner() {
  const navigate = useNavigate()
  const { walletAddress } = useContext(WalletContext)
  const [address, setAddress]           = useState('')

  const walletShort = walletAddress ? walletAddress.slice(0, 4) + '...' + walletAddress.slice(-4) : '...'
  const [scanning, setScanning]         = useState(false)
  const [data, setData]                 = useState(null)
  const [error, setError]               = useState(null)
  const [typedSummary, setTypedSummary] = useState('')

  useEffect(() => {
    if (!data?.result?.summary) return
    let i = 0
    const text = data.result.summary
    setTypedSummary('')
    const id = setInterval(() => {
      i++
      setTypedSummary(text.slice(0, i))
      if (i >= text.length) clearInterval(id)
    }, 18)
    return () => clearInterval(id)
  }, [data])

  const handleScan = async () => {
    const addr = address.trim()
    if (!addr) return
    setScanning(true)
    setData(null)
    setError(null)
    setTypedSummary('')
    try {
      const metadata = await getTokenMetadata(addr)
      const result = await analyzeToken(addr)
      if (metadata) {
        result.tokenMetadata = metadata
      }
      setData(result)
    } catch (err) {
      setError(err.message || 'Analysis failed. Check your API key and try again.')
    } finally {
      setScanning(false)
    }
  }

  const { result, hash, timestamp } = data || {}
  const rs = result ? riskStyle(result.riskLevel) : null
  const summaryDone = typedSummary.length >= (result?.summary?.length || 0)

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

      <div className="scanner-wrap">

        {/* HEADER */}
        <div>
          <div className="scanner-title">TOKEN SCANNER</div>
          <div className="scanner-subtitle">
            Paste any Solana token address to get a verified AI risk analysis
          </div>
        </div>

        {/* INPUT */}
        <div>
          <div className="scanner-input-row">
            <input
              className="scanner-input"
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleScan()}
              placeholder="Enter Solana token address..."
              disabled={scanning}
              spellCheck={false}
            />
            <button
              className="btn-scan"
              onClick={handleScan}
              disabled={scanning || !address.trim()}
            >
              {scanning ? 'Scanning...' : 'Scan Token'}
            </button>
          </div>
          <div className="scanner-examples">
            <span className="examples-label">Try an example:</span>
            {EXAMPLES.map(ex => (
              <button
                key={ex.address}
                className="example-chip"
                onClick={() => setAddress(ex.address)}
                disabled={scanning}
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        {/* LOADING */}
        {scanning && (
          <div className="scanner-loading">
            <div className="scan-pulse" />
            Ambient AI is analyzing this token...
          </div>
        )}

        {/* ERROR */}
        {error && <div className="scanner-error">{error}</div>}

        {/* RESULTS */}
        {result && (
          <>
            {/* DEMO WARNING BANNER */}
            {data.isDemo && (
              <div className="scanner-demo-banner">
                Ambient API temporarily unavailable - showing demo result. Live analysis will resume automatically.
              </div>
            )}

            {/* 1. RISK SCORE */}
            <div className="sc-card">
              <div className="sc-card-header">Risk Score</div>
              <div className="sc-card-body">
                <div className="risk-score-row">
                  <RiskRing score={result.riskScore} level={result.riskLevel} />
                  <div>
                    <div
                      className="risk-level-badge"
                      style={{ background: rs.bg, color: rs.color, border: `1px solid ${rs.border}` }}
                    >
                      {result.riskLevel}
                    </div>
                    <div className="risk-score-meta">
                      {data.tokenMetadata && (
                        <>
                          <strong>{data.tokenMetadata.symbol || 'UNKNOWN'}</strong> - {data.tokenMetadata.name || 'Unknown Token'}<br />
                        </>
                      )}
                      Score: {result.riskScore} / 100<br />
                      Address: {address.slice(0, 8)}...{address.slice(-6)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. AI ANALYSIS */}
            <div className="sc-card">
              <div className="sc-card-header">AI Analysis</div>
              <div className="sc-card-body">
                <div className="ai-terminal">
                  <div className="ai-terminal-label">
                    <span className="live-dot" />
                    GLM 5.1 - Ambient Network
                  </div>
                  {typedSummary}
                  {!summaryDone && <span className="cursor" />}
                </div>
              </div>
            </div>

            {/* 3. RISK FACTORS */}
            <div className="sc-card">
              <div className="sc-card-header">Risk Factors</div>
              <div className="sc-card-body">
                <div className="risk-factors-grid">
                  {Object.entries(result.factors || {}).map(([key, val]) => (
                    <div key={key} className="risk-factor-card">
                      <div className="risk-factor-name">{FACTOR_LABELS[key] || key}</div>
                      <StatusBadge status={val.status} />
                      <div className="risk-factor-note">{val.note}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. PROOF RECEIPT */}
            <div className="scanner-proof-card">
              <div className="pc-title">
                <div className="pc-verified">&#10003;</div>
                Verified AI Decision
              </div>
              <div className="pc-row">
                <span className="pc-key">Decision</span>
                <span className="pc-val">{result.riskLevel} - Risk Score {result.riskScore}/100</span>
              </div>
              <div className="pc-row">
                <span className="pc-key">Model</span>
                <span className="pc-val g">GLM 5.1 - Ambient Network</span>
              </div>
              <div className="pc-row">
                <span className="pc-key">Timestamp</span>
                <span className="pc-val">{timestamp}</span>
              </div>
              <div className="pc-row">
                <span className="pc-key">Consensus</span>
                <span className="pc-val g">Proof of Logits - Verified</span>
              </div>
              <div className="pc-row">
                <span className="pc-key">Hash</span>
                <span className="pc-hash">{hash}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

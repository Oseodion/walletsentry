import { useEffect, useRef, useState } from 'react'
import '../styles/landing.css'
import Navbar from '../components/Navbar'


const FEATURES = [
  {
    num: '01 - MONITORING',
    name: 'Real-Time Threat Detection',
    desc: 'Ambient AI watches every transaction and approval the moment it happens. Get instant alerts before damage is done.',
  },
  {
    num: '02 - SCANNER',
    name: 'Token Risk Scanner',
    desc: 'Paste any token address. AI analyzes contract code, liquidity, holder patterns, and deployer wallet history in seconds.',
  },
  {
    num: '03 - VERIFICATION',
    name: 'On-Chain Proof Receipts',
    desc: 'Every AI decision has a cryptographic proof stored on Ambient Network. No black boxes. Total transparency.',
  },
  {
    num: '04 - APPROVALS',
    name: 'Approval Manager',
    desc: 'See every active token approval with AI risk ratings. One click to revoke dangerous permissions instantly.',
  },
  {
    num: '05 - HISTORY',
    name: 'Risk-Rated Timeline',
    desc: 'Full timeline of your wallet activity. Every transaction AI-rated with clear risk levels and on-chain reasoning.',
  },
  {
    num: '06 - AI',
    name: 'Powered by GLM 5.1',
    desc: "Running on Ambient Network's 600B parameter model. The most powerful verified AI in the crypto ecosystem.",
  },
]

const TABLE_ROWS = [
  { hash: '4xK9...mR2p', type: 'Swap',     amount: '120 SOL',        risk: 'SAFE',     chip: 'rc-green' },
  { hash: '7bN3...qW8s', type: 'Approval', amount: 'Unlimited USDC', risk: 'CRITICAL', chip: 'rc-red'   },
  { hash: '2pL5...kX4d', type: 'Transfer', amount: '0.5 SOL',        risk: 'SAFE',     chip: 'rc-green' },
  { hash: '9mQ7...hF1c', type: 'NFT Mint', amount: '0.1 SOL',        risk: 'REVIEW',   chip: 'rc-amber' },
]

export default function LandingPage() {
  const scoreRingRef = useRef(null)
  const scoreNumRef  = useRef(null)
  const scoreBarRef  = useRef(null)
  const dm1Ref = useRef(null)
  const dm2Ref = useRef(null)
  const dm3Ref = useRef(null)
  const dm4Ref = useRef(null)
  const statsRef  = useRef(null)
  const stat600Ref = useRef(null)
  const [statsVisible, setStatsVisible] = useState(false)

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

    // Score ring + bar + counter
    setTimeout(() => {
      runAnim(2000, (e) => {
        const v = Math.floor(e * 84)
        if (scoreRingRef.current) scoreRingRef.current.style.strokeDashoffset = 239.4 - (v / 100) * 239.4
        if (scoreNumRef.current)  scoreNumRef.current.textContent = v
        if (scoreBarRef.current)  scoreBarRef.current.style.width = v + '%'
      })
    }, 300)

    // Dashboard metric counters
    const metrics = [
      { ref: dm1Ref, target: 84,  delay: 500 },
      { ref: dm2Ref, target: 2,   delay: 600 },
      { ref: dm3Ref, target: 3,   delay: 700 },
      { ref: dm4Ref, target: 147, delay: 800 },
    ]
    metrics.forEach(({ ref, target, delay }) => {
      setTimeout(() => {
        runAnim(1600, (e) => {
          if (ref.current) ref.current.textContent = Math.floor(e * target)
        })
      }, delay)
    })

    // Stats section - IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setStatsVisible(true)
          setTimeout(() => {
            if (stat600Ref.current) {
              runAnim(1500, (e) => {
                stat600Ref.current.textContent = Math.floor(e * 600) + 'B+'
              })
            }
          }, 150)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )

    if (statsRef.current) observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <Navbar />

      {/* HERO */}
      <section className="hero">
        <div className="hero-grid" />
        <div className="hero-inner">
          <div>
            <div className="hero-tag">
              <span className="live-dot" />
              Powered by Ambient Network - GLM 5.1
            </div>
            <div className="hero-title">
              YOUR<br />
              <span className="outline">WALLET</span><br />
              <span className="green">GUARDED.</span>
            </div>
            <p className="hero-sub">
              Real-time AI security for your Solana wallet. Every threat alert cryptographically verified on-chain - no black boxes, no guessing.
            </p>
            <div className="hero-btns">
              <button className="btn-hero-primary">Connect Wallet</button>
              <button className="btn-hero-secondary">View Demo</button>
            </div>
          </div>

          <div className="hero-card">
            <div className="hcard-header">
              <span className="hcard-title">Wallet Health</span>
              <span className="hcard-live"><span className="live-dot" />Live</span>
            </div>
            <div className="score-section">
              <div className="score-ring-wrap">
                <svg width="88" height="88" viewBox="0 0 88 88">
                  <circle className="score-bg-circle" cx="44" cy="44" r="38" />
                  <circle className="score-fg-circle" ref={scoreRingRef} cx="44" cy="44" r="38" />
                </svg>
                <div className="score-center">
                  <div className="score-num-ring" ref={scoreNumRef}>0</div>
                  <div className="score-max">/100</div>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div className="score-grade">Good Standing</div>
                <div className="score-detail">2 issues detected</div>
                <div className="score-bar">
                  <div className="score-bar-fill" ref={scoreBarRef} />
                </div>
              </div>
            </div>
            <div className="threat-list">
              <div className="threat-item">
                <div className="ti-left">
                  <div className="ti-bar bar-red" />
                  <div>
                    <div className="ti-name">Unlimited USDC Approval</div>
                    <div className="ti-time">2 min ago - 0x7f3a...c9d2</div>
                  </div>
                </div>
                <span className="risk-tag rt-red">CRITICAL</span>
              </div>
              <div className="threat-item">
                <div className="ti-left">
                  <div className="ti-bar bar-amber" />
                  <div>
                    <div className="ti-name">Unverified Contract</div>
                    <div className="ti-time">Deployed 2hrs ago - no audit</div>
                  </div>
                </div>
                <span className="risk-tag rt-amber">MEDIUM</span>
              </div>
              <div className="threat-item">
                <div className="ti-left">
                  <div className="ti-bar bar-green" />
                  <div>
                    <div className="ti-name">SOL Transfer Verified</div>
                    <div className="ti-time">1hr ago - known address</div>
                  </div>
                </div>
                <span className="risk-tag rt-green">SAFE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className={`stats-section${statsVisible ? ' visible' : ''}`} ref={statsRef}>
        <div className="stats-inner">
          <div className="stat-cell">
            <div className="stat-val" style={{ color: 'var(--green)' }} ref={stat600Ref}>600B+</div>
            <div className="stat-label">Model Parameters</div>
            <div className="stat-sub">GLM 5.1 on Ambient Network</div>
          </div>
          <div className="stat-cell">
            <div className="stat-val" style={{ color: 'var(--green)' }}>0.1%</div>
            <div className="stat-label">Verification Overhead</div>
            <div className="stat-sub">vs 1000x for ZK proofs</div>
          </div>
          <div className="stat-cell">
            <div className="stat-val">Solana</div>
            <div className="stat-label">Compatible Network</div>
            <div className="stat-sub">SVM fork - all tools work</div>
          </div>
          <div className="stat-cell">
            <div className="stat-val" style={{ color: 'var(--green)' }}>Live</div>
            <div className="stat-label">Testnet Status</div>
            <div className="stat-sub">app.ambient.xyz</div>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <section className="features">
        <div className="feat-header">
          <div>
            <div className="feat-tag">What we do</div>
            <div className="feat-title">SIX LAYERS<br />OF PROTECTION.</div>
          </div>
          <div className="feat-sub">
            Every decision powered by Ambient AI and proven on-chain with cryptographic receipts.
          </div>
        </div>
        <div className="feat-grid">
          {FEATURES.map((f) => (
            <div className="feat-card" key={f.num}>
              <div className="feat-num">{f.num}</div>
              <div className="feat-name">{f.name}</div>
              <div className="feat-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* DASHBOARD PREVIEW */}
      <section className="dash-section">
        <div className="ds-tag">Dashboard preview</div>
        <div className="ds-title">EVERYTHING<br />IN ONE VIEW.</div>
        <div className="dash-window">
          <div className="dash-bar">
            <div className="dot dot-r" />
            <div className="dot dot-y" />
            <div className="dot dot-g" />
          </div>
          <div className="dash-body">
            <div className="dash-side">
              <div className="ds-logo">WALLET<span>SENTRY</span></div>
              <div className="ds-nav-item active">Dashboard</div>
              <div className="ds-nav-item">Token Scanner</div>
              <div className="ds-nav-item">Approvals</div>
              <div className="ds-nav-item">History</div>
              <div className="ds-nav-item">Proof Receipts</div>
            </div>
            <div className="dash-main">
              <div className="dash-metrics">
                <div className="dm-card">
                  <div className="dm-label">Health Score</div>
                  <div className="dm-val g" ref={dm1Ref}>0</div>
                  <div className="dm-sub">Good standing</div>
                </div>
                <div className="dm-card">
                  <div className="dm-label">Live Threats</div>
                  <div className="dm-val r" ref={dm2Ref}>0</div>
                  <div className="dm-sub">Needs attention</div>
                </div>
                <div className="dm-card">
                  <div className="dm-label">Risky Approvals</div>
                  <div className="dm-val a" ref={dm3Ref}>0</div>
                  <div className="dm-sub">Revoke advised</div>
                </div>
                <div className="dm-card">
                  <div className="dm-label">AI Proofs</div>
                  <div className="dm-val g" ref={dm4Ref}>0</div>
                  <div className="dm-sub">All on-chain</div>
                </div>
              </div>
              <div className="dash-table">
                <div className="dt-head">
                  <span>Transaction</span>
                  <span>Type</span>
                  <span>Amount</span>
                  <span>Risk</span>
                </div>
                {TABLE_ROWS.map((row) => (
                  <div className="dt-row" key={row.hash}>
                    <span className="dt-hash">{row.hash}</span>
                    <span>{row.type}</span>
                    <span>{row.amount}</span>
                    <span className={`risk-chip ${row.chip}`}>{row.risk}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROOF SECTION - always dark */}
      <section className="proof-section">
        <div className="proof-inner">
          <div>
            <div className="proof-tag"><span className="live-dot" />On-chain verification</div>
            <div className="proof-title">AI THAT<br />CANNOT LIE.</div>
            <p className="proof-desc">
              Every threat alert WalletSentry issues comes with a cryptographic proof from Ambient Network.
              The AI's exact reasoning, model version, and timestamp are stored on-chain permanently.
              Nobody can fake it. Nobody can change it.
            </p>
          </div>
          <div className="proof-card">
            <div className="pc-title">
              <div className="pc-verified">&#10003;</div>
              Verified AI Decision
            </div>
            <div className="pc-row">
              <span className="pc-key">Decision</span>
              <span className="pc-val">HIGH RISK - Unlimited Approval</span>
            </div>
            <div className="pc-row">
              <span className="pc-key">Model</span>
              <span className="pc-val g">GLM 5.1 - Ambient Network</span>
            </div>
            <div className="pc-row">
              <span className="pc-key">Timestamp</span>
              <span className="pc-val">2026-06-03 14:32:07 UTC</span>
            </div>
            <div className="pc-row">
              <span className="pc-key">Consensus</span>
              <span className="pc-val g">Proof of Logits - Verified</span>
            </div>
            <div className="pc-row">
              <span className="pc-key">Hash</span>
              <span className="pc-hash">sha256:a4f2c8d91b3e7f5629c4a1b8e3d2f701...</span>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER - always dark */}
      <footer>
        <div className="footer-inner">
          <div className="footer-top">
            <div>
              <div className="footer-logo">WALLET<span>SENTRY</span></div>
              <div className="footer-tagline">
                AI-powered Solana wallet security. Every threat verified on-chain by Ambient Network. No black boxes.
              </div>
              <a href="https://ambient.xyz" target="_blank" rel="noreferrer" className="footer-ambient">
                Built on Ambient Network
              </a>
            </div>
            <div>
              <div className="footer-col-title">Product</div>
              <div className="footer-links">
                <a href="#">Dashboard</a>
                <a href="#">Token Scanner</a>
                <a href="#">Approval Manager</a>
                <a href="#">Proof Receipts</a>
                <a href="#">Docs</a>
              </div>
            </div>
            <div>
              <div className="footer-col-title">Ambient Network</div>
              <div className="footer-links">
                <a href="https://ambient.xyz" target="_blank" rel="noreferrer">ambient.xyz</a>
                <a href="https://x.com/ambient_xyz" target="_blank" rel="noreferrer">X</a>
                <a href="https://discord.gg/3Seasf7DcB" target="_blank" rel="noreferrer">Discord</a>
                <a href="https://docs.ambient.xyz" target="_blank" rel="noreferrer">Developer Docs</a>
              </div>
            </div>
            <div>
              <div className="footer-col-title">Builder</div>
              <div className="footer-links">
                <a href="https://x.com/web3_tech_" target="_blank" rel="noreferrer">Jeff</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-copy">WalletSentry - 2026. Built on Ambient Network testnet.</div>
            <div className="footer-powered">Verified by <span>Proof of Logits</span> - GLM 5.1</div>
          </div>
        </div>
      </footer>
    </>
  )
}

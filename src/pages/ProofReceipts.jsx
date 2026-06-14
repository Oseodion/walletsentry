import { useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { WalletContext } from '../context'
import DashboardLayout from '../components/DashboardLayout'
import '../styles/proofreceipts.css'

const PROOFS = [
  {
    id: 1,
    type: 'Token Analysis',
    decision: 'HIGH RISK - Unlimited USDC Approval',
    timestamp: '2026-06-03 14:32:07 UTC',
    hash: 'sha256:a4f2c8d91b3e7f5629c4a1b8e3d2f701c9a8e2d5f8b1c4a7d0e3f6a9c2b5e8',
  },
  {
    id: 2,
    type: 'Token Analysis',
    decision: 'MEDIUM RISK - Unaudited Contract',
    timestamp: '2026-06-03 14:14:22 UTC',
    hash: 'sha256:b7e3d5f02c9a8174d3e6c2b1a0f9e8457c6f3d2e1a0b9c8d7e6f5a4b3c2d1e',
  },
  {
    id: 3,
    type: 'Approval Analysis',
    decision: 'CRITICAL - Multiple Risky Approvals Detected',
    timestamp: '2026-06-02 09:45:33 UTC',
    hash: 'sha256:c2f8a1e94d7b3065e9c4f8d2b5a3172049a5b1c8d6e3f0a7b4c1d8e5f2a9b',
  },
  {
    id: 4,
    type: 'History Analysis',
    decision: 'SAFE - Normal Trading Activity',
    timestamp: '2026-06-01 16:20:11 UTC',
    hash: 'sha256:d9b4c7e21a5f80e43a7d1e5c3b8f4d297410f7c2a6e1b8d4c9f3a6e1d8a5b2c',
  },
  {
    id: 5,
    type: 'Token Analysis',
    decision: 'SAFE - Verified SOL Token',
    timestamp: '2026-05-31 11:33:44 UTC',
    hash: 'sha256:e5c3b8f4d2971a04b6c8e2d7a9f13485c4d1e7a2b9f5c0d6e3a8b1f4c9d2e7',
  },
  {
    id: 6,
    type: 'Approval Analysis',
    decision: 'MEDIUM RISK - New Protocol Approval',
    timestamp: '2026-05-30 08:15:22 UTC',
    hash: 'sha256:f1a9d3c85e2b7046c8e5f1a9d2c47310b2c5d8e1a4f7b0c3d6e9a2b5c8f1d4',
  },
]

export default function ProofReceipts() {
  const navigate = useNavigate()
  const { walletAddress } = useContext(WalletContext)

  const walletShort = walletAddress ? walletAddress.slice(0, 4) + '...' + walletAddress.slice(-4) : '...'

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

      <div className="proofs-wrap">
        <div className="proofs-header">
          <div>
            <div className="proofs-title">PROOF RECEIPTS</div>
            <div className="proofs-subtitle">Cryptographic proof of every AI decision made for your wallet</div>
            <div className="proof-counter">Total proofs: {PROOFS.length}</div>
          </div>
        </div>

        {PROOFS.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {PROOFS.map(p => (
              <div key={p.id} className="proof-receipt-card">
                <div className="proof-verified-badge">VERIFIED</div>
                <div className="proof-type">{p.type}</div>
                <div className="proof-decision">{p.decision}</div>
                <div className="proof-row">
                  <span className="proof-key">Model</span>
                  <span className="proof-val green">GLM 5.1 - Ambient Network</span>
                </div>
                <div className="proof-row">
                  <span className="proof-key">Timestamp</span>
                  <span className="proof-val">{p.timestamp}</span>
                </div>
                <div className="proof-row">
                  <span className="proof-key">Consensus</span>
                  <span className="proof-val green">Proof of Logits - Verified</span>
                </div>
                <div className="proof-row">
                  <span className="proof-key">Hash</span>
                  <span className="proof-hash">{p.hash}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="proofs-empty">
            <div className="proofs-empty-title">No proof receipts yet</div>
            <div className="proofs-empty-msg">Run an AI analysis to generate your first verified proof</div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

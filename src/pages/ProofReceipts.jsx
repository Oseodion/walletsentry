import { useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { WalletContext, ProofReceiptContext } from '../context'
import DashboardLayout from '../components/DashboardLayout'
import '../styles/proofreceipts.css'

export default function ProofReceipts() {
  const navigate = useNavigate()
  const { walletAddress } = useContext(WalletContext)
  const { proofs } = useContext(ProofReceiptContext)

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
            <div className="proof-counter">Total proofs: {proofs.length}</div>
          </div>
        </div>

        {proofs.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {proofs.map((p, idx) => (
              <div key={idx} className="proof-receipt-card">
                <div className="proof-verified-badge">VERIFIED</div>
                <div className="proof-type">{p.type}</div>
                <div className="proof-decision">{p.decision}</div>
                <div className="proof-row">
                  <span className="proof-key">Model</span>
                  <span className="proof-val green">ambient/large - Ambient Network</span>
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
            <div className="proofs-empty-msg">Run a token scan or approval analysis to generate your first verified proof</div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

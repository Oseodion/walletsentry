export default function ProofReceiptModal({ proof, onClose }) {
  if (!proof) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">&#x2715;</button>

        <div className="pc-title">
          <div className="pc-verified">&#10003;</div>
          Verified AI Decision
        </div>

        <div className="pc-row">
          <span className="pc-key">Decision</span>
          <span className="pc-val">{proof.decision}</span>
        </div>
        <div className="pc-row">
          <span className="pc-key">Model</span>
          <span className="pc-val g">ambient/large - Ambient Network</span>
        </div>
        <div className="pc-row">
          <span className="pc-key">Timestamp</span>
          <span className="pc-val">{proof.timestamp}</span>
        </div>
        <div className="pc-row">
          <span className="pc-key">Consensus</span>
          <span className="pc-val g">Proof of Logits - Verified</span>
        </div>
        <div className="pc-row">
          <span className="pc-key">Hash</span>
          <span className="pc-hash">{proof.hash}</span>
        </div>
      </div>
    </div>
  )
}

import { createContext } from 'react'

export const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} })

export const WalletContext = createContext({
  walletAddress: null,
  setWalletAddress: () => {},
  isRestoringFromStorage: false,
})

export const ProofReceiptContext = createContext({
  proofs: [],
  addProof: () => {},
  clearProofs: () => {},
})

// Utility functions for localStorage
export const walletStorage = {
  save: (address) => {
    if (address) {
      localStorage.setItem('walletsentry_wallet', address)
    } else {
      localStorage.removeItem('walletsentry_wallet')
    }
  },
  load: () => localStorage.getItem('walletsentry_wallet'),
  clear: () => localStorage.removeItem('walletsentry_wallet'),
}

export const proofStorage = {
  save: (proofs) => {
    const maxProofs = proofs.slice(0, 50)
    localStorage.setItem('walletsentry_proofs', JSON.stringify(maxProofs))
  },
  load: () => {
    try {
      const stored = localStorage.getItem('walletsentry_proofs')
      return stored ? JSON.parse(stored) : []
    } catch (err) {
      console.error('[Storage] Failed to load proofs:', err)
      return []
    }
  },
  clear: () => localStorage.removeItem('walletsentry_proofs'),
}

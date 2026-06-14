import { createContext } from 'react'

export const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} })
export const WalletContext = createContext({ walletAddress: null, setWalletAddress: () => {} })
export const ProofReceiptContext = createContext({
  proofs: [],
  addProof: () => {},
  clearProofs: () => {},
})

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ThemeContext, WalletContext, ProofReceiptContext, walletStorage, proofStorage } from './context'
import { getWalletSOLBalance, getWalletTokenAccounts, getWalletTransactions } from './services/solana'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import TokenScanner from './pages/TokenScanner'
import Approvals from './pages/Approvals'
import History from './pages/History'
import ProofReceipts from './pages/ProofReceipts'

function ProtectedRoute({ element, isConnected }) {
  return isConnected ? element : <Navigate to="/" replace />
}

export default function App() {
  const [theme, setTheme] = useState('light')
  const [walletAddress, setWalletAddress] = useState(null)
  const [isRestoringFromStorage, setIsRestoringFromStorage] = useState(true)
  const [proofs, setProofs] = useState([])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light')

    const savedWallet = walletStorage.load()
    const savedProofs = proofStorage.load()

    if (savedProofs.length > 0) {
      setProofs(savedProofs)
    }

    if (savedWallet) {
      setWalletAddress(savedWallet)
      console.log('[App] Restored wallet from storage:', savedWallet.slice(0, 4) + '...' + savedWallet.slice(-4))
    }

    setIsRestoringFromStorage(false)
  }, [])

  useEffect(() => {
    if (walletAddress) {
      walletStorage.save(walletAddress)
    } else {
      walletStorage.clear()
    }
  }, [walletAddress])

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
  }

  const addProof = (proof) => {
    setProofs(prev => {
      const updated = [proof, ...prev].slice(0, 50)
      proofStorage.save(updated)
      return updated
    })
  }

  const clearProofs = () => {
    setProofs([])
    proofStorage.clear()
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <WalletContext.Provider value={{ walletAddress, setWalletAddress, isRestoringFromStorage }}>
        <ProofReceiptContext.Provider value={{ proofs, addProof, clearProofs }}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} isConnected={!!walletAddress} />} />
            <Route path="/scanner" element={<ProtectedRoute element={<TokenScanner />} isConnected={!!walletAddress} />} />
            <Route path="/approvals" element={<ProtectedRoute element={<Approvals />} isConnected={!!walletAddress} />} />
            <Route path="/history" element={<ProtectedRoute element={<History />} isConnected={!!walletAddress} />} />
            <Route path="/proofs" element={<ProtectedRoute element={<ProofReceipts />} isConnected={!!walletAddress} />} />
          </Routes>
        </BrowserRouter>
        </ProofReceiptContext.Provider>
      </WalletContext.Provider>
    </ThemeContext.Provider>
  )
}

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ThemeContext, WalletContext } from './context'
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

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light')
  }, [])

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <WalletContext.Provider value={{ walletAddress, setWalletAddress }}>
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
      </WalletContext.Provider>
    </ThemeContext.Provider>
  )
}

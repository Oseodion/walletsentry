import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ThemeContext, WalletContext } from './context'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'

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
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </BrowserRouter>
      </WalletContext.Provider>
    </ThemeContext.Provider>
  )
}

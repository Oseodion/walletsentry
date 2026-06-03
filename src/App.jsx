import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import { ThemeContext, WalletContext } from './context'

export default function App() {
  const [theme, setTheme] = useState('light')
  const [walletAddress, setWalletAddress] = useState(null)

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <WalletContext.Provider value={{ walletAddress, setWalletAddress }}>
        <div data-theme={theme}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<div style={{ padding: 40, fontFamily: 'Bebas Neue' }}>WalletSentry - scaffold ready</div>} />
            </Routes>
          </BrowserRouter>
        </div>
      </WalletContext.Provider>
    </ThemeContext.Provider>
  )
}

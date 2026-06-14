# WalletSentry

AI-powered Solana wallet security dashboard built on Ambient Network. Every threat alert is analyzed by Ambient's verified AI (GLM 5.1) and comes with a cryptographic proof receipt stored on-chain.

## What it does

- **Real-time wallet monitoring** - connects your Phantom wallet and monitors activity
- **Token Scanner** - paste any Solana token address and get an AI risk analysis with a verified proof receipt
- **Approval Manager** - see all active token approvals and revoke dangerous ones
- **Transaction History** - full timeline of wallet activity with AI risk ratings
- **Proof Receipts** - every AI decision generates a cryptographic proof verified by Ambient's Proof of Logits consensus

## Why Ambient Network

Every AI analysis in WalletSentry is powered by Ambient's GLM 5.1 model via verified inference. Unlike traditional AI APIs where the model can change silently or outputs can be manipulated, Ambient's Proof of Logits consensus means every AI decision is cryptographically verifiable on-chain. When WalletSentry says a token is HIGH RISK - you can prove that's what the AI said, permanently.

## Tech Stack

- React + Vite + Tailwind CSS
- Ambient API (https://api.ambient.xyz) - model: ambient/large
- Solana web3.js - RPC: https://rpc.ambient.xyz
- Phantom wallet adapter
- React Router

## Getting Started

1. Clone the repo
2. Run `npm install`
3. Create a `.env` file with your Ambient API key:
   ```
   VITE_AMBIENT_API_KEY=your_key_here
   ```
   Get your API key at app.ambient.xyz/keys
4. Run `npm run dev`
5. Open http://localhost:5173
6. Install Phantom wallet from phantom.app
7. Click Connect Wallet

## Built by

Jeff - [@web3_tech_](https://x.com/web3_tech_) on X

Built on Ambient Network testnet. Part of the Ambient developer ecosystem.

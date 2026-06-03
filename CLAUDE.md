Update CLAUDE.md with the following - replace everything in it:

# CLAUDE.md

## Project
WalletSentry - AI-powered Solana wallet security dashboard built on Ambient Network.

Every threat alert is analyzed by Ambient's verified AI (GLM 5.1) and every AI decision comes with a cryptographic proof receipt stored on-chain. Built to show the Ambient Network developer team as a portfolio piece.

## Design Reference
The file `walletsentry-final.html` in this repo is the exact design reference. Every screen we build must match this design exactly - same fonts, same colors, same spacing, same components.

## Rules - follow these always
- Never use em dashes anywhere - use a single hyphen - when needed
- Never use emojis anywhere in the UI
- Commit to GitHub after every major feature or screen completed
- Use single - not -- or em dash in all copy and code comments
- No placeholder lorem ipsum text anywhere

## Tech Stack
- React + Vite + Tailwind CSS
- Anthropic SDK pointed at Ambient API (baseURL: https://api.ambient.xyz)
- API key from environment variable VITE_AMBIENT_API_KEY
- Solana wallet adapter for Phantom wallet connection
- @solana/web3.js connected to https://rpc.ambient.xyz
- React Router for navigation between screens

## Design System
- Fonts: Bebas Neue (headings and big numbers), Plus Jakarta Sans (body text), IBM Plex Mono (labels, tags, monospace data)
- Primary accent: #00cc55 (green), bright version #00ff66
- Risk colors: green #00cc55 = SAFE, amber #ffaa00 = MEDIUM/REVIEW, red #e03030 or #ff4444 = CRITICAL
- Light theme bg: #f5f5f0, surface: #ffffff
- Dark theme bg: #0a0a0a, surface: #111111
- Hero section always dark #0a0a0a regardless of theme
- Border radius: 8px buttons, 16px cards, 20px large containers
- No emojis in UI ever

## Environment Variables
VITE_AMBIENT_API_KEY= (Ambient API key - never expose in code)

## Ambient API Integration
All AI calls go through src/services/ambientAI.js using Anthropic SDK format:

import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: import.meta.env.VITE_AMBIENT_API_KEY,
  baseURL: 'https://api.ambient.xyz',
  dangerouslyAllowBrowser: true
})

Model to use: ambient-ai

## Screens to Build
1. Landing page - matches walletsentry-final.html exactly
2. Dashboard - wallet health score, live threat feed, metrics
3. Token Scanner - paste address, AI analyzes, proof receipt shown
4. Approval Manager - list approvals, revoke dangerous ones
5. Transaction History - AI rated timeline
6. Proof Receipt modal - shows after every AI decision

## Navigation Flow
Landing -> connect wallet -> Dashboard -> Scanner / Approvals / History (sidebar nav)

## State Management
React useState and useContext for:
- Connected wallet address
- Current theme (light/dark)
- Current screen/route
- Threat alerts list
- Token scan results
- Proof receipts history

## Commit Strategy
Commit to GitHub after each of these milestones:
- Project scaffolded
- Landing page complete
- Dashboard complete
- Token Scanner complete
- Approval Manager complete
- Transaction History complete
- Proof Receipt system complete
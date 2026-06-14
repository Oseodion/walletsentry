import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'

const RPC_URLS = [
  'https://rpc.ambient.xyz',
  'https://api.mainnet-beta.solana.com'
]

const JUPITER_TOKEN_URLS = [
  'https://tokens.jup.ag/tokens?tags=verified',
  'https://cdn.jsdelivr.net/gh/solana-labs/token-list@main/src/tokens/solana.tokenlist.json',
  'https://token.jup.ag/all'
]

let connection = null
let tokenCache = null

function getConnection() {
  if (!connection) {
    connection = new Connection(RPC_URLS[0], 'confirmed')
  }
  return connection
}

async function tryFetchTokenList() {
  for (const url of JUPITER_TOKEN_URLS) {
    try {
      const resp = await fetch(url)
      if (!resp.ok) continue
      const data = await resp.json()
      return data
    } catch (err) {
      console.log(`[Solana] Failed to fetch from ${url}:`, err.message)
      continue
    }
  }
  return null
}

export async function getTokenCache() {
  if (tokenCache) return tokenCache
  try {
    const data = await tryFetchTokenList()
    if (!data) return {}

    tokenCache = {}
    const tokens = Array.isArray(data) ? data : (data.tokens || [])
    tokens.forEach(t => {
      const address = t.address || t.mint
      if (address) {
        tokenCache[address] = t
      }
    })
    return tokenCache
  } catch (err) {
    console.error('Failed to fetch token cache:', err)
    return {}
  }
}

export async function getWalletSOLBalance(walletAddress) {
  try {
    const conn = getConnection()
    const pubkey = new PublicKey(walletAddress)
    const balance = await conn.getBalance(pubkey)
    return balance / LAMPORTS_PER_SOL
  } catch (err) {
    console.error('Error fetching SOL balance:', err)
    return 0
  }
}

export async function getWalletTokenAccounts(walletAddress) {
  try {
    if (!walletAddress || typeof walletAddress !== 'string' || walletAddress.length < 32 || walletAddress.length > 44) {
      console.error('[Solana] Invalid wallet address:', walletAddress)
      return []
    }

    const conn = getConnection()
    const pubkey = new PublicKey(walletAddress)
    const tokens = await conn.getParsedTokenAccountsByOwner(pubkey, {
      programId: new PublicKey('TokenkegQfeZyiNwAJsyFbPVwwQQfsSyS4NqWTLW9J')
    })

    const cache = await getTokenCache()
    return tokens.value
      .filter(t => t.account.data.parsed.info.tokenAmount.uiAmount > 0)
      .map(t => {
        const mint = t.account.data.parsed.info.mint
        const tokenInfo = cache[mint] || {}
        return {
          mint,
          symbol: tokenInfo.symbol || '???',
          name: tokenInfo.name || 'Unknown Token',
          amount: t.account.data.parsed.info.tokenAmount.uiAmount,
          decimals: t.account.data.parsed.info.tokenAmount.decimals,
          logo: tokenInfo.logoURI || null,
        }
      })
  } catch (err) {
    console.error('Error fetching token accounts:', err)
    return []
  }
}

export async function getWalletTransactions(walletAddress, limit = 20) {
  try {
    const conn = getConnection()
    const pubkey = new PublicKey(walletAddress)
    const sigs = await conn.getSignaturesForAddress(pubkey, { limit: Math.min(limit, 1000) })

    const txns = await Promise.all(
      sigs.map(async (sig) => {
        try {
          const tx = await conn.getParsedTransaction(sig.signature, 'confirmed')
          if (!tx) return null

          const blockTime = tx.blockTime || 0
          const date = new Date(blockTime * 1000)
          const timestamp = date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })

          let type = 'Unknown'
          let amount = '--'
          if (tx.transaction.message.instructions.length > 0) {
            const inst = tx.transaction.message.instructions[0]
            if ('parsed' in inst && inst.parsed.type) {
              type = inst.parsed.type
                .split(/(?=[A-Z])/)
                .join(' ')
                .toUpperCase()
              if (inst.parsed.info) {
                amount = inst.parsed.info.tokenAmount?.uiAmount || inst.parsed.info.lamports
                if (typeof amount === 'number') {
                  if (amount >= 1e9) amount = (amount / 1e9).toFixed(2) + 'B'
                  else if (amount >= 1e6) amount = (amount / 1e6).toFixed(2) + 'M'
                  else amount = amount.toFixed(4)
                }
              }
            }
          }

          return {
            hash: sig.signature.slice(0, 8) + '...' + sig.signature.slice(-6),
            fullHash: sig.signature,
            type,
            amount,
            timestamp,
            status: sig.confirmationStatus,
          }
        } catch (e) {
          console.error('Error parsing transaction:', e)
          return null
        }
      })
    )

    return txns.filter(t => t !== null).slice(0, limit)
  } catch (err) {
    console.error('Error fetching transactions:', err)
    return []
  }
}

export async function getTokenMetadata(mintAddress) {
  try {
    const cache = await getTokenCache()
    return cache[mintAddress] || null
  } catch (err) {
    console.error('Error fetching token metadata:', err)
    return null
  }
}

export async function getTokenLogo(mintAddress, symbol) {
  try {
    const metadata = await getTokenMetadata(mintAddress)
    if (metadata?.logoURI) {
      return metadata.logoURI
    }
    return null
  } catch (err) {
    console.error('Error fetching token logo:', err)
    return null
  }
}

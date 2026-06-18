const MODEL = 'ambient/large'
const API_BASE = 'https://api.ambient.xyz/v1/chat/completions'

export default { MODEL, API_BASE }

const SCAN_SYSTEM_PROMPT = `You are a Solana token security analyzer powered by Ambient Network. Analyze the given token address for security risks. Respond in JSON only with this exact structure: { "riskScore": number 0-100, "riskLevel": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "SAFE", "summary": "2-3 sentences about the overall risk", "factors": { "contractAge": {"status": "safe" | "warning" | "risk", "note": "brief finding"}, "liquidityLock": {"status": "safe" | "warning" | "risk", "note": "brief finding"}, "holderDistribution": {"status": "safe" | "warning" | "risk", "note": "brief finding"}, "mintAuthority": {"status": "safe" | "warning" | "risk", "note": "brief finding"}, "freezeAuthority": {"status": "safe" | "warning" | "risk", "note": "brief finding"}, "deployerHistory": {"status": "safe" | "warning" | "risk", "note": "brief finding"} } }. Note: Wrapped tokens like Wrapped SOL (So111...112) are safe by design and should be rated SAFE or LOW risk despite having mint and freeze authority. These are controlled by the Solana foundation and are standard infrastructure tokens. Return ONLY the JSON object, no markdown, no explanation.`

const DEMO_FALLBACK = {
  result: {
    riskScore: 72,
    riskLevel: 'HIGH',
    summary: 'Demo result - Ambient API temporarily unavailable. This token shows multiple risk indicators including unverified contract history and concentrated holder distribution.',
    factors: {
      contractAge:        { status: 'WARN', note: 'Contract deployed less than 30 days ago' },
      liquidityLock:      { status: 'RISK', note: 'No liquidity lock detected' },
      holderDistribution: { status: 'RISK', note: 'Top 10 wallets hold 84% of supply' },
      mintAuthority:      { status: 'RISK', note: 'Mint authority not revoked' },
      freezeAuthority:    { status: 'WARN', note: 'Freeze authority active' },
      deployerHistory:    { status: 'WARN', note: 'Deployer has 3 previous token launches' },
    },
  },
  hash: 'demo-fallback-not-verified',
  get timestamp() { return new Date().toISOString() },
  isDemo: true,
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

let requestInProgress = false
const requestQueue = []

async function processRequestQueue() {
  if (requestInProgress || requestQueue.length === 0) return
  requestInProgress = true
  const { query, isApprovals, resolve, reject } = requestQueue.shift()
  try {
    const result = await callAPIWithRetry(query, isApprovals)
    resolve(result)
  } catch (err) {
    reject(err)
  } finally {
    requestInProgress = false
    processRequestQueue()
  }
}

function queueRequest(query, isApprovals = false) {
  return new Promise((resolve, reject) => {
    requestQueue.push({ query, isApprovals, resolve, reject })
    processRequestQueue()
  })
}

async function callAPIWithRetry(query, isApprovals = false, maxRetries = 3) {
  const delays = [3000, 6000, 12000]
  const timeoutMs = 60000
  let lastError

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

      const response = await fetch(API_BASE, {
        signal: controller.signal,
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + import.meta.env.VITE_AMBIENT_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL,
          messages: isApprovals ? [
            { role: 'system', content: 'You are a Solana wallet security expert. Analyze these token approvals and give an overall risk assessment. Respond in JSON only: {overallRisk: string, riskScore: number, summary: string, topThreats: string[]}' },
            { role: 'user', content: query },
          ] : [
            { role: 'system', content: SCAN_SYSTEM_PROMPT },
            { role: 'user', content: 'Analyze this Solana token address for security risks: ' + query },
          ],
          stream: false,
        }),
      })

      clearTimeout(timeoutId)
      console.log('[Ambient] Status:', response.status)

      if (response.status === 429) {
        console.warn('[Ambient] Rate limited (429) - waiting 5 seconds before retry')
        if (attempt < maxRetries) {
          await sleep(5000)
          continue
        } else {
          throw new Error('API rate limited - max retries exceeded')
        }
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('[Ambient] Response:', JSON.stringify(data))
      console.log('[Ambient API Response]', JSON.stringify(data, null, 2))

      if (data.error) {
        console.error('[Ambient API Error Field]', data.error)
        throw new Error(`API error: ${JSON.stringify(data.error)}`)
      }

      if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
        console.error('[Ambient API Invalid Response] Missing or empty choices array:', data)
        throw new Error('API returned empty choices array')
      }

      if (!data.choices[0].message) {
        console.error('[Ambient API Invalid Response] Missing message object:', data.choices[0])
        throw new Error('API returned choice without message object')
      }

      if (!data.choices[0].message.content) {
        console.error('[Ambient API Invalid Response] Missing message content:', data.choices[0].message)
        throw new Error('API returned message without content')
      }

      return data.choices[0].message.content
    } catch (err) {
      lastError = err
      if (err.name === 'AbortError') {
        console.error('[Ambient] Request timeout after 60 seconds')
        throw new Error('API request timeout - took too long to respond')
      }
      if (attempt < maxRetries && !err.message.includes('rate limited')) {
        await sleep(delays[attempt])
      }
    }
  }

  throw lastError
}

export async function analyzeApprovals(approvals) {
  let text
  try {
    text = await queueRequest(`Analyze these approvals: ${JSON.stringify(approvals)}`, true)
  } catch {
    return { ...DEMO_FALLBACK, timestamp: new Date().toISOString() }
  }

  const trimmed = text.trim()

  let result
  try {
    result = JSON.parse(trimmed)
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/)
    if (!match) return { ...DEMO_FALLBACK, timestamp: new Date().toISOString() }
    try {
      result = JSON.parse(match[0])
    } catch {
      return { ...DEMO_FALLBACK, timestamp: new Date().toISOString() }
    }
  }

  const encoder = new TextEncoder()
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(trimmed))
  const hash = 'sha256:' + Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC'

  return { result, hash, timestamp, isDemo: false }
}

export async function analyzeToken(tokenAddress) {
  let text
  try {
    text = await queueRequest(tokenAddress)
  } catch {
    return { ...DEMO_FALLBACK, timestamp: new Date().toISOString() }
  }

  const trimmed = text.trim()

  let result
  try {
    result = JSON.parse(trimmed)
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/)
    if (!match) return { ...DEMO_FALLBACK, timestamp: new Date().toISOString() }
    try {
      result = JSON.parse(match[0])
    } catch {
      return { ...DEMO_FALLBACK, timestamp: new Date().toISOString() }
    }
  }

  const encoder = new TextEncoder()
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(trimmed))
  const hash = 'sha256:' + Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC'

  return { result, hash, timestamp, isDemo: false }
}

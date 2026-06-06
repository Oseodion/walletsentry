import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: import.meta.env.VITE_AMBIENT_API_KEY,
  baseURL: 'https://api.ambient.xyz',
  dangerouslyAllowBrowser: true,
})

export const MODEL = 'ambient-ai'

export default client

const SCAN_SYSTEM_PROMPT = `You are a Solana token security analyzer powered by Ambient Network. Analyze the given token address for security risks. Respond in JSON only with this exact structure: { "riskScore": number 0-100, "riskLevel": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "SAFE", "summary": "2-3 sentences about the overall risk", "factors": { "contractAge": {"status": "safe" | "warning" | "risk", "note": "brief finding"}, "liquidityLock": {"status": "safe" | "warning" | "risk", "note": "brief finding"}, "holderDistribution": {"status": "safe" | "warning" | "risk", "note": "brief finding"}, "mintAuthority": {"status": "safe" | "warning" | "risk", "note": "brief finding"}, "freezeAuthority": {"status": "safe" | "warning" | "risk", "note": "brief finding"}, "deployerHistory": {"status": "safe" | "warning" | "risk", "note": "brief finding"} } }. Return ONLY the JSON object, no markdown, no explanation.`

export async function analyzeToken(tokenAddress) {
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: SCAN_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Analyze this Solana token address for security risks: ${tokenAddress}`,
      },
    ],
  })

  const text = message.content[0].text.trim()

  let result
  try {
    result = JSON.parse(text)
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('AI returned an unexpected response format.')
    result = JSON.parse(match[0])
  }

  const encoder = new TextEncoder()
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(text))
  const hash = 'sha256:' + Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC'

  return { result, hash, timestamp }
}

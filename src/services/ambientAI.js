import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: import.meta.env.VITE_AMBIENT_API_KEY,
  baseURL: 'https://api.ambient.xyz',
  dangerouslyAllowBrowser: true,
})

export const MODEL = 'ambient-ai'

export default client

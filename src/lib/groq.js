const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

export class DebateError extends Error {
  constructor(message, code) {
    super(message)
    this.name = 'DebateError'
    this.code = code // 'no_api_key' | 'rate_limit' | 'network'
  }
}

function getKey(apiKey) {
  const key = apiKey || import.meta.env.VITE_GROQ_API_KEY
  if (!key) throw new DebateError('No Groq API key — add one in Settings.', 'no_api_key')
  return key
}

async function doFetch(body, apiKey) {
  let res
  try {
    res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getKey(apiKey)}`,
      },
      body: JSON.stringify(body),
    })
  } catch {
    throw new DebateError('Connection lost. Check your internet and retry.', 'network')
  }

  if (res.status === 401) {
    throw new DebateError('Invalid API key. Check your key in Settings.', 'invalid_key')
  }
  if (res.status === 429) {
    throw new DebateError("You're going too fast! Wait a moment and try again.", 'rate_limit')
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: res.statusText } }))
    throw new DebateError(err?.error?.message ?? `Groq API error ${res.status}`, 'network')
  }

  return res
}

export async function callGroq(systemPrompt, userMessage, apiKey) {
  const res = await doFetch(
    {
      model: MODEL,
      max_tokens: 1500,
      temperature: 0.7,
      stream: false,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    },
    apiKey,
  )
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}

export async function callGroqStream(systemPrompt, userMessage, apiKey, onChunk) {
  const res = await doFetch(
    {
      model: MODEL,
      max_tokens: 1500,
      temperature: 0.7,
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    },
    apiKey,
  )

  const reader = res.body.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value, { stream: true })
    for (const line of chunk.split('\n')) {
      if (!line.startsWith('data: ')) continue
      const payload = line.slice(6).trim()
      if (payload === '[DONE]') return
      try {
        const parsed = JSON.parse(payload)
        const token = parsed.choices?.[0]?.delta?.content
        if (token) onChunk(token)
      } catch {
        // skip malformed SSE chunks
      }
    }
  }
}

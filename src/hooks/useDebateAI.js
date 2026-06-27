import { useState, useCallback } from 'react'
import { callGroq, DebateError } from '../lib/groq'
import { ATTACK_PROMPT, DEFEND_PROMPT, COACH_PROMPT } from '../lib/prompts'

const HISTORY_LIMIT = 10

function buildUserMessage(mode, claim, previousResult) {
  if (mode === 'defend' && previousResult) {
    return `Original claim: "${claim}"

Counterarguments you must rebut:
${previousResult.counterarguments?.map((c, i) => `${i + 1}. ${c}`).join('\n') ?? 'None provided'}`
  }
  return `Argument: "${claim}"`
}

function selectPrompt(mode) {
  if (mode === 'defend') return DEFEND_PROMPT
  if (mode === 'coach') return COACH_PROMPT
  return ATTACK_PROMPT
}

function safeParseJSON(raw) {
  try {
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    return { data: JSON.parse(cleaned), error: null }
  } catch {
    return { data: null, error: true }
  }
}

export function useDebateAI() {
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null) // { message, type } | null
  const [mode, setMode] = useState('attack')
  const [history, setHistory] = useState([])

  const analyzeArgument = useCallback(async (claim, selectedMode, apiKey) => {
    const activeMode = selectedMode ?? mode
    if (!claim.trim()) return

    setIsLoading(true)
    setError(null)

    const lastResult = history.length > 0 ? history[history.length - 1]?.result : null
    const userMessage = buildUserMessage(activeMode, claim, lastResult)
    const systemPrompt = selectPrompt(activeMode)

    try {
      const raw = await callGroq(systemPrompt, userMessage, apiKey)
      let parsed = safeParseJSON(raw)

      // Silent retry once on bad JSON
      if (parsed.error) {
        const raw2 = await callGroq(systemPrompt, userMessage, apiKey)
        parsed = safeParseJSON(raw2)
      }

      if (parsed.error) {
        setError({ message: 'AI response was unclear. Try again.', type: 'bad_json' })
        return
      }

      setResult(parsed.data)
      const entry = { claim, mode: activeMode, result: parsed.data, timestamp: Date.now() }
      setHistory((prev) => {
        const updated = [...prev, entry]
        return updated.length > HISTORY_LIMIT ? updated.slice(-HISTORY_LIMIT) : updated
      })
    } catch (err) {
      if (err instanceof DebateError) {
        setError({ message: err.message, type: err.code })
      } else {
        setError({ message: err.message || 'Something went wrong.', type: 'network' })
      }
    } finally {
      setIsLoading(false)
    }
  }, [mode, history])

  const clearHistory = useCallback(() => {
    setHistory([])
    setResult(null)
    setError(null)
  }, [])

  return { result, isLoading, error, mode, history, analyzeArgument, clearHistory, setMode }
}

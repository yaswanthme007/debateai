import { useState, useCallback } from 'react'
import { callGroq } from '../lib/groq'
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
    // Strip accidental markdown fences the model may add despite instructions
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    return { data: JSON.parse(cleaned), error: null }
  } catch {
    return { data: null, error: 'Response was not valid JSON. Try again.' }
  }
}

export function useDebateAI() {
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [mode, setMode] = useState('attack')
  const [history, setHistory] = useState([])

  const analyzeArgument = useCallback(async (claim, selectedMode, apiKey) => {
    const activeMode = selectedMode ?? mode
    if (!claim.trim()) return

    setIsLoading(true)
    setError(null)

    // For defend mode, pass the last attack result as context
    const lastResult = history.length > 0 ? history[history.length - 1]?.result : null
    const userMessage = buildUserMessage(activeMode, claim, lastResult)
    const systemPrompt = selectPrompt(activeMode)

    try {
      const raw = await callGroq(systemPrompt, userMessage, apiKey)
      const { data, error: parseError } = safeParseJSON(raw)

      if (parseError) {
        setError(parseError)
        setIsLoading(false)
        return
      }

      setResult(data)

      const entry = { claim, mode: activeMode, result: data, timestamp: Date.now() }
      setHistory(prev => {
        const updated = [...prev, entry]
        return updated.length > HISTORY_LIMIT ? updated.slice(-HISTORY_LIMIT) : updated
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [mode, history])

  const clearHistory = useCallback(() => {
    setHistory([])
    setResult(null)
    setError(null)
  }, [])

  return {
    result,
    isLoading,
    error,
    mode,
    history,
    analyzeArgument,
    clearHistory,
    setMode,
  }
}

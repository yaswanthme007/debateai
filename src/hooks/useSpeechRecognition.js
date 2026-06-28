import { useState, useRef, useEffect, useCallback, useMemo } from 'react'

export function useSpeechRecognition({ onTranscript, onInterim, onError } = {}) {
  const [isListening, setIsListening] = useState(false)
  const recognitionRef   = useRef(null)
  const manualStopRef    = useRef(false)
  const callbacksRef     = useRef({ onTranscript, onInterim, onError })

  // Keep callbacks up to date without triggering re-renders
  useEffect(() => {
    callbacksRef.current = { onTranscript, onInterim, onError }
  })

  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  const stopListening = useCallback(() => {
    manualStopRef.current = true
    setIsListening(false)
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch {}
      recognitionRef.current = null
    }
  }, [])

  const startListening = useCallback(() => {
    if (!isSupported || recognitionRef.current) return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous     = true
    recognition.interimResults = true
    recognition.lang           = 'en-US'

    recognition.onresult = (event) => {
      let interim = ''
      let final   = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript
        if (event.results[i].isFinal) final += text
        else interim += text
      }
      if (final)   callbacksRef.current.onTranscript?.(final.trim())
      callbacksRef.current.onInterim?.(interim)
    }

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed') {
        callbacksRef.current.onError?.('not-allowed')
        manualStopRef.current = true
        setIsListening(false)
        recognitionRef.current = null
      } else if (event.error === 'network') {
        callbacksRef.current.onError?.('network')
      }
      // 'no-speech' is silently ignored
    }

    recognition.onend = () => {
      if (!manualStopRef.current) {
        // Chrome auto-stops after ~60s — restart transparently
        try { recognition.start() } catch {}
      } else {
        setIsListening(false)
        recognitionRef.current = null
      }
    }

    manualStopRef.current  = false
    recognitionRef.current = recognition

    try {
      recognition.start()
      setIsListening(true)
    } catch {
      setIsListening(false)
      recognitionRef.current = null
    }
  }, [isSupported])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      manualStopRef.current = true
      if (recognitionRef.current) {
        try { recognitionRef.current.stop() } catch {}
        recognitionRef.current = null
      }
    }
  }, [])

  // Memoize so callers can safely include the returned object in useEffect deps
  return useMemo(
    () => ({ isListening, startListening, stopListening, isSupported }),
    [isListening, startListening, stopListening, isSupported],
  )
}

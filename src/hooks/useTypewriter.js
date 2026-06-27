import { useState, useEffect } from 'react'

export function useTypewriter(text, speed = 15, delay = 0) {
  const [displayText, setDisplayText] = useState('')
  const [isDone, setIsDone] = useState(false)

  useEffect(() => {
    if (!text) {
      setDisplayText('')
      setIsDone(false)
      return
    }

    setDisplayText('')
    setIsDone(false)

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let startTimer
    let intervalId

    startTimer = setTimeout(() => {
      if (reduced) {
        setDisplayText(text)
        setIsDone(true)
        return
      }

      let i = 0
      intervalId = setInterval(() => {
        i++
        setDisplayText(text.slice(0, i))
        if (i >= text.length) {
          setIsDone(true)
          clearInterval(intervalId)
        }
      }, speed)
    }, delay)

    return () => {
      clearTimeout(startTimer)
      clearInterval(intervalId)
    }
  }, [text, speed, delay])

  return { displayText, isDone }
}

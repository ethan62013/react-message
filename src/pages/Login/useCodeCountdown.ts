import { useEffect, useState } from 'react'

export function useCodeCountdown(seconds = 60) {
  const [left, setLeft] = useState(0)

  useEffect(() => {
    if (left <= 0) return
    const id = window.setTimeout(() => setLeft((n) => n - 1), 1000)
    return () => window.clearTimeout(id)
  }, [left])

  return {
    left,
    running: left > 0,
    start() {
      setLeft(seconds)
    },
  }
}

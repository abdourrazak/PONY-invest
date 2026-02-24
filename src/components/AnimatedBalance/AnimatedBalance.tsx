'use client'
import { useEffect, useState, useRef } from 'react'

interface AnimatedBalanceProps {
  value: number
  duration?: number
  className?: string
  prefix?: string
  suffix?: string
}

export default function AnimatedBalance({ 
  value, 
  duration = 1000, 
  className = '',
  prefix = '',
  suffix = ' $'
}: AnimatedBalanceProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const previousValue = useRef(value)

  useEffect(() => {
    if (previousValue.current === value) return

    const startValue = previousValue.current
    const endValue = value
    const startTime = Date.now()
    const difference = endValue - startValue

    const animate = () => {
      const currentTime = Date.now()
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const currentValue = startValue + (difference * easeOut)

      setDisplayValue(Math.round(currentValue))

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        previousValue.current = value
      }
    }

    requestAnimationFrame(animate)
  }, [value, duration])

  return (
    <span className={`transition-all duration-300 ${className}`}>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  )
}

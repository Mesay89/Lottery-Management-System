import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

export function CountdownTimer({ targetDate, className = '' }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false })

  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate).getTime() - Date.now()
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true })
        return
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        expired: false,
      })
    }
    calc()
    const timer = setInterval(calc, 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  if (timeLeft.expired) {
    return (
      <div className={`inline-flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400 ${className}`}>
        <Clock className="w-3.5 h-3.5" />
        <span>Draw time reached</span>
      </div>
    )
  }

  return (
    <div className={`inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-400 ${className}`}>
      <Clock className="w-3.5 h-3.5 shrink-0" />
      <span>
        {timeLeft.days}d : {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
      </span>
    </div>
  )
}

export default CountdownTimer

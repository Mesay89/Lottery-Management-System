import { useState } from 'react'
import { CheckCircle2, Copy, Check, Upload, X } from 'lucide-react'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { formatCurrency } from '../../lib/utils'
import toast from 'react-hot-toast'

export function DirectTransferPayment({
  providerName,
  accountName,
  accountDisplay,
  accountRaw,
  refPlaceholder,
  accentClasses,
  icon: Icon,
  amount,
  eventId,
  ticketId,
  hideAccountBox = false,
  submitPayment,
  onSuccess,
}) {
  const [externalRef, setExternalRef] = useState('')
  const [screenshot, setScreenshot] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(accountRaw)
      setCopied(true)
      toast.success(`${providerName} account copied!`)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Could not copy account number')
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG, JPG, WEBP)')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Screenshot must be smaller than 5 MB')
      return
    }
    setScreenshot(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const clearScreenshot = () => {
    setScreenshot(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl('')
  }

  const handlePay = async (e) => {
    e.preventDefault()
    if (!externalRef.trim() && !screenshot) {
      toast.error('Please enter a Transaction ID or upload a payment screenshot')
      return
    }
    if (externalRef.trim() && externalRef.trim().length < 3) {
      toast.error('Transaction ID must be at least 3 characters')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('amount', String(amount))
      if (externalRef.trim()) formData.append('externalRef', externalRef.trim())
      if (screenshot) formData.append('screenshot', screenshot)
      if (eventId) formData.append('eventId', eventId)
      if (ticketId) formData.append('ticketId', ticketId)

      const res = await submitPayment(formData)
      const data = res.data.data || res.data
      setCompleted(true)
      toast.success(`${providerName} proof submitted! Awaiting Cash Manager approval.`)
      onSuccess?.(data.transaction || data)
    } catch (err) {
      toast.error(err.displayMessage || `${providerName} payment failed`)
    } finally {
      setLoading(false)
    }
  }

  if (completed) {
    return (
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center space-y-2">
        <CheckCircle2 className="h-8 w-8 text-amber-600 mx-auto" />
        <p className="text-sm font-medium text-amber-900">{providerName} proof submitted</p>
        <p className="text-xs text-amber-700">
          Your ticket is <span className="font-semibold">Pending</span> until the Cash Manager approves your payment for {formatCurrency(amount)}.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handlePay} className={`p-4 rounded-xl border space-y-4 ${accentClasses.container}`}>
      <div className="flex items-center gap-2">
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-xs ${accentClasses.badge}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className={`text-sm font-semibold ${accentClasses.title}`}>{providerName} Payment Proof</p>
          <p className={`text-xs ${accentClasses.subtitle}`}>Amount to send: {formatCurrency(amount)}</p>
        </div>
      </div>

      {!hideAccountBox && (
        <div className="rounded-lg bg-white border border-slate-200 p-3 space-y-2">
          <p className="text-xs font-medium text-slate-600">
            Send <span className="font-semibold text-slate-900">{formatCurrency(amount)}</span> to:
          </p>
          <div className="flex items-center justify-between gap-2 rounded-md bg-slate-50 px-3 py-2 border border-slate-200">
            <div>
              <div className="font-mono text-base font-bold tracking-wider text-slate-900">{accountDisplay}</div>
              {accountName && <div className="text-xs font-medium text-slate-600">{accountName}</div>}
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      )}

      <Input
        label="Transaction ID / Reference (optional if screenshot uploaded)"
        placeholder={refPlaceholder}
        value={externalRef}
        onChange={(e) => setExternalRef(e.target.value)}
      />

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Payment Screenshot (optional if Transaction ID entered)
        </label>
        {previewUrl ? (
          <div className="relative rounded-lg border border-slate-200 bg-white p-2">
            <img src={previewUrl} alt="Payment proof preview" className="max-h-44 mx-auto rounded object-contain" />
            <button
              type="button"
              onClick={clearScreenshot}
              className="absolute top-2 right-2 p-1 rounded-full bg-slate-900/70 text-white hover:bg-slate-900"
              aria-label="Remove screenshot"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <label className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-white px-4 py-3 text-xs font-medium text-slate-600 cursor-pointer hover:border-slate-400">
            <Upload className="w-4 h-4 text-slate-400" />
            <span>Click to upload payment screenshot (PNG, JPG, WEBP)</span>
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
        )}
      </div>

      <Button type="submit" loading={loading} className={`w-full text-white ${accentClasses.button}`}>
        Submit Payment Proof ({formatCurrency(amount)})
      </Button>
    </form>
  )
}

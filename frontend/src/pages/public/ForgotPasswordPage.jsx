import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft } from 'lucide-react'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useForgotPassword } from '../../hooks/useAuth'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const mutation = useForgotPassword()

  const handleSubmit = async (e) => {
    e.preventDefault()
    await mutation.mutateAsync(email)
    setSent(true)
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reset Password</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Enter your email address and we will send you a password reset link.
          </p>
        </div>

        {sent ? (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200 text-sm text-center">
            If an account exists for <strong>{email}</strong>, a reset link has been sent.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              required
              leftIcon={<Mail className="w-4 h-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" loading={mutation.isPending} className="w-full">
              Send Reset Link
            </Button>
          </form>
        )}

        <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm text-[#1a7a4a] dark:text-emerald-400 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>
      </div>
    </div>
  )
}

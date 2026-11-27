import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Ticket, Mail, Lock } from 'lucide-react'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useLogin } from '../../hooks/useAuth'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export default function LoginPage() {
  const navigate = useNavigate()
  const loginMutation = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (values) => {
    try {
      const { user } = await loginMutation.mutateAsync(values)
      switch (user?.role) {
        case 'superAdmin':
          navigate('/admin/dashboard')
          break
        case 'lotteryAdmin':
          navigate('/lottery/dashboard')
          break
        case 'cashManager':
          navigate('/finance/dashboard')
          break
        case 'ticketAgent':
          navigate('/agent/dashboard')
          break
        default:
          navigate('/customer/dashboard')
      }
    } catch {
      // handled in hook
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1a7a4a] to-emerald-700 text-white flex items-center justify-center mx-auto shadow-md">
            <Ticket className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome Back</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Sign in to your OLMS account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            leftIcon={<Mail className="w-4 h-4" />}
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            error={errors.password?.message}
            {...register('password')}
          />

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <input type="checkbox" className="rounded border-slate-300 text-[#1a7a4a]" />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-[#1a7a4a] dark:text-emerald-400 hover:underline font-medium">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" loading={loginMutation.isPending} className="w-full" size="lg">
            Sign In
          </Button>
        </form>

        <p className="text-center text-sm text-slate-600 dark:text-slate-400">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-[#1a7a4a] dark:text-emerald-400 font-semibold hover:underline">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  )
}

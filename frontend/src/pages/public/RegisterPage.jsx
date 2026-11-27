import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Ticket } from 'lucide-react'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useRegister } from '../../hooks/useAuth'

const schema = z
  .object({
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().min(9, 'Valid phone number is required'),
    dateOfBirth: z.string().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export default function RegisterPage() {
  const navigate = useNavigate()
  const registerMutation = useRegister()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (values) => {
    const { confirmPassword, ...payload } = values
    try {
      await registerMutation.mutateAsync(payload)
      navigate('/login')
    } catch {
      // handled in hook
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1a7a4a] to-emerald-700 text-white flex items-center justify-center mx-auto shadow-md">
            <Ticket className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create Customer Account</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Join OLMS to register tickets and track draws</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="First Name" placeholder="Abebe" error={errors.firstName?.message} {...register('firstName')} required />
            <Input label="Last Name" placeholder="Bikila" error={errors.lastName?.message} {...register('lastName')} required />
          </div>
          <Input label="Email" type="email" placeholder="abebe@example.com" error={errors.email?.message} {...register('email')} required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Phone Number" placeholder="+251911234567" error={errors.phone?.message} {...register('phone')} required />
            <Input label="Date of Birth" type="date" error={errors.dateOfBirth?.message} {...register('dateOfBirth')} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Password" type="password" placeholder="Min 8 chars" error={errors.password?.message} {...register('password')} required />
            <Input label="Confirm Password" type="password" placeholder="Repeat password" error={errors.confirmPassword?.message} {...register('confirmPassword')} required />
          </div>

          <Button type="submit" loading={registerMutation.isPending} className="w-full" size="lg">
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-slate-600 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-[#1a7a4a] dark:text-emerald-400 font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}

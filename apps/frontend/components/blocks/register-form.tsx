'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/lib/utils'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import axios from 'axios'

const formSchema = z
  .object({
    display_name: z.string().min(1, 'Display name is required'),
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

type RegisterFormValues = z.infer<typeof formSchema>

export function RegisterForm({
  className,
  onSuccess,
  ...props
}: React.ComponentProps<'form'> & {
  onSuccess?: (message: string) => void
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(formSchema),
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (data: RegisterFormValues): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      await api.post<void>('/api/auth/register', {
        display_name: data.display_name,
        email: data.email,
        password: data.password,
      })

      // Appelle le callback parent si défini
      onSuccess?.('Account created successfully! Please log in.')
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const backendMessage = (
          error.response?.data as { error?: string }
        )?.error
        setError(backendMessage ?? 'Something went wrong')
      } else if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Something went wrong')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      className={cn('flex flex-col gap-6', className)}
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Create an account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your details below to create your account
        </p>
      </div>

      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="display_name">Display Name</Label>
          <Input id="display_name" {...register('display_name')} />
          {errors.display_name && (
            <p className="text-sm text-red-500">{errors.display_name.message}</p>
          )}
        </div>

        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register('email')} />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="grid gap-3">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" {...register('password')} />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        <div className="grid gap-3">
          <Label htmlFor="confirm_password">Confirm Password</Label>
          <Input id="confirm_password" type="password" {...register('confirm_password')} />
          {errors.confirm_password && (
            <p className="text-sm text-red-500">{errors.confirm_password.message}</p>
          )}
        </div>

        {error && <p className="text-center text-red-600">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Signing up…' : 'Sign up'}
        </Button>

        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-background text-muted-foreground relative z-10 px-2">
            Or continue with
          </span>
        </div>

        <Button variant="outline" className="w-full" disabled={loading}>
          {/* Google SVG icon */}
          Sign up with Google
        </Button>
      </div>

      <div className="text-center text-sm">
        Already have an account?{' '}
        <a href="/login" className="underline underline-offset-4">
          Login
        </a>
      </div>
    </form>
  )
}

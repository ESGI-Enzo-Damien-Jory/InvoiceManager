'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, LoginDTO } from '@/lib/validation/schema'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import api from '@/lib/api'
import axios from 'axios'
import { useState } from 'react'

interface LoginResponse {
  token: string
}

export function LoginForm({ className, ...props }: React.ComponentProps<'form'>) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginDTO>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginDTO) => {
    setError(null)

    try {
      const response = await api.post<LoginResponse>('/api/auth/login', data)
      const { token } = response.data

      if (token) {
        localStorage.setItem('token', token)
        router.push('/dashboard')
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const backendMessage = (
          error.response?.data as { error?: string }
        )?.error
        setError(backendMessage ?? error.message)
      } else if (error instanceof Error) {
        setError(error.message)
      } else {
        setError(String(error))
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('flex flex-col gap-6', className)} {...props}>
      {/* Header */}
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-muted-foreground text-sm">
          Enter your email below to login to your account
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="text-sm text-destructive text-center">{error}</div>
      )}

      {/* Inputs */}
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="m@example.com" {...register('email')} />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div>

        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <a href="#" className="ml-auto text-sm underline-offset-4 hover:underline">
              Forgot your password?
            </a>
          </div>
          <Input id="password" type="password" {...register('password')} />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in...' : 'Login'}
        </Button>

        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>

        <Button variant="outline" className="w-full" disabled={isSubmitting}>
          {/* Google icon SVG */}
          Login with Google
        </Button>
      </div>

      <div className="text-center text-sm">
        Don&apos;t have an account?{' '}
        <a href="/register" className="underline underline-offset-4">
          Sign up
        </a>
      </div>
    </form>
  )
}

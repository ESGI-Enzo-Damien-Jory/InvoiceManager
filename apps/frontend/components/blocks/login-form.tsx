'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { useLogin } from '@/hooks/use-auth'
import { getUser } from '@/services/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const schema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
})

interface LoginFormProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string
}

export function LoginForm({ className, ...props }: LoginFormProps) {
    const [show_password, set_show_password] = useState(false)
    const [error, set_error] = useState<string | null>(null)
    const router = useRouter()
    const query_client = useQueryClient()
    const { loginMutate, status } = useLogin()
    const { register, handleSubmit, formState, setError, watch } = useForm({
        resolver: zodResolver(schema),
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: { email: '', password: '' },
    })
    const { errors, isValid, isSubmitting, touchedFields } = formState

    const on_submit = (data: { email: string; password: string }) => {
        set_error(null)
        loginMutate(
            { email: data.email.trim(), password: data.password },
            {
                onSuccess: async () => {
                    try {
                        await query_client.fetchQuery({
                            queryKey: ['currentUserProfile'],
                            queryFn: getUser,
                        })
                    } catch {}
                    router.push('/dashboard')
                },
                onError: (err) => {
                    const errorWithResponse = err as
                        | {
                              response?: {
                                  status?: number
                                  data?: { error?: string }
                              }
                          }
                        | Error
                    const status = (errorWithResponse as any)?.response?.status
                    if (status === 401)
                        set_error(
                            'Invalid email or password. Please try again.'
                        )
                    else if (status === 429)
                        set_error(
                            'Too many login attempts. Please try again later.'
                        )
                    else if (status === 500)
                        set_error('Server error. Please try again later.')
                    else
                        set_error(
                            (errorWithResponse as any)?.response?.data?.error ||
                                err?.message ||
                                'An unexpected error occurred'
                        )
                },
            }
        )
    }

    return (
        <div className={cn('flex flex-col gap-6', className)} {...props}>
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Login to your account</h1>
                <p className="text-muted-foreground text-sm">
                    Enter your email below to login to your account
                </p>
            </div>

            {error && (
                <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <div>{error}</div>
                </div>
            )}

            <form onSubmit={handleSubmit(on_submit)} className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        autoComplete="email"
                        disabled={isSubmitting || status === 'pending'}
                        placeholder="m@example.com"
                        {...register('email')}
                        className={cn(
                            errors.email &&
                                touchedFields.email &&
                                'border-destructive focus-visible:ring-destructive'
                        )}
                    />
                    {errors.email && touchedFields.email && (
                        <div className="flex items-center gap-2 text-xs text-destructive">
                            <AlertCircle className="h-3 w-3" />
                            {errors.email.message}
                        </div>
                    )}
                </div>
                <div className="grid gap-2">
                    <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>
                        <a
                            href="#"
                            className="ml-auto text-sm underline-offset-4 hover:underline"
                        >
                            Forgot your password?
                        </a>
                    </div>
                    <div className="relative">
                        <Input
                            id="password"
                            type={show_password ? 'text' : 'password'}
                            autoComplete="current-password"
                            disabled={isSubmitting || status === 'pending'}
                            {...register('password')}
                            className={cn(
                                'pr-10',
                                errors.password &&
                                    touchedFields.password &&
                                    'border-destructive focus-visible:ring-destructive'
                            )}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => set_show_password((v) => !v)}
                            tabIndex={-1}
                            disabled={isSubmitting || status === 'pending'}
                        >
                            {show_password ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                            <span className="sr-only">
                                {show_password
                                    ? 'Hide password'
                                    : 'Show password'}
                            </span>
                        </Button>
                    </div>
                    {errors.password && touchedFields.password && (
                        <div className="flex items-center gap-2 text-xs text-destructive">
                            <AlertCircle className="h-3 w-3" />
                            {errors.password.message}
                        </div>
                    )}
                </div>
                <Button
                    type="submit"
                    className="w-full"
                    disabled={!isValid || isSubmitting || status === 'pending'}
                >
                    {isSubmitting || status === 'pending' ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Logging in...
                        </>
                    ) : (
                        'Login'
                    )}
                </Button>
                <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                    <span className="relative z-10 bg-background px-2 text-muted-foreground">
                        Or continue with
                    </span>
                </div>
                <Button
                    variant="outline"
                    className="w-full"
                    disabled={isSubmitting || status === 'pending'}
                    type="button"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="20"
                        viewBox="0 0 24 24"
                        width="20"
                        className="mr-2"
                    >
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                        />
                        <path d="M1 1h22v22H1z" fill="none" />
                    </svg>
                    Login with Google
                </Button>
            </form>
            <div className="text-center text-sm">
                Don&apos;t have an account?{' '}
                <a href="/register" className="underline underline-offset-4">
                    Sign up
                </a>
            </div>
        </div>
    )
}

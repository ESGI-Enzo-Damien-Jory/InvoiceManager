'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { useLogin } from '@/hooks/use-auth'
import { getUser } from '@/services/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoginFormProps {
    className?: string
}

interface ApiError {
    response?: {
        status: number
        data?: {
            error?: string
        }
    }
    message?: string
}

export function LoginForm({
    className,
    ...props
}: LoginFormProps & React.ComponentProps<'div'>) {
    const router = useRouter()
    const queryClient = useQueryClient()
    const emailRef = useRef<HTMLInputElement>(null)
    const passwordRef = useRef<HTMLInputElement>(null)

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [fieldErrors, setFieldErrors] = useState<{
        email?: string | null
        password?: string | null
    }>({})
    const [touched, setTouched] = useState<{
        email?: boolean
        password?: boolean
    }>({})

    const { loginMutate, status } = useLogin()

    const validateEmail = (email: string) => {
        if (!email) return 'Email is required'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return 'Please enter a valid email address'
        }
        return null
    }

    const validatePassword = (password: string) => {
        if (!password) return 'Password is required'
        if (password.length < 6) return 'Password must be at least 6 characters'
        return null
    }

    const checkAutofillValues = useCallback(() => {
        const emailValue = emailRef.current?.value || ''
        const passwordValue = passwordRef.current?.value || ''

        if (emailValue !== email) {
            setEmail(emailValue)
        }
        if (passwordValue !== password) {
            setPassword(passwordValue)
        }
    }, [email, password])

    useEffect(() => {
        if (touched.email) {
            const emailError = validateEmail(email)
            setFieldErrors((prev) => ({ ...prev, email: emailError }))
        }
    }, [email, touched.email])

    useEffect(() => {
        if (touched.password) {
            const passwordError = validatePassword(password)
            setFieldErrors((prev) => ({ ...prev, password: passwordError }))
        }
    }, [password, touched.password])

    useEffect(() => {
        const interval = setInterval(checkAutofillValues, 100)
        return () => clearInterval(interval)
    }, [checkAutofillValues])

    useEffect(() => {
        const handleFormInteraction = () => {
            setTimeout(checkAutofillValues, 50)
        }

        document.addEventListener('click', handleFormInteraction)
        document.addEventListener('keydown', handleFormInteraction)

        return () => {
            document.removeEventListener('click', handleFormInteraction)
            document.removeEventListener('keydown', handleFormInteraction)
        }
    }, [checkAutofillValues])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        checkAutofillValues()

        const currentEmail = emailRef.current?.value || email
        const currentPassword = passwordRef.current?.value || password

        setTouched({ email: true, password: true })

        const emailError = validateEmail(currentEmail)
        const passwordError = validatePassword(currentPassword)

        if (emailError || passwordError) {
            setFieldErrors({
                email: emailError,
                password: passwordError,
            })
            return
        }

        loginMutate(
            { email: currentEmail.trim(), password: currentPassword },
            {
                onSuccess: async () => {
                    try {
                        await queryClient.fetchQuery({
                            queryKey: ['currentUserProfile'],
                            queryFn: getUser,
                        })
                    } catch (fetchError) {
                        console.error('Prefetch /users failed:', fetchError)
                    }

                    router.push('/dashboard')
                },
                onError: (err: ApiError) => {
                    let errorMessage = 'An unexpected error occurred'

                    if (err?.response?.status) {
                        const status = err.response.status
                        const payload = err.response?.data || {}

                        if (status === 401) {
                            errorMessage =
                                'Invalid email or password. Please try again.'
                        } else if (status === 429) {
                            errorMessage =
                                'Too many login attempts. Please try again later.'
                        } else if (status === 500) {
                            errorMessage =
                                'Server error. Please try again later.'
                        } else {
                            errorMessage =
                                payload.error || err.message || errorMessage
                        }
                    } else if (err?.message) {
                        errorMessage = err.message
                    }

                    setError(errorMessage)
                },
            }
        )
    }

    const handleBlur = (field: 'email' | 'password') => {
        setTouched((prev) => ({ ...prev, [field]: true }))
        setTimeout(checkAutofillValues, 50)
    }

    const handleFocus = () => {
        setTimeout(checkAutofillValues, 50)
    }

    const getCurrentValues = () => {
        const currentEmail = emailRef.current?.value || email
        const currentPassword = passwordRef.current?.value || password
        return { currentEmail, currentPassword }
    }

    const { currentEmail, currentPassword } = getCurrentValues()
    const isFormValid =
        !fieldErrors.email &&
        !fieldErrors.password &&
        currentEmail.length > 0 &&
        currentPassword.length > 0
    const isPending = status === 'pending'

    return (
        <div className={cn('flex flex-col gap-6', className)} {...props}>
            {/* Header */}
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Login to your account</h1>
                <p className="text-muted-foreground text-sm">
                    Enter your email below to login to your account
                </p>
            </div>

            {/* Error message */}
            {error && (
                <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <div>{error}</div>
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="grid gap-4">
                {/* Email */}
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        ref={emailRef}
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={() => handleBlur('email')}
                        onFocus={handleFocus}
                        className={cn(
                            'input-autofill',
                            fieldErrors.email &&
                                touched.email &&
                                'border-destructive focus-visible:ring-destructive'
                        )}
                        disabled={isPending}
                        required
                    />
                    {fieldErrors.email && touched.email && (
                        <div className="flex items-center gap-2 text-xs text-destructive">
                            <AlertCircle className="h-3 w-3" />
                            {fieldErrors.email}
                        </div>
                    )}
                </div>

                {/* Password */}
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
                            ref={passwordRef}
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onBlur={() => handleBlur('password')}
                            onFocus={handleFocus}
                            className={cn(
                                'pr-10 input-autofill',
                                fieldErrors.password &&
                                    touched.password &&
                                    'border-destructive focus-visible:ring-destructive'
                            )}
                            disabled={isPending}
                            required
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isPending}
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                            <span className="sr-only">
                                {showPassword
                                    ? 'Hide password'
                                    : 'Show password'}
                            </span>
                        </Button>
                    </div>
                    {fieldErrors.password && touched.password && (
                        <div className="flex items-center gap-2 text-xs text-destructive">
                            <AlertCircle className="h-3 w-3" />
                            {fieldErrors.password}
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    className="w-full"
                    disabled={!isFormValid || isPending}
                >
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Logging in...
                        </>
                    ) : (
                        'Login'
                    )}
                </Button>

                {/* Divider */}
                <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                    <span className="relative z-10 bg-background px-2 text-muted-foreground">
                        Or continue with
                    </span>
                </div>

                {/* Google Button */}
                <Button
                    variant="outline"
                    className="w-full"
                    disabled={isPending}
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

            {/* Footer */}
            <div className="text-center text-sm">
                Don&apos;t have an account?{' '}
                <a href="/register" className="underline underline-offset-4">
                    Sign up
                </a>
            </div>
        </div>
    )
}

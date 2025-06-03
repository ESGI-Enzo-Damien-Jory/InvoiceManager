'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils'
import { useRegister } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react'
import axios from 'axios'

const formSchema = z
    .object({
        display_name: z
            .string()
            .min(6, 'Display name must be at least 6 characters'),
        email: z.string().email('Invalid email'),
        password: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/[0-9]/, 'Password must contain at least one number')
            .regex(
                /[!@#$%^&*(),.?":{}|<>]/,
                'Password must contain at least one special character'
            ),
        confirm_password: z.string(),
    })
    .refine((data) => data.password === data.confirm_password, {
        message: 'Passwords do not match',
        path: ['confirm_password'],
    })

type RegisterFormValues = z.infer<typeof formSchema>

export function RegisterForm({
    className,
    ...props
}: React.ComponentProps<'form'>) {
    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        watch,
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(formSchema),
        mode: 'onChange',
    })

    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const { registerMutate, status } = useRegister()

    const watchedValues = watch()
    const isPending = status === 'pending'

    const onSubmit = async (data: RegisterFormValues): Promise<void> => {
        setError(null)

        registerMutate(
            {
                display_name: data.display_name,
                email: data.email,
                password: data.password,
            },
            {
                onSuccess: () => {
                    router.push('/login')
                },
                onError: (err: unknown) => {
                    if (axios.isAxiosError(err)) {
                        const backendMessage = (
                            err.response?.data as { error?: string }
                        )?.error
                        setError(backendMessage ?? 'Something went wrong')
                    } else if (err instanceof Error) {
                        setError(err.message)
                    } else {
                        setError('Something went wrong')
                    }
                },
            }
        )
    }

    const getFieldStatus = (fieldName: keyof RegisterFormValues) => {
        const hasValue = watchedValues[fieldName]
        const hasError = errors[fieldName]

        if (!hasValue) return null
        if (hasError) return 'error'
        return 'success'
    }

    const getPasswordStrength = (password: string) => {
        if (!password) return { score: 0, label: '' }

        let score = 0
        const checks = {
            length: password.length >= 8,
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
            upper: /[A-Z]/.test(password),
            lower: /[a-z]/.test(password),
        }

        if (checks.length) score++
        if (checks.number) score++
        if (checks.special) score++
        if (checks.upper) score++
        if (checks.lower) score++

        if (score <= 2) return { score: 1, label: 'Weak' }
        if (score <= 3) return { score: 2, label: 'Fair' }
        if (score <= 4) return { score: 3, label: 'Good' }
        return { score: 4, label: 'Strong' }
    }

    const passwordStrength = getPasswordStrength(watchedValues.password || '')

    return (
        <form
            className={cn('flex flex-col gap-6', className)}
            onSubmit={handleSubmit(onSubmit)}
            {...props}
        >
            {/* Header */}
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Create an account</h1>
                <p className="text-muted-foreground text-sm text-balance">
                    Enter your details below to create your account
                </p>
            </div>

            {/* Error message global */}
            {error && (
                <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <div>{error}</div>
                </div>
            )}

            <div className="grid gap-4">
                {/* Display Name */}
                <div className="grid gap-2">
                    <Label htmlFor="display_name">Display Name</Label>
                    <div className="relative">
                        <Input
                            id="display_name"
                            placeholder="Your full name (min. 6 characters)"
                            className={cn(
                                'input-autofill',
                                errors.display_name &&
                                    'border-destructive focus-visible:ring-destructive'
                            )}
                            disabled={isPending}
                            {...register('display_name')}
                        />
                        {getFieldStatus('display_name') === 'success' && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                            </div>
                        )}
                    </div>
                    {errors.display_name && (
                        <div className="flex items-center gap-2 text-xs text-destructive">
                            <AlertCircle className="h-3 w-3" />
                            {errors.display_name.message}
                        </div>
                    )}
                </div>

                {/* Email */}
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            className={cn(
                                'input-autofill',
                                errors.email &&
                                    'border-destructive focus-visible:ring-destructive'
                            )}
                            disabled={isPending}
                            {...register('email')}
                        />
                        {getFieldStatus('email') === 'success' && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                            </div>
                        )}
                    </div>
                    {errors.email && (
                        <div className="flex items-center gap-2 text-xs text-destructive">
                            <AlertCircle className="h-3 w-3" />
                            {errors.email.message}
                        </div>
                    )}
                </div>

                {/* Password */}
                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="8+ chars, 1 number, 1 special character"
                            className={cn(
                                'pr-10 input-autofill',
                                errors.password &&
                                    'border-destructive focus-visible:ring-destructive'
                            )}
                            disabled={isPending}
                            {...register('password')}
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
                        {getFieldStatus('password') === 'success' && (
                            <div className="absolute right-10 top-1/2 -translate-y-1/2">
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                            </div>
                        )}
                    </div>

                    {/* Password strength indicator */}
                    {watchedValues.password &&
                        watchedValues.password.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex gap-1">
                                    {[...Array(4)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={cn(
                                                'h-1 flex-1 rounded-full transition-all duration-300',
                                                i < passwordStrength.score
                                                    ? 'bg-muted-foreground'
                                                    : 'bg-muted'
                                            )}
                                        />
                                    ))}
                                </div>
                                {passwordStrength.label && (
                                    <p className="text-xs text-muted-foreground">
                                        Strength: {passwordStrength.label}
                                    </p>
                                )}
                            </div>
                        )}

                    {errors.password && (
                        <div className="flex items-center gap-2 text-xs text-destructive">
                            <AlertCircle className="h-3 w-3" />
                            {errors.password.message}
                        </div>
                    )}
                </div>

                {/* Confirm Password */}
                <div className="grid gap-2">
                    <Label htmlFor="confirm_password">Confirm Password</Label>
                    <div className="relative">
                        <Input
                            id="confirm_password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Confirm your password"
                            className={cn(
                                'pr-10 input-autofill',
                                errors.confirm_password &&
                                    'border-destructive focus-visible:ring-destructive'
                            )}
                            disabled={isPending}
                            {...register('confirm_password')}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                            }
                            disabled={isPending}
                        >
                            {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                            <span className="sr-only">
                                {showConfirmPassword
                                    ? 'Hide password'
                                    : 'Show password'}
                            </span>
                        </Button>
                        {getFieldStatus('confirm_password') === 'success' && (
                            <div className="absolute right-10 top-1/2 -translate-y-1/2">
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                            </div>
                        )}
                    </div>
                    {errors.confirm_password && (
                        <div className="flex items-center gap-2 text-xs text-destructive">
                            <AlertCircle className="h-3 w-3" />
                            {errors.confirm_password.message}
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    className="w-full"
                    disabled={!isValid || isPending}
                >
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing up...
                        </>
                    ) : (
                        'Sign up'
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
                    Sign up with Google
                </Button>
            </div>

            {/* Footer */}
            <div className="text-center text-sm">
                Already have an account?{' '}
                <a href="/login" className="underline underline-offset-4">
                    Login
                </a>
            </div>
        </form>
    )
}

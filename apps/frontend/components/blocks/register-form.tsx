'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { useForm, UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils'
import { useRegister } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react'
import axios from 'axios'

export interface RegisterPayload {
    email: string
    password: string
    display_name: string
}

const register_schema = z
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

export type RegisterFormValues = z.infer<typeof register_schema>

export interface RegisterFormProps extends React.ComponentProps<'form'> {
    className?: string
}

type RegisterField = {
    name: keyof RegisterFormValues
    label: string
    placeholder: string
    type: 'text' | 'email' | 'password'
    auto_complete?: string
}

const register_fields: RegisterField[] = [
    {
        name: 'display_name',
        label: 'Display Name',
        placeholder: 'Your full name (min. 6 characters)',
        type: 'text',
        auto_complete: 'name',
    },
    {
        name: 'email',
        label: 'Email',
        placeholder: 'm@example.com',
        type: 'email',
        auto_complete: 'email',
    },
    {
        name: 'password',
        label: 'Password',
        placeholder: '8+ chars, 1 number, 1 special char',
        type: 'password',
        auto_complete: 'new-password',
    },
    {
        name: 'confirm_password',
        label: 'Confirm Password',
        placeholder: 'Confirm your password',
        type: 'password',
        auto_complete: 'new-password',
    },
]

function get_password_strength(password: string) {
    let score = 0
    if (password.length >= 8) score++
    if (/[0-9]/.test(password)) score++
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++
    if (/[A-Z]/.test(password)) score++
    if (/[a-z]/.test(password)) score++
    if (score <= 2) return { score: 1, label: 'Weak' }
    if (score <= 3) return { score: 2, label: 'Fair' }
    if (score <= 4) return { score: 3, label: 'Good' }
    return { score: 4, label: 'Strong' }
}

type FieldShowPassword = {
    [K in keyof RegisterFormValues]?: boolean
}

export function RegisterForm({ className, ...props }: RegisterFormProps) {
    const [field_show_password, set_field_show_password] =
        useState<FieldShowPassword>({})
    const [form_error, set_form_error] = useState<string | null>(null)
    const router = useRouter()
    const { registerMutate, status } = useRegister()

    const {
        register,
        handleSubmit,
        formState: { errors, isValid, isSubmitting, touchedFields },
        watch,
    }: UseFormReturn<RegisterFormValues> = useForm<RegisterFormValues>({
        resolver: zodResolver(register_schema),
        mode: 'onChange',
    })

    const values = watch()
    const is_pending = status === 'pending'

    const on_submit = (data: RegisterFormValues) => {
        set_form_error(null)
        const payload: RegisterPayload = {
            display_name: data.display_name,
            email: data.email,
            password: data.password,
        }
        registerMutate(payload, {
            onSuccess: () => router.push('/login'),
            onError: (err: unknown) => {
                if (axios.isAxiosError(err)) {
                    set_form_error(
                        err.response?.data?.error ?? 'Something went wrong'
                    )
                } else if (err instanceof Error) {
                    set_form_error(err.message)
                } else set_form_error('Something went wrong')
            },
        })
    }

    const is_field_success = (name: keyof RegisterFormValues) =>
        Boolean(values[name] && !errors[name] && touchedFields[name])

    return (
        <form
            className={cn('flex flex-col gap-6', className)}
            onSubmit={handleSubmit(on_submit)}
            autoComplete="on"
            {...props}
        >
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Create an account</h1>
                <p className="text-muted-foreground text-sm text-balance">
                    Enter your details below to create your account
                </p>
            </div>

            {form_error && (
                <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <div>{form_error}</div>
                </div>
            )}

            <div className="grid gap-4">
                {register_fields.map((field) => {
                    const is_password = field.type === 'password'
                    const show_pw = !!field_show_password[field.name]
                    return (
                        <div className="grid gap-2" key={field.name}>
                            <Label htmlFor={field.name}>{field.label}</Label>
                            <div className="relative">
                                <Input
                                    id={field.name}
                                    type={
                                        is_password
                                            ? show_pw
                                                ? 'text'
                                                : 'password'
                                            : field.type
                                    }
                                    autoComplete={field.auto_complete}
                                    placeholder={field.placeholder}
                                    disabled={is_pending || isSubmitting}
                                    {...register(field.name)}
                                    className={cn(
                                        is_password && 'pr-10',
                                        errors[field.name] &&
                                            'border-destructive focus-visible:ring-destructive'
                                    )}
                                />
                                {is_password && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() =>
                                            set_field_show_password((prev) => ({
                                                ...prev,
                                                [field.name]: !prev[field.name],
                                            }))
                                        }
                                        tabIndex={-1}
                                        disabled={is_pending || isSubmitting}
                                    >
                                        {show_pw ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                        <span className="sr-only">
                                            {show_pw
                                                ? 'Hide password'
                                                : 'Show password'}
                                        </span>
                                    </Button>
                                )}
                                {is_field_success(field.name) && (
                                    <CheckCircle
                                        className={cn(
                                            'absolute top-1/2 h-4 w-4 text-muted-foreground -translate-y-1/2',
                                            is_password ? 'right-10' : 'right-3'
                                        )}
                                    />
                                )}
                            </div>
                            {field.name === 'password' && values.password && (
                                <div className="space-y-2">
                                    <div className="flex gap-1">
                                        {[...Array(4)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={cn(
                                                    'h-1 flex-1 rounded-full transition-all duration-300',
                                                    i <
                                                        get_password_strength(
                                                            values.password
                                                        ).score
                                                        ? 'bg-muted-foreground'
                                                        : 'bg-muted'
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Strength:{' '}
                                        {
                                            get_password_strength(
                                                values.password
                                            ).label
                                        }
                                    </p>
                                </div>
                            )}
                            {errors[field.name] && (
                                <div className="flex items-center gap-2 text-xs text-destructive">
                                    <AlertCircle className="h-3 w-3" />
                                    {errors[field.name]?.message as string}
                                </div>
                            )}
                        </div>
                    )
                })}

                <Button
                    type="submit"
                    className="w-full"
                    disabled={!isValid || is_pending || isSubmitting}
                >
                    {is_pending || isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing up...
                        </>
                    ) : (
                        'Sign up'
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
                    disabled={is_pending || isSubmitting}
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

            <div className="text-center text-sm">
                Already have an account?{' '}
                <a href="/login" className="underline underline-offset-4">
                    Login
                </a>
            </div>
        </form>
    )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
    ...props
}: React.ComponentProps<'form'>) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(formSchema),
    })
    const router = useRouter()
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
            router.push('/login')
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
                        <p className="text-sm text-red-500">
                            {errors.display_name.message}
                        </p>
                    )}
                </div>

                <div className="grid gap-3">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" {...register('email')} />
                    {errors.email && (
                        <p className="text-sm text-red-500">
                            {errors.email.message}
                        </p>
                    )}
                </div>

                <div className="grid gap-3">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        {...register('password')}
                    />
                    {errors.password && (
                        <p className="text-sm text-red-500">
                            {errors.password.message}
                        </p>
                    )}
                </div>

                <div className="grid gap-3">
                    <Label htmlFor="confirm_password">Confirm Password</Label>
                    <Input
                        id="confirm_password"
                        type="password"
                        {...register('confirm_password')}
                    />
                    {errors.confirm_password && (
                        <p className="text-sm text-red-500">
                            {errors.confirm_password.message}
                        </p>
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
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24"
                        viewBox="0 0 24 24"
                        width="24"
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

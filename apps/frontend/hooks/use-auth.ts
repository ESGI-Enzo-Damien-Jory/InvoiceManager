import {
    useMutation,
    useQuery,
    useQueryClient,
    UseMutationResult,
    UseMutateFunction,
} from '@tanstack/react-query'
import {
    loginUser,
    LoginPayload,
    LoginResponse,
    registerUser,
    RegisterPayload,
    RegisterResponse,
    logoutUser,
    resetPassword,
    ResetPasswordPayload,
    ResetPasswordResponse,
    getUser,
    UserProfile,
    updateUser,
    UpdateProfilePayload,
    UpdateProfileResponse,
    uploadAvatar,
    UploadAvatarResponse,
} from '@/services/auth'

/**
 * Hook: useLogin
 */
export function useLogin(): {
    loginMutate: UseMutateFunction<LoginResponse, Error, LoginPayload, unknown>
    status: 'idle' | 'pending' | 'error' | 'success'
    error: Error | null
    reset: () => void
} {
    const queryClient = useQueryClient()

    const mutation: UseMutationResult<
        LoginResponse,
        Error,
        LoginPayload,
        unknown
    > = useMutation({
        mutationFn: (payload: LoginPayload) => loginUser(payload),

        onSuccess: (_data: LoginResponse) => {
            queryClient.invalidateQueries({ queryKey: ['items'] })
            queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] })
        },

        onError: (error: Error) => {
            console.error('[useLogin] Login failed:', error.message)
        },
    })

    return {
        loginMutate: mutation.mutate,
        status: mutation.status,
        error: mutation.error ?? null,
        reset: mutation.reset,
    }
}

/**
 * Hook: useRegister
 */
export function useRegister(): {
    registerMutate: (
        payload: RegisterPayload,
        options?: {
            onSuccess?: (data: RegisterResponse) => void
            onError?: (error: unknown) => void
        }
    ) => void
    status: 'idle' | 'pending' | 'error' | 'success'
    error: Error | null
    reset: () => void
} {
    const mutation: UseMutationResult<
        RegisterResponse,
        Error,
        RegisterPayload,
        unknown
    > = useMutation({
        mutationFn: (payload: RegisterPayload) => registerUser(payload),
        onError: (error: Error) => {
            console.error('[useRegister] Registration failed:', error.message)
        },
    })

    return {
        registerMutate: mutation.mutate,
        status: mutation.status,
        error: mutation.error ?? null,
        reset: mutation.reset,
    }
}

/**
 * Hook: useLogout
 */
export function useLogout(): {
    logoutMutate: (options?: {
        onSuccess?: (data: { message: string }) => void
        onError?: (error: unknown) => void
    }) => void
    status: 'idle' | 'pending' | 'error' | 'success'
    error: Error | null
    reset: () => void
} {
    const queryClient = useQueryClient()

    const mutation: UseMutationResult<
        { message: string },
        Error,
        void,
        unknown
    > = useMutation({
        mutationFn: () => logoutUser(),

        onSuccess: () => {
            queryClient.removeQueries({ queryKey: ['currentUserProfile'] })
            queryClient.removeQueries({ queryKey: ['items'] })
        },

        onError: (error: Error) => {
            console.error('[useLogout] Logout failed:', error.message)
        },
    })

    const logoutMutate = (options?: {
        onSuccess?: (data: { message: string }) => void
        onError?: (error: unknown) => void
    }) => {
        mutation.mutate(undefined, options)
    }

    return {
        logoutMutate,
        status: mutation.status,
        error: mutation.error ?? null,
        reset: mutation.reset,
    }
}

/**
 * Hook: useResetPassword
 */
export function useResetPassword(): {
    resetMutate: (
        payload: ResetPasswordPayload,
        options?: {
            onSuccess?: (data: ResetPasswordResponse) => void
            onError?: (error: unknown) => void
        }
    ) => void
    status: 'idle' | 'pending' | 'error' | 'success'
    error: Error | null
    reset: () => void
} {
    const mutation: UseMutationResult<
        ResetPasswordResponse,
        Error,
        ResetPasswordPayload,
        unknown
    > = useMutation({
        mutationFn: (payload: ResetPasswordPayload) => resetPassword(payload),
        onError: (error: Error) => {
            console.error(
                '[useResetPassword] Reset password request failed:',
                error.message
            )
        },
    })

    return {
        resetMutate: mutation.mutate,
        status: mutation.status,
        error: mutation.error ?? null,
        reset: mutation.reset,
    }
}

/**
 * Hook: useUser
 */
export function useUser() {
    return useQuery<UserProfile, Error>({
        queryKey: ['currentUserProfile'],
        queryFn: () => getUser(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: false,
    })
}

/**
 * Hook: useUpdateProfile
 */
export function useUpdateProfile(): {
    updateMutate: (
        payload: UpdateProfilePayload,
        options?: {
            onSuccess?: (data: UpdateProfileResponse) => void
            onError?: (error: unknown) => void
        }
    ) => void
    status: 'idle' | 'pending' | 'error' | 'success'
    error: Error | null
    reset: () => void
} {
    const queryClient = useQueryClient()

    const mutation: UseMutationResult<
        UpdateProfileResponse,
        Error,
        UpdateProfilePayload,
        unknown
    > = useMutation({
        mutationFn: (payload: UpdateProfilePayload) => updateUser(payload),

        onSuccess: (updatedProfile: UpdateProfileResponse) => {
            queryClient.setQueryData<UserProfile>(
                ['currentUserProfile'],
                updatedProfile
            )
        },

        onError: (error: Error) => {
            console.error('[useUpdateProfile] Update failed:', error.message)
        },
    })

    return {
        updateMutate: mutation.mutate,
        status: mutation.status,
        error: mutation.error ?? null,
        reset: mutation.reset,
    }
}

/**
 * Hook: useUploadAvatar
 */
export function useUploadAvatar(): {
    uploadMutate: (
        file: File,
        options?: {
            onSuccess?: (data: UploadAvatarResponse) => void
            onError?: (error: unknown) => void
        }
    ) => void
    status: 'idle' | 'pending' | 'error' | 'success'
    error: Error | null
    reset: () => void
} {
    const queryClient = useQueryClient()

    const mutation: UseMutationResult<
        UploadAvatarResponse,
        Error,
        File,
        unknown
    > = useMutation({
        mutationFn: (file: File) => uploadAvatar(file),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] })
        },

        onError: (error: Error) => {
            console.error(
                '[useUploadAvatar] Avatar upload failed:',
                error.message
            )
        },
    })

    return {
        uploadMutate: mutation.mutate,
        status: mutation.status,
        error: mutation.error ?? null,
        reset: mutation.reset,
    }
}

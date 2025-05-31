// hooks/use-auth.ts

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
} from '@/services/auth'

/**
 * Hook: useLogin
 *
 * We return `loginMutate` as a `UseMutateFunction` so that callers
 * can pass both `(variables, options)` without type errors.
 */
export function useLogin(): {
    loginMutate: UseMutateFunction<LoginResponse, Error, LoginPayload, unknown>
    status: 'idle' | 'pending' | 'error' | 'success'
    error: Error | null
    reset: () => void
  } {
    const queryClient = useQueryClient()
  
    // We explicitly capture the exact `UseMutationResult<>` so that
    // its `mutate` method has the correct overloaded signature.
    const mutation: UseMutationResult<LoginResponse, Error, LoginPayload, unknown> =
      useMutation({
        mutationFn: (payload: LoginPayload) => loginUser(payload),
  
        onSuccess: (_data: LoginResponse) => {
          // Invalidate any queries that depend on being authenticated:
          queryClient.invalidateQueries({ queryKey: ['items'] })
          // Invalidate the user‐profile query so that useUser() refetches GET /users
          queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] })
        },
  
        onError: (error: Error) => {
          console.error('[useLogin] Login failed:', error.message)
        },
      })
  
    return {
      // Expose the `mutate` method directly (it is a UseMutateFunction<...>).
      loginMutate: mutation.mutate,
      status: mutation.status,
      error: mutation.error ?? null,
      reset: mutation.reset,
    }
  }

/**
 * Hook: useRegister
 * - mutationFn: registerUser
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
 * - mutationFn: logoutUser
 * - onSuccess: remove user‐profile and items cache
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
            // 1) Remove cached user profile
            queryClient.removeQueries({ queryKey: ['currentUserProfile'] })
            // 2) Remove any other queries that depend on login
            queryClient.removeQueries({ queryKey: ['items'] })
        },

        onError: (error: Error) => {
            console.error('[useLogout] Logout failed:', error.message)
        },
    })

    // Wrap mutate so callers don’t need to pass “undefined” explicitly
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
 * - mutationFn: resetPassword
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
 * - queryFn: getUser (GET /users)
 * - caches under ['currentUserProfile']
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
 * - mutationFn: updateUser (PUT /users)
 * - onSuccess: overwrite ['currentUserProfile'] cache
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
            // Overwrite the cached user profile
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

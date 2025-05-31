import api from '@/lib/api'

/** --------------------------------------------- **
 * 1) Auth‐related types & functions
 ** --------------------------------------------- **/

/** Payload for login: email & password. */
export interface LoginPayload {
    email: string
    password: string
}

/** Response from POST /auth/login: only a success message. */
export interface LoginResponse {
    message: string
}

/**
 * POST /auth/login
 * - Server sets the HttpOnly “supabase-session” cookie on success.
 * - Returns: { message: string }.
 */
export async function loginUser(payload: LoginPayload): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', payload)
    return response.data
}

/** Payload for registration: email, password, display_name. */
export interface RegisterPayload {
    email: string
    password: string
    display_name: string
}

/** Response from POST /auth/register: created user info + message. */
export interface RegisterResponse {
    user: {
        id: string
        email: string
        created_at: string
        updated_at: string
        display_name: string
    }
    message: string
}

/**
 * POST /auth/register
 * - Creates a new Supabase user and stores display_name.
 * - Returns: { user: { id, email, created_at, updated_at, display_name }, message }.
 */
export async function registerUser(
    payload: RegisterPayload
): Promise<RegisterResponse> {
    const response = await api.post<RegisterResponse>('/auth/register', payload)
    return response.data
}

/**
 * POST /auth/logout
 * - Server clears the “supabase-session” cookie.
 * - Returns: { message: string }.
 */
export async function logoutUser(): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/logout')
    return response.data
}

/** Payload for sending a password‐reset email. */
export interface ResetPasswordPayload {
    email: string
}

/** Response from POST /auth/reset: only a message. */
export interface ResetPasswordResponse {
    message: string
}

/**
 * POST /auth/reset
 * - Sends a password‐reset email via Supabase.
 * - Returns: { message: string }.
 */
export async function resetPassword(
    payload: ResetPasswordPayload
): Promise<ResetPasswordResponse> {
    const response = await api.post<ResetPasswordResponse>(
        '/auth/reset',
        payload
    )
    return response.data
}

/** --------------------------------------------- **
 * 2) User‐profile types & functions
 ** --------------------------------------------- **/

/**
 * The “public” user profile returned by GET /users (UsersController.show).
 * Matches exactly: { id, display_name, email, phone_number, updated_at }.
 */
export interface UserProfile {
    id: string
    display_name: string
    email: string
    phone_number: string | null
    updated_at: string
}

/**
 * GET /users
 * - Uses the HttpOnly “supabase-session” cookie for authentication.
 * - Returns: UserProfile.
 */
export async function getUser(): Promise<UserProfile> {
    const response = await api.get<UserProfile>('/user')
    return response.data
}

/**
 * Payload for updating the current user’s profile.
 * Only display_name and/or phone_number may be provided.
 */
export interface UpdateProfilePayload {
    display_name?: string
    phone_number?: string
}

/**
 * PUT /users
 * - Updates the Supabase “users” row for the authenticated user.
 * - Returns: the updated UserProfile.
 */
export type UpdateProfileResponse = UserProfile

export async function updateUser(
    payload: UpdateProfilePayload
): Promise<UpdateProfileResponse> {
    const response = await api.put<UpdateProfileResponse>('/users', payload)
    return response.data
}

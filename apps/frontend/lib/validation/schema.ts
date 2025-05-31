import { z } from 'zod'

/* ------------------------- 🧍 Create Client ------------------------- */
export const createClientSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone_number: z.string().optional(),
  address: z.string().optional(),
  avatar: z
    .string()
    .url('Invalid avatar URL')
    .optional()
    .or(z.literal('').transform(() => undefined)), // Gère les strings vides comme "non rempli"
})

export type CreateClientDTO = z.infer<typeof createClientSchema>

/* ------------------------- 🔐 Login ------------------------- */
export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type LoginDTO = z.infer<typeof loginSchema>

/* ------------------------- 📝 Register ------------------------- */
export const registerSchema = z
  .object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirm_password: z.string().min(6, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  })

export type RegisterDTO = z.infer<typeof registerSchema>

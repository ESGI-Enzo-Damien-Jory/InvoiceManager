// =============================================================================
// FORM TYPES - ZOD SCHEMAS & FORM DATA
// =============================================================================

import { z } from 'zod'

// =============================================================================
// AUTHENTICATION FORMS
// =============================================================================

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
})

export const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string(),
  display_name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
})

export const resetPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
})

// =============================================================================
// CLIENT FORMS
// =============================================================================

export const clientFormSchema = z.object({
  first_name: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  last_name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  phone_number: z.string().optional(),
  address: z.string().optional(),
})

export const clientFiltersSchema = z.object({
  search: z.string().optional(),
  email: z.string().optional(),
})

// =============================================================================
// ITEM FORMS
// =============================================================================

export const itemFormSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  price: z.number().min(0, 'Le prix doit être positif'),
  avatar: z.string().optional(),
})

export const itemFiltersSchema = z.object({
  search: z.string().optional(),
  price_min: z.number().optional(),
  price_max: z.number().optional(),
})

// =============================================================================
// INVOICE FORMS
// =============================================================================

export const invoiceFormSchema = z.object({
  client_id: z.string().min(1, 'Client requis'),
  title: z.string().min(2, 'Le titre doit contenir au moins 2 caractères'),
  total_amount: z.number().min(0, 'Le montant doit être positif').optional(),
  expiration_date: z.date().optional(),
  state: z.enum(['Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled']).optional(),
})

export const invoiceItemFormSchema = z.object({
  invoice_id: z.string(),
  item_id: z.string().min(1, 'Article requis'),
  quantity: z.number().min(1, 'Quantité requise'),
  unit_price: z.number().min(0, 'Prix unitaire requis'),
})

export const invoiceFiltersSchema = z.object({
  client_id: z.string().optional(),
  state: z.enum(['Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled']).optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
})

// =============================================================================
// PROFILE FORMS
// =============================================================================

export const profileFormSchema = z.object({
  display_name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  phone_number: z.string().optional(),
  avatar_url: z.string().optional(),
})

// =============================================================================
// FORM DATA TYPES (INFERRED FROM SCHEMAS)
// =============================================================================

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export type ClientFormData = z.infer<typeof clientFormSchema>
export type ClientFiltersData = z.infer<typeof clientFiltersSchema>

export type ItemFormData = z.infer<typeof itemFormSchema>
export type ItemFiltersData = z.infer<typeof itemFiltersSchema>

export type InvoiceFormData = z.infer<typeof invoiceFormSchema>
export type InvoiceItemFormData = z.infer<typeof invoiceItemFormSchema>
export type InvoiceFiltersData = z.infer<typeof invoiceFiltersSchema>

export type ProfileFormData = z.infer<typeof profileFormSchema>

// =============================================================================
// GENERIC FORM TYPES
// =============================================================================

export interface FormState<T> {
  data: T
  errors: Partial<Record<keyof T, string>>
  isSubmitting: boolean
  isValid: boolean
}

export interface FormFieldProps<T> {
  name: keyof T
  label: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
}

export interface FormValidationResult {
  isValid: boolean
  errors: Record<string, string>
} 
import { InvoiceSettings, UpdateInvoiceSettingsPayload } from '@/types/api'

export async function getInvoiceSettings(): Promise<InvoiceSettings> {
  const res = await fetch('/api/invoice-settings', { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch invoice settings')
  return await res.json()
}

export async function updateInvoiceSettings(payload: UpdateInvoiceSettingsPayload): Promise<InvoiceSettings> {
  const res = await fetch('/api/invoice-settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Failed to update invoice settings')
  return await res.json()
}
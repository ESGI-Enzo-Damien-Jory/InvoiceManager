export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            clients: {
                Row: {
                    address: string | null
                    deleted_at: string | null
                    email: string
                    first_name: string
                    id: string
                    last_name: string
                    phone_number: string | null
                    updated_at: string
                    user_id: string
                }
                Insert: {
                    address?: string | null
                    deleted_at?: string | null
                    email: string
                    first_name: string
                    id?: string
                    last_name: string
                    phone_number?: string | null
                    updated_at?: string
                    user_id: string
                }
                Update: {
                    address?: string | null
                    deleted_at?: string | null
                    email?: string
                    first_name?: string
                    id?: string
                    last_name?: string
                    phone_number?: string | null
                    updated_at?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: 'clients_user_id_fkey'
                        columns: ['user_id']
                        isOneToOne: false
                        referencedRelation: 'profiles'
                        referencedColumns: ['id']
                    },
                ]
            }
            invoice_history: {
                Row: {
                    id: string
                    invoice_id: string
                    new_state: Database['public']['Enums']['invoice_state']
                    previous_state: Database['public']['Enums']['invoice_state']
                    state_change_timestamp: string
                }
                Insert: {
                    id?: string
                    invoice_id: string
                    new_state: Database['public']['Enums']['invoice_state']
                    previous_state: Database['public']['Enums']['invoice_state']
                    state_change_timestamp?: string
                }
                Update: {
                    id?: string
                    invoice_id?: string
                    new_state?: Database['public']['Enums']['invoice_state']
                    previous_state?: Database['public']['Enums']['invoice_state']
                    state_change_timestamp?: string
                }
                Relationships: [
                    {
                        foreignKeyName: 'invoice_history_invoice_id_fkey'
                        columns: ['invoice_id']
                        isOneToOne: false
                        referencedRelation: 'invoices'
                        referencedColumns: ['id']
                    },
                ]
            }
            invoice_items: {
                Row: {
                    deleted_at: string | null
                    invoice_id: string
                    item_id: string
                    quantity: number
                    unit_price: number
                }
                Insert: {
                    deleted_at?: string | null
                    invoice_id: string
                    item_id: string
                    quantity?: number
                    unit_price: number
                }
                Update: {
                    deleted_at?: string | null
                    invoice_id?: string
                    item_id?: string
                    quantity?: number
                    unit_price?: number
                }
                Relationships: [
                    {
                        foreignKeyName: 'invoice_items_invoice_id_fkey'
                        columns: ['invoice_id']
                        isOneToOne: false
                        referencedRelation: 'invoices'
                        referencedColumns: ['id']
                    },
                    {
                        foreignKeyName: 'invoice_items_item_id_fkey'
                        columns: ['item_id']
                        isOneToOne: false
                        referencedRelation: 'items'
                        referencedColumns: ['id']
                    },
                ]
            }
            invoices: {
                Row: {
                    client_id: string
                    created_at: string
                    deleted_at: string | null
                    expiration_date: string | null
                    id: string
                    invoice_number: string | null
                    owner_id: string
                    pdf_url: string | null
                    state: Database['public']['Enums']['invoice_state']
                    title: string
                    total_amount: number | null
                    updated_at: string
                }
                Insert: {
                    client_id: string
                    created_at?: string
                    deleted_at?: string | null
                    expiration_date?: string | null
                    id?: string
                    invoice_number?: string | null
                    owner_id: string
                    pdf_url?: string | null
                    state?: Database['public']['Enums']['invoice_state']
                    title: string
                    total_amount?: number | null
                    updated_at?: string
                }
                Update: {
                    client_id?: string
                    created_at?: string
                    deleted_at?: string | null
                    expiration_date?: string | null
                    id?: string
                    invoice_number?: string | null
                    owner_id?: string
                    pdf_url?: string | null
                    state?: Database['public']['Enums']['invoice_state']
                    title?: string
                    total_amount?: number | null
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: 'invoices_client_id_fkey'
                        columns: ['client_id']
                        isOneToOne: false
                        referencedRelation: 'clients'
                        referencedColumns: ['id']
                    },
                    {
                        foreignKeyName: 'invoices_owner_id_fkey'
                        columns: ['owner_id']
                        isOneToOne: false
                        referencedRelation: 'profiles'
                        referencedColumns: ['id']
                    },
                ]
            }
            items: {
                Row: {
                    avatar: string | null
                    deleted_at: string | null
                    id: string
                    name: string
                    owner_id: string
                    price: number
                    updated_at: string
                }
                Insert: {
                    avatar?: string | null
                    deleted_at?: string | null
                    id?: string
                    name: string
                    owner_id: string
                    price: number
                    updated_at?: string
                }
                Update: {
                    avatar?: string | null
                    deleted_at?: string | null
                    id?: string
                    name?: string
                    owner_id?: string
                    price?: number
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: 'items_owner_id_fkey'
                        columns: ['owner_id']
                        isOneToOne: false
                        referencedRelation: 'profiles'
                        referencedColumns: ['id']
                    },
                ]
            }
            profiles: {
                Row: {
                    avatar_url: string | null
                    created_at: string
                    deleted_at: string | null
                    display_name: string
                    email: string
                    id: string
                    last_login: string
                    phone_number: string | null
                    updated_at: string
                }
                Insert: {
                    avatar_url?: string | null
                    created_at?: string
                    deleted_at?: string | null
                    display_name: string
                    email: string
                    id: string
                    last_login?: string
                    phone_number?: string | null
                    updated_at?: string
                }
                Update: {
                    avatar_url?: string | null
                    created_at?: string
                    deleted_at?: string | null
                    display_name?: string
                    email?: string
                    id?: string
                    last_login?: string
                    phone_number?: string | null
                    updated_at?: string
                }
                Relationships: []
            }
            invoice_settings: {
                Row: {
                    id: string
                    user_id: string
                    prefix: string
                    next_number: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    prefix?: string
                    next_number?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    prefix?: string
                    next_number?: number
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: 'invoice_settings_user_id_fkey'
                        columns: ['user_id']
                        isOneToOne: true
                        referencedRelation: 'profiles'
                        referencedColumns: ['id']
                    },
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            invoice_state: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled'
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

type DefaultSchema = Database[Extract<keyof Database, 'public'>]

export type Tables<
    DefaultSchemaTableNameOrOptions extends
        | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
        | { schema: keyof Database },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof Database
    }
        ? keyof (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
              Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])
        : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
          Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
          Row: infer R
      }
        ? R
        : never
    : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
            DefaultSchema['Views'])
      ? (DefaultSchema['Tables'] &
            DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
            Row: infer R
        }
          ? R
          : never
      : never

export type TablesInsert<
    DefaultSchemaTableNameOrOptions extends
        | keyof DefaultSchema['Tables']
        | { schema: keyof Database },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof Database
    }
        ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
        : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
          Insert: infer I
      }
        ? I
        : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
      ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
            Insert: infer I
        }
          ? I
          : never
      : never

export type TablesUpdate<
    DefaultSchemaTableNameOrOptions extends
        | keyof DefaultSchema['Tables']
        | { schema: keyof Database },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof Database
    }
        ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
        : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
          Update: infer U
      }
        ? U
        : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
      ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
            Update: infer U
        }
          ? U
          : never
      : never

export type Enums<
    DefaultSchemaEnumNameOrOptions extends
        | keyof DefaultSchema['Enums']
        | { schema: keyof Database },
    EnumName extends DefaultSchemaEnumNameOrOptions extends {
        schema: keyof Database
    }
        ? keyof Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
        : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
    ? Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
    : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
      ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
      : never

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
        | keyof DefaultSchema['CompositeTypes']
        | { schema: keyof Database },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof Database
    }
        ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
        : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
    ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
      ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
      : never

export const Constants = {
    public: {
        Enums: {
            invoice_state: ['Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled'],
        },
    },
} as const

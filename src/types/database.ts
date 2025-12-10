export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            tenants: {
                Row: {
                    id: string
                    name: string
                    industry: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    industry?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    industry?: string | null
                    created_at?: string
                }
            }
            ad_accounts: {
                Row: {
                    id: string
                    tenant_id: string
                    platform_account_id: string
                    name: string
                    access_token: string
                    currency: string | null
                    status: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    tenant_id: string
                    platform_account_id: string
                    name: string
                    access_token: string
                    currency?: string | null
                    status?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    tenant_id?: string
                    platform_account_id?: string
                    name?: string
                    access_token?: string
                    currency?: string | null
                    status?: string | null
                    created_at?: string
                }
            }
            creatives: {
                Row: {
                    id: string
                    ad_account_id: string
                    platform_creative_id: string | null
                    image_url: string | null
                    thumbnail_url: string | null
                    title: string | null
                    body: string | null
                    call_to_action: string | null
                    impressions: number
                    clicks: number
                    spend: number
                    ctr: number
                    cpa: number
                    roas: number
                    winning_score: number
                    analysis_summary: string | null
                    status: string
                    origin: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    ad_account_id: string
                    platform_creative_id?: string | null
                    image_url?: string | null
                    thumbnail_url?: string | null
                    title?: string | null
                    body?: string | null
                    call_to_action?: string | null
                    impressions?: number
                    clicks?: number
                    spend?: number
                    ctr?: number
                    cpa?: number
                    roas?: number
                    winning_score?: number
                    analysis_summary?: string | null
                    status?: string
                    origin?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    ad_account_id?: string
                    platform_creative_id?: string | null
                    image_url?: string | null
                    thumbnail_url?: string | null
                    title?: string | null
                    body?: string | null
                    call_to_action?: string | null
                    impressions?: number
                    clicks?: number
                    spend?: number
                    ctr?: number
                    cpa?: number
                    roas?: number
                    winning_score?: number
                    analysis_summary?: string | null
                    status?: string
                    origin?: string
                    created_at?: string
                    updated_at?: string
                }
            }
        }
    }
}

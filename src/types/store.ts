export type Store = {
    id: string
    name: string
    address?: string
    phone?: string
    user_id: string

    // Linked External IDs
    meta_campaign_ids: string[] // Array of Campaign IDs
    meta_campaign_id?: string // Main Campaign ID
    meta_campaign_name?: string // Main Campaign Name (Display)

    meta_ad_account_id?: string // Selected Ad Account ID
    meta_ad_account_name?: string

    ga4_property_id?: string
    ga4_property_name?: string // Property Name (Display)

    gbp_location_id?: string
    gbp_location_name?: string

    // Tokens (Server-side use mostly)
    meta_access_token?: string
    google_refresh_token?: string // Added for permanent GA4/GBP access

    // Analysis Settings
    cv_event_name?: string
    target_audience?: string
    initial_budget?: string
    industry?: string

    created_at: string
}

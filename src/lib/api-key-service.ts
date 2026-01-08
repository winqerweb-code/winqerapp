import { getSupabase } from './supabase-server'

export async function getGeminiKey(): Promise<string | null> {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data } = await supabase
        .from('user_settings')
        .select('gemini_api_key')
        .eq('user_id', user.id)
        .single()

    return data?.gemini_api_key || null
}

export async function getOpenAIKey(): Promise<string | null> {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data } = await supabase
        .from('user_settings')
        .select('openai_api_key')
        .eq('user_id', user.id)
        .single()

    return data?.openai_api_key || null
}

export async function getMetaToken(): Promise<string | null> {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data } = await supabase
        .from('user_settings')
        .select('meta_access_token')
        .eq('user_id', user.id)
        .single()

    return data?.meta_access_token || null
}

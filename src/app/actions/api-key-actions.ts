'use server'

import { getSupabase } from '@/lib/supabase-server'

export type ApiKeyStatus = {
    hasApiKey: boolean
    last4: string | null
}

export async function saveGeminiKey(key: string) {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    if (!key || key.trim() === '') {
        return { success: false, error: 'API Key cannot be empty' }
    }

    const { error } = await supabase
        .from('user_settings')
        .upsert({
            user_id: user.id,
            gemini_api_key: key,
            updated_at: new Date().toISOString()
        })

    if (error) {
        console.error('Failed to save Gemini API key:', error)
        return { success: false, error: 'Failed to save API key' }
    }

    return { success: true }
}

export async function getGeminiKeyStatus(): Promise<{ success: boolean, data?: ApiKeyStatus, error?: string }> {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    const { data, error } = await supabase
        .from('user_settings')
        .select('gemini_api_key')
        .eq('user_id', user.id)
        .single()

    if (error && error.code !== 'PGRST116') {
        console.error('Failed to get Gemini API key status:', error)
        return { success: false, error: 'Failed to get API key status' }
    }

    const apiKey = data?.gemini_api_key
    const hasApiKey = !!apiKey && apiKey.length > 0
    const last4 = hasApiKey ? apiKey.slice(-4) : null

    return {
        success: true,
        data: {
            hasApiKey,
            last4
        }
    }
}

export async function saveOpenAIKey(key: string) {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    if (!key || key.trim() === '') {
        return { success: false, error: 'API Key cannot be empty' }
    }

    const { error } = await supabase
        .from('user_settings')
        .upsert({
            user_id: user.id,
            openai_api_key: key,
            updated_at: new Date().toISOString()
        })

    if (error) {
        console.error('Failed to save OpenAI API key:', error)
        return { success: false, error: 'Failed to save API key' }
    }

    return { success: true }
}

export async function getOpenAIKeyStatus(): Promise<{ success: boolean, data?: ApiKeyStatus, error?: string }> {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    const { data, error } = await supabase
        .from('user_settings')
        .select('openai_api_key')
        .eq('user_id', user.id)
        .single()

    if (error && error.code !== 'PGRST116') {
        console.error('Failed to get OpenAI API key status:', error)
        return { success: false, error: 'Failed to get API key status' }
    }

    const apiKey = data?.openai_api_key
    const hasApiKey = !!apiKey && apiKey.length > 0
    const last4 = hasApiKey ? apiKey.slice(-4) : null

    return {
        success: true,
        data: {
            hasApiKey,
            last4
        }
    }
}

export async function saveMetaToken(token: string) {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    if (!token || token.trim() === '') {
        return { success: false, error: 'Token cannot be empty' }
    }

    const { error } = await supabase
        .from('user_settings')
        .upsert({
            user_id: user.id,
            meta_access_token: token,
            updated_at: new Date().toISOString()
        })

    if (error) {
        console.error('Failed to save Meta token:', error)
        return { success: false, error: 'Failed to save token' }
    }

    return { success: true }
}

export async function getMetaTokenStatus(): Promise<{ success: boolean, data?: ApiKeyStatus, error?: string }> {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    const { data, error } = await supabase
        .from('user_settings')
        .select('meta_access_token')
        .eq('user_id', user.id)
        .single()

    if (error && error.code !== 'PGRST116') {
        console.error('Failed to get Meta token status:', error)
        return { success: false, error: 'Failed to get token status' }
    }

    const token = data?.meta_access_token
    const hasApiKey = !!token && token.length > 0
    const last4 = hasApiKey ? token.slice(-4) : null

    return {
        success: true,
        data: {
            hasApiKey,
            last4
        }
    }
}

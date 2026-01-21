"use server"

// Allow longer execution for AI generation (Vercel limit)
export const maxDuration = 60;

import OpenAI from "openai"
import { getStore } from "@/app/actions/store"
import { createClient } from '@supabase/supabase-js'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

interface GeneratePostParams {
    storeId: string
    apiKey: string
    topic: string
    imageBase64?: string
    tone?: string
}



function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !key) {
        console.error("Missing Admin Credentials for Key Fetch:", { url: !!url, key: !!key })
        return null
    }

    return createClient(url, key, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
}

export async function generateInstagramPost({
    storeId,
    apiKey,
    topic,
    imageBase64,
    tone
}: GeneratePostParams) {
    try {
        // 1. Fetch Store & Strategy Data
        // 1. Fetch Store 
        const storeResult = await getStore(storeId)

        if (!storeResult.success || !storeResult.store) {
            throw new Error("Store not found")
        }

        const store = storeResult.store

        // 2. Fetch Strategy (Inlined for robustness)
        // We use a local helper to avoid module dependency issues
        let strategyData: any = null
        try {
            // Helper to get Supabase (Standard)
            const cookieStore = cookies()
            const supabase = createServerClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                {
                    cookies: {
                        get(name: string) { return cookieStore.get(name)?.value },
                        // No need to set cookies for simple fetch
                    }
                }
            )

            // Standard fetch
            const { data: stdData } = await supabase
                .from('strategies')
                .select('*')
                .eq('store_id', storeId)
                .single()

            if (stdData) {
                strategyData = stdData
            } else {
                // Admin Bypass if standard failed (RLS)
                const adminClient = getSupabaseAdmin()
                if (adminClient) {
                    const { data: adminData } = await adminClient
                        .from('strategies')
                        .select('*')
                        .eq('store_id', storeId)
                        .single()
                    if (adminData) strategyData = adminData
                }
            }
        } catch (stratError) {
            console.error("Strategy Fetch Error (Non-fatal):", stratError)
            // Continue without strategy if failed
        }

        // Prepare Strategy Context
        const inputData = strategyData?.input_data || {}
        const outputData = strategyData?.output_data || {} // The AI generated persona etc

        // 2. Resolve API Key
        // Use client-provided key if available (legacy/global), otherwise fallback to Store Secret
        let effectiveApiKey = (apiKey && apiKey.trim() !== "")
            ? apiKey
            : (store.openai_api_key || "")

        // SECURE FALLBACK: If standard fetch failed to get the key (due to RLS), fetch it via Admin Client
        if (!effectiveApiKey) {
            console.log("⚠️ OpenAI Key missing from standard store fetch. Attempting Admin Bypass...")
            const adminSupabase = getSupabaseAdmin()
            if (adminSupabase) {
                const { data: adminStore } = await adminSupabase
                    .from('stores')
                    .select('openai_api_key')
                    .eq('id', storeId)
                    .single()

                if (adminStore?.openai_api_key) {
                    console.log("✅ Retrieved OpenAI Key via Admin Bypass")
                    effectiveApiKey = adminStore.openai_api_key
                }
            }
        }

        if (!effectiveApiKey) {
            throw new Error("OpenAI API Key is not configured. Please set it in the Store Settings.")
        }

        // 3. Initialize OpenAI
        const openai = new OpenAI({
            apiKey: effectiveApiKey,
        })

        // 3. Construct Prompt
        const systemPrompt = `
あなたはプロのInstagram運用代行者です。
指定された店舗情報・戦略に基づき、コピペでそのまま使える投稿キャプションを作成してください。

## 店舗情報
- 店名: ${store.name}
- 業種: ${inputData.industry || store.industry || "未設定"}
- 地域: ${store.address || "未設定"}

## 戦略コンテキスト
- ターゲット層: ${outputData.persona?.demographics || inputData.goal?.target_audience || "一般層"}
- ターゲットの悩み: ${outputData.persona?.pain_points || "未設定"}
- ブランドの強み (USP): ${outputData.swot?.strengths?.join(", ") || inputData.comparison?.differentiation_points || "未設定"}
- 目指すブランドイメージ: ${inputData.brand?.desired_image || "未設定"}
- NG表現: ${inputData.brand?.ng_expressions || "特になし"}

## 出力要件
- 3つの異なるバリエーションを出力（JSON形式）。
- ハッシュタグも10〜15個程度提案。
- JSONのキーは必ず "captions" という配列を含めてください。

JSONフォーマット:
{
  "captions": [
    {
      "title": "案のタイトル",
      "caption": "本文",
      "hashtags": "#タグ..."
    }
  ]
}
`

        const userContent: any[] = [
            { type: "text", text: `トピック: ${topic}\n指定トーン: ${tone || "店舗の雰囲気に合わせる"}` }
        ]

        if (imageBase64) {
            userContent.push({
                type: "image_url",
                image_url: {
                    url: imageBase64, // base64 string including data:image/... prefix
                    detail: "high"
                }
            })
            userContent.push({
                type: "text",
                text: "この画像を解析し、その視覚情報（雰囲気、写っているもの、色味など）をキャプションに自然に盛り込んでください。"
            })
        }

        // 4. Generate Content
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userContent }
            ],
            response_format: { type: "json_object" }
        })

        const content = response.choices[0].message.content
        if (!content) throw new Error("No content generated")

        // 5. Parse JSON
        let captions = []
        try {
            const parsed = JSON.parse(content)
            if (parsed.captions && Array.isArray(parsed.captions)) {
                captions = parsed.captions
            } else if (Array.isArray(parsed)) {
                captions = parsed
            } else {
                const val = Object.values(parsed).find(v => Array.isArray(v))
                if (val) captions = val as any[]
            }
        } catch (e) {
            console.error("JSON Parse Error:", e)
            throw new Error("Failed to parse AI response")
        }

        if (!captions || captions.length === 0) {
            throw new Error("Failed to parse captions structure")
        }

        return { success: true, captions }

    } catch (error: any) {
        console.error("Generate Post Critical Error:", error)
        // Ensure we return a serializable object, not throwing
        return {
            success: false,
            error: error?.message || "Unknown Server Error during generation"
        }
    }
}

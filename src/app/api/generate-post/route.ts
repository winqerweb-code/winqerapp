import { createClient } from '@supabase/supabase-js'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import OpenAI from "openai"
import { NextRequest, NextResponse } from 'next/server'
import { getStore } from "@/app/actions/store"

// Allow execution up to 60 seconds (Standard for Vercel Hobby/Pro Serverless Functions)
export const maxDuration = 60;

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

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { storeId, apiKey, topic, imageBase64, tone } = body

        if (!storeId) {
            return NextResponse.json({ success: false, error: "Store ID is required" }, { status: 400 })
        }

        // 1. Fetch Store 
        const storeResult = await getStore(storeId)

        if (!storeResult.success || !storeResult.store) {
            return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 })
        }

        const store = storeResult.store

        // 2. Fetch Strategy (Inlined for robustness)
        let strategyData: any = null
        try {
            const cookieStore = cookies()
            const supabase = createServerClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                {
                    cookies: {
                        get(name: string) { return cookieStore.get(name)?.value },
                    }
                }
            )

            const { data: stdData } = await supabase
                .from('strategies')
                .select('*')
                .eq('store_id', storeId)
                .single()

            if (stdData) {
                strategyData = stdData
            } else {
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
        }

        // Prepare Strategy Context
        const inputData = strategyData?.input_data || {}
        const outputData = strategyData?.output_data || {}

        // 3. Resolve API Key
        let effectiveApiKey = (apiKey && apiKey.trim() !== "")
            ? apiKey
            : (store.openai_api_key || "")

        if (!effectiveApiKey) {
            const adminSupabase = getSupabaseAdmin()
            if (adminSupabase) {
                const { data: adminStore } = await adminSupabase
                    .from('stores')
                    .select('openai_api_key')
                    .eq('id', storeId)
                    .single()

                if (adminStore?.openai_api_key) {
                    effectiveApiKey = adminStore.openai_api_key
                }
            }
        }

        if (!effectiveApiKey) {
            return NextResponse.json({ success: false, error: "OpenAI API Key is not configured." }, { status: 500 })
        }

        // 4. Initialize OpenAI
        const openai = new OpenAI({ apiKey: effectiveApiKey })

        // 5. Construct Prompt (Professional Copywriter Persona)
        const systemPrompt = `
あなたは「売上に直結する言葉を紡ぐプロのInstagramコピーライター」です。
提供された情報（店舗データ・戦略）を元に、ターゲットの心を動かし、予約や来店という「行動」を引き出すキャプションを作成してください。

## 入力変数（※値が「未設定」の場合は、業種や店名から最適な内容を推測して補完すること）
- 店名: ${store.name}
- 業種: ${inputData.industry || store.industry || "未設定"}
- 地域: ${store.address || "未設定"}
- ターゲット層: ${outputData.persona?.demographics || inputData.goal?.target_audience || "一般層"}
- ターゲットの悩み: ${outputData.persona?.pain_points || "未設定"}
- ブランドの強み (USP): ${Array.isArray(outputData.swot?.strengths) ? outputData.swot.strengths.join(", ") : (outputData.swot?.strengths || inputData.comparison?.differentiation_points || "未設定")}
- 目指すブランドイメージ: ${inputData.brand?.desired_image || "未設定"}
- NG表現: ${inputData.brand?.ng_expressions || "特になし"}

## 執筆ルール（絶対遵守）
1. **「未設定」の自動補完**: 上記の変数が「未設定」や「一般層」などの抽象的な値の場合、指定された「業種」と「地域」から論理的に考えられる「具体的な悩み」や「魅力」を勝手に想像して文章に盛り込むこと。
2. **構成フレームワーク**: 全ての投稿案で以下の構成を守ること。
   - 【フック】1行目で読み手の足を止める（挨拶禁止。「〜な方へ」「実は〜」などで始める）。
   - 【共感】ターゲットの悩み（Pain Points）に寄り添う。
   - 【解決】自社の強み（USP）がどう解決するか提示する。
   - 【誘導】最後に明確なアクション（予約、保存、DM）を促す。
3. **トーン＆マナー**:
   - 専門用語を使わず、親しみやすい口語体で書く。
   - 適度な絵文字と改行を使い、スマホでの可読性を高める。
   - 「宣伝臭」を消し、「役立つ情報」や「素敵な提案」として届ける。

## 出力要件
- 3つの異なる訴求軸（バリエーション）で作成し、JSON形式で出力してください。
  - パターンA: **共感・悩み解決型**（コンプレックスや不便の解消を強調）
  - パターンB: **ベネフィット・憧れ型**（利用後の素敵な未来や、空間の良さを強調）
  - パターンC: **短文・インパクト型**（画像内の文字を補足する、勢いのある短めな文章）
- ハッシュタグは「地域名×業種」「悩み系」「ビッグワード」をバランスよく15個程度選定すること。

## 出力フォーマット（JSON）
JSONのキーは必ず "captions" という配列を含めてください。
{
  "captions": [
    {
      "title": "案のタイトル（例: 共感型）",
      "caption": "投稿本文...",
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
                    url: imageBase64,
                    detail: "high"
                }
            })
            userContent.push({
                type: "text",
                text: "この画像を解析し、その視覚情報（雰囲気、写っているもの、色味など）をキャプションに自然に盛り込んでください。"
            })
        }

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

        return NextResponse.json({ success: true, captions })

    } catch (error: any) {
        console.error("API Route Critical Error:", error)
        return NextResponse.json({
            success: false,
            error: error?.message || "Unknown Server Error during generation"
        }, { status: 500 })
    }
}

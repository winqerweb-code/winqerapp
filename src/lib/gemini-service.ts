import { GoogleGenerativeAI } from "@google/generative-ai"

interface GenerateBannerParams {
    analysisText: string
    storeUrl?: string
    referenceImageBase64?: string
}

interface BannerResult {
    type: 'base64' | 'url'
    data: string
}

/**
 * Extract basic text content from a URL for context
 */
async function extractStoreInfo(url: string): Promise<string> {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; BannerGenerator/1.0)'
            }
        })

        if (!response.ok) {
            return `[URL: ${url}] (could not fetch content)`
        }

        const html = await response.text()

        // Simple text extraction (title, description, h1-h3)
        const titleMatch = html.match(/<title>(.*?)<\/title>/i)
        const descMatch = html.match(/<meta\s+name="description"\s+content="(.*?)"/i)
        const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/i)

        const lines: string[] = []
        if (titleMatch) lines.push(`Title: ${titleMatch[1].trim()}`)
        if (descMatch) lines.push(`Description: ${descMatch[1].trim()}`)
        if (h1Match) lines.push(`Main Heading: ${h1Match[1].replace(/<[^>]+>/g, '').trim()}`)

        return lines.join('\n') || `[URL: ${url}] (no extractable content)`
    } catch (error) {
        console.error('Store info extraction error:', error)
        return `[URL: ${url}] (extraction failed)`
    }
}

/**
 * Generate banner using NanoBanana Pro (Gemini 3.0 Pro Image)
 */
export async function generateBannerWithGemini(
    params: GenerateBannerParams
): Promise<BannerResult> {
    const { analysisText, storeUrl, referenceImageBase64 } = params

    // Get API key from DB or environment
    const { getGeminiKey } = await import('@/lib/api-key-service')
    const dbKey = await getGeminiKey()
    const apiKey = dbKey || process.env.GEMINI_API_KEY

    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured in settings or environment variables')
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    // Extract store info if URL provided
    let storeInfoText = ''
    if (storeUrl) {
        storeInfoText = await extractStoreInfo(storeUrl)
    }

    // Build prompt
    const promptText = `
以下の情報をもとに、Webバナーを生成してください。

[バナーの要件・コンセプト]
${analysisText}

${storeInfoText ? `
[店舗情報（URLから抽出）]
${storeInfoText}
` : ''}

店舗URL: ${storeUrl ?? '（未指定）'}

条件:
- ${referenceImageBase64 ? '参考バナー画像のテイスト・雰囲気を踏襲する' : '現代的でプロフェッショナルなデザインにする'}
- テキストは読みやすく、LP向けのバナーとして成立するデザインにする
- 高解像度（1024x1024以上）で生成する
- キャッチコピーは日本語で明瞭に表示する
    `.trim()

    // Build contents array
    const contents: any[] = [{ text: promptText }]

    // Add reference image if provided
    if (referenceImageBase64) {
        // Detect mime type from base64 prefix or assume png
        const mimeType = referenceImageBase64.startsWith('/9j/') ? 'image/jpeg' : 'image/png'

        contents.push({
            inlineData: {
                mimeType,
                data: referenceImageBase64
            }
        })
    }

    try {
        // Generate content
        const result = await model.generateContent(contents)
        const response = await result.response

        // Extract image from response
        // Note: Gemini 2.0 Flash doesn't natively generate images
        // For actual image generation, you would need to use Imagen API
        // This is a placeholder - you'll need to integrate the actual Imagen API

        // For now, return a mock response indicating the limitation
        throw new Error('Image generation requires Imagen API integration. Gemini 2.0 Flash is a text model.')

    } catch (error) {
        console.error('Gemini API Error:', error)
        throw error
    }
}

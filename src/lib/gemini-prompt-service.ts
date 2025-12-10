import { GoogleGenerativeAI } from "@google/generative-ai"

interface GeneratePromptParams {
    analysisText: string
    storeUrl?: string
    referenceImageDescription?: string
    apiKey: string
}

async function extractStoreInfo(url: string): Promise<string> {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; BannerGenerator/1.0)'
            }
        })

        if (!response.ok) {
            return `[URL: ${url}] (could not fetch)`
        }

        const html = await response.text()

        const titleMatch = html.match(/<title>(.*?)<\/title>/i)
        const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i)
        const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/i)
        const h2Matches = html.match(/<h2[^>]*>(.*?)<\/h2>/gi)

        const lines: string[] = []
        if (titleMatch) lines.push(`タイトル: ${titleMatch[1].replace(/<[^>]+>/g, '').trim()}`)
        if (descMatch) lines.push(`説明: ${descMatch[1].trim()}`)
        if (h1Match) lines.push(`メイン見出し: ${h1Match[1].replace(/<[^>]+>/g, '').trim()}`)
        if (h2Matches && h2Matches.length > 0) {
            const h2Texts = h2Matches.slice(0, 3).map(m => m.replace(/<[^>]+>/g, '').trim())
            lines.push(`サブ見出し: ${h2Texts.join(', ')}`)
        }

        return lines.join('\n')
    } catch (error) {
        console.error('Store info extraction error:', error)
        return `[URL: ${url}] (extraction failed)`
    }
}

export async function generateNanoBananaPrompt(params: GeneratePromptParams): Promise<string> {
    const { analysisText, storeUrl, referenceImageDescription, apiKey } = params

    let storeInfoText = ''
    if (storeUrl) {
        storeInfoText = await extractStoreInfo(storeUrl)
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    const metaPrompt = `あなたは「バナー用プロンプト設計AI」です。

入力として以下の情報が与えられます：
- analysisText: 店舗のAI分析結果（強み・悩み・訴求ポイントなど）
- storeInfo: 店舗URLから抽出した情報（店名、サービス内容、コンセプトなど）
- referenceStyleDescription: 参考バナーの見た目の特徴（色・レイアウト・雰囲気などの要約）

あなたの仕事は、
「画像生成AI（DALL·E 3 や NanoBanana Pro）に渡すためのプロンプト」と
「バナーに載せるテキスト」を設計することです。

出力は必ず **JSON形式のみ** とし、説明文は一切書かないでください。
形式は以下に従ってください：

{
  "prompt_for_image_model": "ここに画像生成用プロンプト（英語で200ワード以内）",
  "headline": "メイン見出し（日本語）",
  "subHeadline": "サブ見出し（日本語）",
  "body": "短い本文（日本語。2文以内）",
  "cta": "CTAボタンのテキスト（日本語）"
}

制約：

- 画像生成用のプロンプトには **エンジン名（NanoBanana Pro, Geminiなど）は絶対に含めない** でください。
- ブランド・店舗名は storeInfo から適切に抽出し、必要な場合のみプロンプトに含めてください。
- "Emphasize this", "IMPORTANT", "This is for AI" のようなメタな文言は入れないでください。
- prompt_for_image_model には以下を含めてください：
  - バナーの用途（例: Instagram post image for a beauty salon promotion）
  - 画像の比率や構図（例: 1080x1080 square format, centered composition）
  - カラートーン（例: soft pastel pink and beige, clean and modern）
  - 参考スタイルの要約（referenceStyleDescription を英語にして要約）
  - ターゲット（例: women in their 30s–40s who care about natural nail health）
  - 必要な要素（例: close-up of natural nails, soft lighting, clean background）

- headline / subHeadline / body / cta は **日本語** で出力し、
  analysisText と storeInfo の内容をもとに、実際に使えるテキストにしてください。
- 全体として、「Instagram投稿でCV獲得を目的としたシンプルで訴求力のあるバナー」を意識してください。

## 入力情報

### analysisText (AI分析結果):
${analysisText}

### storeInfo (店舗情報):
${storeInfoText || '(店舗URL未提供)'}

### referenceStyleDescription (参考バナーのスタイル):
${referenceImageDescription || '(参考画像未提供 - 一般的な広告バナーのベストプラクティスに従ってください)'}

上記の情報を基に、JSON形式でプロンプトとバナーテキストを出力してください。`.trim()

    try {
        const result = await model.generateContent(metaPrompt)
        const response = await result.response
        const text = response.text()

        // Try to parse JSON response
        try {
            // Extract JSON from response (in case there's markdown formatting)
            const jsonMatch = text.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0])
                // Return as formatted JSON string for display
                return JSON.stringify(parsed, null, 2)
            }
        } catch (parseError) {
            console.warn('Failed to parse JSON, returning raw text:', parseError)
        }

        return text
    } catch (error) {
        console.error('Gemini API Error:', error)
        throw new Error('Failed to generate NanoBanana prompt: ' + (error as Error).message)
    }
}

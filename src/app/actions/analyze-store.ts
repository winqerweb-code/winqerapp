'use server'

import { generateText } from '@/lib/ai-service'
import { MOCK_ADS, MOCK_GA4_REPORT } from '@/lib/mock-data'

export async function analyzeStore(
    storeName: string,
    metaCampaignId: string,
    ga4PropertyId: string,
    accessToken?: string,
    metaAccessToken?: string,
    adAccountId?: string, // New param
    openaiApiKey?: string,
    remarks?: string,
    additionalParams?: {
        industry: string
        region: string
        adFormat: string
        adObjective: string
        targetAudience: string
        cvLabel: string // New param
        ga4CvEvent: string // New param
    }
) {
    console.log('🤖 [AI Analysis] Starting analysis for:', storeName)
    console.log('🔑 [Server] OpenAI Key received:', openaiApiKey ? 'YES' : 'NO')

    // 1. Fetch Meta Ads Data from Real API
    let metaMetrics = {
        spend: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
    }

    try {
        // Try to get token from DB if not provided
        let effectiveMetaToken = metaAccessToken
        if (!effectiveMetaToken) {
            const { getMetaToken } = await import('@/lib/api-key-service')
            const token = await getMetaToken()
            if (token) {
                effectiveMetaToken = token
            }
        }

        if (effectiveMetaToken) {
            console.log('🔍 [Meta] Fetching real ads data for campaign:', metaCampaignId)

            // Use server-compatible Meta API
            const { metaApiServer } = await import('@/lib/meta-api')

            // Get ad accounts to find the target account
            // Get ad accounts to find the target account
            const accounts = await metaApiServer.getAdAccounts(effectiveMetaToken)
            console.log('📊 [Meta] Ad Accounts:', accounts)

            let targetAccountId = adAccountId
            let selectedAccount

            if (accounts && accounts.length > 0) {
                if (targetAccountId) {
                    selectedAccount = accounts.find((a: any) => a.id === targetAccountId)
                }

                if (!selectedAccount) {
                    // Fallback: Select specific account (864591462413204)
                    const targetId = "act_864591462413204"
                    selectedAccount = accounts.find((a: any) => a.id === targetId || a.id === "864591462413204") || accounts[0]
                }

                console.log('🎯 [Meta] Using account:', selectedAccount)

                // Fetch all ads for this account
                const adsData = await metaApiServer.getAds(effectiveMetaToken, selectedAccount.id)
                console.log('📢 [Meta] Total ads fetched:', adsData.length)

                // Filter ads by campaign ID
                const campaignAds = adsData.filter((ad: any) => ad.campaign_id === metaCampaignId)
                console.log('✅ [Meta] Campaign ads:', campaignAds.length)

                if (campaignAds.length > 0) {
                    metaMetrics = {
                        spend: campaignAds.reduce((sum: number, ad: any) => sum + ad.insights.spend, 0),
                        impressions: campaignAds.reduce((sum: number, ad: any) => sum + ad.insights.impressions, 0),
                        clicks: campaignAds.reduce((sum: number, ad: any) => sum + ad.insights.clicks, 0),
                        conversions: campaignAds.reduce((sum: number, ad: any) => sum + (ad.insights.lp_views || 0), 0),
                    }
                    console.log('💰 [Meta] Metrics:', metaMetrics)
                } else {
                    console.warn('⚠️ [Meta] No ads found for campaign, using defaults')
                }
            }
        } else {
            // Use mock data
            console.log('⚠️ [Meta] No Meta token - using mock data')
            const campaignAds = MOCK_ADS.filter(ad => ad.campaign_id === metaCampaignId)

            metaMetrics = {
                spend: campaignAds.reduce((sum: number, ad: any) => sum + ad.insights.spend, 0),
                impressions: campaignAds.reduce((sum: number, ad: any) => sum + ad.insights.impressions, 0),
                clicks: campaignAds.reduce((sum: number, ad: any) => sum + ad.insights.clicks, 0),
                conversions: campaignAds.reduce((sum: number, ad: any) => sum + (ad.insights.lp_views || 0), 0),
            }
        }
    } catch (error) {
        console.error('❌ [Meta] Data Fetch Error:', error)
        // Fallback to mock on error
        const campaignAds = MOCK_ADS.filter(ad => ad.campaign_id === metaCampaignId)
        metaMetrics = {
            spend: campaignAds.reduce((sum: number, ad: any) => sum + ad.insights.spend, 0),
            impressions: campaignAds.reduce((sum: number, ad: any) => sum + ad.insights.impressions, 0),
            clicks: campaignAds.reduce((sum: number, ad: any) => sum + ad.insights.clicks, 0),
            conversions: campaignAds.reduce((sum: number, ad: any) => sum + (ad.insights.lp_views || 0), 0),
        }
    }

    // 2. Fetch GA4 Data from Google API
    let ga4Metrics = {
        sessions: 0,
        conversions: 0,
        engagementRate: 0,
        activeUsers: 0,
        averageSessionDuration: 0,
        screenPageViews: 0,
        bounceRate: 0,
        specificEventCount: 0 // New metric
    }

    const cvLabel = additionalParams?.cvLabel || 'CV'
    const ga4CvEvent = additionalParams?.ga4CvEvent || 'purchase'

    try {
        if (accessToken) {
            // Use real Google API
            const { GoogleApiClient } = await import('@/lib/google-api')
            const googleClient = new GoogleApiClient(accessToken)

            // Fetch data for the last 30 days
            const endDate = new Date().toISOString().split('T')[0]
            const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

            const report = await googleClient.getGa4Report(ga4PropertyId, { startDate, endDate })
            ga4Metrics = { ...ga4Metrics, ...report }

            // Fetch Specific Event Count
            const eventCount = await googleClient.getGa4EventCount(ga4PropertyId, ga4CvEvent, { startDate, endDate })
            ga4Metrics.specificEventCount = eventCount

            console.log('✅ [GA4] Real data fetched:', ga4Metrics)
        } else {
            // Fallback to mock
            const mockData = (MOCK_GA4_REPORT as any)[ga4PropertyId]
            if (mockData) {
                ga4Metrics = { ...mockData, specificEventCount: 0, screenPageViews: 0, bounceRate: 0 }
            }
            console.log('⚠️ [GA4] Using mock data (no access token)')
        }
    } catch (error) {
        console.error('❌ [GA4] Data Fetch Error:', error)
        // Fallback to mock on error
        const mockData = (MOCK_GA4_REPORT as any)[ga4PropertyId]
        if (mockData) {
            ga4Metrics = { ...mockData, specificEventCount: 0, screenPageViews: 0, bounceRate: 0 }
        }
    }

    // Calculate Key Metrics
    // CPA = Spend / CV (Specific Event)
    // CTR = Clicks / Impressions (Meta)
    // CVR = CV (Specific Event) / Clicks (Meta) -- Ad CVR approximation
    const cvCount = ga4Metrics.specificEventCount || 0
    const cpa = cvCount > 0 ? Math.round(metaMetrics.spend / cvCount) : 0
    const ctr = metaMetrics.impressions > 0 ? ((metaMetrics.clicks / metaMetrics.impressions) * 100).toFixed(2) : "0.00"
    const cvr = metaMetrics.clicks > 0 ? ((cvCount / metaMetrics.clicks) * 100).toFixed(2) : "0.00"

    // GA4 Derived Metrics
    const gaCvr = ga4Metrics.sessions > 0 ? ((cvCount / ga4Metrics.sessions) * 100).toFixed(2) : "0.00"


    // 3. Construct Prompt
    const prompt = `
あなたは中小店舗向けの広告運用に特化したプロフェッショナル広告運用AIです。

本ツールでは、Meta広告（Facebook/Instagram）のAPIデータと、
GA4の最新データを用いて「相場推定」「異常検知」「原因分析」「改善施策」を自動生成します。

※Meta Ads API・GA4 APIの呼び出しはシステムが行い、あなたには数値のみ渡します。
※Meta側のCVは広告マネージャーの「結果」欄を正として扱ってください。
※GA4側のCVはユーザーが入力したイベント名を基準とします。

--------------------------
■ 人が入力する情報（コンテキスト）
【業種】${additionalParams?.industry || '未指定'}
【地域】${additionalParams?.region || '未指定'}
【広告形式】${additionalParams?.adFormat || '未指定'}        （静止画 / 動画 / UGC / カルーセル など）
【広告目的】${additionalParams?.adObjective || '未指定'}        （LP誘導 / 予約獲得 / LINE登録 など）
【ターゲット属性】${additionalParams?.targetAudience || '未指定'}    （例：25〜39歳女性、主婦層、20代前半など）

【備考・特記事項】
${remarks || '特になし'}

▼CV設定（案件ごとに自由に設定可能）
【CVの名前】${cvLabel}
【GA4のCVイベント名】${ga4CvEvent}
※Meta広告側のCVは広告マネージャーの「結果欄」で算出された数値を使用します。

※広告IDの入力は不要です。
※Meta広告のキャンペーン/広告セット/広告のIDは、UI側で選択されたオブジェクトを内部的に使用します。

--------------------------
■ Meta Ads API（システムが取得し、あなたに数値として渡す項目）

【Meta側（結果欄と同じ値を使用）】
- impressions: ${metaMetrics.impressions}
- clicks: ${metaMetrics.clicks}
- ctr: ${ctr}%
- cpc: ${metaMetrics.clicks > 0 ? Math.round(metaMetrics.spend / metaMetrics.clicks) : 0}
- spend: ${metaMetrics.spend}
- conversions（結果欄の値をそのまま使用）: ${metaMetrics.conversions}
- cpa: ${metaMetrics.conversions > 0 ? Math.round(metaMetrics.spend / metaMetrics.conversions) : 0}    ※ meta_spend ÷ meta_cv

必要に応じて以下も利用可能：
- reach: (データなし)
- frequency: (データなし)

※MetaのCVは「ウェブサイトの予約ボタン」「Instagramプロフィールからのアクション」など、
  広告マネージャーの“結果カラム”を正として扱ってください。

--------------------------
■ GA4 Data API（システムが取得して渡す項目）

▼対象LPまたは対象サイト全体（同一期間）
- sessions: ${ga4Metrics.sessions}
- users: ${ga4Metrics.activeUsers}
- pageviews: ${ga4Metrics.screenPageViews}
- engagement_rate: ${ga4Metrics.engagementRate}
- bounce_rate: ${ga4Metrics.bounceRate}

▼CV（ユーザー定義イベント）
- conversions（${ga4CvEvent} の回数）: ${cvCount}
- conversion_rate（CVR）: ${gaCvr}%   ※ ga_cv ÷ ga_sessions

--------------------------
■ あなたが行う処理

### ① 現状整理（広告ファネル構造）
MetaとGA4の値から以下の流れで現状を要約してください：

1. 配信：imp / reach / frequency  
2. クリック：click / ctr / cpc  
3. LP滞在：sessions / engagement_rate / bounce_rate  
4. CV：meta_cv（結果欄） / ga_cv（任意CVイベント）

どの段階が最も弱いかを明確に述べてください。

--------------------------
### ② 業種×地域×目的×形式に基づく“期待値レンジ”を推定
比較指標がなくても分析できるように、  
あなたの知識に基づいて以下の「期待値レンジ」を推定してください：

- 想定CTRレンジ（%）
- 想定CPCレンジ（円）
- 想定CVRレンジ（%）
- 想定CPAレンジ（円）

※厳密でなくてよい。実務ベースのレンジでOK。  
※地方や専門業種は「そもそも母数が少ない」などの補足も記載。

--------------------------
### ③ 実データとの比較分析
推定レンジとの比較で、各指標を4段階で評価してください：

- CTR：高い / 妥当 / 低い
- CPC：安い / 妥当 / 高い
- CVR：高い / 妥当 / 低い
- CPA：良い / 普通 / 悪い

そして、
**最も大きなボトルネックとなっている箇所**を特定してください。

--------------------------
### ④ 原因仮説（優先度順）
以下の観点から、原因を3〜6個提示してください：

- クリエイティブの質（訴求・構図・コピー）
- ターゲティング（年齢・地域・興味関心）
- 業種特性（競合の多さ・単価・シーズナリティ）
- LP改善ポイント（ファーストビュー・CTA・導線の不足）
- 学習フェーズや配信量による不安定性

各仮説に「なぜそう判断できるのか」を1〜2行で書いてください。

--------------------------
### ⑤ 改善施策（実務ベース）
実際にすぐ試せる改善案を記載：

■ クリエイティブ改善（最低3つ）
■ ターゲット修正案
■ LP改善案（構成レベルでOK）
■ 入札/予算戦略（増減の判断理由つき）
■ 必要なら計測チェック項目（MetaとGA4のCV差異が大きい場合など）

--------------------------
### ⑥ 総評と“次にやるべき1手”
最後に以下の形式でまとめてください：

【総評】
全体評価を1〜2文で要約

【次にやるべき1手】
もっとも費用対効果が高く、実装難易度が低い施策を1つだけ提示
`

    // 4. Generate Analysis
    try {
        const analysis = await generateText(prompt, openaiApiKey)
        return {
            success: true,
            analysis,
            metrics: {
                spend: metaMetrics.spend,
                cpa: cpa,
                ctr: ctr,
                cvr: cvr,
                cvCount: cvCount,
                cvEventName: cvLabel
            }
        }
    } catch (error) {
        console.error('AI Generation Error:', error)
        return { success: false, error: 'Failed to generate analysis' }
    }
}


import { Database } from "@/types/database"

type AdWithInsights = {
    id: string
    name: string
    creative: {
        id: string
        title: string
        body: string
        image_url: string
    }
    insights: {
        impressions: number
        clicks: number
        spend: number
        ctr: number
        cpc: number
        lp_views: number
        cost_per_lp_view: number
    }
}

export type AnalysisResult = {
    isWinner: boolean
    score: number
    reasons: string[]
}

export function analyzeAdPerformance(ad: AdWithInsights): AnalysisResult {
    const reasons: string[] = []
    let score = 0

    // 1. CTR Check (Store Visit Model: High CTR is crucial for interest)
    // Benchmark: 1.0% is average, 2.0% is good
    if (ad.insights.ctr >= 2.0) {
        score += 40
        reasons.push("High CTR (> 2.0%) indicates strong visual/hook.")
    } else if (ad.insights.ctr >= 1.0) {
        score += 20
        reasons.push("Good CTR (> 1.0%).")
    }

    // 2. LP View Check (Did they actually load the page?)
    if (ad.insights.lp_views > 0) {
        score += 20
        reasons.push(`Generated ${ad.insights.lp_views} LP Views.`)

        // Efficiency Check
        if (ad.insights.cost_per_lp_view < 200) {
            score += 10
            reasons.push("Efficient LP View Cost (< ¥200).")
        }
    }

    // 3. CPC Check (Efficiency)
    if (ad.insights.cpc > 0 && ad.insights.cpc < 100) {
        score += 20
        reasons.push("Low CPC (< ¥100).")
    }

    // Winner Threshold
    // 60 points = e.g. High CTR (40) + Low CPC (20) OR Good CTR (20) + LP Views (20) + Low CPC (20)
    const isWinner = score >= 60

    return {
        isWinner,
        score,
        reasons,
    }
}

"use server"

import { aiService } from "@/lib/ai-service"

export async function generateCreativeAction(
    analysis: string,
    storeUrl?: string,
    referenceImageBase64?: string,
    openaiApiKey?: string
) {
    console.log('🎨 [Creative Gen] Starting generation...')
    console.log('📍 Store URL:', storeUrl || '(not provided)')
    console.log('🖼️  Reference Image:', referenceImageBase64 ? 'YES' : 'NO')

    if (!analysis) {
        return { success: false, error: 'Analysis result is missing' }
    }

    try {
        const result = await aiService.generateCreative(
            analysis,
            storeUrl,
            referenceImageBase64,
            openaiApiKey
        )
        return { success: true, data: result }
    } catch (error) {
        console.error('Creative Generation Error:', error)
        return { success: false, error: 'Failed to generate creative' }
    }
}

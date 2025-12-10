"use server"

import { generateNanoBananaPrompt } from "@/lib/gemini-prompt-service"

export async function generateNanoBananaPromptAction(
    analysisText: string,
    storeUrl?: string,
    referenceImageBase64?: string
) {
    console.log('🎨 [NanoBanana Prompt Gen] Starting...')

    if (!analysisText) {
        return { success: false, error: 'Analysis text is missing' }
    }

    // Get Gemini API key from environment
    const geminiApiKey = process.env.GEMINI_API_KEY
    if (!geminiApiKey) {
        return {
            success: false,
            error: 'GEMINI_API_KEY is not configured. Please add it to your .env file.'
        }
    }

    try {
        // Generate reference image description if image is provided
        let referenceImageDescription = ''
        if (referenceImageBase64) {
            // Simple description for now - could enhance with Gemini vision later
            referenceImageDescription = "User has provided a reference banner image. The generated prompt should maintain similar visual style, color scheme, layout structure, and overall design aesthetic as the reference."
        }

        const prompt = await generateNanoBananaPrompt({
            analysisText,
            storeUrl,
            referenceImageDescription,
            apiKey: geminiApiKey,
        })

        return {
            success: true,
            prompt,
            note: "このプロンプトを NanoBanana Pro にコピー&ペーストして画像生成してください。"
        }
    } catch (error) {
        console.error('Prompt Generation Error:', error)
        return {
            success: false,
            error: 'Failed to generate NanoBanana prompt: ' + (error as Error).message
        }
    }
}

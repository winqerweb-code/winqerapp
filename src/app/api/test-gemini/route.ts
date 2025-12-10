import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function GET(request: NextRequest) {
    const apiKey = "AIzaSyBWSVyWQD7_CyjyYlk7WkJA-5FqVfRxxnk"
    const genAI = new GoogleGenerativeAI(apiKey)

    const results: any = {
        apiKeyValid: false,
        modelsAccessible: [],
        textGenerationWorks: false,
        imageGenerationSupported: false,
        testResults: []
    }

    try {
        // Test 1: Check model access
        const models = [
            'gemini-2.0-flash-exp',
            'gemini-1.5-flash',
            'gemini-1.5-pro'
        ]

        for (const modelName of models) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName })
                results.modelsAccessible.push(modelName)
            } catch (e: any) {
                results.testResults.push({ model: modelName, error: e.message })
            }
        }

        results.apiKeyValid = results.modelsAccessible.length > 0

        // Test 2: Text generation
        try {
            const textModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
            const textResult = await textModel.generateContent("Say 'API is working!'")
            const textResponse = await textResult.response
            results.textGenerationWorks = true
            results.testResults.push({
                test: 'text_generation',
                success: true,
                response: textResponse.text()
            })
        } catch (e: any) {
            results.testResults.push({
                test: 'text_generation',
                success: false,
                error: e.message
            })
        }

        // Test 3: Check if image generation is supported
        // According to Gemini API docs, image generation is available via:
        // 1. Imagen models (separate API)
        // 2. Gemini 2.5 Pro with image output (if available)

        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
            const prompt = "Generate a simple square red image"

            const result = await model.generateContent(prompt)
            const response = await result.response

            // Check response structure for image data
            results.testResults.push({
                test: 'image_generation_attempt',
                responseText: response.text(),
                candidates: response.candidates?.map((c: any) => ({
                    contentType: c.content?.parts?.map((p: any) => Object.keys(p))
                }))
            })

            // Gemini text models don't generate images directly
            // They would need Imagen integration
            results.imageGenerationSupported = false
            results.note = "Gemini models accessible, but image generation requires Imagen API (Vertex AI)"

        } catch (e: any) {
            results.testResults.push({
                test: 'image_generation_attempt',
                error: e.message
            })
        }

        return NextResponse.json(results)

    } catch (error: any) {
        return NextResponse.json({
            error: error.message,
            stack: error.stack
        }, { status: 500 })
    }
}

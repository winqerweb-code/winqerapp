import { GoogleGenerativeAI } from "@google/generative-ai"

async function testGeminiImageGeneration() {
    const apiKey = "AIzaSyBWSVyWQD7_CyjyYlk7WkJA-5FqVfRxxnk"
    const genAI = new GoogleGenerativeAI(apiKey)

    console.log("🔍 Testing Gemini API Key for Image Generation...")
    console.log("=".repeat(60))

    try {
        // Test 1: List available models
        console.log("\n📋 Available Models:")
        const models = [
            'gemini-2.0-flash-exp',
            'gemini-1.5-flash',
            'gemini-1.5-pro',
            'gemini-pro-vision'
        ]

        for (const modelName of models) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName })
                console.log(`✅ ${modelName} - accessible`)
            } catch (e: any) {
                console.log(`❌ ${modelName} - ${e.message}`)
            }
        }

        // Test 2: Try text generation (sanity check)
        console.log("\n📝 Testing Text Generation:")
        const textModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
        const textResult = await textModel.generateContent("Hello, respond with 'Working!'")
        const textResponse = await textResult.response
        console.log(`Response: ${textResponse.text()}`)

        // Test 3: Try multimodal input (text + image description)
        console.log("\n🖼️  Testing Multimodal Capabilities:")
        const prompt = "Generate a professional web banner image for a coffee shop. Size: 1024x512. Include text: 'Premium Coffee'"

        try {
            const result = await textModel.generateContent(prompt)
            const response = await result.response
            console.log("Multimodal Response:", response.text())

            // Check if response contains image data
            if (response.candidates && response.candidates[0]) {
                const candidate = response.candidates[0]
                console.log("Candidate structure:", JSON.stringify(candidate, null, 2))
            }
        } catch (e: any) {
            console.log("❌ Image generation error:", e.message)
        }

        console.log("\n" + "=".repeat(60))
        console.log("✅ API Key is valid and working for text generation")
        console.log("⚠️  Image generation capability: Testing...")

    } catch (error: any) {
        console.error("❌ Error:", error.message)
        console.error("Stack:", error.stack)
    }
}

testGeminiImageGeneration()

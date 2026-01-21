"use server"

import OpenAI from "openai"

export async function debugOpenAIPing(apiKey: string) {
    try {
        console.log("Debug: Starting OpenAI Ping")
        if (!apiKey) throw new Error("No API Key provided")

        const openai = new OpenAI({ apiKey })
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: "Ping" }],
            max_tokens: 5
        })

        console.log("Debug: OpenAI Ping Success", response.choices[0].message.content)
        return { success: true, message: response.choices[0].message.content }
    } catch (error: any) {
        console.error("Debug: OpenAI Ping Failed", error)
        return { success: false, error: error.message }
    }
}

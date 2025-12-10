import { OpenAI } from "openai"

// Helper to get API key from storage safely
const getOpenAIKey = () => {
    if (typeof window === "undefined") return null
    return localStorage.getItem("openai_api_key")
}

export type GeneratedCreative = {
    title: string
    body: string
    image_prompt: string
    mock_image_url: string
}

const getOpenAIClient = () => {
    if (typeof window === "undefined") return null
    const apiKey = localStorage.getItem("openai_api_key")
    if (!apiKey) return null

    return new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true // Allowing client-side for this demo/dashboard
    })
}

export const aiService = {
    generateCreative: async (
        analysis: string,
        storeUrl?: string,
        referenceImageBase64?: string,
        apiKey?: string
    ): Promise<GeneratedCreative> => {
        // Try to use provided API key first (for server-side), then client-side localStorage
        let openai = null

        if (apiKey) {
            // Server-side usage with provided key
            // Workaround: Set env var because OpenAI constructor sometimes fails to pick up the apiKey argument in this environment
            process.env.OPENAI_API_KEY = apiKey.trim()

            try {
                openai = new OpenAI({
                    apiKey: apiKey.trim(),
                })
            } catch (e) {
                console.error('generateCreative: Error creating OpenAI instance:', e)
            }
        } else {
            // Client-side usage with localStorage
            openai = getOpenAIClient()
        }

        if (!openai) {
            // Fallback to mock if no key
            await new Promise((resolve) => setTimeout(resolve, 2000))
            return {
                title: `[Mock] Improved Ad Variation`,
                body: `[Mock] Based on analysis: ${analysis.substring(0, 20)}...`,
                image_prompt: "Mock prompt based on analysis",
                mock_image_url: "https://placehold.co/1024x1024?text=Mock+Generated+Image",
            }
        }

        // Extract store info from URL if provided
        let storeInfoText = ''
        if (storeUrl) {
            try {
                const response = await fetch(storeUrl)
                if (response.ok) {
                    const html = await response.text()

                    // Simple extraction
                    const titleMatch = html.match(/<title>(.*?)<\/title>/i)
                    const descMatch = html.match(/<meta\s+name="description"\s+content="(.*?)"/i)
                    const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/i)

                    const lines: string[] = []
                    if (titleMatch) lines.push(`Title: ${titleMatch[1].trim()}`)
                    if (descMatch) lines.push(`Description: ${descMatch[1].trim()}`)
                    if (h1Match) lines.push(`Main Heading: ${h1Match[1].replace(/<[^>]+>/g, '').trim()}`)

                    storeInfoText = lines.join('\n')
                }
            } catch (e) {
                console.error('Store URL fetch error:', e)
                storeInfoText = `[URL: ${storeUrl}] (could not fetch)`
            }
        }

        try {
            // 1. Generate Image Prompt & Copy (Copywriting)
            const systemPrompt = referenceImageBase64
                ? "You are an expert creative director and copywriter. Based on the provided ad analysis and reference banner image, generate a new ad concept that addresses the identified issues while maintaining a similar visual style to the reference. Output JSON with 'headline', 'primary_text', and 'image_prompt'."
                : "You are an expert creative director and copywriter. Based on the provided ad analysis, generate a new ad concept that addresses the identified issues. Output JSON with 'headline', 'primary_text', and 'image_prompt'."

            const userPrompt = `
Analysis Result:
${analysis}

${storeInfoText ? `
Store Information (from ${storeUrl}):
${storeInfoText}
` : ''}

${referenceImageBase64 ? `
A reference banner image has been provided. Please analyze its style, color scheme, layout, and overall aesthetic to inform your new banner design.
` : ''}

Task: Generate a new ad concept (Headline in Japanese, Primary Text in Japanese, and detailed DALL-E 3 Image Prompt in English) that improves upon the current performance described in the analysis. The image prompt should be highly detailed and visual, specifying:
- Layout and composition
- Color scheme${referenceImageBase64 ? ' (matching the reference)' : ''}
- Typography style
- Key visual elements
- Overall mood and tone
            `.trim()

            const messages: any[] = [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ]

            const completion = await openai.chat.completions.create({
                messages,
                model: "gpt-4o",
                response_format: { type: "json_object" },
            })

            const content = JSON.parse(completion.choices[0].message.content || "{}")

            const newTitle = content.headline || "New Optimized Headline"
            const newBody = content.primary_text || "New Optimized Body Text"
            let imagePrompt = content.image_prompt || `A professional advertising banner for: ${newTitle}`

            // If reference image provided, enhance prompt
            if (referenceImageBase64) {
                imagePrompt = `${imagePrompt}\n\nStyle reference: Match the visual style, color palette, and design aesthetic of the provided reference image.`
            }

            // 2. Generate Image (DALL-E 3)
            const imageResponse = await openai.images.generate({
                model: "dall-e-3",
                prompt: imagePrompt,
                n: 1,
                size: "1024x1024",
            })

            return {
                title: newTitle,
                body: newBody,
                image_prompt: imagePrompt,
                mock_image_url: imageResponse.data?.[0]?.url || "",
            }

        } catch (error) {
            console.error("OpenAI API Error:", error)
            throw error
        }
    },

    analyzeCampaign: async (
        campaignName: string,
        objective: string,
        ads: any[]
    ): Promise<{ summary: string; suggestions: { title: string; description: string; priority: "High" | "Medium" | "Low" }[] }> => {
        const apiKey = getOpenAIKey()
        if (!apiKey) {
            // Mock response
            await new Promise((resolve) => setTimeout(resolve, 2000))
            return {
                summary: "Mock Analysis: Campaign performance is stable but frequency is rising.",
                suggestions: [
                    { title: "Expand Audience", description: "Frequency is over 3.0, consider broadening targeting.", priority: "High" },
                    { title: "Refresh Creative", description: "CTR is dropping on Ad A, try a new image.", priority: "Medium" }
                ]
            }
        }

        const openai = new OpenAI({
            apiKey: apiKey,
            dangerouslyAllowBrowser: true
        })

        // Prepare data for AI
        const campaignData = {
            campaignName,
            objective,
            totalSpend: ads.reduce((acc, ad) => acc + ad.insights.spend, 0),
            totalImpressions: ads.reduce((acc, ad) => acc + ad.insights.impressions, 0),
            totalLpViews: ads.reduce((acc, ad) => acc + ad.insights.lp_views, 0),
            avgCtr: ads.reduce((acc, ad) => acc + ad.insights.ctr, 0) / (ads.length || 1),
            avgFrequency: ads.reduce((acc, ad) => acc + ad.insights.frequency, 0) / (ads.length || 1),
            ads: ads.map(ad => ({
                name: ad.name,
                spend: ad.insights.spend,
                ctr: ad.insights.ctr,
                cpm: ad.insights.cpm,
                cpc: ad.insights.cpc,
                lp_views: ad.insights.lp_views,
                cost_per_lp_view: ad.insights.cost_per_lp_view,
                frequency: ad.insights.frequency,
                creativeTitle: ad.creative.title
            }))
        }

        // Dynamic Focus based on Objective
        let focusText = ""
        if (objective.includes("TRAFFIC") || objective.includes("LINK_CLICKS")) {
            focusText = `
            - **Goal**: Traffic & Store Visits.
            - **Key Metrics**: CTR, LP Views, CPC.
            - **Strategy**: Maximize clicks and ensure users land on the page.
            `
        } else if (objective.includes("AWARENESS") || objective.includes("BRAND")) {
            focusText = `
            - **Goal**: Brand Awareness & Reach.
            - **Key Metrics**: Impressions, CPM, Frequency, Reach.
            - **Strategy**: Maximize cheap impressions while controlling frequency (don't annoy users).
            - **Note**: Low CTR is acceptable if CPM is low.
            `
        } else if (objective.includes("SALES") || objective.includes("CONVERSIONS")) {
            focusText = `
            - **Goal**: Conversions (Sales/Leads).
            - **Key Metrics**: CPA (Cost Per Action), ROAS (if applicable), Volume.
            - **Strategy**: Optimize for efficiency (CPA).
            - **Note**: If ROAS is 0 (offline), focus on CPA and Volume.
            `
        } else {
            // Default / Fallback
            focusText = `
            - **Goal**: General Performance.
            - **Key Metrics**: CTR, CPC, CPM.
            - **Strategy**: Balance efficiency and volume.
            `
        }

        const prompt = `
        You are an expert Digital Marketer specializing in Meta Ads.
        Analyze the following campaign performance data based on its **Objective: ${objective}**.
        
        **Analysis Context:**
        ${focusText}
        
        **General Rules:**
        - **Ignore ROAS** if it is 0 (likely offline conversion).
        - Provide specific, actionable advice.
        
        Focus on:
        1. **Primary Metric Optimization**: Based on the context above.
        2. **Creative Performance**: Which ads are contributing to the goal?
        3. **Audience/Targeting**: Is frequency too high? Is CPM too high?
        4. **Budget Efficiency**: Where should budget be shifted?

        Data:
        ${JSON.stringify(campaignData, null, 2)}

        Output JSON format:
        {
            "summary": "Brief summary of the campaign status (Japanese)",
            "suggestions": [
                { "title": "Actionable Title (Japanese)", "description": "Detailed explanation (Japanese)", "priority": "High" | "Medium" | "Low" }
            ]
        }
        `

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }
        })

        const content = response.choices[0].message.content
        if (!content) throw new Error("No content from OpenAI")

        return JSON.parse(content)
    }
}

export const generateText = async (prompt: string, apiKey?: string): Promise<string> => {
    // Try to use provided API key first (for server-side), then client-side localStorage
    let openai = null

    if (apiKey) {
        // Server-side usage with provided key
        // Workaround: Set env var because OpenAI constructor sometimes fails to pick up the apiKey argument in this environment
        process.env.OPENAI_API_KEY = apiKey.trim()

        try {
            openai = new OpenAI({
                apiKey: apiKey.trim(),
            })
        } catch (e) {
            console.error('generateText: Error creating OpenAI instance:', e)
        }
    } else {
        // Client-side usage with localStorage
        openai = getOpenAIClient()
    }

    if (!openai) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        return "Mock Analysis: The ad spend is efficient with a high ROAS. Traffic quality is good, but engagement rate could be improved. Recommendation: Optimize the landing page for better conversion."
    }

    try {
        console.log('generateText: Calling OpenAI API...')
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
        })
        return response.choices[0].message.content || "No analysis generated."
    } catch (error) {
        console.error("OpenAI API Error:", error)
        throw error
    }
}

import { MOCK_GBP_LOCATIONS, MOCK_GBP_INSIGHTS, MOCK_GA4_PROPERTIES, MOCK_GA4_REPORT } from "./mock-data"

export class GoogleApiClient {
    private accessToken: string | null = null

    constructor(accessToken?: string) {
        if (accessToken) {
            this.accessToken = accessToken
        }
    }

    // GBP: Get Accounts
    async getAccounts() {
        if (!this.accessToken) return []

        try {
            const res = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                },
            })

            if (!res.ok) {
                const errorBody = await res.text()
                console.error('Google API Error (Accounts):', res.status, errorBody)
                throw new Error(`Failed to fetch accounts: ${res.status}`)
            }

            const data = await res.json()
            return data.accounts || []
        } catch (e) {
            console.warn("Google API Error (Accounts):", e)
            return []
        }
    }

    // GBP: Get Locations
    async getLocations() {
        if (!this.accessToken) {
            // Return Mock Data if no token
            console.log("Google API: Using Mock Locations")
            return MOCK_GBP_LOCATIONS
        }

        try {
            // 1. Get Account ID first
            const accounts = await this.getAccounts()
            if (accounts.length === 0) {
                console.warn("Google API: No accounts found")
                return []
            }

            const accountId = accounts[0].name // Format: accounts/123456789
            console.log(`Google API: Using account ${accountId}`)

            // 2. Fetch Locations using the Account ID
            const res = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${accountId}/locations?readMask=name,title,storeCode,phoneNumbers,categories,metadata`, {
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                },
            })

            if (!res.ok) {
                const errorBody = await res.text()
                console.error('Google API Error (Locations):', res.status, errorBody)
                throw new Error(`Failed to fetch locations: ${res.status}`)
            }

            const data = await res.json()
            return data.locations || []
        } catch (e) {
            console.warn("Google API Error (Locations):", e)
            return MOCK_GBP_LOCATIONS // Fallback
        }
    }

    // GBP: Get Insights (Mocked for now as real API is complex)
    async getInsights(locationId: string) {
        // In a real app, this would call the Performance API
        // https://businessprofileperformance.googleapis.com/v1/locations/{locationId}:fetchMultiDailyMetricsTimeSeries

        console.log(`Google API: Fetching insights for ${locationId}`)

        // Return Mock Data
        const insights = (MOCK_GBP_INSIGHTS as any)[locationId] || {
            rating: 0,
            reviewCount: 0,
            calls: 0,
            directions: 0,
            websiteClicks: 0,
            views: 0,
        }

        return insights
    }

    // GA4: Get Properties
    async getGa4Properties() {
        if (!this.accessToken) {
            console.log("Google API: Using Mock GA4 Properties")
            return MOCK_GA4_PROPERTIES
        }

        try {
            // https://analyticsadmin.googleapis.com/v1beta/accountSummaries
            // Note: In a real app, we might need to list account summaries first to find properties.
            // For simplicity, we'll try to list properties directly if possible, or use account summaries.
            // Actually, listing account summaries is the standard way to find accessible properties.

            const res = await fetch('https://analyticsadmin.googleapis.com/v1beta/accountSummaries', {
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                },
            })

            if (!res.ok) {
                const errorBody = await res.text()
                console.error('Google API Error (GA4 Properties):', res.status, errorBody)
                throw new Error(`Failed to fetch GA4 properties: ${res.status}`)
            }

            const data = await res.json()
            // Extract properties from account summaries
            const properties: any[] = []
            if (data.accountSummaries) {
                data.accountSummaries.forEach((account: any) => {
                    if (account.propertySummaries) {
                        account.propertySummaries.forEach((prop: any) => {
                            properties.push({
                                name: prop.property, // "properties/123"
                                displayName: prop.displayName,
                                createTime: "2024-01-01T00:00:00Z", // Mock date if missing
                            })
                        })
                    }
                })
            }
            return properties
        } catch (e) {
            console.warn("Google API Error (GA4 Properties):", e)
            return MOCK_GA4_PROPERTIES // Fallback
        }
    }

    // GA4: Get Report (Mocked for now as real API requires complex body construction)
    // GA4: Get Report
    async getGa4Report(propertyId: string, dateRange: { startDate: string, endDate: string }) {
        if (!this.accessToken) {
            console.log("Google API: Using Mock GA4 Report")
            const report = (MOCK_GA4_REPORT as any)[propertyId] || {
                sessions: 0,
                activeUsers: 0,
                conversions: 0,
                engagementRate: 0,
                averageSessionDuration: 0,
                screenPageViews: 0,
                bounceRate: 0,
            }
            return report
        }

        try {
            // https://analyticsdata.googleapis.com/v1beta/properties/{propertyId}:runReport
            const cleanPropertyId = propertyId.replace('properties/', '')
            const url = `https://analyticsdata.googleapis.com/v1beta/properties/${cleanPropertyId}:runReport`

            const body = {
                dateRanges: [
                    { startDate: dateRange.startDate, endDate: dateRange.endDate }
                ],
                metrics: [
                    { name: 'sessions' },
                    { name: 'activeUsers' },
                    { name: 'conversions' },
                    { name: 'engagementRate' },
                    { name: 'averageSessionDuration' },
                    { name: 'screenPageViews' },
                    { name: 'bounceRate' }
                ]
            }

            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            })

            if (!res.ok) {
                const errorBody = await res.text()
                console.error('Google API Error (GA4 Report):', res.status, errorBody)
                throw new Error(`Failed to fetch GA4 report: ${res.status}`)
            }

            const data = await res.json()

            // Parse response
            // Response format: { rows: [ { metricValues: [ { value: "100" }, ... ] } ] }
            if (data.rows && data.rows.length > 0) {
                const values = data.rows[0].metricValues
                return {
                    sessions: parseInt(values[0].value) || 0,
                    activeUsers: parseInt(values[1].value) || 0,
                    conversions: parseInt(values[2].value) || 0,
                    engagementRate: parseFloat(values[3].value) || 0,
                    averageSessionDuration: parseFloat(values[4].value) || 0,
                    screenPageViews: parseInt(values[5].value) || 0,
                    bounceRate: parseFloat(values[6].value) || 0,
                }
            }

            return {
                sessions: 0,
                activeUsers: 0,
                conversions: 0,
                engagementRate: 0,
                averageSessionDuration: 0,
                screenPageViews: 0,
                bounceRate: 0,
            }

        } catch (e) {
            console.warn("Google API Error (GA4 Report):", e)
            // Fallback to mock
            const report = (MOCK_GA4_REPORT as any)[propertyId] || {
                sessions: 0,
                activeUsers: 0,
                conversions: 0,
                engagementRate: 0,
                averageSessionDuration: 0,
                screenPageViews: 0,
                bounceRate: 0,
            }
            return report
        }
    }

    // GA4: Get Specific Event Count
    async getGa4EventCount(propertyId: string, eventName: string, dateRange: { startDate: string, endDate: string }) {
        if (!this.accessToken) {
            console.log(`Google API: Using Mock GA4 Event Count for ${eventName}`)
            // Mock logic: return a random number or 0
            return 0
        }

        console.log(`📊 [GA4] Fetching event count for: ${eventName}`, dateRange)

        try {
            const cleanPropertyId = propertyId.replace('properties/', '')
            const url = `https://analyticsdata.googleapis.com/v1beta/properties/${cleanPropertyId}:runReport`

            const body = {
                dateRanges: [
                    { startDate: dateRange.startDate, endDate: dateRange.endDate }
                ],
                dimensions: [
                    { name: 'eventName' }
                ],
                metrics: [
                    { name: 'eventCount' }
                ],
                dimensionFilter: {
                    filter: {
                        fieldName: 'eventName',
                        stringFilter: {
                            value: eventName,
                            matchType: 'EXACT'
                        }
                    }
                }
            }

            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            })

            if (!res.ok) {
                const errorBody = await res.text()
                console.error('Google API Error (GA4 Event):', res.status, errorBody)
                throw new Error(`Failed to fetch GA4 event: ${res.status}`)
            }

            const data = await res.json()

            if (data.rows && data.rows.length > 0) {
                // rows[0].metricValues[0].value
                return parseInt(data.rows[0].metricValues[0].value) || 0
            }

            return 0

        } catch (e) {
            console.warn("Google API Error (GA4 Event):", e)
            return 0
        }
    }

    // GA4: Get Daily Specific Event Count
    async getDailyGa4EventCount(propertyId: string, eventName: string, dateRange: { startDate: string, endDate: string }) {
        if (!this.accessToken) {
            return []
        }

        try {
            const cleanPropertyId = propertyId.replace('properties/', '')
            const url = `https://analyticsdata.googleapis.com/v1beta/properties/${cleanPropertyId}:runReport`

            const body = {
                dateRanges: [
                    { startDate: dateRange.startDate, endDate: dateRange.endDate }
                ],
                dimensions: [
                    { name: 'date' } // Break down by date
                ],
                metrics: [
                    { name: 'eventCount' }
                ],
                dimensionFilter: {
                    filter: {
                        fieldName: 'eventName',
                        stringFilter: {
                            value: eventName,
                            matchType: 'EXACT'
                        }
                    }
                },
                orderBys: [
                    { dimension: { dimensionName: 'date' } }
                ]
            }

            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            })

            if (!res.ok) {
                const errorBody = await res.text()
                console.error('Google API Error (GA4 Daily Event):', res.status, errorBody)
                throw new Error(`Failed to fetch GA4 daily event: ${res.status}`)
            }

            const data = await res.json()

            if (data.rows && data.rows.length > 0) {
                return data.rows.map((row: any) => {
                    // date format: YYYYMMDD -> YYYY-MM-DD
                    const dateStr = row.dimensionValues[0].value
                    const formattedDate = `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`

                    return {
                        date: formattedDate,
                        count: parseInt(row.metricValues[0].value) || 0
                    }
                })
            }

            return []

        } catch (e) {
            console.warn("Google API Error (GA4 Daily Event):", e)
            return []
        }
    }

    // GA4: Get Events Containing String Count
    async getGa4EventsContaining(propertyId: string, searchString: string, dateRange: { startDate: string, endDate: string }) {
        if (!this.accessToken) {
            console.log(`Google API: Using Mock GA4 Event Count (Contains ${searchString})`)
            return 0
        }

        console.log(`📊 [GA4] Fetching events containing: ${searchString}`, dateRange)

        try {
            const cleanPropertyId = propertyId.replace('properties/', '')
            const url = `https://analyticsdata.googleapis.com/v1beta/properties/${cleanPropertyId}:runReport`

            const body = {
                dateRanges: [
                    { startDate: dateRange.startDate, endDate: dateRange.endDate }
                ],
                metrics: [
                    { name: 'eventCount' }
                ],
                dimensionFilter: {
                    filter: {
                        fieldName: 'eventName',
                        stringFilter: {
                            value: searchString,
                            matchType: 'CONTAINS'
                        }
                    }
                }
            }

            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            })

            if (!res.ok) {
                const errorBody = await res.text()
                console.error('Google API Error (GA4 Event Contains):', res.status, errorBody)
                throw new Error(`Failed to fetch GA4 event contains: ${res.status}`)
            }

            const data = await res.json()

            if (data.rows && data.rows.length > 0) {
                return parseInt(data.rows[0].metricValues[0].value) || 0
            }

            return 0

        } catch (e) {
            console.warn("Google API Error (GA4 Event Contains):", e)
            return 0
        }
    }

    // GA4: Get Daily Events Containing String
    async getDailyGa4EventsContaining(propertyId: string, searchString: string, dateRange: { startDate: string, endDate: string }) {
        if (!this.accessToken) {
            return []
        }

        try {
            const cleanPropertyId = propertyId.replace('properties/', '')
            const url = `https://analyticsdata.googleapis.com/v1beta/properties/${cleanPropertyId}:runReport`

            const body = {
                dateRanges: [
                    { startDate: dateRange.startDate, endDate: dateRange.endDate }
                ],
                dimensions: [
                    { name: 'date' }
                ],
                metrics: [
                    { name: 'eventCount' }
                ],
                dimensionFilter: {
                    filter: {
                        fieldName: 'eventName',
                        stringFilter: {
                            value: searchString,
                            matchType: 'CONTAINS'
                        }
                    }
                },
                orderBys: [
                    { dimension: { dimensionName: 'date' } }
                ]
            }

            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            })

            if (!res.ok) {
                const errorBody = await res.text()
                console.error('Google API Error (GA4 Daily Event Contains):', res.status, errorBody)
                throw new Error(`Failed to fetch GA4 daily event contains: ${res.status}`)
            }

            const data = await res.json()

            if (data.rows && data.rows.length > 0) {
                return data.rows.map((row: any) => {
                    const dateStr = row.dimensionValues[0].value
                    const formattedDate = `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`

                    return {
                        date: formattedDate,
                        count: parseInt(row.metricValues[0].value) || 0
                    }
                })
            }

            return []

        } catch (e) {
            console.warn("Google API Error (GA4 Daily Event Contains):", e)
            return []
        }
    }
}

export const googleApi = new GoogleApiClient()

export async function refreshGoogleAccessToken(refreshToken: string) {
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET

    if (!clientId || !clientSecret) {
        throw new Error("Missing Google Client ID or Secret")
    }

    try {
        const res = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                refresh_token: refreshToken,
                grant_type: 'refresh_token',
            }),
        })

        if (!res.ok) {
            const error = await res.json()
            console.error('Google Token Refresh Error:', error)
            throw new Error(`Failed to refresh token: ${error.error_description || res.statusText}`)
        }

        const data = await res.json()
        return {
            accessToken: data.access_token,
            expiresIn: data.expires_in,
            // Google doesn't always return a new refresh token, but if it does, we should update it
            newRefreshToken: data.refresh_token
        }
    } catch (error) {
        console.error('Refresh Token Error:', error)
        throw error
    }
}

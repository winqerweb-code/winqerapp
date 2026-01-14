export const MOCK_AD_ACCOUNTS = [
    {
        id: "act_123456789",
        name: "WINQER Demo Account",
        currency: "JPY",
        account_status: 1,
    },
]

export const MOCK_CAMPAIGNS = [
    {
        id: "cam_111",
        name: "Spring Sale 2024",
        objective: "OUTCOME_SALES",
        status: "ACTIVE",
    },
    {
        id: "cam_222",
        name: "Brand Awareness",
        objective: "OUTCOME_AWARENESS",
        status: "PAUSED",
    },
]

export const MOCK_ADS = [
    {
        id: "ad_101",
        campaign_id: "cam_111",
        campaign_name: "Spring Sale 2024",
        campaign_objective: "OUTCOME_SALES",
        name: "Spring Sale - Carousel A",
        creative: {
            id: "cre_101",
            title: "Spring Collection 50% OFF",
            body: "Don't miss out on our biggest sale of the season. Shop now!",
            image_url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80",
        },
        insights: {
            impressions: 15400,
            clicks: 2200, // Boosted to 2200 (Total 3000) for partial month coverage
            spend: 12500,
            ctr: 14.28,
            cpa: 2500,
            roas: 3.5,
            lp_views: 300,
            cost_per_lp_view: 41.6,
            frequency: 1.2,
        },
    },
    {
        id: "ad_102",
        campaign_id: "cam_111",
        campaign_name: "Spring Sale 2024",
        campaign_objective: "OUTCOME_SALES",
        name: "Spring Sale - Single Image B",
        creative: {
            id: "cre_102",
            title: "Limited Time Offer",
            body: "Get your favorite items before they are gone.",
            image_url: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&q=80",
        },
        insights: {
            impressions: 8200,
            clicks: 800, // Boosted to 800
            spend: 5000,
            ctr: 9.76,
            cpa: 4100,
            roas: 1.2,
            lp_views: 50,
            cost_per_lp_view: 100,
            frequency: 1.1,
        },
    },
    {
        id: "ad_201",
        campaign_id: "cam_222",
        campaign_name: "Brand Awareness",
        campaign_objective: "OUTCOME_AWARENESS",
        name: "Brand Video",
        creative: {
            id: "cre_201",
            title: "Discover WINQER",
            body: "We help small businesses grow.",
            image_url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
        },
        insights: {
            impressions: 45000,
            clicks: 800,
            spend: 30000,
            ctr: 1.77,
            cpa: 0, // Awareness campaign
            roas: 0,
            lp_views: 600,
            cost_per_lp_view: 50,
            frequency: 2.5,
        },
    },
]

export const MOCK_STORES = [
    {
        id: "store_001",
        name: "WINQER 渋谷店",
        address: "東京都渋谷区神南1-1-1",
        phone: "03-1234-5678",
        meta_campaign_ids: ["cam_111"], // Linked to Spring Sale
        ga4_property_id: "properties/12345678",
        gbp_location_id: "locations/1111111111",
        created_at: "2024-01-01T00:00:00Z",
    },
    {
        id: "store_002",
        name: "WINQER 新宿店",
        address: "東京都新宿区西新宿1-1-1",
        phone: "03-9876-5432",
        meta_campaign_ids: ["cam_222"], // Linked to Brand Awareness
        ga4_property_id: "properties/87654321",
        gbp_location_id: "locations/2222222222",
        created_at: "2024-02-01T00:00:00Z",
    },
]

export const MOCK_GBP_LOCATIONS = [
    {
        name: "locations/1111111111",
        title: "WINQER 渋谷店",
        storeCode: "STORE-001",
        phoneNumbers: { primaryPhone: "03-1234-5678" },
        categories: { primaryCategory: { displayName: "Marketing Agency" } },
        metadata: { mapsUri: "https://maps.google.com/?cid=111" },
    },
    {
        name: "locations/2222222222",
        title: "WINQER 新宿店",
        storeCode: "STORE-002",
        phoneNumbers: { primaryPhone: "03-9876-5432" },
        categories: { primaryCategory: { displayName: "Marketing Agency" } },
        metadata: { mapsUri: "https://maps.google.com/?cid=222" },
    },
    {
        name: "locations/3333333333",
        title: "WINQER 池袋店 (未連携)",
        storeCode: "STORE-003",
        phoneNumbers: { primaryPhone: "03-5555-5555" },
        categories: { primaryCategory: { displayName: "Marketing Agency" } },
        metadata: { mapsUri: "https://maps.google.com/?cid=333" },
    },
]

export const MOCK_GBP_INSIGHTS = {
    "locations/1111111111": {
        rating: 4.8,
        reviewCount: 124,
        calls: 45,
        directions: 120,
        websiteClicks: 350,
        views: 1500,
    },
    "locations/2222222222": {
        rating: 4.5,
        reviewCount: 89,
        calls: 30,
        directions: 90,
        websiteClicks: 210,
        views: 1100,
    },
}

export const MOCK_GA4_PROPERTIES = [
    {
        name: "properties/12345678",
        displayName: "WINQER Official Site",
        createTime: "2023-01-01T00:00:00Z",
    },
    {
        name: "properties/87654321",
        displayName: "WINQER LP - Spring Sale",
        createTime: "2023-02-01T00:00:00Z",
    },
]

export const MOCK_GA4_REPORT = {
    "properties/12345678": {
        sessions: 12500,
        activeUsers: 8400,
        conversions: 320,
        engagementRate: 0.65,
        averageSessionDuration: 145,
    },
    "properties/87654321": {
        sessions: 5600,
        activeUsers: 4200,
        conversions: 180,
        engagementRate: 0.72,
        averageSessionDuration: 180,
    },
    // Demo Property for Verification
    "properties/demo-ga4": {
        sessions: 1250, // Matches verification target
        activeUsers: 900,
        conversions: 45,
        engagementRate: 0.60,
        averageSessionDuration: 120,
    },
}

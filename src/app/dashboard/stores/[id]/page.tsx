"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

import { getStore, updateStore, getStoreRole } from "@/app/actions/store"
import { useToast } from "@/components/ui/use-toast"
import { Store } from "@/types/store"
import { useStore } from "@/contexts/store-context"
import { getStrategy, getStrategyForGeneration } from "@/app/actions/strategy"
import { getAdAccountsAction, getCampaignsAction } from "@/app/actions/meta-actions"
import { checkAdminStatusAction, checkSystemKeyAvailabilityAction } from "@/app/actions/provider-actions"

// Components
import { StoreHeader } from "@/components/dashboard/store/store-header"
import { StoreSettings } from "@/components/dashboard/store/store-settings"
import { Integrations } from "@/components/dashboard/store/integrations"
import { PostGeneration } from "@/components/dashboard/store/post-generation"
import { StrategyView } from "@/components/dashboard/store/strategy-view"

// UI
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, Settings, Target } from "lucide-react"

export default function StorePage() {
    const params = useParams<{ id: string }>()
    const storeId = Array.isArray(params.id) ? params.id[0] : params.id
    const { toast } = useToast()
    const { setSelectedStore } = useStore()

    // Store Data
    const [store, setStore] = useState<Store | null>(null)
    const [strategyData, setStrategyData] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)
    const [userRole, setUserRole] = useState<string | null>(null)
    const [isSystemKeyAvailable, setIsSystemKeyAvailable] = useState(false)

    // Form State (for Settings Tab)
    const [name, setName] = useState("")
    const [address, setAddress] = useState("")
    const [phone, setPhone] = useState("")
    const [openaiApiKey, setOpenaiApiKey] = useState("")

    // Integration State
    const [metaCampaignId, setMetaCampaignId] = useState<string>("none")
    const [ga4PropertyId, setGa4PropertyId] = useState<string>("")
    const [gbpLocationId, setGbpLocationId] = useState<string>("")

    // Meta Assets
    const [selectedAdAccountId, setSelectedAdAccountId] = useState<string>("")
    const [campaigns, setCampaigns] = useState<any[]>([])

    // Analysis Inputs (Still needed for saving settings)
    const [targetAudience, setTargetAudience] = useState<string>("")
    const [initialBudget, setInitialBudget] = useState<string>("")
    const [cvEventName, setCvEventName] = useState<string>("フッター予約リンク")
    const [industry, setIndustry] = useState<string>("")
    const [remarks, setRemarks] = useState<string>("")

    // Fetch Meta Assets logic (Secure Server Action)
    useEffect(() => {
        const checkAdmin = async () => {
            const res = await checkAdminStatusAction()
            setIsAdmin(res.isAdmin)

            // Check System Key Availability
            const keyRes = await checkSystemKeyAvailabilityAction()
            setIsSystemKeyAvailable(keyRes.available)
        }
        checkAdmin()

        const fetchMetaAssets = async () => {
            try {
                const result = await getAdAccountsAction()

                if (result.success && result.accounts && result.accounts.length > 0) {
                    const accounts = result.accounts
                    if (!selectedAdAccountId) {
                        const targetId = "864591462413204"
                        const targetAccount = accounts.find((a: any) => a.id === targetId || a.id === `act_${targetId}`)
                        setSelectedAdAccountId(targetAccount ? targetAccount.id : accounts[0].id)
                    }
                }
            } catch (error) {
                console.error('Meta Fetch Error:', error)
            }
        }
        fetchMetaAssets()
    }, [])

    useEffect(() => {
        const fetchCampaigns = async () => {
            if (!selectedAdAccountId) return

            try {
                const result = await getCampaignsAction(selectedAdAccountId)
                if (result.success && result.campaigns) {
                    setCampaigns(result.campaigns)
                } else {
                    setCampaigns([])
                }
            } catch (error) {
                setCampaigns([])
            }
        }
        fetchCampaigns()
    }, [selectedAdAccountId])

    // Debug Log for render
    console.log("[StorePage] Rendering. ID:", storeId)

    useEffect(() => {
        const fetchStoreAndStrategy = async () => {
            if (!storeId) {
                console.log("[StorePage] No Store ID")
                return
            }
            console.log("[StorePage] Start Fetching...", storeId)
            try {
                // Execute in parallel to ensure Strategy is fetched even if Store fetch has minor issues
                // and to speed up loading.
                const [storeResult, strategyRes] = await Promise.all([
                    getStore(storeId),
                    getStrategyForGeneration(storeId)
                ])

                console.log("[StorePage] Store Result:", storeResult)
                console.log("[StorePage] Strategy Result:", strategyRes)

                // 1. Handle Store
                if (storeResult.success && storeResult.store) {
                    setStore(storeResult.store)
                    setSelectedStore(storeResult.store)

                    // Hydrate Form
                    setName(storeResult.store.name || "")
                    setAddress(storeResult.store.address || "")
                    setPhone(storeResult.store.phone || "")
                    setOpenaiApiKey(storeResult.store.openai_api_key || "") // Hydrate API Key
                    setMetaCampaignId(storeResult.store.meta_campaign_id || "none")
                    setGa4PropertyId(storeResult.store.ga4_property_id || "")
                    setGbpLocationId(storeResult.store.gbp_location_id || "")
                    if (storeResult.store.meta_ad_account_id) setSelectedAdAccountId(storeResult.store.meta_ad_account_id)
                    setCvEventName(storeResult.store.cv_event_name || "")
                    setTargetAudience(storeResult.store.target_audience || "")
                    setInitialBudget(storeResult.store.initial_budget || "")
                    setIndustry(storeResult.store.industry || "")

                    // Fetch Role
                    getStoreRole(storeId).then(res => {
                        if (res.success) setUserRole(res.role || null)
                    })
                } else {
                    console.error("[StorePage] Store fetch failed:", storeResult.error)
                }

                // 2. Handle Strategy
                if (strategyRes.success && strategyRes.strategy) {
                    console.log("[StorePage] Setting strategy data:", strategyRes.strategy)
                    setStrategyData(strategyRes.strategy)
                } else {
                    console.warn("[StorePage] Strategy fetch failed or empty:", strategyRes)
                    // If failed, we might still want to try to use standard logic or just log
                }
            } catch (error) {
                console.error("[StorePage] Exception during fetch:", error)
                toast({
                    title: "エラー",
                    description: "データの取得に失敗しました。",
                    variant: "destructive",
                })
            }
        }
        fetchStoreAndStrategy()
    }, [storeId, toast, setSelectedStore])


    const handleSave = async () => {
        if (!storeId) return
        setLoading(true)
        try {
            const selectedCampaign = campaigns.find(c => c.id === metaCampaignId)
            const updatedStore = await updateStore(storeId, {
                name,
                address,
                phone,
                meta_campaign_id: metaCampaignId !== "none" ? metaCampaignId : undefined,
                meta_campaign_name: selectedCampaign?.name,
                ga4_property_id: ga4PropertyId,
                gbp_location_id: gbpLocationId,
                meta_ad_account_id: selectedAdAccountId,
                cv_event_name: cvEventName,
                target_audience: targetAudience,
                initial_budget: initialBudget,
                industry: industry,
                openai_api_key: openaiApiKey // Save API Key
            })

            if (updatedStore.success) {
                setStore(updatedStore.store || null)
                toast({
                    title: "保存完了",
                    description: "事業情報を更新しました。",
                })
            } else {
                throw new Error(updatedStore.error)
            }
        } catch (error) {
            toast({
                title: "エラー",
                description: "保存に失敗しました。",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    if (!storeId) return <div>Invalid Store ID</div>

    return (
        <div className="flex-1 space-y-4 p-6 pt-6 bg-background min-h-screen">
            <StoreHeader name={name} storeId={storeId} isAdmin={isAdmin} />

            <Tabs defaultValue="post-gen" className="space-y-4">
                <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 lg:w-[400px] h-auto">
                    <TabsTrigger value="post-gen" className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        投稿生成
                    </TabsTrigger>
                    <TabsTrigger value="strategy" className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        戦略設定
                    </TabsTrigger>
                </TabsList>
                {/* Tab 1: Post Generation */}
                <TabsContent value="post-gen" className="space-y-4">
                    {storeId && (
                        <PostGeneration storeId={storeId} strategyData={strategyData} />
                    )}
                </TabsContent>

                {/* Tab 2: Strategy */}
                <TabsContent value="strategy" className="space-y-4">
                    <div className="border rounded-lg bg-card p-4 shadow-sm">
                        <StrategyView isAdmin={isAdmin} />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

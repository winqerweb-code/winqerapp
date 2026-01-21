"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

import { getStore, updateStore } from "@/app/actions/store"
import { useToast } from "@/components/ui/use-toast"
import { Store } from "@/types/store"
import { useStore } from "@/contexts/store-context"
import { getStrategy } from "@/app/actions/strategy"
import { getAdAccountsAction, getCampaignsAction } from "@/app/actions/meta-actions"
import { checkAdminStatusAction } from "@/app/actions/provider-actions"

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

    // Form State (for Settings Tab)
    const [name, setName] = useState("")
    const [address, setAddress] = useState("")
    const [phone, setPhone] = useState("")

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

    useEffect(() => {
        const fetchStoreAndStrategy = async () => {
            if (!storeId) return
            try {
                // 1. Fetch Store
                const result = await getStore(storeId)
                if (result.success && result.store) {
                    setStore(result.store)
                    setSelectedStore(result.store)

                    // Hydrate Form
                    setName(result.store.name || "")
                    setAddress(result.store.address || "")
                    setPhone(result.store.phone || "")
                    setMetaCampaignId(result.store.meta_campaign_id || "none")
                    setGa4PropertyId(result.store.ga4_property_id || "")
                    setGbpLocationId(result.store.gbp_location_id || "")
                    if (result.store.meta_ad_account_id) setSelectedAdAccountId(result.store.meta_ad_account_id)
                    setCvEventName(result.store.cv_event_name || "")
                    setTargetAudience(result.store.target_audience || "")
                    setInitialBudget(result.store.initial_budget || "")
                    setIndustry(result.store.industry || "")
                }

                // 2. Fetch Strategy (for Post Generation Context)
                const strategyRes = await getStrategy(storeId)
                if (strategyRes.success && strategyRes.strategy) {
                    setStrategyData(strategyRes.strategy)
                }

            } catch (error) {
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
                industry: industry
            })

            if (updatedStore.success) {
                setStore(updatedStore.store || null)
                toast({
                    title: "保存完了",
                    description: "店舗情報を更新しました。",
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
            <StoreHeader name={name} storeId={storeId} />

            <Tabs defaultValue="post-gen" className="space-y-4">
                <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 lg:w-[400px] h-auto">
                    <TabsTrigger value="post-gen" className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        投稿生成
                    </TabsTrigger>
                    {isAdmin && (
                        <>
                            <TabsTrigger value="strategy" className="flex items-center gap-2">
                                <Target className="h-4 w-4" />
                                戦略設定
                            </TabsTrigger>

                            <TabsTrigger value="settings" className="flex items-center gap-2">
                                <Settings className="h-4 w-4" />
                                店舗設定
                            </TabsTrigger>
                        </>
                    )}
                </TabsList>

                {/* Tab 1: Post Generation */}
                <TabsContent value="post-gen" className="space-y-4">
                    {storeId && (
                        <PostGeneration storeId={storeId} strategyData={strategyData} />
                    )}
                </TabsContent>

                {/* Tab 2: Strategy */}
                {isAdmin && (
                    <TabsContent value="strategy" className="space-y-4">
                        <div className="border rounded-lg bg-card p-4 shadow-sm">
                            <StrategyView />
                        </div>
                    </TabsContent>
                )}

                {/* Tab 3: Settings (Original Layout) */}
                {isAdmin && (
                    <TabsContent value="settings" className="space-y-4">
                        <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
                            {/* Left Column: Settings */}
                            <div className="col-span-1 lg:col-span-4 space-y-4">
                                {store && (
                                    <StoreSettings
                                        store={store}
                                        name={name}
                                        setName={setName}
                                        address={address}
                                        setAddress={setAddress}
                                        phone={phone}
                                        setPhone={setPhone}
                                        targetAudience={targetAudience}
                                        setTargetAudience={setTargetAudience}
                                        initialBudget={initialBudget}
                                        setInitialBudget={setInitialBudget}
                                        industry={industry}
                                        setIndustry={setIndustry}
                                        onSave={handleSave}
                                        loading={loading}
                                    />
                                )}
                            </div>

                            {/* Right Column: Integrations */}
                            <div className="col-span-1 lg:col-span-3 space-y-4">
                                <Integrations
                                    metaCampaignId={metaCampaignId}
                                    setMetaCampaignId={setMetaCampaignId}
                                    campaigns={campaigns}
                                    ga4PropertyId={ga4PropertyId}
                                    setGa4PropertyId={setGa4PropertyId}
                                    gbpLocationId={gbpLocationId}
                                    setGbpLocationId={setGbpLocationId}
                                    cvEventName={cvEventName}
                                    setCvEventName={setCvEventName}
                                    onSave={handleSave}
                                    loading={loading}
                                />
                            </div>
                        </div>
                    </TabsContent>
                )}
            </Tabs>
        </div>
    )
}

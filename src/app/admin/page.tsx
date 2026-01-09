"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    createStoreAction,
    deleteStoreAction,
    assignUserToStoreAction,
    removeUserFromStoreAction,
    updateStoreSecretsAction,
    getStoreAssignmentsAction,
    assignUserByEmailAction,
    getStoreMetaAdAccountsAction,
    getStoreMetaCampaignsAction,
    checkAdminStatusAction
} from "@/app/actions/provider-actions"
import { getStores } from "@/app/actions/store"
import { Store } from "@/types/store"
import { SecureApiKeyInput } from "@/components/secure-api-key-input"
import { IdInputWithSelect } from "@/components/id-input-with-select"
import { Trash2, RefreshCw } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GoogleConnectButton } from "@/components/google-connect-button"
import { supabase } from "@/lib/auth"

interface UserAssignmentManagerProps {
    storeId: string;
    storeName: string;
}

function UserAssignmentManager({ storeId, storeName }: UserAssignmentManagerProps) {
    const { toast } = useToast();
    const [assignments, setAssignments] = useState<any[]>([]);
    const [emailToAssign, setEmailToAssign] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const fetchAssignments = async () => {
        setIsLoading(true);
        const res = await getStoreAssignmentsAction(storeId);
        if (res.success && res.assignments) {
            setAssignments(res.assignments);
        } else {
            toast({ title: "エラー", description: res.error, variant: "destructive" });
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (storeId) {
            fetchAssignments();
        }
    }, [storeId]);

    const handleAssignUser = async () => {
        if (!emailToAssign) {
            toast({ title: "入力エラー", description: "メールアドレスを入力してください", variant: "destructive" });
            return;
        }
        setIsLoading(true);
        const res = await assignUserByEmailAction(emailToAssign, storeId); // Note: email first in action signature
        if (res.success) {
            toast({ title: "ユーザーを割り当てました" });
            setEmailToAssign("");
            fetchAssignments();
        } else {
            toast({ title: "エラー", description: res.error, variant: "destructive" });
        }
        setIsLoading(false);
    };

    const handleRemoveUser = async (userId: string) => {
        if (!confirm("本当にこのユーザーの割り当てを解除しますか？")) return;
        setIsLoading(true);
        const res = await removeUserFromStoreAction(userId, storeId); // Note: userId first
        if (res.success) {
            toast({ title: "ユーザーの割り当てを解除しました" });
            fetchAssignments();
        } else {
            toast({ title: "エラー", description: res.error, variant: "destructive" });
        }
        setIsLoading(false);
    };

    return (
        <Card className="mt-4">
            <CardHeader>
                <CardTitle>ユーザー管理 ({storeName})</CardTitle>
                <CardDescription>この店舗にアクセスできるユーザーを管理します。</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex space-x-2 mb-4">
                    <Input
                        placeholder="ユーザーのメールアドレス"
                        value={emailToAssign}
                        onChange={(e) => setEmailToAssign(e.target.value)}
                        className="flex-grow bg-background"
                    />
                    <Button onClick={handleAssignUser} disabled={isLoading}>
                        {isLoading ? "割り当て中..." : "ユーザーを割り当てる"}
                    </Button>
                </div>
                <h3 className="text-lg font-semibold mb-2">割り当て済みユーザー</h3>
                {isLoading ? (
                    <p>読み込み中...</p>
                ) : (
                    <ul className="space-y-2">
                        {assignments.length === 0 ? (
                            <p className="text-gray-500">この店舗にはまだユーザーが割り当てられていません。</p>
                        ) : (
                            assignments.map((assignment) => (
                                <li key={assignment.user_id} className="flex justify-between items-center p-2 border rounded-md">
                                    <span>{assignment.email}</span>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleRemoveUser(assignment.user_id)}
                                    >
                                        解除
                                    </Button>
                                </li>
                            ))
                        )}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}

export default function AdminDashboard() {
    const { toast } = useToast()
    const [stores, setStores] = useState<Store[]>([])
    const [newStoreName, setNewStoreName] = useState("")
    const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null)
    const [selectedStore, setSelectedStore] = useState<Store | null>(null)
    const [debugInfo, setDebugInfo] = useState<{ email?: string | null, role?: string | null }>({})

    // Integration States
    const [metaAdAccounts, setMetaAdAccounts] = useState<any[]>([])
    const [isLoadingMetaAccounts, setIsLoadingMetaAccounts] = useState(false)

    const [isGoogleConnected, setIsGoogleConnected] = useState(false)
    const [gbpLocations, setGbpLocations] = useState<any[]>([])
    const [ga4Properties, setGa4Properties] = useState<any[]>([])
    const [isLoadingGoogleData, setIsLoadingGoogleData] = useState(false)

    // Fetch Stores
    useEffect(() => {
        const fetchStores = async () => {
            const res = await getStores()
            if (res.success && res.stores) {
                setStores(res.stores)
            } else {
                // If fetch fails, check admin status for debugging
                const status = await checkAdminStatusAction()
                setDebugInfo({ email: status.email, role: status.role })
            }
        }
        fetchStores()
    }, [])

    useEffect(() => {
        if (selectedStoreId) {
            const store = stores.find(s => s.id === selectedStoreId)
            setSelectedStore(store || null)
        } else {
            setSelectedStore(null)
        }
    }, [selectedStoreId, stores])

    // Google Auth Check
    useEffect(() => {
        const checkGoogleAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.user && session.provider_token) {
                setIsGoogleConnected(true)
                fetchGoogleData(session.provider_token)
            } else {
                setIsGoogleConnected(false)
            }
        }
        checkGoogleAuth()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user && session.provider_token) {
                setIsGoogleConnected(true)
                fetchGoogleData(session.provider_token)
            } else {
                setIsGoogleConnected(false)
            }
        })
        return () => subscription.unsubscribe()
    }, [])

    const fetchGoogleData = async (token: string) => {
        setIsLoadingGoogleData(true)
        try {
            const { GoogleApiClient } = await import('@/lib/google-api')
            const googleClient = new GoogleApiClient(token)

            try {
                const locations = await googleClient.getLocations()
                setGbpLocations(locations)
            } catch (e) { console.warn("GBP Fetch Error", e) }

            try {
                const properties = await googleClient.getGa4Properties()
                setGa4Properties(properties)
            } catch (e) { console.warn("GA4 Fetch Error", e) }

        } catch (error) {
            console.error("Google Data Fetch Error", error)
        } finally {
            setIsLoadingGoogleData(false)
        }
    }

    const fetchMetaAdAccounts = async () => {
        if (!selectedStoreId) return
        setIsLoadingMetaAccounts(true)
        const res = await getStoreMetaAdAccountsAction(selectedStoreId)
        setIsLoadingMetaAccounts(false)

        if (res.success && res.accounts) {
            setMetaAdAccounts(res.accounts)
            toast({ title: "広告アカウントを取得しました" })
        } else {
            toast({ title: "エラー", description: res.error, variant: "destructive" })
        }
    }

    const [metaCampaigns, setMetaCampaigns] = useState<any[]>([])
    const [isLoadingMetaCampaigns, setIsLoadingMetaCampaigns] = useState(false)

    const fetchMetaCampaigns = async () => {
        if (!selectedStoreId || !selectedStore?.meta_ad_account_id) return
        setIsLoadingMetaCampaigns(true)
        const res = await getStoreMetaCampaignsAction(selectedStoreId, selectedStore.meta_ad_account_id)
        setIsLoadingMetaCampaigns(false)

        if (res.success && res.campaigns) {
            setMetaCampaigns(res.campaigns)
            toast({ title: "キャンペーンを取得しました" })
        } else {
            toast({ title: "エラー", description: res.error, variant: "destructive" })
        }
    }

    const [isCreating, setIsCreating] = useState(false)

    const handleCreateStore = async () => {
        if (!newStoreName) {
            toast({
                title: "入力エラー",
                description: "店舗名を入力してください",
                variant: "destructive"
            })
            return
        }
        setIsCreating(true)
        try {
            const res = await createStoreAction(newStoreName)
            if (res.success && res.store) {
                setStores([...stores, res.store])
                setNewStoreName("")
                toast({ title: "店舗を作成しました" })
            } else {
                toast({ title: "エラー", description: res.error, variant: "destructive" })
            }
        } catch (error) {
            toast({ title: "エラー", description: "予期せぬエラーが発生しました", variant: "destructive" })
        } finally {
            setIsCreating(false)
        }
    }

    const handleDeleteStore = async (id: string) => {
        if (!confirm("本当に削除しますか？")) return
        const res = await deleteStoreAction(id)
        if (res.success) {
            setStores(stores.filter(s => s.id !== id))
            toast({ title: "店舗を削除しました" })
        } else {
            toast({ title: "エラー", description: res.error, variant: "destructive" })
        }
    }

    // Secret Management Handlers
    const handleSaveSecret = async (keyName: string, value: string) => {
        if (!selectedStoreId) return { success: false, error: "店舗が選択されていません" }
        const secrets = { [keyName]: value }
        const res = await updateStoreSecretsAction(selectedStoreId, secrets)
        if (res.success) {
            toast({ title: "設定を保存しました" })
            // Update local state if needed (e.g. for dropdown value)
            if (selectedStore) {
                setSelectedStore({ ...selectedStore, [keyName]: value })
            }
            return { success: true }
        } else {
            toast({ title: "保存エラー", description: res.error, variant: "destructive" })
            return { success: false, error: res.error }
        }
    }

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">管理者ダッシュボード</h1>
                <div className="flex gap-2">
                    <Input
                        placeholder="新規店舗名"
                        value={newStoreName}
                        onChange={e => setNewStoreName(e.target.value)}
                        className="w-64"
                    />
                    <Button
                        onClick={handleCreateStore}
                        disabled={isCreating}
                    >
                        {isCreating ? "作成中..." : "店舗作成"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Store List */}
                <div className="col-span-4 space-y-4">
                    <h2 className="text-xl font-semibold">店舗一覧</h2>
                    {stores.length === 0 && (
                        <div className="p-4 border border-red-200 bg-red-50 rounded-md text-sm text-red-800">
                            <p className="font-bold">店舗が見つかりません</p>
                            <p>権限が不足している可能性があります。</p>
                            <div className="mt-2 text-xs text-gray-600">
                                <p>現在のユーザー: {debugInfo.email || "不明"}</p>
                                <p>現在のロール: {debugInfo.role || "なし (NULL)"}</p>
                            </div>
                            {debugInfo.role !== 'PROVIDER_ADMIN' && (
                                <p className="mt-2 font-mono text-xs bg-white p-1 rounded border">
                                    Required: PROVIDER_ADMIN
                                </p>
                            )}
                        </div>
                    )}
                    {stores.map(store => (
                        <Card
                            key={store.id}
                            className={`cursor-pointer hover:bg-slate-50 ${selectedStoreId === store.id ? 'border-blue-500' : ''}`}
                            onClick={() => setSelectedStoreId(store.id)}
                        >
                            <CardHeader className="p-4">
                                <CardTitle className="text-base flex justify-between">
                                    {store.name}
                                    <Button variant="ghost" size="sm" className="text-red-500 h-6" onClick={(e) => {
                                        e.stopPropagation()
                                        handleDeleteStore(store.id)
                                    }}>削除</Button>
                                </CardTitle>
                                <CardDescription>{store.id}</CardDescription>
                            </CardHeader>
                        </Card>
                    ))}
                </div>

                {/* Selected Store Details */}
                <div className="col-span-8">
                    {selectedStoreId ? (
                        <Tabs defaultValue="secrets">
                            <TabsList>
                                <TabsTrigger value="secrets">シークレット・連携</TabsTrigger>
                                <TabsTrigger value="users">ユーザー割り当て</TabsTrigger>
                            </TabsList>

                            <TabsContent value="secrets" className="space-y-4 mt-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>APIキー & シークレット</CardTitle>
                                        <CardDescription>この店舗のシークレットを管理します。</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* AI Keys */}
                                        <div className="space-y-4">
                                            <h3 className="font-medium">AI API Keys</h3>
                                            <SecureApiKeyInput
                                                label="Gemini API Key"
                                                onSave={(val) => handleSaveSecret('gemini_api_key', val)}
                                                fetchStatus={async () => ({ success: true, data: { hasApiKey: false, last4: "****" } })}
                                                placeholder="AIza..."
                                            />
                                            <SecureApiKeyInput
                                                label="OpenAI API Key"
                                                onSave={(val) => handleSaveSecret('openai_api_key', val)}
                                                fetchStatus={async () => ({ success: true, data: { hasApiKey: false, last4: "****" } })}
                                                placeholder="sk-..."
                                            />
                                        </div>

                                        <div className="border-t pt-4 space-y-4">
                                            <h3 className="font-medium">Meta連携</h3>
                                            <SecureApiKeyInput
                                                label="Meta Access Token"
                                                onSave={(val) => handleSaveSecret('meta_access_token', val)}
                                                fetchStatus={async () => ({ success: true, data: { hasApiKey: false, last4: "****" } })}
                                                placeholder="EAA..."
                                            />

                                            <div className="space-y-4">
                                                <IdInputWithSelect
                                                    label="Meta Ad Account ID"
                                                    value={selectedStore?.meta_ad_account_id || ""}
                                                    onChange={(val) => {
                                                        if (selectedStore) {
                                                            setSelectedStore({ ...selectedStore, meta_ad_account_id: val })
                                                        }
                                                    }}
                                                    onSave={async (val) => {
                                                        const res = await handleSaveSecret('meta_ad_account_id', val)
                                                        if (res.success) {
                                                            // Reset campaign when account changes
                                                            handleSaveSecret('meta_campaign_id', "")
                                                            setMetaCampaigns([])
                                                        }
                                                    }}
                                                    options={metaAdAccounts.map((acc: any) => ({
                                                        id: acc.id,
                                                        label: acc.name,
                                                        subLabel: acc.id
                                                    }))}
                                                    onFetch={async () => { await fetchMetaAdAccounts() }}
                                                    isLoadingFetch={isLoadingMetaAccounts}
                                                    fetchLabel="アカウント取得"
                                                    placeholder="act_..."
                                                />

                                                <IdInputWithSelect
                                                    label="Meta Campaign ID"
                                                    value={selectedStore?.meta_campaign_id || ""}
                                                    onChange={(val) => {
                                                        if (selectedStore) {
                                                            setSelectedStore({ ...selectedStore, meta_campaign_id: val })
                                                        }
                                                    }}
                                                    onSave={async (val) => { await handleSaveSecret('meta_campaign_id', val) }}
                                                    options={metaCampaigns.map((camp: any) => ({
                                                        id: camp.id,
                                                        label: camp.name,
                                                        subLabel: camp.status
                                                    }))}
                                                    onFetch={async () => { await fetchMetaCampaigns() }}
                                                    isLoadingFetch={isLoadingMetaCampaigns}
                                                    fetchLabel="キャンペーン取得"
                                                    disabled={!selectedStore?.meta_ad_account_id}
                                                    placeholder="123..."
                                                />
                                            </div>
                                        </div>

                                        <div className="border-t pt-4 space-y-4">
                                            <h3 className="font-medium">Google連携</h3>
                                            <div className="flex items-center gap-4">
                                                <GoogleConnectButton />
                                                {isGoogleConnected && <span className="text-sm text-green-600">連携済み</span>}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <IdInputWithSelect
                                                    label="GA4 Property ID"
                                                    value={selectedStore?.ga4_property_id || ""}
                                                    onChange={(val) => {
                                                        if (selectedStore) {
                                                            setSelectedStore({ ...selectedStore, ga4_property_id: val })
                                                        }
                                                    }}
                                                    onSave={async (val) => { await handleSaveSecret('ga4_property_id', val) }}
                                                    options={ga4Properties.map((prop: any) => ({
                                                        id: prop.name,
                                                        label: prop.displayName,
                                                        subLabel: prop.name
                                                    }))}
                                                    disabled={!isGoogleConnected}
                                                    placeholder="properties/..."
                                                />

                                                <IdInputWithSelect
                                                    label="GBP Location ID"
                                                    value={selectedStore?.gbp_location_id || ""}
                                                    onChange={(val) => {
                                                        if (selectedStore) {
                                                            setSelectedStore({ ...selectedStore, gbp_location_id: val })
                                                        }
                                                    }}
                                                    onSave={async (val) => { await handleSaveSecret('gbp_location_id', val) }}
                                                    options={gbpLocations.map((loc: any) => ({
                                                        id: loc.name,
                                                        label: loc.title,
                                                        subLabel: loc.name
                                                    }))}
                                                    disabled={!isGoogleConnected}
                                                    placeholder="locations/..."
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="users" className="mt-4">
                                <UserAssignmentManager
                                    storeId={selectedStoreId}
                                    storeName={selectedStore?.name || "選択された店舗"}
                                />
                            </TabsContent>
                        </Tabs>
                    ) : (
                        <div className="flex items-center justify-center h-64 text-muted-foreground border-2 border-dashed rounded-lg">
                            管理する店舗を選択してください
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

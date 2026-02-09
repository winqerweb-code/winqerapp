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
    checkAdminStatusAction,
    getGoogleRefreshTokenFromCookie,
    getProviderAdminsAction,
    assignProviderAdminAction,
    removeProviderAdminAction,
    adminResetUserPasswordAction,
    getAllUsersAction,
    deleteUserAction,
    getSystemSettingsAction,
    updateSystemSettingsAction
} from "@/app/actions/provider-actions"
import { getStoreGoogleDataAction } from "@/app/actions/google-data"
import { getStores } from "@/app/actions/store"
import { Store } from "@/types/store"
import { SecureApiKeyInput } from "@/components/secure-api-key-input"
import { IdInputWithSelect } from "@/components/id-input-with-select"
import { Trash2, RefreshCw, Save, Plus, UserPlus, Key } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GoogleConnectButton } from "@/components/google-connect-button"
import { supabase } from "@/lib/auth"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

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
                <CardDescription>この事業にアクセスできるユーザーを管理します。</CardDescription>
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
                            <p className="text-gray-500">この事業にはまだユーザーが割り当てられていません。</p>
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

function UserManagement() {
    const { toast } = useToast()
    const [targetEmail, setTargetEmail] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [users, setUsers] = useState<any[]>([])
    const [isLoadingUsers, setIsLoadingUsers] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoadingUsers(true)
            try {
                const res = await getAllUsersAction()
                if (res.success) {
                    setUsers(res.users || [])
                } else {
                    toast({
                        title: "ユーザー取得エラー",
                        description: res.error,
                        variant: "destructive"
                    })
                }
            } catch (error) {
                console.error(error)
            } finally {
                setIsLoadingUsers(false)
            }
        }
        fetchUsers()
    }, [toast])

    const filteredUsers = users.filter(user =>
        (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || "") ||
        (user.role?.toLowerCase().includes(searchTerm.toLowerCase()) || "")
    )

    const handleResetPassword = async () => {
        if (!targetEmail || !newPassword) {
            toast({
                title: "入力エラー",
                description: "メールアドレスと新しいパスワードを入力してください",
                variant: "destructive"
            })
            return
        }

        if (newPassword.length < 6) {
            toast({
                title: "パスワードエラー",
                description: "パスワードは6文字以上で入力してください",
                variant: "destructive"
            })
            return
        }

        if (!confirm(`本当にユーザー ${targetEmail} のパスワードをリセットしますか？\nこの操作は取り消せません。`)) {
            return
        }

        setIsLoading(true)
        try {
            const res = await adminResetUserPasswordAction(targetEmail, newPassword)
            if (res.success) {
                toast({
                    title: "リセット完了",
                    description: "パスワードが正常に変更されました。",
                })
                setNewPassword("")
                // Don't clear email so admin can verify who they just changed
            } else {
                toast({
                    title: "エラー",
                    description: res.error,
                    variant: "destructive"
                })
            }
        } catch (error) {
            toast({
                title: "エラー",
                description: "予期せぬエラーが発生しました",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteUser = async (userId: string, userEmail: string) => {
        if (!confirm(`本当にユーザー ${userEmail} を削除しますか？\nこの操作は完全に取り消せません。`)) {
            return
        }

        setIsLoading(true)
        try {
            const res = await deleteUserAction(userId)
            if (res.success) {
                toast({
                    title: "削除完了",
                    description: "ユーザーを削除しました。",
                })
                // Refresh list
                const resUsers = await getAllUsersAction()
                if (resUsers.success) {
                    setUsers(resUsers.users || [])
                }
            } else {
                toast({
                    title: "エラー",
                    description: res.error,
                    variant: "destructive"
                })
            }
        } catch (error) {
            toast({
                title: "エラー",
                description: "予期せぬエラーが発生しました",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6 mt-4">
            <Card>
                <CardHeader>
                    <CardTitle>ユーザー一覧</CardTitle>
                    <CardDescription>登録済みユーザーの一覧です。</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <Input
                            placeholder="メールアドレスで検索..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {isLoadingUsers ? (
                        <div className="text-center py-4">読み込み中...</div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>メールアドレス</TableHead>
                                        <TableHead>権限</TableHead>
                                        <TableHead>登録日</TableHead>
                                        <TableHead className="text-right">操作</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.length > 0 ? (
                                        filteredUsers.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium">{user.email}</TableCell>
                                                <TableCell>{user.role}</TableCell>
                                                <TableCell>{user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setTargetEmail(user.email)}
                                                        >
                                                            選択
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => handleDeleteUser(user.id, user.email)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center h-24">
                                                ユーザーが見つかりません
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>ユーザーパスワード管理</CardTitle>
                    <CardDescription>
                        ユーザーのパスワードを強制的にリセットします。
                        <br />
                        <span className="text-red-500 font-bold">警告: ユーザーは古いパスワードでログインできなくなります。</span>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 max-w-md">
                        <div className="grid gap-2">
                            <Label htmlFor="target-email">対象ユーザーのメールアドレス</Label>
                            <Input
                                id="target-email"
                                placeholder="user@example.com"
                                value={targetEmail}
                                onChange={(e) => setTargetEmail(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="new-password">新しいパスワード</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="new-password"
                                    type="text" // Visible so admin can see what they are setting
                                    placeholder="新しいパスワード"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    minLength={6}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setNewPassword(Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8))}
                                    title="ランダム生成"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">※少なくとも6文字以上。ランダム生成ボタンで強力なパスワードを生成できます。</p>
                        </div>
                        <Button onClick={handleResetPassword} disabled={isLoading} className="w-full">
                            <Key className="mr-2 h-4 w-4" />
                            {isLoading ? "リセット中..." : "パスワードをリセット"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function ProviderAdminsManager() {
    const { toast } = useToast();
    const [admins, setAdmins] = useState<any[]>([]);
    const [emailToAssign, setEmailToAssign] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const fetchAdmins = async () => {
        setIsLoading(true);
        const res = await getProviderAdminsAction();
        if (res.success && res.admins) {
            setAdmins(res.admins);
        } else {
            toast({ title: "エラー", description: res.error, variant: "destructive" });
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const handleAssignAdmin = async () => {
        if (!emailToAssign) {
            toast({ title: "入力エラー", description: "メールアドレスを入力してください", variant: "destructive" });
            return;
        }
        if (!confirm("本当にこのユーザーに管理者権限を付与しますか？\n(全ての事業へのアクセスが可能になります)")) return;

        setIsLoading(true);
        const res = await assignProviderAdminAction(emailToAssign);
        if (res.success) {
            toast({ title: "管理者を追加しました" });
            setEmailToAssign("");
            fetchAdmins();
        } else {
            toast({ title: "エラー", description: res.error, variant: "destructive" });
        }
        setIsLoading(false);
    };

    const handleRemoveAdmin = async (userId: string) => {
        if (!confirm("本当にこのユーザーの管理者権限を削除しますか？")) return;
        setIsLoading(true);
        const res = await removeProviderAdminAction(userId);
        if (res.success) {
            toast({ title: "管理者権限を削除しました" });
            fetchAdmins();
        } else {
            toast({ title: "エラー", description: res.error, variant: "destructive" });
        }
        setIsLoading(false);
    };

    return (
        <Card className="mt-4">
            <CardHeader>
                <CardTitle>全体管理者</CardTitle>
                <CardDescription>
                    システム全体の管理権限を持つユーザーを管理します。
                    <br />
                    <span className="text-red-500 font-bold">注意: ここに追加されたユーザーは全ての事業データにアクセスできます。</span>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex space-x-2 mb-4">
                    <Input
                        placeholder="ユーザーのメールアドレス"
                        value={emailToAssign}
                        onChange={(e) => setEmailToAssign(e.target.value)}
                        className="flex-grow bg-background"
                    />
                    <Button onClick={handleAssignAdmin} disabled={isLoading}>
                        {isLoading ? "処理中..." : "管理者を追加"}
                    </Button>
                </div>
                <h3 className="text-lg font-semibold mb-2">現在の管理者</h3>
                {isLoading ? (
                    <p>読み込み中...</p>
                ) : (
                    <ul className="space-y-2">
                        {admins.map((admin) => (
                            <li key={admin.id} className="flex justify-between items-center p-2 border rounded-md">
                                <div className="flex flex-col">
                                    <span className="font-medium">{admin.email}</span>
                                    <span className="text-xs text-muted-foreground">ID: {admin.id}</span>
                                </div>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleRemoveAdmin(admin.id)}
                                >
                                    削除
                                </Button>
                            </li>
                        ))}
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
    const [pendingRefreshToken, setPendingRefreshToken] = useState<string | null>(null)

    // Check for pending refresh token in cookie
    useEffect(() => {
        const checkRefreshToken = async () => {
            const token = await getGoogleRefreshTokenFromCookie()
            if (token) {
                console.log("Found pending refresh token")
                setPendingRefreshToken(token)
            }
        }
        checkRefreshToken()
    }, [])

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

            // Auto-save pending refresh token if store doesn't have one
            if (store && pendingRefreshToken && !store.google_refresh_token) {
                console.log("Auto-saving pending refresh token to store:", store.name)
                updateStoreSecretsAction(store.id, { google_refresh_token: pendingRefreshToken })
                    .then(res => {
                        if (res.success) {
                            toast({ title: "Google連携情報を自動保存しました" })
                            // Update local state
                            const updated = { ...store, google_refresh_token: pendingRefreshToken }
                            setSelectedStore(updated)
                            setStores(prev => prev.map(s => s.id === store.id ? updated : s))
                        }
                    })
            }
        } else {
            setSelectedStore(null)
        }
    }, [selectedStoreId, stores, pendingRefreshToken])

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

    // New Effect: Fetch Google Data via Server Action if Store has token but Session doesn't
    useEffect(() => {
        const loadStoredGoogleData = async () => {
            if (selectedStoreId && selectedStore?.google_refresh_token && !isGoogleConnected) {
                console.log("Fetching Google Data using stored Refresh Token...")
                setIsLoadingGoogleData(true)
                const res = await getStoreGoogleDataAction(selectedStoreId)
                setIsLoadingGoogleData(false)

                if (res.success) {
                    if (res.locations) setGbpLocations(res.locations)
                    if (res.properties) setGa4Properties(res.properties)
                    toast({ title: "連携済みデータを読み込みました" })
                } else {
                    console.error("Stored Google Data Fetch Failed:", res.error)
                    // Optionally toast error, but maybe silent fail is better if just browsing?
                }
            }
        }
        loadStoredGoogleData()
    }, [selectedStoreId, selectedStore?.google_refresh_token, isGoogleConnected])

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
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [newStoreIndustry, setNewStoreIndustry] = useState("")

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
            const res = await createStoreAction(newStoreName, newStoreIndustry)
            if (res.success && res.store) {
                setStores([...stores, res.store])
                setNewStoreName("")
                setNewStoreIndustry("")
                setIsCreateDialogOpen(false)
                toast({ title: "事業を作成しました" })
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
            toast({ title: "事業を削除しました" })
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

            // Sync both selectedStore and stores array
            if (selectedStore) {
                const updatedStore = { ...selectedStore, [keyName]: value }
                setSelectedStore(updatedStore)
                setStores(prev => prev.map(s => s.id === selectedStoreId ? updatedStore : s))
            }
            return { success: true }
        } else {
            toast({ title: "保存エラー", description: res.error, variant: "destructive" })
            return { success: false, error: res.error }
        }
    }

    const checkApiKeyStatus = async (keyName: string) => {
        const store = stores.find(s => s.id === selectedStoreId)
        const val = store ? (store as any)[keyName] : null
        return {
            success: true,
            data: {
                hasApiKey: !!val,
                last4: val && val.length > 4 ? val.slice(-4) : "****"
            }
        }
    }

    // Add Admin State & Handler
    const [isAddAdminDialogOpen, setIsAddAdminDialogOpen] = useState(false)
    const [newAdminEmail, setNewAdminEmail] = useState("")
    const [newAdminPassword, setNewAdminPassword] = useState("")
    const [isAddingAdmin, setIsAddingAdmin] = useState(false)

    const handleAddAdmin = async () => {
        if (!newAdminEmail) return
        setIsAddingAdmin(true)
        try {
            const res = await assignProviderAdminAction(newAdminEmail, newAdminPassword)
            if (res.success) {
                toast({ title: "管理者を追加しました" })
                setNewAdminEmail("")
                setNewAdminPassword("")
                setIsAddAdminDialogOpen(false)
            } else {
                toast({ title: "エラー", description: res.error, variant: "destructive" })
            }
        } catch (error) {
            toast({ title: "エラー", description: "予期せぬエラーが発生しました", variant: "destructive" })
        } finally {
            setIsAddingAdmin(false)
        }
    }

    return (
        <div className="p-8 space-y-8">

            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">管理者ダッシュボード</h1>
                <div className="flex gap-2">
                    <Dialog open={isAddAdminDialogOpen} onOpenChange={setIsAddAdminDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <UserPlus className="mr-2 h-4 w-4" />
                                管理者を招待
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>管理者の招待</DialogTitle>
                                <DialogDescription>
                                    システム全体の管理者権限を付与します。<br />
                                    パスワードを入力すると、そのパスワードでログインできるアカウントを作成（または更新）します。
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="admin-email">メールアドレス</Label>
                                    <Input
                                        id="admin-email"
                                        placeholder="user@example.com"
                                        value={newAdminEmail}
                                        onChange={(e) => setNewAdminEmail(e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="admin-password">パスワード（任意）</Label>
                                    <Input
                                        id="admin-password"
                                        type="password"
                                        placeholder="設定する場合のみ入力"
                                        value={newAdminPassword}
                                        onChange={(e) => setNewAdminPassword(e.target.value)}
                                        minLength={6}
                                    />
                                    <p className="text-xs text-muted-foreground">※6文字以上。空白の場合はパスワードを設定しません（既存ユーザーの権限付与のみ）。</p>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsAddAdminDialogOpen(false)}>キャンセル</Button>
                                <Button onClick={handleAddAdmin} disabled={isAddingAdmin}>
                                    {isAddingAdmin ? "追加中..." : "追加する"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                事業を追加
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>新規店舗の作成</DialogTitle>
                                <DialogDescription>
                                    新しい店舗を作成します。店舗名と業種を入力してください。
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">事業名</Label>
                                    <Input
                                        id="name"
                                        placeholder="例: Winqer Salon Imj"
                                        value={newStoreName}
                                        onChange={(e) => setNewStoreName(e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="industry">業種</Label>
                                    <Select value={newStoreIndustry} onValueChange={setNewStoreIndustry}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="業種を選択" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="beauty_salon">美容サロン</SelectItem>
                                            <SelectItem value="restaurant">飲食店</SelectItem>
                                            <SelectItem value="retail">小売店</SelectItem>
                                            <SelectItem value="service">サービス業</SelectItem>
                                            <SelectItem value="other">その他</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>キャンセル</Button>
                                <Button onClick={handleCreateStore} disabled={isCreating}>
                                    {isCreating ? "作成中..." : "作成する"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* System Admins Section - Always visible to Provider Admins */}
                <div className="col-span-12 mb-8">
                    <Tabs defaultValue="store-management">
                        <TabsList>
                            <TabsTrigger value="store-management">店舗管理</TabsTrigger>
                            <TabsTrigger value="user-management">ユーザー管理</TabsTrigger>
                            <TabsTrigger value="system-admins">システム管理者</TabsTrigger>
                            <TabsTrigger value="system-settings">システム設定</TabsTrigger>
                        </TabsList>
                        <TabsContent value="store-management">
                            <div className="grid grid-cols-12 gap-6 pt-4">
                                {/* Store List */}
                                <div className="col-span-4 space-y-4">
                                    <h2 className="text-xl font-semibold">事業一覧</h2>
                                    {stores.length === 0 && (
                                        <div className="p-4 border border-red-200 bg-red-50 rounded-md text-sm text-red-800">
                                            <p className="font-bold">事業が見つかりません</p>
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
                                        <Tabs defaultValue="secrets" key={selectedStoreId}>
                                            <TabsList>
                                                <TabsTrigger value="secrets">シークレット・連携</TabsTrigger>
                                                <TabsTrigger value="users">ユーザー割り当て</TabsTrigger>
                                            </TabsList>
                                            <TabsContent value="system-admins" className="mt-4">
                                                <ProviderAdminsManager />
                                            </TabsContent>

                                            <TabsContent value="secrets" className="space-y-4 mt-4">
                                                <Card>
                                                    <CardHeader>
                                                        <CardTitle>APIキー & シークレット</CardTitle>
                                                        <CardDescription>この事業のシークレットを管理します。</CardDescription>
                                                    </CardHeader>
                                                    <CardContent className="space-y-6">
                                                        {/* AI Keys */}
                                                        <div className="space-y-4">
                                                            <h3 className="font-medium">AI API Keys</h3>
                                                            <SecureApiKeyInput
                                                                label="Gemini API Key"
                                                                onSave={(val) => handleSaveSecret('gemini_api_key', val)}
                                                                fetchStatus={() => checkApiKeyStatus('gemini_api_key')}
                                                                placeholder="AIza..."
                                                            />
                                                            <SecureApiKeyInput
                                                                label="OpenAI API Key"
                                                                onSave={(val) => handleSaveSecret('openai_api_key', val)}
                                                                fetchStatus={() => checkApiKeyStatus('openai_api_key')}
                                                                placeholder="sk-..."
                                                            />
                                                        </div>

                                                        <div className="border-t pt-4 space-y-4">
                                                            <h3 className="font-medium">Meta連携</h3>
                                                            <SecureApiKeyInput
                                                                label="Meta Access Token"
                                                                onSave={(val) => handleSaveSecret('meta_access_token', val)}
                                                                fetchStatus={() => checkApiKeyStatus('meta_access_token')}
                                                                placeholder="EAA..."
                                                            />

                                                            <div className="space-y-4">
                                                                <IdInputWithSelect
                                                                    label="Meta Ad Account ID"
                                                                    value={selectedStore?.meta_ad_account_id || ""}
                                                                    savedName={selectedStore?.meta_ad_account_name}
                                                                    onChange={(val) => {
                                                                        if (selectedStore) {
                                                                            setSelectedStore({ ...selectedStore, meta_ad_account_id: val })
                                                                        }
                                                                    }}
                                                                    showSaveButton={false}
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
                                                                    savedName={selectedStore?.meta_campaign_name}
                                                                    onChange={(val) => {
                                                                        if (selectedStore) {
                                                                            setSelectedStore({ ...selectedStore, meta_campaign_id: val })
                                                                        }
                                                                    }}
                                                                    showSaveButton={false}
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
                                                                {(isGoogleConnected || selectedStore?.google_refresh_token) ? (
                                                                    <div className="flex flex-col">
                                                                        <span className="text-sm text-green-600 font-bold">
                                                                            {selectedStore?.google_refresh_token ? "連携済み (保存済み)" : "連携済み (未保存)"}
                                                                        </span>
                                                                        {!isGoogleConnected && (
                                                                            <span className="text-xs text-muted-foreground">
                                                                                ※設定を変更するには、再度ボタンから連携してください
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-sm text-gray-500">未連携</span>
                                                                )}
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <IdInputWithSelect
                                                                    label="GA4 Property ID"
                                                                    value={selectedStore?.ga4_property_id || ""}
                                                                    savedName={selectedStore?.ga4_property_name}
                                                                    onChange={(val) => {
                                                                        if (selectedStore) {
                                                                            setSelectedStore({ ...selectedStore, ga4_property_id: val })
                                                                        }
                                                                    }}
                                                                    showSaveButton={false}
                                                                    options={ga4Properties.map((prop: any) => ({
                                                                        id: prop.name,
                                                                        label: prop.displayName,
                                                                        subLabel: prop.name
                                                                    }))}
                                                                    disabled={!isGoogleConnected && !selectedStore?.google_refresh_token}
                                                                    placeholder="properties/..."
                                                                />

                                                                <IdInputWithSelect
                                                                    label="GBP Location ID"
                                                                    value={selectedStore?.gbp_location_id || ""}
                                                                    savedName={selectedStore?.gbp_location_name}
                                                                    onChange={(val) => {
                                                                        if (selectedStore) {
                                                                            setSelectedStore({ ...selectedStore, gbp_location_id: val })
                                                                        }
                                                                    }}
                                                                    showSaveButton={false}
                                                                    options={gbpLocations.map((loc: any) => ({
                                                                        id: loc.name,
                                                                        label: loc.title,
                                                                        subLabel: loc.name
                                                                    }))}
                                                                    disabled={!isGoogleConnected && !selectedStore?.google_refresh_token}
                                                                    placeholder="locations/..."
                                                                />
                                                            </div>

                                                            <div className="pt-6">
                                                                <Button
                                                                    onClick={async () => {
                                                                        if (!selectedStoreId || !selectedStore) return

                                                                        // Find names (labels) for selected IDs
                                                                        const metaAdAccountName = metaAdAccounts.find(a => a.id === selectedStore.meta_ad_account_id)?.name
                                                                        const metaCampaignName = metaCampaigns.find(c => c.id === selectedStore.meta_campaign_id)?.name
                                                                        const ga4PropertyName = ga4Properties.find(p => p.name === selectedStore.ga4_property_id)?.displayName
                                                                        const gbpLocationName = gbpLocations.find(l => l.name === selectedStore.gbp_location_id)?.title

                                                                        const secrets = {
                                                                            meta_ad_account_id: selectedStore.meta_ad_account_id || "",
                                                                            meta_ad_account_name: metaAdAccountName,
                                                                            meta_campaign_id: selectedStore.meta_campaign_id || "",
                                                                            meta_campaign_name: metaCampaignName,
                                                                            ga4_property_id: selectedStore.ga4_property_id || "",
                                                                            ga4_property_name: ga4PropertyName,
                                                                            gbp_location_id: selectedStore.gbp_location_id || "",
                                                                            gbp_location_name: gbpLocationName,
                                                                            google_refresh_token: pendingRefreshToken || undefined
                                                                        }

                                                                        const res = await updateStoreSecretsAction(selectedStoreId, secrets)
                                                                        if (res.success) {
                                                                            // If we saved the refresh token, clear the pending state to avoid resending? 
                                                                            // Actually keeping it is fine, it will just overwrite same value.
                                                                            toast({ title: "設定を保存しました" })

                                                                            // FIX: Update local stores state to persist changes when switching
                                                                            const updatedStore = {
                                                                                ...selectedStore,
                                                                                ...secrets
                                                                            }
                                                                            setSelectedStore(updatedStore)
                                                                            setStores(prev => prev.map(s => s.id === selectedStoreId ? { ...s, ...secrets } : s))
                                                                        } else {
                                                                            toast({ title: "保存エラー", description: res.error, variant: "destructive" })
                                                                        }
                                                                    }}
                                                                    className="w-full"
                                                                >
                                                                    <Save className="mr-2 h-4 w-4" />
                                                                    設定を保存
                                                                </Button>
                                                                <p className="text-xs text-muted-foreground mt-2 text-center">
                                                                    ※ APIキー以外の設定（Meta/Google ID等）はこのボタンで一括保存されます。
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </TabsContent>

                                            <TabsContent value="users" className="mt-4">
                                                <UserAssignmentManager
                                                    storeId={selectedStoreId}
                                                    storeName={selectedStore?.name || "選択された事業"}
                                                />
                                            </TabsContent>
                                        </Tabs>
                                    ) : (
                                        <div className="flex items-center justify-center h-64 text-muted-foreground border-2 border-dashed rounded-lg">
                                            管理する事業を選択してください
                                        </div>
                                    )}
                                </div>
                            </div>

                        </TabsContent>
                        <TabsContent value="user-management" className="pt-4">
                            <UserManagement />
                        </TabsContent>
                        <TabsContent value="system-admins" className="pt-4">
                            <ProviderAdminsManager />
                        </TabsContent>
                        <TabsContent value="system-settings" className="pt-4">
                            <SystemSettingsManager />
                        </TabsContent>
                    </Tabs>
                </div>
            </div >
        </div>
    )
}

function SystemSettingsManager() {
    const { toast } = useToast()
    const [settings, setSettings] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(false)
    const [openaiKey, setOpenaiKey] = useState("")

    useEffect(() => {
        loadSettings()
    }, [])

    const loadSettings = async () => {
        setLoading(true)
        const res = await getSystemSettingsAction()
        if (res.success && res.settings) {
            setSettings(res.settings)
            setOpenaiKey(res.settings.openai_api_key || "")
        }
        setLoading(false)
    }

    const handleSave = async () => {
        setLoading(true)
        const res = await updateSystemSettingsAction({
            openai_api_key: openaiKey
        })

        if (res.success) {
            toast({ title: "システム設定を保存しました" })
            loadSettings()
        } else {
            toast({ title: "保存エラー", description: res.error, variant: "destructive" })
        }
        setLoading(false)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>システム設定 (Global Config)</CardTitle>
                <CardDescription>
                    全ユーザー・全店舗に適用される共通設定です。<br />
                    各店舗で個別に設定がない場合、ここの設定が使用されます。
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="global-openai-key">Global OpenAI API Key</Label>
                    <div className="flex gap-2">
                        <Input
                            id="global-openai-key"
                            type="password"
                            value={openaiKey}
                            onChange={(e) => setOpenaiKey(e.target.value)}
                            placeholder="sk-..."
                        />
                        <Button onClick={handleSave} disabled={loading}>
                            {loading ? "保存中..." : "保存"}
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        ※ここに設定すると、APIキーを持っていない店舗でもAI機能が利用可能になります。
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}

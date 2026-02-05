
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function PrivacyPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <h1 className="text-3xl font-bold mb-6">プライバシーポリシー</h1>
            <p className="mb-4 text-sm text-gray-500">最終更新日: {new Date().toLocaleDateString('ja-JP')}</p>

            <div className="space-y-6">
                <section>
                    <h2 className="text-xl font-semibold mb-2">1. 個人情報の収集</h2>
                    <p>WINQER（以下「本サービス」）は、GoogleビジネスプロフィールAPIを通じて、ユーザーの店舗情報、インサイトデータ、クチコミ情報等を収集します。</p>
                </section>
                <section>
                    <h2 className="text-xl font-semibold mb-2">2. 情報の利用目的</h2>
                    <p>収集した情報は、以下の目的で利用します：</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>ダッシュボードでの分析・可視化</li>
                        <li>店舗情報の管理・更新</li>
                        <li>AIによる投稿文案の作成</li>
                        <li>サービスの改善および新機能の開発</li>
                    </ul>
                </section>
                <section>
                    <h2 className="text-xl font-semibold mb-2">3. 第三者への提供</h2>
                    <p>ユーザーの同意がある場合や法令に基づく場合を除き、取得した個人情報を第三者に提供することはありません。</p>
                </section>
                <section>
                    <h2 className="text-xl font-semibold mb-2">4. お問い合わせ</h2>
                    <p>本ポリシーに関するお問い合わせは、運営者までご連絡ください。</p>
                </section>
            </div>

            <div className="mt-8 pt-8 border-t">
                <Link href="/">
                    <Button variant="outline">トップページへ戻る</Button>
                </Link>
            </div>
        </div>
    )
}

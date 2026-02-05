
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function TermsPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <h1 className="text-3xl font-bold mb-6">利用規約</h1>
            <p className="mb-4 text-sm text-gray-500">最終更新日: {new Date().toLocaleDateString('ja-JP')}</p>

            <div className="space-y-6">
                <section>
                    <h2 className="text-xl font-semibold mb-2">1. 総則</h2>
                    <p>本規約は、WINQER（以下「本サービス」）の利用条件を定めるものです。</p>
                </section>
                <section>
                    <h2 className="text-xl font-semibold mb-2">2. Googleビジネスプロフィール連携</h2>
                    <p>本サービスはGoogleビジネスプロフィールの機能を利用します。ユーザーはGoogleの利用規約およびポリシーを遵守する必要があります。</p>
                </section>
                <section>
                    <h2 className="text-xl font-semibold mb-2">3. 禁止事項</h2>
                    <p>法令違反、公序良俗に反する行為、サービスの運営を妨害する行為等を禁止します。</p>
                </section>
                <section>
                    <h2 className="text-xl font-semibold mb-2">4. 免責事項</h2>
                    <p>本サービスの利用により生じた損害について、運営者は故意または重大な過失がない限り責任を負いません。</p>
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

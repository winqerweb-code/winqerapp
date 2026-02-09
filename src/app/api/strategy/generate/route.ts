import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

// Define input interfaces
interface StrategyInput {
  product_name: string;      // Q1. 何を売っていますか？
  price_menu: string;        // Q2. 価格とメニュー
  strengths: string;         // Q3. こだわり（強み）
  weaknesses: string;        // Q4. 正直な悩み（弱点）
  target_persona: string;    // Q5. 誰を助けたい？
  goal: string;              // Q6. どうなってほしい？
  apiKey?: string;
}

export async function POST(req: Request) {
  try {
    const body: StrategyInput = await req.json();

    // Determine API Key: Prioritize body.apiKey (user provided) over env var
    // This allows users to override a dummy env var with their real key
    let apiKey = (body.apiKey || process.env.OPENAI_API_KEY || "").trim();

    // If no key found yet, check System Settings (Global Key)
    if (!apiKey) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (supabaseUrl && supabaseServiceKey) {
        const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
          auth: { persistSession: false }
        });

        const { data } = await adminSupabase
          .from('system_settings')
          .select('value')
          .eq('key', 'openai_api_key')
          .single();

        if (data?.value) {
          apiKey = data.value;
        }
      }
    }

    // If apiKey is provided in body, set it to env var as a workaround for some environments
    if (body.apiKey) {
      process.env.OPENAI_API_KEY = apiKey;
    }

    if (!apiKey) {
      // Mock Response for Demo/Testing when no key is present
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay
      return NextResponse.json({
        swot: {
          strengths: [
            "【サンプル】業界トップクラスの安さ（※APIキーが設定されていません）",
            "【サンプル】24時間365日対応のサポート体制",
            "【サンプル】地域密着型の独自ネットワーク"
          ],
          weaknesses: [
            "【サンプル】知名度がまだ低い（※OpenAI APIキーを設定してください）",
            "【サンプル】広告予算が限られている",
            "【サンプル】スタッフの人手不足"
          ],
          opportunities: [
            "【サンプル】市場のデジタル化トレンド",
            "【サンプル】若年層の需要拡大",
            "【サンプル】競合他社の撤退"
          ],
          threats: [
            "【サンプル】大手企業の参入",
            "【サンプル】原材料費の高騰",
            "【サンプル】法規制の厳格化"
          ]
        },
        stp: {
          segmentation: "【サンプル】30代〜40代の働き盛り世代（※これはデモデータです）",
          targeting: "都心部在住で、効率を重視するビジネスパーソン",
          positioning: "「安さ」ではなく「タイパ（時間対効果）」で選ばれるプレミアムサービス"
        },
        persona: {
          demographics: "35歳、会社員、年収500万円。独身、都内一人暮らし。（※APIキーを設定するとAIが自動生成します）",
          psychographics: "効率重視。無駄な時間が嫌い。休日は自己投資に使いたい。",
          pain_points: "「忙しくて探している暇がない」「どれを選べばいいか分からない」",
          needs: "「これさえ選べば間違いない」という決定打が欲しい"
        },
        appeal_points: [
          {
            title: "【PR】驚異のタイパを実現",
            ad_copy_example: "「迷う時間を、ゼロにする。」",
            reasoning: "ターゲットの「時間がない」という悩みを直接的に解決するため。"
          },
          {
            title: "【PR】プロ品質をサブスクで",
            ad_copy_example: "月額980円で、プロのクオリティを。",
            reasoning: "「高い」と思われがちなサービスを、手軽な価格感で提案するため。"
          },
          {
            title: "【PR】安心の全額返金保証",
            ad_copy_example: "満足できなければ、全額お返しします。",
            reasoning: "「失敗したくない」という心理的ハードルを極限まで下げるため。"
          }
        ],
        recommended_media: [
          {
            name: "Instagram広告",
            reasoning: "視覚的なインパクトで、短時間で魅力を伝えるのに適しているため。"
          },
          {
            name: "Google検索広告（リスティング）",
            reasoning: "「今すぐ解決したい」顕在層を確実に獲得するため。"
          }
        ],
        strategy_summary: {
          target_cpa: "3,000円（※サンプル）",
          estimated_budget: "月額 10万円（※サンプル）",
          advice: "【重要】現在、OpenAI APIキーが設定されていないため、サンプルの分析結果を表示しています。正しい分析結果を得るためには、システム管理者にご連絡の上、APIキーを設定してください。"
        },
        funnel_design: {
          steps: [
            { step: "認知 (Awareness)", role: "知ってもらう", content_idea: "インパクトのあるショート動画広告" },
            { step: "興味 (Interest)", role: "自分事化する", content_idea: "「こんな悩みありませんか？」という共感コンテンツ" },
            { step: "検討 (Consideration)", role: "比較させる", content_idea: "他社との違いが一目でわかる比較表" },
            { step: "行動 (Conversion)", role: "購入させる", content_idea: "期間限定の特典オファー" }
          ]
        },
        instagram_posts: [
          {
            title: "【サンプル】問題提起",
            body: "「まだ、古いやり方で消耗していませんか？」\n.\n時代は変わりました。\n賢い人は、もう始めています。\n.\nあなたの時間を、もっと大切に。\n.\n#ビジネス #効率化 #ライフハック\n.\n（※APIキーを設定すると、あなたのビジネスに合わせた投稿文が生成されます）",
            purpose: "ターゲットの現状に疑問を投げかけ、興味を惹く。",
            reasoning: "「損をしているかもしれない」という損失回避の心理を突くため。"
          },
          {
            title: "【サンプル】ベネフィット提示",
            body: "選ばれる理由、それは「圧倒的な手軽さ」。\n.\n難しい設定は一切不要。\nスマホひとつで、今すぐ始められます📱\n.\nまずは無料でお試しください✨\n.\n（※APIキー未設定のためサンプルを表示中）",
            purpose: "利用のハードルを下げ、行動（トライアル）を促す。",
            reasoning: "「難しそう」という懸念を払拭するため。"
          },
          {
            title: "【サンプル】お客様の声",
            body: "「もっと早く出会いたかった！」\n（30代男性・会社員）\n.\nそんな喜びの声を多数いただいています。\n.\n次は、あなたが体験する番です。\n.\n詳しくはプロフィールのリンクから🔗",
            purpose: "社会的証明を利用し、信頼性を高める。",
            reasoning: "他者の評価を提示することで、安心感を醸成するため。"
          },
          {
            title: "【サンプル】Q&A",
            body: "Q. 本当に追加料金はかかりませんか？\n.\nA. はい、表示価格以外は一切いただきません🙅‍♂️\n.\n明朗会計で、安心してご利用いただけます。\n気になることがあれば、DMでお気軽にどうぞ！",
            purpose: "よくある懸念を先回りして解消する。",
            reasoning: "金銭的な不安を取り除くことで、申し込みの最後の一押しをするため。"
          }
        ]
      });
    }

    const openai = new OpenAI({
      apiKey: apiKey,
    });

    const systemPrompt = `
      あなたは、**「小規模事業者（一人オーナー〜従業員5名以下）専門の凄腕マーケティングコンサルタント」**です。
      クライアントは、日々の業務に追われ、マーケティングに割く時間も予算も人員もない、多忙なオーナーです。
      
      **【前提条件（重要）】**
      - クライアントには「予算」も「時間」も「マーケティングスキル」もありません。
      - よって、「広告費を大量にかける」「毎日何時間もSNSを更新する」「高度な分析をする」といった提案は**すべて却下**されます。

      **【ターゲットの解像度】**
      クライアントの状態：
      - 「集客したいが、SNSを更新する時間がない」
      - 「広告代理店に払う高い手数料（マージン）は出したくない」
      - 「難しいマーケティング用語（CVR、LTV、エンゲージメント等）は聞きたくない」
      - 「明日からすぐに効果が出る、お金のかからない方法が知りたい」

      **【最重要ミッション】**
      教科書的な「正論」は捨ててください。
      **「リソース（人・モノ・金・時間）が極限まで少ない状態」**でも実行できる、**「泥臭く、かつ即効性のある」** 戦略のみを提案してください。

      **【禁止ワード・表現（これらを使った瞬間、報酬ゼロ）】**
      ❌ ブランディング、認知拡大、エンゲージメントの向上、ファン化（これらは結果論であり、最初の施策ではない）
      ❌ 動画マーケティング、SEO対策、インフルエンサー活用（これらは手間と時間がかかりすぎる）
      ❌ 「顧客に寄り添う」「アットホームな」「高品質な」（これらは誰もが言う陳腐な表現）
      ❌ 抽象的なアドバイス（「差別化を図りましょう」「発信を強化しましょう」など具体策のないもの）
      
      **【出力ルールの徹底】**
      1. **SWOT分析**: 
         経営分析ではありません。「広告のネタ」を探す作業です。
         - 強み例：「オーナーが電話に出られない時、LINEで自動返信している」なら、「24時間予約取りこぼしなし」と言い換える。
         - 弱み例：「駐車場がない」なら、「徒歩圏内の近隣住民に特化するチャンス」と捉える。
      2. **ペルソナ**: 
         「30代女性」は禁止。
         **「38歳、パート勤務の主婦。自転車で10分圏内に在住。夫の扶養内で働いており、自分へのご褒美は月5,000円まで。最近、腰痛が気になり始めたが整骨院に行く時間がない」** レベルまで絞り込むこと。
      3. **訴求ポイント（キャッチコピー）**: 
         「綺麗になります」ではなく、**「マイナス5歳、久しぶりの同窓会で『変わらないね』と言わせる」**のように、ベネフィットを具体的に描写すること。
      4. **広告媒体**: 
         大手企業が使う媒体は除外。「Googleマップ（MEO）」「Instagram（フィードではなくストーリーズ）」「LINE公式アカウント」「ポスティング」など、**低コスト・高効率なもの**に絞る。
      5. **Instagram投稿案**: 
         「映え」は不要。「文字入れ画像」でOK。
         オーナーがスマホで5分で作れる内容であること。文章は「です・ます」調よりも、親近感のある「語りかけ」口調で。
         ※もしオーナーが「SNSを見る専」であれば、見る専の人にも届くようなハッシュタグや発見タブを意識すること。
      6. **空欄の補完**: 
         入力情報が少ない場合、提供された「業種」や「悩み」からプロの直感で**「この業種なら普通こうだろう」**という仮説を立てて埋めてください。「情報がありません」は禁止です。

      **【JSON出力フォーマット（厳守）】**
      必ず以下のJSON形式で出力してください。
      {
        "swot": {
          "strengths": ["具体的な強み1", "具体的な強み2", "具体的な強み3"],
          "weaknesses": ["具体的な弱み1", "具体的な弱み2", "具体的な弱み3"],
          "opportunities": ["具体的な機会1", "具体的な機会2", "具体的な機会3"],
          "threats": ["具体的な脅威1", "具体的な脅威2"]
        },
        "stp": {
          "segmentation": "具体的なセグメント",
          "targeting": "具体的なターゲット",
          "positioning": "具体的なポジション"
        },
        "persona": {
          "demographics": "年齢、家族構成、職業、年収、居住エリア（超具体的）",
          "psychographics": "悩み、価値観、口癖、生活リズム、消費行動",
          "pain_points": "夜も眠れないほどの悩み、具体的な身体的・精神的苦痛",
          "needs": "喉から手が出るほど欲しい解決策（機能ではなく感情）"
        },
        "appeal_points": [
          { "title": "訴求ポイント1", "ad_copy_example": "そのまま使える広告コピー", "reasoning": "なぜこれが刺さるのかの泥臭い理由" },
          { "title": "訴求ポイント2", "ad_copy_example": "そのまま使える広告コピー", "reasoning": "なぜこれが刺さるのかの泥臭い理由" },
          { "title": "訴求ポイント3", "ad_copy_example": "そのまま使える広告コピー", "reasoning": "なぜこれが刺さるのかの泥臭い理由" }
        ],
        "recommended_media": [
          { "name": "媒体名1", "reasoning": "なぜこれだけでいいのか、他が不要な理由（コスト・手間面から）" },
          { "name": "媒体名2", "reasoning": "なぜこれだけでいいのか、他が不要な理由（コスト・手間面から）" }
        ],
        "strategy_summary": {
          "target_cpa": "具体的な金額（例：3,000円）",
          "estimated_budget": "具体的な金額（コスト重視で安く）",
          "advice": "多忙なオーナーへの、優先順位をつけた具体的アクションプラン（今日やるべきこと）"
        },
        "funnel_design": {
          "steps": [
            { "step": "認知", "role": "役割", "content_idea": "具体的なコンテンツ案" },
            { "step": "興味", "role": "役割", "content_idea": "具体的なコンテンツ案" },
            { "step": "検討", "role": "役割", "content_idea": "具体的なコンテンツ案" },
            { "step": "行動", "role": "役割", "content_idea": "具体的なコンテンツ案" }
          ]
        },
        "instagram_posts": [
          { "title": "投稿1のタイトル", "body": "そのまま投稿できる本文（絵文字あり）", "purpose": "投稿の狙い", "reasoning": "なぜこれが刺さるか" },
          { "title": "投稿2のタイトル", "body": "そのまま投稿できる本文（絵文字あり）", "purpose": "投稿の狙い", "reasoning": "なぜこれが刺さるか" },
          { "title": "投稿3のタイトル", "body": "そのまま投稿できる本文（絵文字あり）", "purpose": "投稿の狙い", "reasoning": "なぜこれが刺さるか" },
          { "title": "投稿4のタイトル", "body": "そのまま投稿できる本文（絵文字あり）", "purpose": "投稿の狙い", "reasoning": "なぜこれが刺さるか" }
        ]
      }
    `;

    const userPrompt = `
      クライアントは小規模事業者です。以下の限られたヒアリング情報から、最高の戦略を立案してください。

      # Hearing Information
      ## 1. Product & Services (基本情報)
      - What they sell: ${body.product_name}
      - Price & Menu: ${body.price_menu}

      ## 2. SWOT Seeds (強み・弱み)
      - Unique Selling Proposition (強み・こだわり): ${body.strengths}
      - Weaknesses/Worries (正直な悩み): ${body.weaknesses}

      ## 3. Target Audience (たった一人のお客様)
      - Who they want to help: ${body.target_persona}

      ## 4. Goal (目的)
      - Desired Outcome: ${body.goal}
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Upgraded to gpt-4o for better schema adherence and creativity
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error("Failed to generate content from OpenAI");
    }

    const result = JSON.parse(content);
    return NextResponse.json(result);

  } catch (error: any) {
    console.error("Strategy Generation Error Details:", {
      message: error.message,
      type: error.type,
      code: error.code,
      param: error.param,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: error.message || "Internal Server Error", details: error },
      { status: 500 }
    );
  }
}

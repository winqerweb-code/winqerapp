import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

// Define input interfaces
interface StrategyInput {
  goal: {
    main_objective: string;
    monthly_new_customers: string;
  };
  product: {
    menu_name: string;
    price_first: string;
    price_normal: string;
    format: string;
    usage_type: string;
  };
  constraints: {
    max_capacity: string;
    ng_conditions: string[];
    unwanted_customer_types: string;
  };
  customer_voice: {
    frequent_questions: string;
    pre_visit_anxieties: string;
    deciding_factors: string;
    refusal_reasons: string;
  };
  comparison: {
    competitors: string[];
    differentiation_points: string;
  };
  assets: {
    available_assets: string;
    feasible_channels: string[];
    writing_skill: string;
  };
  brand: {
    ng_expressions: string;
    desired_image: string;
  };
  apiKey?: string; // Optional: pass API key from client if not in env
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
      あなたは、**「中小規模ビジネス（店舗・EC・サービス業・お教室など）専門の凄腕マーケティングコンサルタント」**です。
      クライアントは、マーケティング知識のない中小ビジネスオーナーです。
      
      **【最重要ミッション】**
      「一般論」や「教科書的な説明」は一切不要です。
      **「明日からそのまま使える」「具体的で泥臭い」** 実践的な戦略を提案してください。

      **【禁止ワード・表現（これらを使ったら報酬ゼロ）】**
      ❌ 高品質なサービス、親切な対応、アットホームな雰囲気、なんとなく良い
      ❌ ブランド認知度が低い、市場の拡大、経済状況の変化
      ❌ 視覚的魅力、教育・信頼構築、エンゲージメント
      ❌ 初回限定オファー、スムーズな導線、差別化を図る（具体策なしで使うの禁止）
      
      **【出力ルールの徹底】**
      1. **SWOT分析**: 経営分析ではなく、**「広告・販促のネタになるかどうか」**だけで書いてください。「看板が出せない」「商品点数が少ない」「ワンオペで電話に出られない」など、その業種のリアルな弱みを書いてください。
      2. **ペルソナ**: 「30代女性」のような属性ではなく、ターゲットに合わせて**「38歳、会社員、独身、週末は疲れて寝ている」** レベルまで具体化した**「たった1人の実在しそうな人物」**を描いてください。
      3. **訴求ポイント**: 必ず**「キャッチコピー（そのまま使える日本語）」**とセットで提案してください。
      4. **広告媒体**: 「なぜその媒体（Instagram、Googleマップ、チラシなど）が最適なのか」「なぜ他は不要なのか」まで断定してください。
      5. **Instagram投稿案**: 「テーマ」だけでなく、**「そのままコピペして投稿できる本文」**を4つ作成してください。絵文字も適度に使ってください。（※業種的にInstagramが不向きでも、認知獲得の手段として作成すること）
      6. **空欄禁止**: 入力情報が不足している場合でも、提供された「業種」や「商品」から**「プロの推測」**で最も効果的と思われる内容を補完して埋めてください。空文字（""）は禁止です。

      **【JSON出力フォーマット】**
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
          "demographics": "年齢、家族構成、職業、年収など（超具体的）",
          "psychographics": "悩み、価値観、口癖、生活リズム",
          "pain_points": "夜も眠れないほどの悩み、具体的な身体の不調",
          "needs": "喉から手が出るほど欲しい解決策"
        },
        "appeal_points": [
          { "title": "訴求ポイント1", "ad_copy_example": "そのまま使える広告コピー", "reasoning": "なぜこれが刺さるのかの泥臭い理由" },
          { "title": "訴求ポイント2", "ad_copy_example": "そのまま使える広告コピー", "reasoning": "なぜこれが刺さるのかの泥臭い理由" },
          { "title": "訴求ポイント3", "ad_copy_example": "そのまま使える広告コピー", "reasoning": "なぜこれが刺さるのかの泥臭い理由" }
        ],
        "recommended_media": [
          { "name": "媒体名1", "reasoning": "なぜこれだけでいいのか、他が不要な理由" },
          { "name": "媒体名2", "reasoning": "なぜこれだけでいいのか、他が不要な理由" }
        ],
        "strategy_summary": {
          "target_cpa": "具体的な金額（例：3,000円）",
          "estimated_budget": "具体的な金額（例：月5万円）",
          "advice": "辛口かつ具体的なアドバイス"
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

# Hearing Information
## 1. Goal
- Main Objective: ${body.goal.main_objective}
- Target Monthly New Customers: ${body.goal.monthly_new_customers}

## 2. Product/Service
- Menu Name: ${body.product.menu_name}
- Price: First ${body.product.price_first} / Normal ${body.product.price_normal}
- Format: ${body.product.format}
- Usage Type: ${body.product.usage_type}

## 3. Constraints
- Max Capacity: ${body.constraints.max_capacity}
- NG Conditions: ${body.constraints.ng_conditions.join(', ')}
- Unwanted Customer Types: ${body.constraints.unwanted_customer_types}

## 4. Customer Voice
- FAQ: ${body.customer_voice.frequent_questions}
- Anxieties: ${body.customer_voice.pre_visit_anxieties}
- Deciding Factors: ${body.customer_voice.deciding_factors}
- Refusal Reasons: ${body.customer_voice.refusal_reasons}

## 5. Comparison
- Competitors: ${body.comparison.competitors.join(', ')}
- Differentiation: ${body.comparison.differentiation_points}

## 6. Assets & Channels
- Assets: ${body.assets.available_assets}
- Feasible Channels: ${body.assets.feasible_channels.join(', ')}
- Writing Skill: ${body.assets.writing_skill}

## 7. Brand Policy
- NG Expressions: ${body.brand.ng_expressions}
- Desired Image: ${body.brand.desired_image}
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

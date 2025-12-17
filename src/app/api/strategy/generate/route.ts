import { NextResponse } from 'next/server';
import OpenAI from 'openai';

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
            "「温活よもぎ蒸し＋全身リンパ90分（5,500円）」という具体的で分かりやすい体験型メニューがある",
            "完全貸切のプライベートサロンで、他のお客様と顔を合わせる心配が一切ない",
            "その日の体調や気分に合わせて、数種類のハーブから最適なものを提案できる"
          ],
          weaknesses: [
            "マンションの一室で看板が出せず、通りがかりの認知がゼロ",
            "広告費に月3万円までしか使えないため、大手のような大量露出ができない",
            "スタッフが1人だけなので、電話対応や急な予約変更に対応しきれない"
          ],
          opportunities: [
            "近隣の競合店が「高額コース契約」中心で、都度払いを求める層が流れてきている",
            "「サウナ」ブームにより、「整う」体験へのハードルが下がっている",
            "リモートワーク疲れで「誰とも話さずリラックスしたい」という需要が増えている"
          ],
          threats: [
            "近隣に大手チェーンの格安マッサージ店（60分2980円）がオープンした",
            "美容医療（ハイフ・ボトックス）の低価格化で、エステの効果に疑問を持つ人が増えた"
          ]
        },
        stp: {
          segmentation: "「肌をきれいにしたいが、美容医療は怖い」「大手サロンの勧誘が苦手」な30代後半〜40代女性",
          targeting: "サロンから半径2km圏内に住む、仕事と家庭の両立で自分の時間が取れない主婦・パート層",
          positioning: "「結果」よりも「心身の解放」を重視する、隠れ家リトリートサロン"
        },
        persona: {
          demographics: "38歳女性、パート勤務（週4日）、夫と小学生の子供2人。世帯年収600万円。",
          psychographics: "「最近、鏡を見るのが憂鬱」「自分のためにお金を使うことに罪悪感がある」。でも、たまには誰にも邪魔されずボーッとしたい。",
          pain_points: "「高い化粧品を使っても効果が分からない」「エステに行きたいが、コース契約を迫られるのが怖い」",
          needs: "「1回でスッキリしたい」「勧誘なしで都度払い通いたい」「すっぴんで帰れる距離がいい」"
        },
        appeal_points: [
          {
            title: "勧誘一切なしの都度払い制",
            ad_copy_example: "「コース契約はしません」宣言。行きたい時だけ、5,500円で。",
            reasoning: "ターゲットは過去に大手サロンの勧誘で嫌な思いをした経験があるため、「契約なし」が最大の安心材料になる。"
          },
          {
            title: "誰とも会わない完全貸切",
            ad_copy_example: "すっぴんで来て、すっぴんで帰る。誰にも会わない隠れ家サロン。",
            reasoning: "近所の知り合いに会いたくない、着飾って行くのが面倒という「ご近所需要」に刺さる。"
          },
          {
            title: "選べるハーブのオーダーメイド",
            ad_copy_example: "「今日は眠りたい」「スッキリしたい」その日の気分でハーブを調合。",
            reasoning: "「私のために選んでくれた」という特別感が、大手チェーンとの明確な差別化になる。"
          }
        ],
        recommended_media: [
          {
            name: "Instagram広告（フィード・ストーリーズ）",
            reasoning: "視覚的な「癒やし」の雰囲気を伝えるのに最適。エリア指定配信で近隣住民に絞れば、無駄な広告費を抑えられる。"
          },
          {
            name: "Googleマップ（MEO対策）",
            reasoning: "「近くのエステ」「よもぎ蒸し [地域名]」で検索する顕在層を無料で獲得できる必須ツール。"
          }
        ],
        strategy_summary: {
          target_cpa: "3,000円 〜 4,000円",
          estimated_budget: "月額 30,000円 〜 50,000円",
          advice: "まずはInstagram広告で「近所の隠れ家」としての認知を広げ、Googleマップの口コミで信頼を獲得する2軸展開が最適です。チラシやフリーペーパーは費用対効果が悪いため不要です。"
        },
        funnel_design: {
          steps: [
            { step: "認知 (Awareness)", role: "「近所にこんな場所があったんだ」と気づかせる", content_idea: "Instagram広告：施術中の湯気やリラックスした表情の写真" },
            { step: "興味 (Interest)", role: "「私に必要かも」と思わせる", content_idea: "Instagramフィード：「更年期のイライラ、我慢していませんか？」という悩み共感投稿" },
            { step: "検討 (Consideration)", role: "「行かない理由」を潰す", content_idea: "ハイライト：「勧誘しません」「駐車場あり」「都度払いOK」の明記" },
            { step: "行動 (Conversion)", role: "迷わず予約させる", content_idea: "プロフィール直下の「LINE予約」リンク。空き状況をカレンダーで表示。" }
          ]
        },
        instagram_posts: [
          {
            title: "悩み共感・問題提起",
            body: "「最近、なんとなくイライラする…」\nそれ、頑張りすぎのサインかもしれません。\n.\n家族のために、仕事のために。\n自分のことは後回しになっていませんか？\n.\n当サロンは、そんなあなたのための「逃げ込み場所」です。\n.\n90分だけ、スマホを置いて。\nハーブの香りに包まれて、何もしない贅沢を。\n.\n明日からまた頑張るために、\n今日は自分を甘やかしてください。\n.\n#地域名エステ #よもぎ蒸し #自律神経ケア",
            purpose: "潜在的な不調に気づかせ、「自分のための時間」の正当性を伝える。",
            reasoning: "ターゲットは「自分のケア」に罪悪感を持ちがち。それを「明日への活力」と肯定することで来店ハードルを下げる。"
          },
          {
            title: "メニュー紹介・ベネフィット",
            body: "【人気No.1】温活よもぎ蒸し＋全身リンパ（90分）\n.\n「終わった後のスッキリ感が違う！」\nとリピート続出の看板メニューです🌿\n.\n① カウンセリングで今日の体調をチェック\n② あなただけのハーブを調合\n③ 30分のよもぎ蒸しで大量発汗\n④ 60分の全身リンパで老廃物を流す\n.\n通常12,000円 → 初回限定 5,500円✨\n.\n「インスタ見た」でご予約ください。\n無理な勧誘は一切ありませんのでご安心を☺️",
            purpose: "具体的な施術の流れと価格を伝え、安心感を与える。",
            reasoning: "「何をするのか分からない」不安を解消。初回価格と「勧誘なし」を明記して予約の最後の一押しをする。"
          },
          {
            title: "お客様の声・信頼獲得",
            body: "「もっと早く来ればよかった！」\n（30代後半・パート勤務のお客様）\n.\n以前、大手サロンで高額なコースを勧められて\nエステが怖くなってしまったそうです😢\n.\n当サロンは「完全都度払い」。\n行きたい時に、行きたいだけ。\n.\n「ここなら安心して通える」\nと言っていただけて本当に嬉しいです✨\n.\nあなたも、美容室に行く感覚で\n気軽にメンテナンスしに来ませんか？",
            purpose: "ターゲットと同じ境遇の人の声を使い、共感と信頼を得る。",
            reasoning: "「大手での勧誘トラウマ」というターゲットの具体的な不安に対して、実際の顧客の声で反論する。"
          },
          {
            title: "Q&A・不安解消",
            body: "Q. すっぴんで行っても大丈夫ですか？\n.\nA. もちろんです！🙆‍♀️\nむしろ、すっぴんでいらしてください。\n.\n当サロンは完全貸切のプライベート空間。\n他のお客様と顔を合わせることはありません。\n.\nパジャマのような楽な格好で来て、\n施術後はそのまま帰宅して寝るだけ…\nそんな使い方ができるのも、ご近所サロンならでは🏠\n.\nお仕事帰りや、家事の合間に。\n気取らずにお越しくださいね。",
            purpose: "来店時の服装や他人の目という、地味だが大きなハードルを下げる。",
            reasoning: "「着飾っていくのが面倒」というインサイトを突き、近所ならではの気軽さをアピールする。"
          }
        ]
      });
    }

    const openai = new OpenAI({
      apiKey: apiKey,
    });

    const systemPrompt = `
      あなたは、**「個人経営の店舗ビジネス（美容室、エステ、整体など）専門の凄腕マーケティングコンサルタント」**です。
      クライアントは、マーケティング知識のない1人オーナーです。
      
      **【最重要ミッション】**
      「一般論」や「教科書的な説明」は一切不要です。
      **「明日からそのまま使える」「具体的で泥臭い」** 実践的な戦略を提案してください。

      **【禁止ワード・表現（これらを使ったら報酬ゼロ）】**
      ❌ 高い技術力、親しみやすいスタッフ、アットホームな雰囲気
      ❌ ブランド認知度が低い、市場の拡大、経済状況の変化
      ❌ 視覚的魅力、教育・信頼構築、エンゲージメント
      ❌ 初回限定オファー、スムーズな導線、差別化を図る
      
      **【出力ルールの徹底】**
      1. **SWOT分析**: 経営分析ではなく、**「広告のネタになるかどうか」**だけで書いてください。「看板が出せない」「電話に出られない」など、リアルな弱みを書いてください。
      2. **ペルソナ**: 「30代女性」のような属性ではなく、**「38歳、パート週4、子供2人、最近夫と会話がない」** レベルまで具体化した**「たった1人の実在しそうな人物」**を描いてください。
      3. **訴求ポイント**: 必ず**「キャッチコピー（そのまま使える日本語）」**とセットで提案してください。
      4. **広告媒体**: 「なぜInstagramだけでいいのか」「なぜチラシは不要なのか」まで断定してください。
      5. **Instagram投稿案**: 「テーマ」だけでなく、**「そのままコピペして投稿できる本文」**を4つ作成してください。絵文字も適度に使ってください。
      6. **空欄禁止**: 入力情報が不足している場合でも、**「プロの推測」**で最も効果的と思われる内容を補完して埋めてください。空文字（""）は禁止です。

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

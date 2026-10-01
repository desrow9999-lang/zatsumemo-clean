import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ reply: 'OPENAI_API_KEY が環境変数に設定されていません。' }, { status: 500 });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ` + apiKey,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // 高速かつ非常に安定した賢いモデル
        messages: [
          {
            role: 'system',
            content: 'あなたはユーザーのメモを深掘りし、ポジティブで建設的なひらめきやアドバイスを日本語で3〜4文程度で短く返す優秀なアシスタントです。'
          },
          {
            role: 'user',
            content: `以下のメモに対してひらめきをください。\n\nメモ: 「${text}」`
          }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API Error:', data);
      throw new Error(data.error?.message || 'OpenAI API failed');
    }

    const reply = data.choices[0]?.message?.content?.trim() || 'ひらめきが得られませんでした。';

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('Catch Error:', error);
    return NextResponse.json({ reply: `エラーが発生しました: ${error.message || '不明なエラー'}` }, { status: 500 });
  }
}

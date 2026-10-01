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
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'あなたはユーザーのメモを鋭く深掘りし、さらに調べるための検索の視点や、ポジティブで建設的なひらめきを日本語で3〜4文程度でスマートに返すアシスタントです。「〜のひらめき：」といった固定の肩書は出力せず、内容だけを簡潔に返してください。'
          },
          {
            role: 'user',
            content: `以下のメモに対して、深掘りの視点や検索のヒントを含めたひらめきをください。\n\nメモ: 「${text}」`
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

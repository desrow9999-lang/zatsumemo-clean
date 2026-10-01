import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ reply: 'GEMINI_API_KEY が環境変数に設定されていません。' }, { status: 500 });
    }

    // 確実に動作するモデル名（gemini-1.5-flash）を指定して直接fetch
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `以下のユーザーのメモに対して、ポジティブで建設的なひらめきや深掘りのアドバイスを日本語で3〜4文程度で短く返してください。\n\nメモ: 「${text}」`
              }
            ]
          }
        ]
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API Error Details:', data);
      throw new Error(data.error?.message || 'Gemini API failed');
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'ひらめきが得られませんでした。';

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('Catch Error:', error);
    return NextResponse.json({ reply: `エラーが発生しました: ${error.message || '不明なエラー'}` }, { status: 500 });
  }
}

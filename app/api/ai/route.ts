import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ reply: 'GEMINI_API_KEY が設定されていません。' }, { status: 500 });
    }

    // Google Gen AI SDKの初期化
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `以下のユーザーのメモに対して、ポジティブで建設的なひらめきや深掘りのアドバイスを日本語で3〜4文程度で短く返してください。\n\nメモ: 「${text}」`;

    // 安定して利用できるモデル名を指定
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const reply = response.text ? response.text.trim() : 'ひらめきが得られませんでした。';

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ reply: `エラーが発生しました: ${error.message || '不明なエラー'}` }, { status: 500 });
  }
}

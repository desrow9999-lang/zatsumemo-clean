import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ reply: 'OPENAI_API_KEY が設定されていません。' }, { status: 500 });
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
            content: 'あなたはユーザーのメモを深掘りし、役立つひらめきや検索の視点を返すアシスタントです。必ずJSON形式で、以下の2つのキーを含めて日本語で返してください。「reply」には3〜4文のひらめき・深掘り文章、「keyword」には楽天市場で関連アイテムを探すための最適な検索キーワード（1〜2単語程度）を入れてください。例: {"reply": "...", "keyword": "おにぎり 具材"}'
          },
          {
            role: 'user',
            content: `以下のメモに対してひらめきをください。\n\nメモ: 「${text}」`
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'OpenAI API failed');
    }

    const content = JSON.parse(data.choices[0]?.message?.content?.trim() || '{}');
    
    return NextResponse.json({
      reply: content.reply || 'ひらめきが得られませんでした。',
      keyword: content.keyword || text,
    });
  } catch (error: any) {
    console.error('Catch Error:', error);
    return NextResponse.json({ reply: `エラーが発生しました: ${error.message || '不明なエラー'}`, keyword: '' }, { status: 500 });
  }
}

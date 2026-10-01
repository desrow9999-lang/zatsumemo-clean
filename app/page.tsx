'use client';

import { useState, useEffect } from 'react';

interface Memo {
  id: string;
  text: string;
  timestamp: string;
  aiReply?: string;
}

export default function Home() {
  const [content, setContent] = useState('');
  const [memos, setMemos] = useState<Memo[]>([]);

  // 最初に開いたとき、保存されているメモを読み込む
  useEffect(() => {
    const saved = localStorage.getItem('zatsumemo_memos');
    if (saved) {
      try {
        setMemos(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    } else {
      // 初期メモ
      setMemos([
        {
          id: '1',
          text: 'サクッと書いたアイデアの断片。ここからひらめきが広がる。',
          timestamp: '2026.10.01 09:30',
          aiReply: 'シンプルイズベスト！そこから意外な大発見が生まれるかも。',
        }
      ]);
    }
  }, []);

  // メモが更新されたらブラウザに保存する
  const saveToStorage = (newMemos: Memo[]) => {
    setMemos(newMemos);
    localStorage.setItem('zatsumemo_memos', JSON.stringify(newMemos));
  };

  // メモの内容に応じた簡単なAIのひらめき生成ロジック
  const generateAiReply = (text: string) => {
    const replies = [
      `「${text}」……ほう、面白い着眼点ですね。深掘りしてみる価値あり！`,
      `それ、もしかして新しいプロジェクトの芽かもしれませんよ 🌱`,
      `シンプルだけど本質を突いてますね。明日には形にできるかも？`,
      `お、冴えてますね！その調子でどんどん雑に書き留めていきましょう。`,
      `AI的にもかなり気になるキーワードです。詳しくメモを足していきますか？`
    ];
    // ランダムに1つ選ぶ
    return replies[Math.floor(Math.random() * replies.length)];
  };

  const handleSave = () => {
    if (!content.trim()) return;
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    const timestamp = `${year}.${month}.${day} ${hours}:${minutes}`;
    const aiReply = generateAiReply(content);
    
    const newMemo: Memo = {
      id: Date.now().toString(),
      text: content,
      timestamp,
      aiReply,
    };

    saveToStorage([newMemo, ...memos]);
    setContent('');
  };

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      color: '#0f172a',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <div style={{ width: '100%', maxWidth: '500px' }}>
        
        {/* ヘッダー */}
        <header style={{ marginBottom: '24px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '800', letterSpacing: '-0.025em', marginBottom: '4px', color: '#1e293b' }}>
            ザツメモ
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            足跡とひらめきを連れてくるAIノート
          </p>
        </header>

        {/* 入力エリア */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '16px',
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e2e8f0',
          marginBottom: '24px'
        }}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="いま何を考えてる？雑に書いてみよう..."
            style={{
              width: '100%',
              height: '120px',
              padding: '12px',
              borderRadius: '12px',
              border: '1px solid #cbd5e1',
              fontSize: '15px',
              outline: 'none',
              resize: 'none',
              backgroundColor: '#f8fafc',
              color: '#1e293b',
              boxSizing: 'border-box',
              marginBottom: '12px'
            }}
          />
          <button
            onClick={handleSave}
            style={{
              width: '100%',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              padding: '12px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(15, 23, 42, 0.1)'
            }}
          >
            メモを残す（足跡つき）
          </button>
        </div>

        {/* メモ一覧（タイムライン） */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            最近の足跡
          </h2>
          {memos.map((memo) => (
            <div key={memo.id} style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
            }}>
              <p style={{ fontSize: '15px', lineHeight: '1.5', marginBottom: '12px', whiteSpace: 'pre-wrap' }}>
                {memo.text}
              </p>

              {/* AIからのひらめき返信 */}
              {memo.aiReply && (
                <div style={{
                  backgroundColor: '#f1f5f9',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  fontSize: '13px',
                  color: '#334155',
                  marginBottom: '10px',
                  borderLeft: '3px solid #0f172a',
                  lineHeight: '1.4'
                }}>
                  <span style={{ fontWeight: '700', marginRight: '4px' }}>💡 AIのひらめき:</span>
                  {memo.aiReply}
                </div>
              )}

              <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>👣</span>
                <span>{memo.timestamp}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}

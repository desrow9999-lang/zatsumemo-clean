'use client';

import { useState, useEffect } from 'react';

interface Memo {
  id: string;
  text: string;
  aiReply?: string;
  rakutenKeyword?: string;
  createdAt: string;
  isAnalyzing?: boolean;
}

export default function Home() {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [inputText, setInputText] = useState('');
  const [tickets, setTickets] = useState<number>(3); // 初期無料チケット3回

  // 104c3008.67310065.104c3009.a677faf7
  const RAKUTEN_AFFILIATE_ID = 'あなたの楽天アフィリエイトID';

  // https://buy.stripe.com/9B64gy95AfDbfRxfDoeZ20n
  const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/9B64gy95AfDbfrXfDoEZ20n';

  useEffect(() => {
    // メモとチケット残数の読み込み
    const savedMemos = localStorage.getItem('zatsumemo_memos');
    if (savedMemos) {
      try { setMemos(JSON.parse(savedMemos)); } catch (e) { console.error(e); }
    }

    const savedTickets = localStorage.getItem('zatsumemo_tickets');
    if (savedTickets !== null) {
      setTickets(Number(savedTickets));
    }

    // Stripe決済完了後（?success=true）に戻ってきたときの処理
    const query = new URLSearchParams(window.location.search);
    if (query.get('success') === 'true') {
      const currentTickets = savedTickets !== null ? Number(savedTickets) : 3;
      const newTickets = currentTickets + 5; // 5回分を追加
      setTickets(newTickets);
      localStorage.setItem('zatsumemo_tickets', newTickets.toString());
      
      // URLのクエリを綺麗にする
      window.history.replaceState({}, document.title, window.location.pathname);
      alert('✨ 決済が完了しました！AI深掘りチケットが5回分追加されました！');
    }
  }, []);

  const saveMemos = (newMemos: Memo[]) => {
    setMemos(newMemos);
    localStorage.setItem('zatsumemo_memos', JSON.stringify(newMemos));
  };

  const updateTickets = (newCount: number) => {
    setTickets(newCount);
    localStorage.setItem('zatsumemo_tickets', newCount.toString());
  };

  const handleAddMemo = () => {
    if (!inputText.trim()) return;

    const newMemo: Memo = {
      id: Date.now().toString(),
      text: inputText.trim(),
      createdAt: new Date().toLocaleString(),
    };

    const updated = [newMemo, ...memos];
    saveMemos(updated);
    setInputText('');
  };

  const handleAIBrainstorm = async (id: string, text: string) => {
    if (tickets <= 0) {
      alert('チケットがありません。「チケットを追加購入する」からチャージしてください。');
      return;
    }

    // チケットを1消費
    updateTickets(tickets - 1);

    const updatedLoading = memos.map((m) =>
      m.id === id ? { ...m, isAnalyzing: true } : m
    );
    setMemos(updatedLoading);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();

      const updatedWithAI = memos.map((m) =>
        m.id === id
          ? {
              ...m,
              aiReply: data.reply,
              rakutenKeyword: data.keyword,
              isAnalyzing: false,
            }
          : m
      );
      saveMemos(updatedWithAI);
    } catch (e) {
      console.error(e);
      // エラー時はチケットを戻す
      updateTickets(tickets);
      const updatedError = memos.map((m) =>
        m.id === id ? { ...m, aiReply: 'AIの呼び出しに失敗しました', isAnalyzing: false } : m
      );
      saveMemos(updatedError);
    }
  };

  const handleDelete = (id: string) => {
    const filtered = memos.filter((m) => m.id !== id);
    saveMemos(filtered);
  };

  return (
    <main style={styles.container}>
      <h1 style={styles.title}>ザツメモ</h1>
      <p style={styles.subtitle}>足跡とひらめきを連れてくるAIノート</p>

      {/* チケット残高＆購入エリア */}
      <div style={styles.ticketCard}>
        <div style={styles.ticketInfo}>
          <span>🎫 AI深掘り残高: <strong>{tickets} 回分</strong></span>
        </div>
        <a
          href={STRIPE_PAYMENT_LINK}
          style={styles.buyButton}
        >
          チケットを追加する（5回 / ¥300）
        </a>
      </div>

      <div style={styles.inputCard}>
        <textarea
          style={styles.textarea}
          placeholder="いま何を考えてる？雑に書いてみよう..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={3}
        />
        <button style={styles.addButton} onClick={handleAddMemo}>
          メモを残す（足跡つき）
        </button>
      </div>

      <div style={styles.listSection}>
        <h2 style={styles.sectionTitle}>最近の足跡</h2>
        {memos.length === 0 ? (
          <p style={styles.emptyText}>サクッと書いたアイデアの断片。ここからひらめきが広がる。</p>
        ) : (
          memos.map((memo) => (
            <div key={memo.id} style={styles.memoCard}>
              <div style={styles.memoHeader}>
                <p style={styles.memoText}>{memo.text}</p>
                <button
                  style={styles.deleteButton}
                  onClick={() => handleDelete(memo.id)}
                  title="削除"
                >
                  ×
                </button>
              </div>

              {memo.aiReply && (
                <div style={styles.aiReplyBox}>
                  <p style={styles.aiReplyText}>💡 ひらめき・深掘り: {memo.aiReply}</p>
                  
                  <a
                    href={`https://search.rakuten.co.jp/search/mall/${encodeURIComponent(memo.rakutenKeyword || memo.text)}/?scid=af_pc_etc&rafid=${RAKUTEN_AFFILIATE_ID}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.rakutenButton}
                  >
                    🛒 楽天市場で「{memo.rakutenKeyword || memo.text}」を探す
                  </a>
                </div>
              )}

              <div style={styles.cardFooter}>
                <span style={styles.dateText}>👣 {memo.createdAt}</span>
                {tickets > 0 ? (
                  <button
                    style={styles.aiButton}
                    onClick={() => handleAIBrainstorm(memo.id, memo.text)}
                    disabled={memo.isAnalyzing}
                  >
                    {memo.isAnalyzing ? '思考中...' : '✨ AIに深掘りを頼む'}
                  </button>
                ) : (
                  <a href={STRIPE_PAYMENT_LINK} style={styles.noTicketButton}>
                    🎫 チケットがありません（購入する）
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}

const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'sans-serif',
    color: '#333',
    backgroundColor: '#f9f9fb',
    minHeight: '100vh',
  },
  title: {
    textAlign: 'center' as const,
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '4px',
  },
  subtitle: {
    textAlign: 'center' as const,
    fontSize: '13px',
    color: '#666',
    marginBottom: '16px',
  },
  ticketCard: {
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    padding: '12px 16px',
    borderRadius: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  ticketInfo: {
    fontSize: '14px',
    color: '#1e40af',
  },
  buyButton: {
    backgroundColor: '#2563eb',
    color: '#fff',
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 'bold' as const,
    textDecoration: 'none',
  },
  inputCard: {
    backgroundColor: '#fff',
    padding: '16px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    marginBottom: '24px',
  },
  textarea: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    resize: 'none' as const,
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box' as const,
    marginBottom: '12px',
  },
  addButton: {
    width: '100%',
    backgroundColor: '#111827',
    color: '#fff',
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
    fontSize: '15px',
  },
  listSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#4b5563',
    marginBottom: '4px',
  },
  emptyText: {
    fontSize: '14px',
    color: '#9ca3af',
    textAlign: 'center' as const,
    padding: '20px 0',
  },
  memoCard: {
    backgroundColor: '#fff',
    padding: '16px',
    borderRadius: '12px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  memoHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  memoText: {
    fontSize: '16px',
    fontWeight: '500',
    margin: 0,
    wordBreak: 'break-word' as const,
    flex: 1,
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    color: '#9ca3af',
    cursor: 'pointer',
    padding: '0 4px',
  },
  aiReplyBox: {
    backgroundColor: '#f3f4f6',
    padding: '12px',
    borderRadius: '8px',
    borderLeft: '4px solid #4f46e5',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  aiReplyText: {
    fontSize: '14px',
    color: '#1f2937',
    margin: 0,
    lineHeight: '1.5',
  },
  rakutenButton: {
    display: 'inline-block',
    backgroundColor: '#bf0000',
    color: '#fff',
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    textAlign: 'center' as const,
    textDecoration: 'none',
    fontWeight: 'bold' as const,
    marginTop: '4px',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid #f3f4f6',
    paddingTop: '10px',
  },
  dateText: {
    fontSize: '12px',
    color: '#9ca3af',
  },
  aiButton: {
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: '1px solid #e5e7eb',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer',
    fontWeight: '500' as const,
  },
  noTicketButton: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    textDecoration: 'none',
    fontWeight: 'bold' as const,
  },
};

export default function Home() {
  return (
    <main style={{ padding: '24px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
        ザツメモ
      </h1>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px' }}>
        足跡とひらめきを連れてくるAIノート
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <textarea
          placeholder="いま何を考えてる？雑に書いてみよう..."
          style={{
            width: '100%',
            height: '150px',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            fontSize: '16px',
            resize: 'none'
          }}
        />
        <button
          style={{
            backgroundColor: '#111',
            color: '#fff',
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          メモを残す（足跡つき）
        </button>
      </div>
    </main>
  );
}

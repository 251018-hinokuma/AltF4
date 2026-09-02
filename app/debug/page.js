'use client';

import React, { useState, useEffect } from 'react';

export default function DebugUserStagesPage() {
  const [userId, setUserId] = useState(1);
  const [stages, setStages] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const genres = [
    { id: 1, name: '1: プログラミング' },
    { id: 2, name: '2: ビジネスマナー' },
    { id: 3, name: '3: 情報セキュリティ' },
    { id: 4, name: '4: ITリテラシー' },
    { id: 5, name: '5: コミュニケーション・仕事術' },
    { id: 6, name: '6: ラストステージ' },
  ];

  // stageId を含むデフォルト構造を生成
  const createDefaultStages = (fetchedStages = {}) => {
    const formatted = {};
    genres.forEach((g) => {
      const maxStages = g.id === 6 ? 1 : 6;
      const currentGenreStages = fetchedStages[g.id] || fetchedStages[String(g.id)] || [];
      
      formatted[g.id] = Array.from({ length: maxStages }, (_, idx) => {
        const existing = currentGenreStages[idx] || {};
        return {
          stageId: existing.stageId || idx + 1,
          clear: Boolean(existing.clear),
          perfect: Boolean(existing.perfect),
          speed: Boolean(existing.speed),
          correct: existing.correct ?? 0,
          total: existing.total ?? (idx === 5 ? 25 : 10),
        };
      });
    });
    return formatted;
  };

  const fetchUserData = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`/api/debug?userId=${userId}`);
      if (!res.ok) throw new Error(`Status: ${res.status}`);
      const data = await res.json();
      if (data.success) {
        setStages(createDefaultStages(data.stages));
      } else {
        setStages(createDefaultStages({}));
      }
    } catch (e) {
      setMessage(`⚠️ データ取得エラー: ${e.message}`);
      setStages(createDefaultStages({}));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const handleStageFieldChange = (genreId, stageIdx, key, value) => {
    setStages((prev) => {
      const updatedGenre = [...(prev[genreId] || [])];
      if (!updatedGenre[stageIdx]) return prev;

      updatedGenre[stageIdx] = {
        ...updatedGenre[stageIdx],
        [key]: value,
      };
      return { ...prev, [genreId]: updatedGenre };
    });
  };

  const handleSingleStageBulk = (genreId, stageIdx, isFull) => {
    setStages((prev) => {
      const updatedGenre = [...(prev[genreId] || [])];
      if (!updatedGenre[stageIdx]) return prev;

      updatedGenre[stageIdx] = {
        ...updatedGenre[stageIdx],
        clear: isFull,
        perfect: isFull,
        speed: isFull,
      };
      return { ...prev, [genreId]: updatedGenre };
    });
  };

  const handleBulkGenre = (genreId, isFull) => {
    setStages((prev) => ({
      ...prev,
      [genreId]: (prev[genreId] || []).map((st) => ({
        ...st,
        clear: isFull,
        perfect: isFull,
        speed: isFull,
      })),
    }));
  };

  const handleBulkAll = (isFull) => {
    setStages((prev) => {
      const nextStages = {};
      Object.keys(prev).forEach((gId) => {
        nextStages[gId] = (prev[gId] || []).map((st) => ({
          ...st,
          clear: isFull,
          perfect: isFull,
          speed: isFull,
        }));
      });
      return nextStages;
    });
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/debug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, stages }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('✅ データベースを更新しました！ジャンル選択画面を確認してください。');
      } else {
        setMessage(`❌ 保存失敗: ${data.error}`);
      }
    } catch (e) {
      setMessage(`❌ エラー: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'sans-serif', backgroundColor: '#18181b', color: '#f4f4f5', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#facc15' }}>
        🛠️ デバッグ：ステージ進行状況設定
      </h1>

      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px', backgroundColor: '#27272a', padding: '16px', borderRadius: '8px', flexWrap: 'wrap' }}>
        <label style={{ fontWeight: 'bold' }}>
          ユーザーID:
          <input
            type="number"
            value={userId}
            onChange={(e) => setUserId(Number(e.target.value))}
            style={{ marginLeft: '8px', padding: '6px 12px', borderRadius: '4px', border: '1px solid #52525b', backgroundColor: '#09090b', color: '#fff', width: '80px' }}
          />
        </label>
        <button onClick={fetchUserData} style={buttonStyle('#3b82f6')}>データ再読み込み</button>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <button onClick={() => handleBulkAll(true)} style={buttonStyle('#16a34a')}>全 ALL ON</button>
          <button onClick={() => handleBulkAll(false)} style={buttonStyle('#dc2626')}>全 ALL OFF</button>
          <button onClick={handleSave} disabled={loading} style={buttonStyle('#eab308', '#000')}>
            {loading ? '保存中...' : '💾 DBに変更を保存'}
          </button>
        </div>
      </div>

      {message && (
        <div style={{ padding: '12px', marginBottom: '20px', borderRadius: '6px', backgroundColor: message.includes('✅') ? '#14532d' : '#7f1d1d', fontWeight: 'bold' }}>
          {message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '16px' }}>
        {genres.map((genre) => {
          const genreStages = stages[genre.id] || [];
          return (
            <div key={genre.id} style={{ backgroundColor: '#27272a', borderRadius: '8px', padding: '16px', border: '1px solid #3f3f46' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #3f3f46', paddingBottom: '8px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#60a5fa', margin: 0 }}>{genre.name}</h2>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={() => handleBulkGenre(genre.id, true)} style={smallButtonStyle('#16a34a')}>全ON</button>
                  <button onClick={() => handleBulkGenre(genre.id, false)} style={smallButtonStyle('#dc2626')}>全OFF</button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {genreStages.map((st, idx) => (
                  <div key={idx} style={{ backgroundColor: '#18181b', padding: '10px 12px', borderRadius: '6px', border: '1px solid #27272a' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#facc15' }}>
                        {genre.id === 6 ? 'LAST STAGE' : idx === 5 ? 'BOSS STAGE (ST 6)' : `STAGE ${st.stageId}`}
                      </span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={() => handleSingleStageBulk(genre.id, idx, true)} style={tinyButtonStyle('#22c55e')}>全ON</button>
                        <button onClick={() => handleSingleStageBulk(genre.id, idx, false)} style={tinyButtonStyle('#ef4444')}>全OFF</button>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                      <label style={checkboxLabelStyle(st.clear, '#22c55e')}>
                        <input
                          type="checkbox"
                          checked={st.clear}
                          onChange={(e) => handleStageFieldChange(genre.id, idx, 'clear', e.target.checked)}
                        />
                        Clear
                      </label>
                      <label style={checkboxLabelStyle(st.perfect, '#eab308')}>
                        <input
                          type="checkbox"
                          checked={st.perfect}
                          onChange={(e) => handleStageFieldChange(genre.id, idx, 'perfect', e.target.checked)}
                        />
                        Perfect
                      </label>
                      <label style={checkboxLabelStyle(st.speed, '#a855f7')}>
                        <input
                          type="checkbox"
                          checked={st.speed}
                          onChange={(e) => handleStageFieldChange(genre.id, idx, 'speed', e.target.checked)}
                        />
                        Speed
                      </label>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#a1a1aa' }}>
                      <label>
                        正解数: 
                        <input
                          type="number"
                          value={st.correct}
                          onChange={(e) => handleStageFieldChange(genre.id, idx, 'correct', Number(e.target.value))}
                          style={numInputStyle}
                        />
                      </label>
                      <label>
                        問題数: 
                        <input
                          type="number"
                          value={st.total}
                          onChange={(e) => handleStageFieldChange(genre.id, idx, 'total', Number(e.target.value))}
                          style={numInputStyle}
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const buttonStyle = (bgColor, textColor = '#fff') => ({
  backgroundColor: bgColor,
  color: textColor,
  border: 'none',
  padding: '8px 16px',
  borderRadius: '6px',
  fontWeight: 'bold',
  cursor: 'pointer',
});

const smallButtonStyle = (bgColor) => ({
  backgroundColor: bgColor,
  color: '#fff',
  border: 'none',
  padding: '2px 8px',
  borderRadius: '4px',
  fontSize: '11px',
  cursor: 'pointer',
});

const tinyButtonStyle = (bgColor) => ({
  backgroundColor: bgColor,
  color: '#fff',
  border: 'none',
  padding: '1px 6px',
  borderRadius: '3px',
  fontSize: '10px',
  cursor: 'pointer',
});

const numInputStyle = {
  marginLeft: '4px',
  padding: '2px 4px',
  borderRadius: '3px',
  border: '1px solid #3f3f46',
  backgroundColor: '#09090b',
  color: '#fff',
  width: '50px',
};

const checkboxLabelStyle = (isChecked, activeColor) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '13px',
  fontWeight: isChecked ? 'bold' : 'normal',
  color: isChecked ? activeColor : '#71717a',
  cursor: 'pointer',
});
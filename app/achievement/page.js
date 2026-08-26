'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation'; 
import { useGame } from '../context/GameContext'; 
import styles from './page.module.css';

export default function AchievementPage() {
  const router = useRouter();
  const { game } = useGame();
  
  const [stagesProgress, setStagesProgress] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [showDebug, setShowDebug] = useState(false); // デバッグパネル開閉フラグ

  // DBから全ジャンル(1〜6)のステージ進行状況を取得
  useEffect(() => {
    async function loadAllStageData() {
      setIsLoading(true);
      const userId = game?.user?.userId || 1;
      const genresList = [1, 2, 3, 4, 5, 6]; 
      const progressMap = {};

      try {
        await Promise.all(
          genresList.map(async (genreId) => {
            const res = await fetch(`/api/user/stages?userId=${userId}&genreId=${genreId}`);
            if (res.ok) {
              const data = await res.json();
              progressMap[genreId] = data.stages || [];
            } else {
              // データがない場合のデフォルト初期構造（各ジャンル6ステージ分を仮設定）
              progressMap[genreId] = Array.from({ length: 6 }, () => ({
                clear: false,
                perfect: false,
                speed: false,
                correct: 0,
                total: 10
              }));
            }
          })
        );
        setStagesProgress(progressMap);
      } catch (error) {
        console.error("実績データの取得に失敗しました:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadAllStageData();
  }, [game?.user?.userId]);
  useEffect(() => {
  async function loadAllStageData() {
    setIsLoading(true);
    const userId = game?.user?.userId || 1;
    const genresList = [1, 2, 3, 4, 5, 6]; 
    const progressMap = {};

    try {
      await Promise.all(
        genresList.map(async (genreId) => {
          const res = await fetch(`/api/user/stages?userId=${userId}&genreId=${genreId}`);
          let fetchedStages = [];

          if (res.ok) {
            const data = await res.json();
            fetchedStages = data.stages || [];
          }

          // 通常ジャンル(1〜5)はインデックス0〜5(6件)、ラストステージ(6)はインデックス0(1件)
          const targetLength = genreId === 6 ? 1 : 6;

          // 足りないインデックスのステージデータをデフォルト値で埋める
          progressMap[genreId] = Array.from({ length: targetLength }, (_, index) => {
            if (fetchedStages[index]) {
              return fetchedStages[index];
            }
            return {
              clear: false,
              perfect: false,
              speed: false,
              correct: 0,
              total: index === 5 ? 25 : 10 // インデックス5(ボスステージ)は25問、それ以外は10問
            };
          });
        })
      );
      setStagesProgress(progressMap);
    } catch (error) {
      console.error("ステージデータの取得に失敗しました:", error);
    } finally {
      setIsLoading(false);
    }
  }

  loadAllStageData();
}, [game?.user?.userId]);

  // =========================================
  // デバッグ用データ操作関数
  // =========================================
  
  // 個別スターの切り替え
  const toggleStar = (genreId, stageIndex, key) => {
    setStagesProgress((prev) => {
      const currentGenre = [...(prev[genreId] || [])];
      if (!currentGenre[stageIndex]) return prev;

      currentGenre[stageIndex] = {
        ...currentGenre[stageIndex],
        [key]: !currentGenre[stageIndex][key],
      };

      return { ...prev, [genreId]: currentGenre };
    });
  };

  // 全ジャンルの全スターを一括ON / OFF
  const setAllStarsGlobal = (isFull) => {
    setStagesProgress((prev) => {
      const nextProgress = {};
      Object.keys(prev).forEach((genreId) => {
        nextProgress[genreId] = prev[genreId].map((stage) => ({
          ...stage,
          clear: isFull,
          perfect: isFull,
          speed: isFull,
        }));
      });
      return nextProgress;
    });
  };

  // 特定ジャンルを全達成にする
  const setGenreFull = (genreId) => {
    setStagesProgress((prev) => ({
      ...prev,
      [genreId]: (prev[genreId] || []).map((s) => ({
        ...s,
        clear: true,
        perfect: true,
        speed: true,
      })),
    }));
  };

  // stageDetailSchemaのプロパティ (clear, perfect, speed) を使用した実績判定
  const userAchievement = useMemo(() => {
    const achievements = {};

    const genreMappings = [
      { genreId: 1, bronzeId: 1, silverId: 2 },
      { genreId: 2, bronzeId: 3, silverId: 4 },
      { genreId: 3, bronzeId: 5, silverId: 6 },
      { genreId: 4, bronzeId: 7, silverId: 8 },
      { genreId: 5, bronzeId: 9, silverId: 10 },
    ];

    genreMappings.forEach(({ genreId, bronzeId, silverId }) => {
      const stages = stagesProgress[genreId] || [];

      // 銅トロフィー: 各ジャンルのボスステージ（インデックス5 / ステージ6）の clear が true
      const bossStage = stages[5];
      achievements[bronzeId] = Boolean(bossStage && bossStage.clear);

      // 獲得スター総数 (clear + perfect + speed)
      const totalStars = stages.reduce((sum, stage) => {
        return sum + (stage.clear ? 1 : 0) + (stage.perfect ? 1 : 0) + (stage.speed ? 1 : 0);
      }, 0);

      // 銀トロフィー: スター合計数 > 17 かつ 全ステージの全スター取得
      achievements[silverId] = 
        totalStars > 17 && 
        stages.length > 0 && 
        stages.every((stage) => stage.clear && stage.perfect && stage.speed);
    });

    // 11. 金トロフィー: ラストステージ (ジャンル6 / ステージ1) の clear が true
    const lastStageList = stagesProgress[6] || [];
    achievements[11] = Boolean(lastStageList.length > 0 && lastStageList[0]?.clear);

    // 12. 虹トロフィー: 全ジャンル(1〜6)の全ステージで clear, perfect, speed がすべて true
    const allGenres = [1, 2, 3, 4, 5, 6];
    achievements[12] = allGenres.every((genreId) => {
      const stages = stagesProgress[genreId] || [];
      if (stages.length === 0) return false;
      return stages.every((stage) => stage.clear && stage.perfect && stage.speed);
    });

    return achievements;
  }, [stagesProgress]);

  // 実績マスターデータ一覧
  const trophies = [
    { id: 1, name: 'プログラミング 銅', className: 'bronze', description: 'プログラミングのボスステージをクリアする' },
    { id: 2, name: 'プログラミング 銀', className: 'silver', description: 'プログラミングのスターをすべて取得する' },
    { id: 3, name: 'ビジネスマナー 銅', className: 'bronze', description: 'ビジネスマナーのボスステージをクリアする' },
    { id: 4, name: 'ビジネスマナー 銀', className: 'silver', description: 'ビジネスマナーのスターをすべて取得する' },
    { id: 5, name: 'セキュリティ 銅', className: 'bronze', description: '情報セキュリティ・モラルのボスステージをクリアする' },
    { id: 6, name: 'セキュリティ 銀', className: 'silver', description: '情報セキュリティ・モラルのスターをすべて取得する' },
    { id: 7, name: 'ITリテラシー 銅', className: 'bronze', description: 'ITリテラシー・オフィスのボスステージをクリアする' },
    { id: 8, name: 'ITリテラシー 銀', className: 'silver', description: 'ITリテラシー・オフィスのスターをすべて取得する' },
    { id: 9, name: '仕事術 銅', className: 'bronze', description: 'コミュニケーション・仕事術のボスステージをクリアする' },
    { id: 10, name: '仕事術 銀', className: 'silver', description: 'コミュニケーション・仕事術のスターをすべて取得する' },
    { id: 11, name: '金トロフィー', className: 'gold', description: 'ラストステージをクリアする' },
    { id: 12, name: '虹トロフィー', className: 'rainbow', description: '全てのスターを取得する' },
  ];

  const handleBack = () => {
    router.push('/userpage');
  };

  return (
    <div className={styles['achievement-container']}>
      {/* ヘッダー */}
      <header className={styles['page-header']}>
        <button className={styles['back-button']} onClick={handleBack}>
          戻る
        </button>
        <div className={`${styles.tab} ${styles['border-left-none']}`}>ユーザーページ</div>
        <div className={`${styles.tab} ${styles['active-tab']}`}>実績</div>
        <button 
          onClick={() => setShowDebug(!showDebug)}
          style={{ marginLeft: 'auto', background: '#333', color: '#fff', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
        >
          {showDebug ? '⚙️ デバッグ閉じる' : '⚙️ デバッグ開く'}
        </button>
      </header>

      {/* =========================================
          デバッグ用操作パネル 
      ========================================= */}
      {showDebug && (
        <div style={{ background: '#222', color: '#fff', padding: '15px', margin: '10px', borderRadius: '8px', fontSize: '12px' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#00ffcc' }}>🛠️ 実績テスト用デバッグパネル</h3>
          
          <div style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
            <button onClick={() => setAllStarsGlobal(true)} style={{ background: '#28a745', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
              全ジャンル スター全獲得
            </button>
            <button onClick={() => setAllStarsGlobal(false)} style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
              全ジャンル スター初期化
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
            {[1, 2, 3, 4, 5, 6].map((genreId) => {
              const stages = stagesProgress[genreId] || [];
              const starCount = stages.reduce((sum, s) => sum + (s.clear ? 1 : 0) + (s.perfect ? 1 : 0) + (s.speed ? 1 : 0), 0);

              return (
                <div key={genreId} style={{ border: '1px solid #444', padding: '8px', borderRadius: '4px', background: '#111' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <strong>ジャンル {genreId} (★ {starCount})</strong>
                    <button onClick={() => setGenreFull(genreId)} style={{ fontSize: '10px', cursor: 'pointer' }}>全★GET</button>
                  </div>
                  
                  {stages.map((stage, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '5px', alignItems: 'center', marginBottom: '3px' }}>
                      <span>ST{idx + 1}:</span>
                      {['clear', 'perfect', 'speed'].map((key) => (
                        <button
                          key={key}
                          onClick={() => toggleStar(genreId, idx, key)}
                          style={{
                            background: stage[key] ? '#ffd700' : '#444',
                            color: stage[key] ? '#000' : '#fff',
                            border: 'none',
                            borderRadius: '3px',
                            fontSize: '10px',
                            padding: '2px 4px',
                            cursor: 'pointer'
                          }}
                        >
                          {key[0].toUpperCase()}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* メインコンテンツ */}
      <main className={styles['achievement-content']}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>実績情報を読み込み中...</div>
        ) : (
          <div className={styles['trophy-grid']}>
            {trophies.map((trophy) => {
              const isUnlocked = Boolean(userAchievement[trophy.id]);

              const trophyCircleClass = `${styles['trophy-circle']} ${
                isUnlocked ? styles[trophy.className] : styles.locked
              }`;

              const statusBadgeClass = `${styles['status-badge']} ${
                isUnlocked ? styles['unlocked-text'] : styles['locked-text']
              }`;

              return (
                <div key={trophy.id} className={styles['trophy-card']}>
                  <div className={trophyCircleClass}>
                    {trophy.name}
                  </div>
                  <div className={styles['status-box']}>
                    <p className={styles['status-title']}>達成状況</p>
                    <p className={styles['description-text']}>{trophy.description}</p>
                    <span className={statusBadgeClass}>
                      {isUnlocked ? '【達成！】' : '【未達成】'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
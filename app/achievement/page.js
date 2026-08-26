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
              progressMap[genreId] = [];
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

  // stageDetailSchemaのプロパティ (clear, perfect, speed) を使用した実績判定
  const userAchievement = useMemo(() => {
    const achievements = {};

    // 通常ジャンル(1〜5)の銅・銀トロフィー判定
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

      // 該当ジャンルの獲得スター総数を算出 (clear + perfect + speed)
      const totalStars = stages.reduce((sum, stage) => {
        return sum + (stage.clear ? 1 : 0) + (stage.perfect ? 1 : 0) + (stage.speed ? 1 : 0);
      }, 0);

      // 銀トロフィー: スター合計数が30より大きく(30以下は不可)、かつ全ステージで全スターを取得しているか
      achievements[silverId] = 
        totalStars > 30 && 
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
      </header>

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
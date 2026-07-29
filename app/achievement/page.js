'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation'; 
import { useGame } from '../context/GameContext'; 
import styles from './page.module.css';

export default function AchievementPage() {
  const router = useRouter();
  const { game } = useGame();

  // Calculate trophy states live using metrics matching your data model and leader rules
  const userAchievement = useMemo(() => {
    // Safety fallback if game or user data isn't loaded yet
    if (!game || !game.user) {
      return { bronzeTrophy: false, silverTrophy: false, goldTrophy: false, rainbowTrophy: false };
    }

    const user = game.user;

    // 1. Calculate historical clears from the nested stagesList structures
    // Safely combine all stages cleared across all genres in the 3-layer structure
    let totalClearedStages = 0;
    let totalPerfectStages = 0;

    const genres = ['genre1', 'genre2', 'genre3']; // Extend based on your game genres
    genres.forEach((genreKey) => {
      if (user.stagesList && Array.isArray(user.stagesList[genreKey])) {
        user.stagesList[genreKey].forEach((stage) => {
          if (stage.clear) totalClearedStages += 1;
          if (stage.perfect) totalPerfectStages += 1;
        });
      }
    });

    // 2. Read runtime arrays from the current active quiz phase
    const currentResultCount = user.resultQuizIds?.length || 0;
    const currentMarkedCount = user.markingQuizIds?.length || 0;

    // 3. Leader Conditions Mapping (Joken)
    return {
      // Bronze: Finished your very first question or cleared 1 stage
      bronzeTrophy: currentResultCount >= 1 || totalClearedStages >= 1,   
      
      // Silver: Finished 10 total questions or cleared a milestone number of stages
      silverTrophy: currentResultCount >= 10 || totalClearedStages >= 5,  
      
      // Gold: Bookmarked/marked 5 or more items during gameplay
      goldTrophy: currentMarkedCount >= 5,   
      
      // Rainbow: Kept alive (HP > 0), answered at least 20 questions, or achieved perfect status
      rainbowTrophy: (game.hp ?? 0) > 0 && (currentResultCount >= 20 || totalPerfectStages >= 3), 
    };
  }, [game]);

  const trophies = [
    {
      id: 'bronzeTrophy',
      name: '銅トロフィー',
      className: 'bronze',
      description: '初めてのタスクを完了する',
    },
    {
      id: 'silverTrophy',
      name: '銀トロフィー',
      className: 'silver',
      description: 'タスクを合計10回完了する',
    },
    {
      id: 'goldTrophy',
      name: '金トロフィー',
      className: 'gold',
      description: 'タスクを合計50回完了する',
    },
    {
      id: 'rainbowTrophy',
      name: '虹トロフィー',
      className: 'rainbow',
      description: 'すべてのイベントをクリアする',
    },
  ];

  const handleBack = () => {

    router.push('/userpage');

  };

  return (
    <div className={styles['achievement-container']}>
      {/* Header Tabs */}
      <header className={styles['page-header']}>
        <button className={styles['back-button']} onClick={handleBack}>
          戻る
        </button>
        <div className={`${styles.tab} ${styles['border-left-none']}`}>ユーザーページ</div>
        <div className={`${styles.tab} ${styles['active-tab']}`}>実績</div>
      </header>

      {/* Main Grid Content */}
      <main className={styles['achievement-content']}>
        <div className={styles['trophy-grid']}>
          {trophies.map((trophy) => {
            const isUnlocked = userAchievement[trophy.id];

            const trophyCircleClass = `${styles['trophy-circle']} ${
              isUnlocked ? styles[trophy.className] : styles.locked
            }`;

            const statusBadgeClass = `${styles['status-badge']} ${
              isUnlocked ? styles['unlocked-text'] : styles['locked-text']
            }`;

            return (
              <div key={trophy.id} className={styles['trophy-card']}>
                {/* Trophy Graphic Circle */}
                <div className={trophyCircleClass}>
                  {trophy.name}
                </div>

                {/* Achievement Description Square Box */}
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
      </main>
    </div>
  );


}



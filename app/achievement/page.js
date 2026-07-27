'use client';

import React, { useState } from 'react';
// Next.js standard router
import { useRouter } from 'next/navigation'; 
import styles from './page.module.css';

export default function AchievementPage() {
  const router = useRouter();

  // Mock User Achievement Data
  const [userAchievement, setUserAchievement] = useState({
    bronzeTrophy: true,   // Unlocked (Colored)
    silverTrophy: false,  // Locked (Gray)
    goldTrophy: true,     // Unlocked (Colored)
    rainbowTrophy: false, // Locked (Gray)
  });

  // Trophy Master Definition Data
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

  // Back Button Click Handler
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

            // Safely combine dynamic styles for the trophy circles
            const trophyCircleClass = `${styles['trophy-circle']} ${
              isUnlocked ? styles[trophy.className] : styles.locked
            }`;

            // Safely combine dynamic styles for the badges
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

'use client';

import React, { useState, useEffect } from 'react';
// 遷移用。Next.js標準の useRouter を想定していますが、環境に合わせて変更してください。
import { useRouter } from 'next/navigation'; 
import './page.css';

export default function AchievementPage() {
  const router = useRouter();

  // 擬似的なUserのachievementデータ（初期表示処理の検証用）
  // 実際の実装ではAPIやPropsから取得したデータに置き換えてください。
  const [userAchievement, setUserAchievement] = useState({
    bronzeTrophy: true,   // 獲得済み（色付き）
    silverTrophy: false,  // 未獲得（灰色）
    goldTrophy: true,     // 獲得済み（色付き）
    rainbowTrophy: false, // 未獲得（灰色）
  });

  // トロフィーの定義データマスタ（達成方法などを管理）
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

  // 戻るボタン[クリック]処理
  const handleBack = () => {
    router.push('/user-page'); // ユーザーページ画面へ遷移
  };

  return (
    <div className="achievement-container">
      {/* ヘッダー・タブ部分 */}
      <header className="page-header">
        <button className="back-button" onClick={handleBack}>
          戻る
        </button>
        <div className="tab border-left-none">ユーザーページ</div>
        <div className="tab active-tab">実績</div>
      </header>

      {/* メインコンテンツ（実績画面） */}
      <main className="achievement-content">
        <div className="trophy-grid">
          {trophies.map((trophy) => {
            // Userのahievementがtrueかfalseかを判定
            const isUnlocked = userAchievement[trophy.id];

            return (
              <div key={trophy.id} className="trophy-card">
                {/* トロフィー（円形）の表示切り替え */}
                <div className={`trophy-circle ${isUnlocked ? trophy.className : 'locked'}`}>
                  {trophy.name}
                </div>

                {/* 達成状況（四角形）に達成方法を表示 */}
                <div className="status-box">
                  <p className="status-title">達成状況</p>
                  <p className="description-text">{trophy.description}</p>
                  <span className={`status-badge ${isUnlocked ? 'unlocked-text' : 'locked-text'}`}>
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
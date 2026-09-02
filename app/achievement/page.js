'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

import { useGame } from '../context/GameContext';
import styles from './page.module.css';

export default function AchievementPage() {
  let game = null;
  try {
    const gameContext = useGame ? useGame() : null;
    game = gameContext?.game || null;
  } catch (e) {
    console.warn("useGame is not available during SSR/Evaluation:", e);
  }

  const [stagesProgress, setStagesProgress] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    async function loadAllStageData() {
      setIsLoading(true);
      const userId = game?.user?.userId || 1;
      const genresList = [1, 2, 3, 4, 5, 6]; 
      const progressMap = {};

      try {
        await Promise.all(
          genresList.map(async (genreId) => {
            try {
              const res = await fetch(`/api/user/stages?userId=${userId}&genreId=${genreId}`);
              let fetchedStages = [];

              if (res.ok) {
                const data = await res.json();
                fetchedStages = data.stages || [];
              }

              const targetLength = genreId === 6 ? 1 : 6;

              progressMap[genreId] = Array.from({ length: targetLength }, (_, index) => {
                if (fetchedStages[index]) {
                  return fetchedStages[index];
                }
                return {
                  clear: false,
                  perfect: false,
                  speed: false,
                  correct: 0,
                  total: index === 5 ? 25 : 10
                };
              });
            } catch (err) {
              console.warn(`Genre ${genreId} fetch error:`, err);
              const targetLength = genreId === 6 ? 1 : 6;
              progressMap[genreId] = Array.from({ length: targetLength }, () => ({
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
        console.error("ステージデータの取得に失敗しました:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadAllStageData();
  }, [isMounted, game?.user?.userId]);

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

      const bossStage = stages[5];
      achievements[bronzeId] = Boolean(bossStage && bossStage.clear);

      const totalStars = stages.reduce((sum, stage) => {
        return sum + (stage.clear ? 1 : 0) + (stage.perfect ? 1 : 0) + (stage.speed ? 1 : 0);
      }, 0);

      achievements[silverId] = 
        totalStars >= 18 && 
        stages.length > 0 && 
        stages.every((stage) => stage.clear && stage.perfect && stage.speed);
    });

    const lastStageList = stagesProgress[6] || [];
    achievements[11] = Boolean(lastStageList.length > 0 && lastStageList[0]?.clear);

    const allGenres = [1, 2, 3, 4, 5, 6];
    achievements[12] = allGenres.every((genreId) => {
      const stages = stagesProgress[genreId] || [];
      if (stages.length === 0) return false;
      return stages.every((stage) => stage.clear && stage.perfect && stage.speed);
    });

    return achievements;
  }, [stagesProgress]);

  // 実績バッジのマスター定義
  const trophies = [
    { id: 1, name: 'プログラミング 銅', rank: 'bronze', rankLabel: 'BRONZE', icon: '🥉', description: 'プログラミングのボスステージをクリアする' },
    { id: 2, name: 'プログラミング 銀', rank: 'silver', rankLabel: 'SILVER', icon: '🥈', description: 'プログラミングのスターをすべて取得する' },
    { id: 3, name: 'ビジネスマナー 銅', rank: 'bronze', rankLabel: 'BRONZE', icon: '🥉', description: 'ビジネスマナーのボスステージをクリアする' },
    { id: 4, name: 'ビジネスマナー 銀', rank: 'silver', rankLabel: 'SILVER', icon: '🥈', description: 'ビジネスマナーのスターをすべて取得する' },
    { id: 5, name: 'セキュリティ 銅', rank: 'bronze', rankLabel: 'BRONZE', icon: '🥉', description: '情報セキュリティのボスステージをクリアする' },
    { id: 6, name: 'セキュリティ 銀', rank: 'silver', rankLabel: 'SILVER', icon: '🥈', description: '情報セキュリティのスターをすべて取得する' },
    { id: 7, name: 'ITリテラシー 銅', rank: 'bronze', rankLabel: 'BRONZE', icon: '🥉', description: 'ITリテラシーのボスステージをクリアする' },
    { id: 8, name: 'ITリテラシー 銀', rank: 'silver', rankLabel: 'SILVER', icon: '🥈', description: 'ITリテラシーのスターをすべて取得する' },
    { id: 9, name: '仕事術 銅', rank: 'bronze', rankLabel: 'BRONZE', icon: '🥉', description: 'コミュニケーション・仕事術のボスをクリア' },
    { id: 10, name: '仕事術 銀', rank: 'silver', rankLabel: 'SILVER', icon: '🥈', description: 'コミュニケーション・仕事術の全スター獲得' },
    { id: 11, name: 'ラストステージ 覇者', rank: 'gold', rankLabel: 'GOLD', icon: '🥇', description: 'ラストステージをクリアする' },
    { id: 12, name: '全知全能の証', rank: 'rainbow', rankLabel: 'LEGEND', icon: '👑', description: '全てのスターを取得する' },
  ];

  const unlockedCount = useMemo(() => {
    return Object.values(userAchievement).filter(Boolean).length;
  }, [userAchievement]);

  const unlockPercentage = Math.round((unlockedCount / trophies.length) * 100);

  const getStyle = (key) => (styles && styles[key] ? styles[key] : '');

  return (
    <div className={getStyle('container')}>
      <div className={getStyle('sky')}></div>
      <div className={getStyle('cloud1')}></div>
      <div className={getStyle('cloud2')}></div>
      <div className={getStyle('cloud3')}></div>
      <div className={getStyle('mountain')}></div>
      <div className={getStyle('forest')}></div>
      <div className={getStyle('ground')}></div>

      <div className={getStyle('menupage')}>
        <nav className={getStyle('starTabs')}>
          <Link href="/userpage" className={getStyle('tabButton')}>
            🔙 戻る
          </Link>
          <Link href="/star_correct" className={getStyle('tabButton')}>
            ⭐ スター獲得状況
          </Link>
          <Link href="/genre_percentage" className={getStyle('tabButton')}>
            📊 ジャンル別正答率
          </Link>
          <div className={`${getStyle('tabButton')} ${getStyle('tabButtonActive')}`}>
            🏆 実績
          </div>
        </nav>

        <div className={getStyle('starContent')}>
          <div className={getStyle('summarySection')}>
            <div className={getStyle('summaryHeader')}>
              <span>🎖️ 実績バッジ獲得数</span>
              <span className={getStyle('summaryCount')}>
                {unlockedCount} / {trophies.length} ({unlockPercentage}%)
              </span>
            </div>
            <div className={getStyle('progressBarBg')}>
              <div 
                className={getStyle('progressBarFill')} 
                style={{ width: `${unlockPercentage}%` }}
              />
            </div>
          </div>

          {!isMounted || isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#fff7e4', fontWeight: 'bold' }}>
              バッジデータを読み込み中...
            </div>
          ) : (
            <div className={getStyle('trophyGrid')}>
              {trophies.map((trophy) => {
                const isUnlocked = Boolean(userAchievement[trophy.id]);

                const cardClass = `${getStyle('trophyCard')} ${
                  isUnlocked ? getStyle(trophy.rank) : getStyle('locked')
                }`;

                const statusBadgeClass = `${getStyle('statusBadge')} ${
                  isUnlocked ? getStyle('unlockedText') : getStyle('lockedText')
                }`;

                return (
                  <div key={trophy.id} className={cardClass}>
                    {/* バッジ（メダル＋リボン）表示部 */}
                    <div className={getStyle('badgeWrapper')}>
                      <div className={getStyle('badgeBody')}>
                        <span className={getStyle('badgeIcon')}>
                          {isUnlocked ? trophy.icon : '🔒'}
                        </span>
                      </div>
                      <div className={getStyle('badgeRibbon')}>
                        {isUnlocked ? trophy.rankLabel : 'LOCKED'}
                      </div>
                    </div>

                    {/* バッジ名 */}
                    <div className={getStyle('badgeTitle')}>
                      {trophy.name}
                    </div>

                    {/* 条件 & ステータス */}
                    <div className={getStyle('statusBox')}>
                      <p className={getStyle('descriptionText')}>{trophy.description}</p>
                      <span className={statusBadgeClass}>
                        {isUnlocked ? '獲得！' : '未獲得'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
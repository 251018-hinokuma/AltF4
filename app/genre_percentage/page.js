"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useGame } from '../context/GameContext'; 
import styles from './page.module.css';

export default function GenrePercentagePage() {
  let game = null;
  try {
    const gameContext = useGame ? useGame() : null;
    game = gameContext?.game || null;
  } catch (e) {
    console.warn("useGame is not available during SSR/Evaluation:", e);
  }

  const [genres, setGenres] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 通常ジャンルのステージ構成
  const defaultStages = ['ステージ1', 'ステージ2', 'ステージ3', 'ステージ4', 'ステージ5', 'ボス'];

  useEffect(() => {
    async function loadData() {
      try {
        // 1. ジャンル一覧取得
        const genreRes = await fetch("/api/genres");
        let genreDataList = [];
        if (genreRes.ok) {
          const data = await genreRes.json();
          genreDataList = data.genres || [];
        }

        // バックアップ用デフォルトジャンル
        if (genreDataList.length === 0) {
          genreDataList = [
            { genreId: 1, genreName: "プログラミング" },
            { genreId: 2, genreName: "ビジネスマナー" },
            { genreId: 3, genreName: "情報セキュリティ" },
            { genreId: 4, genreName: "ITリテラシー" },
            { genreId: 5, genreName: "コミュニケーション・仕事術" },
            { genreId: 6, genreName: "ラストステージ" },
          ];
        }

        setGenres(genreDataList);

        // 2. ユーザー情報取得
        const userId = game?.user?.userId || 1;
        const userRes = await fetch(`/api/userpage?userId=${userId}`);
        
        if (userRes.ok) {
          const fetchedUser = await userRes.json();
          if (fetchedUser.singleItem) {
            setUserData(fetchedUser.singleItem);
          }
        }
      } catch (error) {
        console.error("データ取得エラー:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [game?.user?.userId]);

  // DBから該当ジャンルのステージ配列を取得する関数
  const getGenreStages = (stagesObj, genre, index) => {
    if (!stagesObj) return [];
    const rawId = genre?.genreId || genre?.id || genre?._id || (index + 1);
    const num = String(rawId).replace(/[^0-9]/g, '') || String(index + 1);

    const keysToTry = [
      `genre${num}`,
      num,
      Number(num),
      genre?.genreName,
      genre?.name,
      String(rawId)
    ];

    for (const key of keysToTry) {
      if (key !== undefined && key !== null && stagesObj[key]) {
        return stagesObj[key];
      }
    }

    return [];
  };

  // ジャンル全体の正答率（％）と集計
  const calculateGenreAccuracy = (genreArray, currentStages) => {
    let totalCorrect = 0;
    let totalQuestions = 0;

    if (Array.isArray(genreArray)) {
      currentStages.forEach((_, index) => {
        const stage = genreArray[index];
        if (stage) {
          totalCorrect += Number(stage.correct || 0);
          totalQuestions += Number(stage.total || 0);
        }
      });
    }

    const percentage = totalQuestions > 0 
      ? Math.round((totalCorrect / totalQuestions) * 100) 
      : 0;

    return { percentage, totalCorrect, totalQuestions };
  };

  const getStyle = (key) => (styles && styles[key] ? styles[key] : '');

  const userStagesObj = userData?.stages || {};

  return (
    <div className={getStyle('container')}>
      {/* 背景ドット演出 */}
      <div className={getStyle('sky')}></div>
      <div className={getStyle('cloud1')}></div>
      <div className={getStyle('cloud2')}></div>
      <div className={getStyle('cloud3')}></div>
      <div className={getStyle('mountain')}></div>
      <div className={getStyle('forest')}></div>
      <div className={getStyle('ground')}></div>

      {/* メインの木目調ウィンドウ */}
      <div className={getStyle('menupage')}>
        {/* 🌟 ナビゲーションタブ */}
        <nav className={getStyle('starTabs')}>
          <Link href="/userpage" className={getStyle('tabButton')}>
            🔙 戻る
          </Link>
          <Link href="/star_correct" className={getStyle('tabButton')}>
            ⭐ スター獲得状況
          </Link>
          <div className={`${getStyle('tabButton')} ${getStyle('tabButtonActive')}`}>
            📊 ジャンル別正答率
          </div>
          <Link href="/achievement" className={getStyle('tabButton')}>
            🏆 実績
          </Link>
        </nav>

        {/* 🌟 スクロールコンテンツ */}
        <div className={getStyle('starContent')}>
          {loading ? (
            <div className={getStyle('loading')}>
              データを読み込み中...
            </div>
          ) : (
            genres.map((genre, genreIdx) => {
              const genreName = genre.genreName || genre.name || `ジャンル ${genreIdx + 1}`;
              
              // 🌟 最後のジャンル（ラストステージ）判定
              const isLastGenre = genreIdx === genres.length - 1 || genreName.includes('ラスト');
              const currentStages = isLastGenre ? ['ボス'] : defaultStages;

              const genreArray = getGenreStages(userStagesObj, genre, genreIdx);
              const accuracy = calculateGenreAccuracy(genreArray, currentStages);

              return (
                <div key={genreName + genreIdx} className={getStyle('genreCard')}>
                  {/* ジャンルヘッダー */}
                  <div className={getStyle('genreHeader')}>
                    <h2 className={getStyle('genreTitle')}>
                      {genreName}
                    </h2>
                    <div className={getStyle('genreScore')}>
                      <span className={getStyle('genrePercentText')}>
                        正答率 {accuracy.percentage}%
                      </span>
                      {accuracy.totalQuestions > 0 && (
                        <span className={getStyle('genreQuestionsText')}>
                          ({accuracy.totalCorrect} / {accuracy.totalQuestions} 問正解)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 全体プログレスバー */}
                  <div className={getStyle('progressBarBg')}>
                    <div 
                      className={getStyle('progressBarFill')} 
                      style={{ width: `${accuracy.percentage}%` }}
                    />
                  </div>

                  {/* ステージグリッド */}
                  <div className={isLastGenre ? getStyle('stageGridBossOnly') : getStyle('stageGrid')}>
                    {currentStages.map((stageName, index) => {
                      const stageDetail = genreArray[index];
                      const stageCorrect = Number(stageDetail?.correct || 0);
                      const stageTotal = Number(stageDetail?.total || 0);
                      const stagePercent = stageTotal > 0 
                        ? Math.round((stageCorrect / stageTotal) * 100) 
                        : null;

                      return (
                        <div key={stageName} className={getStyle('stageCard')}>
                          <div className={getStyle('stageTitle')}>
                            {stageName}
                          </div>
                          <div className={getStyle('stagePercent')}>
                            {stagePercent !== null ? `${stagePercent}%` : '- %'}
                          </div>
                          {stageTotal > 0 && (
                            <div className={getStyle('stageDetail')}>
                              {stageCorrect} / {stageTotal}
                            </div>
                          )}
                          <div className={getStyle('miniProgressBarBg')}>
                            <div 
                              className={getStyle('miniProgressBarFill')}
                              style={{ width: `${stagePercent || 0}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
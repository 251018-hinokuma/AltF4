"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useGame } from '../context/GameContext'; 

export default function GenrePercentagePage() {
  const { game } = useGame();
  const [genres, setGenres] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const stages = ['ステージ1', 'ステージ2', 'ステージ3', 'ステージ4', 'ステージ5', 'ボス'];

  useEffect(() => {
    async function loadData() {
      try {
        // 1. ジャンル一覧取得
        const genreRes = await fetch("/api/genres");
        const genreData = await genreRes.json();
        setGenres(genreData.genres || []);

        // 2. ユーザー情報取得 (DBから最新データを取得)
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

  // DBから該当ジャンルのステージ配列を拾い出す関数
  const getGenreStages = (stagesObj, genre, index) => {
    if (!stagesObj) return [];
    const rawId = genre?.genreId || genre?.id || genre?._id || (index + 1);
    const num = String(rawId).replace(/[^0-9]/g, '') || String(index + 1);

    const keysToTry = [`genre${num}`, num, Number(num), genre?.genreName, genre?.name, String(rawId)];
    for (const key of keysToTry) {
      if (key !== undefined && key !== null && stagesObj[key]) {
        return stagesObj[key];
      }
    }
    return [];
  };

  // ジャンル全体の正答率（％）計算
  const calculateGenreAccuracy = (genreArray) => {
    let totalCorrect = 0;
    let totalQuestions = 0;

    if (Array.isArray(genreArray)) {
      genreArray.forEach(stage => {
        if (stage) {
          totalCorrect += Number(stage.correct || 0);
          totalQuestions += Number(stage.total || 0);
        }
      });
    }

    const percentage = totalQuestions > 0 
      ? Math.round((totalCorrect / totalQuestions) * 100) 
      : 0;

    return percentage;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.1rem', color: '#666' }}>
        データを読み込み中...
      </div>
    );
  }

  const userStagesObj = userData?.stages || {};

  return (
    <div style={{ backgroundColor: '#faf8f5', minHeight: '100vh', padding: '20px 40px', fontFamily: 'sans-serif' }}>
      
      {/* 🌟 ナビゲーションタブ */}
      <nav style={{ display: 'flex', gap: '30px', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px', marginBottom: '30px' }}>
        <Link href="/" style={{ textDecoration: 'none', color: '#6b7280', fontWeight: '500' }}>
          戻る
        </Link>
        <Link href="/star_correct" style={{ textDecoration: 'none', color: '#6b7280', fontWeight: '500' }}>
          ユーザーページ
        </Link>
        <div style={{ color: '#1e3a8a', fontWeight: 'bold', borderBottom: '3px solid #d97706', paddingBottom: '10px', marginBottom: '-13px' }}>
          ジャンル別正答率
        </div>
      </nav>

      {/* 🌟 メインコンテンツ（ジャンルカード一覧） */}
      <main style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {genres.map((genre, genreIdx) => {
          const genreName = genre.genreName || genre.name || `ジャンル ${genreIdx + 1}`;
          const genreArray = getGenreStages(userStagesObj, genre, genreIdx);
          const totalAccuracy = calculateGenreAccuracy(genreArray);

          return (
            <div 
              key={genreName + genreIdx}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                borderTop: '4px solid #eab308', // 黄色のトップライン
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                padding: '20px 24px'
              }}
            >
              {/* ジャンルヘッダー */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ flex: 1 }} />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e3a8a', margin: 0, textAlign: 'center', flex: 1 }}>
                  {genreName}
                </h2>
                <div style={{ flex: 1, textAlign: 'right', fontSize: '0.95rem', color: '#4b5563', fontWeight: 'bold' }}>
                  正答率: <span style={{ color: '#374151' }}>{totalAccuracy}%</span>
                </div>
              </div>

              {/* ステージ正答率グリッド（6列横並び） */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px', borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}>
                {stages.map((stageName, index) => {
                  const stageDetail = genreArray[index];
                  const stageCorrect = Number(stageDetail?.correct || 0);
                  const stageTotal = Number(stageDetail?.total || 0);
                  
                  const stagePercent = stageTotal > 0 
                    ? Math.round((stageCorrect / stageTotal) * 100) 
                    : null;

                  return (
                    <div key={stageName} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '12px' }}>
                        {stageName}
                      </div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#111827' }}>
                        {stagePercent !== null ? `${stagePercent}%` : '- %'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}
"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import styles from './page.module.css';

export default function GenreAccuracyPage() {
  // ステージの定義（インデックス 0〜5 が各ステージに対応）
  const stages = ['ステージ1', 'ステージ2', 'ステージ3', 'ステージ4', 'ステージ5', 'ボス'];

  // データを保持する state
  const [accuracyData, setAccuracyData] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem("quizAccuracyData");

    if (saved) {
      setAccuracyData(JSON.parse(saved));
    } else {
      // 🌟 新しいデータ構造（配列形式 ＆ correct/total）に合わせたダミーデータ
      const dummyData = {
        "ジャンル1": [
          { clear: true, perfect: true, speed: false, correct: 8, total: 10 },  // インデックス0: ステージ1
          { clear: true, perfect: false, speed: true, correct: 7, total: 10 },  // インデックス1: ステージ2
          { clear: false, perfect: false, speed: false, correct: 0, total: 0 }, // インデックス2: ステージ3
          // ステージ4以降はまだプレイしていない（データがない）想定
        ],
        "ジャンル2": [
          { clear: true, perfect: false, speed: false, correct: 9, total: 10 }  // インデックス0: ステージ1
        ]
      };
      setAccuracyData(dummyData);
    }
  }, []);

  // ジャンル名を受け取り、そのジャンル全体の平均正答率を計算する関数
  const getGenreAverage = (genreName) => {
    // データが配列として格納されているか確認
    const genreArray = accuracyData[genreName];
    if (!Array.isArray(genreArray) || genreArray.length === 0) return "- %";

    let totalPercentage = 0;
    let count = 0;

    genreArray.forEach((stage) => {
      // totalが0より大きい場合のみ計算（0割りを防ぐ）
      if (stage && stage.total > 0) {
        const percentage = (stage.correct / stage.total) * 100;
        totalPercentage += percentage;
        count++;
      }
    });

    return count > 0 ? `${Math.round(totalPercentage / count)}%` : "- %";
  };

  // 画面に表示するジャンル一覧
  const genres = [
    { id: 1, name: "ジャンル1" },
    { id: 2, name: "ジャンル2" },
  ];

  return (
    <div className={styles.container}>
      {/* ヘッダー（タブ） */}
      <header className={styles.header}>
        <Link href="/">
          <button className={styles.tab}>戻る</button>
        </Link>
        <Link href="/userpage">
          <button className={styles.tab}>ユーザーページ</button>
        </Link>
        <button className={`${styles.tab} ${styles.tabActive}`}>ジャンル別正答率</button>
      </header>

      <main className={styles.content}>
        {genres.map((genre) => {
          // 該当ジャンルのデータ（配列）を取得
          const genreArray = accuracyData[genre.name] || [];

          return (
            <table key={genre.id} className={styles.genreTable}>
              <tbody>
                {/* 1行目：ジャンル名とジャンル全体の正答率 */}
                <tr>
                  <th colSpan="5" className={styles.genreTitle}>{genre.name}</th>
                  <th>正答率: {getGenreAverage(genre.name)}</th>
                </tr>
                
                {/* 2行目：ステージ名（6列） */}
                <tr>
                  {stages.map((stageName) => (
                    <th key={stageName}>{stageName}</th>
                  ))}
                </tr>
                
                {/* 3行目：各ステージの正答率の値（動的表示） */}
                <tr>
                  {stages.map((stageName, index) => {
                    // 🌟 配列のインデックス（0, 1, 2...）を使ってステージデータを取得
                    const stageDetail = genreArray[index];
                    
                    // correct と total からパーセンテージを計算
                    let displayVal = '- %';
                    if (stageDetail && stageDetail.total > 0) {
                      const percentage = Math.round((stageDetail.correct / stageDetail.total) * 100);
                      displayVal = `${percentage}%`;
                    }

                    return (
                      <td key={stageName}>
                        {displayVal}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          );
        })}
      </main>
    </div>
  );
}
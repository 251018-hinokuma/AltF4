"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGame } from "../context/GameContext";
import styles from "./page.module.css";

export default function QuizQuestion() {
  const router = useRouter();
  const searchParams = useSearchParams();

  //=========================================
  // URLクエリパラメータ & Context
  //=========================================
  const queryGenreId = searchParams.get("genreId");
  const queryStageId = searchParams.get("stageId");

  const { 
    game, 
    fetchQuizzes,
    updateElapsedTime, 
    setCurrentQuiz, 
    setSelectedAnswer 
  } = useGame();

  // ステート管理
  const [genres, setGenres] = useState([]);
  const [stageInfo, setStageInfo] = useState(null); // ステージ情報保持用

  // コンテキストのクイズ配列から現在の問題データを取得
  const quizIndex = game.currentQuestion > 0 ? game.currentQuestion - 1 : 0;
  const currentQuizData = game.quizzes && game.quizzes.length > 0 ? game.quizzes[quizIndex] : null;

  const [choices, setChoices] = useState([]);

  // 現在のジャンル・ステージID取得
  const currentGenreId = Number(queryGenreId || game.genreId || currentQuizData?.genreId || 1);
  const currentStageNum = Number(queryStageId || game.stageId || currentQuizData?.stageId || 1);

  // 難易度 & ボスステージ判定
  const isHardMode = game.difficulty === "hard" || game.mode === "hard" || !!game.isHard;
  const isBossStage = stageInfo?.isBoss || currentStageNum === 6;

  //=========================================
  // 【1. Genreモデルからジャンル一覧を取得】
  //=========================================
  useEffect(() => {
    async function loadGenres() {
      if (game.genres && game.genres.length > 0) {
        setGenres(game.genres);
      } else {
        try {
          const res = await fetch("/api/genres");
          if (res.ok) {
            const data = await res.json();
            const list = Array.isArray(data) ? data : (data.genres || []);
            setGenres(list);
          }
        } catch (e) {
          console.error("Genreデータの取得に失敗しました:", e);
        }
      }
    }
    loadGenres();
  }, [game.genres]);

  //=========================================
  // 【2. Stage情報を取得（最大HP・制限時間・ボス判定用）】
  //=========================================
  useEffect(() => {
    if (!currentGenreId || !currentStageNum) return;

    async function loadStageInfo() {
      try {
        const res = await fetch(`/api/stages?genreId=${currentGenreId}&stageId=${currentStageNum}`);
        if (res.ok) {
          const data = await res.json();
          const stagesList = data.stages || [];
          const currentStage = stagesList.find((s) => s.stageId === currentStageNum);
          if (currentStage) {
            setStageInfo(currentStage);
          }
        }
      } catch (e) {
        console.error("Stageデータの取得に失敗しました:", e);
      }
    }
    loadStageInfo();
  }, [currentGenreId, currentStageNum]);

  //=========================================
  // 初回クイズの取得 ＆ タイマー開始
  //=========================================
  useEffect(() => {
    // まだクイズデータが存在しない場合のみ API 取得（途中進行時のリセットを防止）
    if (!game.quizzes || game.quizzes.length === 0) {
      fetchQuizzes(currentGenreId, currentStageNum);
    }

    const timer = setInterval(() => {
      updateElapsedTime();
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentGenreId, currentStageNum]);

  //=========================================
  // mm:ss 経過時間フォーマット
  //=========================================
  const formattedTime = useMemo(() => {
    const minute = String(Math.floor(game.elapsedTime / 60)).padStart(2, "0");
    const second = String(game.elapsedTime % 60).padStart(2, "0");
    return `${minute}:${second}`;
  }, [game.elapsedTime]);

  //=========================================
  // 選択肢のシャッフル処理
  //=========================================
  useEffect(() => {
    if (currentQuizData) {
      const copy = currentQuizData.choices.map((text, index) => ({ text, originalIndex: index }));
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      setChoices(copy);
    }
  }, [currentQuizData]);

  //=========================================
  // シャッフル後の解説データ作成（解答画面へ渡す用）
  //=========================================
  const explanations = useMemo(() => {
    if (!currentQuizData || choices.length === 0) return [];
    
    return choices.map((choice) => ({
      choice: choice.text,
      explanation: currentQuizData.explanation[choice.originalIndex]
    }));
  }, [choices, currentQuizData]);

  //=========================================
  // 回答ボタンクリック処理
  //=========================================
 const choiceClick = (choice) => {
  if (!currentQuizData) return;

  // 現在プレイ中のステージ番号(currentStageNum)を渡すように変更
  setCurrentQuiz({
    quizId: currentQuizData.quizId,
    genreId: currentGenreId,
    stageId: currentStageNum, // ★ currentQuizData.stageId から修正
    question: currentQuizData.quizText,
    answer: currentQuizData.choices[currentQuizData.answer], 
    explanations 
  }, choices.map(c => c.text));

  setSelectedAnswer(choice.text);
  router.push(`/quiz_answer?genreId=${currentGenreId}&stageId=${currentStageNum}`);
  };

  //=========================================
  // ローディング表示
  //=========================================
  if (!currentQuizData) {
    return (
      <main className={styles.container} style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px" }}>
        <h2>問題を読み込み中...</h2>
      </main>
    );
  }

  // 最大HPの決定（難易度・ボスステージ対応）
  const maxHp = isHardMode
    ? (stageInfo?.hardHp || (isBossStage ? 7 : 3))
    : (stageInfo?.normalHp || (isBossStage ? 10 : 5));

  // ジャンル名取得
  const allGenres = genres.length > 0 ? genres : (game.genres || []);
  const foundGenreObj = allGenres.find(
    (g) => Number(g.genreId ?? g.id) === Number(currentGenreId)
  );

  const genreName = foundGenreObj?.genreName || foundGenreObj?.name || "";

  return (
    <main className={styles.container}>

      {/*============================*/}
      {/* ヘッダー */}
      {/*============================*/}
      <div className={styles.header}>

        {/* マーキングボタンの代わりの空白エリア */}
        <div className={styles.blankArea} style={{ width: "180px", borderRight: "2px solid black", height: "100%" }}></div>

        {/* 判定結果の代わりの空白エリア */}
        <div className={styles.blankArea} style={{ flex: 1, borderRight: "2px solid black", height: "100%" }}></div>

        {/* ジャンル名・ステージ数・問題番号 */}
        <div className={styles.quiz_now} style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
          {genreName && (
            <div style={{ fontSize: "0.8rem", opacity: 0.85 }}>
              {genreName}
            </div>
          )}
          {currentStageNum && (
            <div style={{ fontSize: "0.8rem", fontWeight: "bold", opacity: 0.85, marginBottom: "2px", color: isBossStage ? "#d63031" : "inherit" }}>
              {isBossStage ? "ボスステージ" : `ステージ ${currentStageNum}`}
            </div>
          )}
          <div>
            {game.currentQuestion}問 / {game.totalQuestion || game.quizzes.length}問
          </div>
        </div>

        {/* HP (動的に最大HPを表示) */}
        <div className={styles.quiz_HP} style={{ color: game.hp <= 1 ? "#ff4757" : "#000" }}>
          HP {game.hp} / {maxHp}
        </div>

        {/* 経過時間 */}
        <div className={styles.quiz_Time}>
          <div className={styles.timerTitle}>
            経過時間
          </div>
          <div className={styles.timer}>
            {formattedTime}
          </div>
        </div>

      </div>

      {/*============================*/}
      {/* 問題文 */}
      {/*============================*/}
      <div className={styles.quiz_text}>
        {currentQuizData.quizText}
      </div>

      {/*============================*/}
      {/* 選択肢ボタン */}
      {/*============================*/}
      <div className={styles.choiceArea}>
        {choices.map((choice, index) => (
          <button
            key={index}
            className={styles.choiceButton}
            onClick={() => choiceClick(choice)}
          >
            <div className={styles.choiceNumber}>
              {index + 1}
            </div>
            
            <div className={styles.quiz_choices}>
              {choice.text}
            </div>
          </button>
        ))}
      </div>

    </main>
  );
}
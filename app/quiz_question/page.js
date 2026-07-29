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
  const queryDifficulty = searchParams.get("difficulty") || searchParams.get("Difficulty");

  const { 
    game, 
    fetchQuizzes,
    updateElapsedTime, 
    setCurrentQuiz, 
    setSelectedAnswer,
    setHp
  } = useGame();

  // ステート管理
  const [genres, setGenres] = useState([]);
  const [stageInfo, setStageInfo] = useState(null);

  // ジャンル・ステージID
  const currentGenreId = Number(queryGenreId || game.genreId || 1);
  const currentStageNum = Number(queryStageId || game.stageId || 1);

  // 難易度判定 (1: Normal, 2: Hard)
  const currentDifficulty = Number(queryDifficulty || game.difficulty || 1);
  const isHardMode = currentDifficulty === 2 || game.difficulty === "hard" || game.mode === "hard" || !!game.isHard;
  const difficultyLabel = isHardMode ? "ハード" : "ノーマル";

  // ボスステージ判定
  const isBossStage = stageInfo?.isBoss || currentStageNum === 6;

  // 最大HPの決定
  const maxHp = isHardMode
    ? (stageInfo?.hardHp || (isBossStage ? 7 : 3))
    : (stageInfo?.normalHp || (isBossStage ? 10 : 5));

  //=========================================
  // 【クイズ取得 ＆ ゲーム初期化・リセット判定】
  //=========================================
  useEffect(() => {
    if (!currentGenreId || !currentStageNum) return;

    // 1. クイズデータが存在しない
    const isNoQuizzes = !game.quizzes || game.quizzes.length === 0;
    // 2. 前回のゲームでHPが0以下、またはゲーム終了フラグ（isFinished）が立っている
    const isGameOverOrFinished = game.hp <= 0 || game.isFinished;
    // 3. 別ジャンル・別ステージが選択された
    const isStageChanged =
      (game.genreId && Number(game.genreId) !== currentGenreId) ||
      (game.stageId && Number(game.stageId) !== currentStageNum);

    // 上記いずれかの場合はクイズを再読み込みして1問目からやり直す
    if (isNoQuizzes || isGameOverOrFinished || isStageChanged) {
      fetchQuizzes(currentGenreId, currentStageNum, maxHp);
    }
  }, [
    currentGenreId,
    currentStageNum,
    game.quizzes,
    game.hp,
    game.isFinished,
    game.genreId,
    game.stageId,
    maxHp,
    fetchQuizzes,
  ]);

  //=========================================
  // 【HPの補正・同期処理】
  //=========================================
  useEffect(() => {
    if (stageInfo && game.currentQuestion === 1 && !game.isFinished && game.hp > 0) {
      if (game.hp !== maxHp && typeof setHp === "function") {
        setHp(maxHp);
      }
    }
  }, [stageInfo, maxHp, game.currentQuestion, game.isFinished, game.hp, setHp]);

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
  // 【2. Stage情報を取得】
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
  // タイマー開始
  //=========================================
  useEffect(() => {
    const timer = setInterval(() => {
      updateElapsedTime();
    }, 1000);

    return () => clearInterval(timer);
  }, [updateElapsedTime]);

  // 現在の問題データ
  const quizIndex = game.currentQuestion > 0 ? game.currentQuestion - 1 : 0;
  const currentQuizData = game.quizzes && game.quizzes.length > 0 ? game.quizzes[quizIndex] : null;

  const [choices, setChoices] = useState([]);

  // mm:ss 経過時間フォーマット
  const formattedTime = useMemo(() => {
    const minute = String(Math.floor(game.elapsedTime / 60)).padStart(2, "0");
    const second = String(game.elapsedTime % 60).padStart(2, "0");
    return `${minute}:${second}`;
  }, [game.elapsedTime]);

  // 制限時間 mm:ss フォーマット
  const formattedSpeedLimit = useMemo(() => {
    const limitSec = isHardMode
      ? (stageInfo?.hardSpeedLimit || (isBossStage ? 250 : 100))
      : (stageInfo?.normalSpeedLimit || (isBossStage ? 500 : 200));

    if (!limitSec) return null;
    const minute = String(Math.floor(limitSec / 60)).padStart(2, "0");
    const second = String(limitSec % 60).padStart(2, "0");
    return `${minute}:${second}`;
  }, [stageInfo, isBossStage, isHardMode]);

  // 選択肢のシャッフル処理
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

  // シャッフル後の解説データ作成
  const explanations = useMemo(() => {
    if (!currentQuizData || choices.length === 0) return [];
    
    return choices.map((choice) => ({
      choice: choice.text,
      explanation: currentQuizData.explanation[choice.originalIndex]
    }));
  }, [choices, currentQuizData]);

  // 回答ボタンクリック処理
  const choiceClick = (choice) => {
    if (!currentQuizData) return;

    setCurrentQuiz({
      quizId: currentQuizData.quizId,
      genreId: currentGenreId,
      stageId: currentStageNum,
      question: currentQuizData.quizText,
      answer: currentQuizData.choices[currentQuizData.answer], 
      explanations 
    }, choices.map(c => c.text));

    setSelectedAnswer(choice.text);
    
    router.push(`/quiz_answer?genreId=${currentGenreId}&stageId=${currentStageNum}&difficulty=${currentDifficulty}`);
  };

  // ローディング表示
  if (!currentQuizData) {
    return (
      <main className={styles.container} style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px" }}>
        <h2>問題を読み込み中...</h2>
      </main>
    );
  }

  // 表示用HP
  const displayHp = game.hp <= 0 ? maxHp : game.hp;

  // ジャンル名取得
  const allGenres = genres.length > 0 ? genres : (game.genres || []);
  const foundGenreObj = allGenres.find(
    (g) => Number(g.genreId ?? g.id) === Number(currentGenreId)
  );
  const genreName = foundGenreObj?.genreName || foundGenreObj?.name || "";

  return (
    <main className={styles.container}>
      {/* ヘッダー */}
      <div className={styles.header}>
        <div className={styles.blankArea} style={{ width: "180px", borderRight: "2px solid black", height: "100%" }}></div>
        <div className={styles.blankArea} style={{ flex: 1, borderRight: "2px solid black", height: "100%" }}></div>

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

        <div 
          className={styles.quiz_HP} 
          style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}
        >
          <div style={{ 
            fontSize: "0.75rem", 
            fontWeight: "bold", 
            color: isHardMode ? "#d63031" : "#00b894",
            marginBottom: "1px"
          }}>
            {difficultyLabel}
          </div>
          <div style={{ color: displayHp <= 1 ? "#ff4757" : "#000" }}>
            HP {displayHp} / {maxHp}
          </div>
        </div>

        <div className={styles.quiz_Time}>
          <div className={styles.timerTitle}>経過時間</div>
          <div className={styles.timer}>
            {formattedTime}
            {formattedSpeedLimit && (
              <span style={{ fontSize: "0.75rem", opacity: 0.7, marginLeft: "4px" }}>
                / {formattedSpeedLimit}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 問題文 */}
      <div className={styles.quiz_text}>
        {currentQuizData.quizText}
      </div>

      {/* 選択肢ボタン */}
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
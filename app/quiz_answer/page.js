"use client";

import { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGame } from "../context/GameContext";
import styles from "./page.module.css";

function QuizAnswerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { game, toggleMarking, decreaseHp, addResultQuiz, nextQuestion, finishGame } = useGame();

  // ステート管理
  const [genres, setGenres] = useState([]);
  const [stageInfo, setStageInfo] = useState(null);

  const currentQuiz = game.currentQuiz;

  //=========================================
  // URLクエリパラメータ & Context
  //=========================================
  const queryGenreId = searchParams.get("genreId");
  const queryStageId = searchParams.get("stageId");
  const queryDifficulty = searchParams.get("difficulty") || searchParams.get("Difficulty");

  const currentGenreId = Number(queryGenreId || game.genreId || currentQuiz?.genreId || 1);
  const currentStageNum = Number(queryStageId || game.stageId || currentQuiz?.stageId || 1);

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

  // 正誤判定とマーキング状態の取得
  const isCorrect = currentQuiz ? game.selectedAnswer === currentQuiz.answer : false;
  const isMarked = currentQuiz ? game.user?.markingQuizIds?.includes(currentQuiz.quizId) : false;

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
  // 二重実行防止用のフラグ（useRef）
  //=========================================
  const processedRef = useRef(null);

  useEffect(() => {
    if (!currentQuiz) return;
    
    const quizId = currentQuiz.quizId;
    if (processedRef.current === quizId) return;

    processedRef.current = quizId;

    if (!game.user?.resultQuizIds?.includes(quizId)) {
      addResultQuiz(quizId);
      if (game.selectedAnswer !== currentQuiz.answer) {
        decreaseHp();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuiz]);

  // mm:ss 経過時間フォーマット
  const formattedTime = useMemo(() => {
    const minute = String(Math.floor(game.elapsedTime / 60)).padStart(2, "0");
    const second = String(game.elapsedTime % 60).padStart(2, "0");
    return `${minute}:${second}`;
  }, [game.elapsedTime]);

  // 制限時間 mm:ss フォーマット
  const formattedSpeedLimit = useMemo(() => {
    let limitSec = isHardMode
      ? (stageInfo?.hardSpeedLimit || (isBossStage ? 250 : 100))
      : (stageInfo?.normalSpeedLimit || (isBossStage ? 500 : 200));

    if (!limitSec) return null;
    const minute = String(Math.floor(limitSec / 60)).padStart(2, "0");
    const second = String(limitSec % 60).padStart(2, "0");
    return `${minute}:${second}`;
  }, [stageInfo, isBossStage, isHardMode]);

  // 最終問題、もしくはHPが0かの判定
  const isLastOrDead = useMemo(() => {
    const total = game.totalQuestion || (game.quizzes ? game.quizzes.length : 0);
    const isLast = total > 0 && game.currentQuestion >= total;
    const isDead = game.hp <= 0;
    
    return isLast || isDead;
  }, [game.currentQuestion, game.totalQuestion, game.quizzes, game.hp]);

  if (!currentQuiz) {
    return (
      <div className={styles.loadingWrapper}>
        <h2>データを読み込み中...</h2>
      </div>
    );
  }

  // 表示用のHP算出
  const displayHp = (game.currentQuestion <= 1 && game.hp <= 0) ? maxHp : game.hp;

  // ジャンル名取得
  const allGenres = genres.length > 0 ? genres : (game.genres || []);
  const foundGenreObj = allGenres.find(
    (g) => Number(g.genreId ?? g.id) === Number(currentGenreId)
  );
  const genreName = foundGenreObj?.genreName || foundGenreObj?.name || "";

  // 下部ボタンクリック処理
  const handleNext = () => {
    if (isLastOrDead) {
      if (typeof finishGame === "function") {
        finishGame();
      }
      router.push(`/quiz_result?genreId=${currentGenreId}&stageId=${currentStageNum}&difficulty=${currentDifficulty}`);
    } else {
      nextQuestion();
      router.push(`/quiz_question?genreId=${currentGenreId}&stageId=${currentStageNum}&difficulty=${currentDifficulty}`);
    }
  };

  return (
    <div className={styles.mainCard}>
      {/* ヘッダー */}
      <div className={styles.header}>
        <div className={styles.markArea}>
          <span className={styles.markText}>マーキング</span>
          <button
            className={styles.markingbutton}
            onClick={() => toggleMarking(currentQuiz.quizId)}
          >
            {isMarked ? "★" : "☆"}
          </button>
        </div>

        <div className={`${styles.quiz_result} ${isCorrect ? styles.resultCorrect : styles.resultIncorrect}`}>
          {isCorrect ? "正解" : "不正解"}
        </div>

        <div className={styles.quiz_now}>
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
            {game.currentQuestion}問 / {game.totalQuestion || game.quizzes?.length || "-"}問
          </div>
        </div>

        <div className={styles.quiz_HP}>
          <div style={{ 
            fontSize: "0.75rem", 
            fontWeight: "bold", 
            color: isHardMode ? "#d63031" : "#00b894",
            marginBottom: "1px"
          }}>
            {difficultyLabel}
          </div>
          <div style={{ color: displayHp <= 1 ? "#ff4757" : "#2c1a0e" }}>
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
        {currentQuiz.question}
      </div>

      {/* 選択肢一覧 */}
      <div className={styles.answerArea}>
        {currentQuiz.choices?.map((choiceText, index) => {
          const isUserSelected = game.selectedAnswer === choiceText;
          const isRealAnswer = currentQuiz.answer === choiceText;
          
          let rowClass = styles.rowDefault;
          if (isRealAnswer) {
            rowClass = styles.rowCorrect;
          } else if (isUserSelected) {
            rowClass = styles.rowIncorrect;
          }

          const expObj = currentQuiz.explanations?.find((e) => e.choice === choiceText);
          const explanationText = expObj ? expObj.explanation : "";

          return (
            <div key={index} className={`${styles.answerRow} ${rowClass}`}>
              <div className={styles.choiceNo}>
                {index + 1}
              </div>
              <div className={styles.quiz_choices}>
                {choiceText}
              </div>
              <div className={styles.quiz_explanation}>
                {explanationText}
              </div>
            </div>
          );
        })}
      </div>

      {/* 下部ボタンエリア */}
      <div className={styles.bottom}>
        <button className={styles.quiz_move_nextbutton} onClick={handleNext}>
          {isLastOrDead ? "結果へ" : "次の問題"}
        </button>
      </div>
    </div>
  );
}

export default function QuizAnswer() {
  return (
    <main className={styles.container}>
      {/* 背景要素 */}
      <div className={styles.sky}></div>
      <div className={styles.cloud1}></div>
      <div className={styles.cloud2}></div>
      <div className={styles.mountain}></div>
      <div className={styles.forest}></div>
      <div className={styles.ground}></div>

      <Suspense fallback={
        <div className={styles.loadingWrapper}>
          <h2>データを読み込み中...</h2>
        </div>
      }>
        <QuizAnswerContent />
      </Suspense>
    </main>
  );
}
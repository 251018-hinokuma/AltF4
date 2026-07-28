"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGame } from "../context/GameContext";
import styles from "./page.module.css";

export default function QuizAnswer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { game, toggleMarking, decreaseHp, addResultQuiz, nextQuestion } = useGame();

  // ステート管理
  const [genres, setGenres] = useState([]);
  const [stageInfo, setStageInfo] = useState(null); // ステージ情報保持用

  const currentQuiz = game.currentQuiz;

  // URLパラメータ & Context からの現在のステージ・ジャンル取得
  const queryGenreId = searchParams.get("genreId");
  const queryStageId = searchParams.get("stageId");

  const currentGenreId = Number(queryGenreId || game.genreId || currentQuiz?.genreId || 1);
  const currentStageNum = Number(queryStageId || game.stageId || currentQuiz?.stageId || 1);

  // 難易度判定
  const isHardMode = game.difficulty === "hard" || game.mode === "hard" || !!game.isHard;

  // ボスステージ判定
  const isBossStage = stageInfo?.isBoss || currentStageNum === 6;
  
  // 正誤判定とマーキング状態の取得
  const isCorrect = currentQuiz ? game.selectedAnswer === currentQuiz.answer : false;
  const isMarked = currentQuiz ? game.user.markingQuizIds.includes(currentQuiz.quizId) : false;

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
  // 【2. Stage情報を取得（最大HP・制限時間の参照用）】
  //=========================================
  useEffect(() => {
    if (!currentGenreId || !currentStageNum) return;

    async function loadStageInfo() {
      try {
        const res = await fetch(`/api/stages?genreId=${currentGenreId}&stageId=${currentStageNum}`);
        if (res.ok) {
          const data = await res.json();
          const stagesList = data.stages || [];
          const currentStage = stagesList.find(s => s.stageId === currentStageNum);
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

  // HP減少と結果（履歴）追加を1回だけ安全に行う
  useEffect(() => {
    if (!currentQuiz) return;
    
    const quizId = currentQuiz.quizId;

    // すでにこの問題の判定処理が終わっている場合はスキップ
    if (processedRef.current === quizId) {
      return;
    }

    // 処理開始時にフラグを立てる（StrictMode等の二重実行を防止）
    processedRef.current = quizId;

    if (!game.user.resultQuizIds.includes(quizId)) {
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

  // 制限時間 mm:ss フォーマット（難易度 Normal / Hard 自動切替＆ボスフォールバック対応）
  const formattedSpeedLimit = useMemo(() => {
    let limitSec = isHardMode
      ? (stageInfo?.hardSpeedLimit || (isBossStage ? 250 : 100))
      : (stageInfo?.normalSpeedLimit || (isBossStage ? 500 : 200));

    if (!limitSec) return null;
    const minute = String(Math.floor(limitSec / 60)).padStart(2, "0");
    const second = String(limitSec % 60).padStart(2, "0");
    return `${minute}:${second}`;
  }, [stageInfo, isBossStage, isHardMode]);

  // 最終問題、もしくはHPが0かどうかの判定
  const isLastOrDead = useMemo(() => {
    const isLast = game.currentQuestion >= (game.totalQuestion || game.quizzes?.length || 10);
    const isDead = game.hp <= 0;
    
    return isLast || isDead;
  }, [game.currentQuestion, game.totalQuestion, game.quizzes, game.hp]);

  // データ未ロード時のフォールバック表示
  if (!currentQuiz) {
    return (
      <main className={styles.container} style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px" }}>
        <h2>データを読み込み中...</h2>
      </main>
    );
  }

  // 最大HPの決定（Hard/Normal、ボス/通常を考慮）
  const maxHp = isHardMode
    ? (stageInfo?.hardHp || (isBossStage ? 7 : 3))
    : (stageInfo?.normalHp || (isBossStage ? 10 : 5));

  // ジャンル名取得
  const allGenres = genres.length > 0 ? genres : (game.genres || []);
  const foundGenreObj = allGenres.find(
    (g) => Number(g.genreId ?? g.id) === Number(currentGenreId)
  );

  const genreName = foundGenreObj?.genreName || foundGenreObj?.name || "";

  // 下部ボタン（次の問題 / 結果へ）クリック処理
  const handleNext = () => {
    if (isLastOrDead) {
      router.push(`/quiz_review?genreId=${currentGenreId}&stageId=${currentStageNum}`);
    } else {
      nextQuestion();
      router.push(`/quiz_question?genreId=${currentGenreId}&stageId=${currentStageNum}`);
    }
  };

  return (
    <main className={styles.container}>
      {/*============================*/}
      {/* ヘッダー */}
      {/*============================*/}
      <div className={styles.header}>
        {/* マーキングボタンと星 */}
        <div className={styles.markArea}>
          <span className={styles.markText}>マーキング</span>
          <button
            className={styles.markingbutton}
            onClick={() => toggleMarking(currentQuiz.quizId)}
          >
            {isMarked ? "★" : "☆"}
          </button>
        </div>

        {/* 判定結果 */}
        <div className={styles.quiz_result} style={{ backgroundColor: isCorrect ? "#e8f5e9" : "#ffebee" }}>
          {isCorrect ? "正解" : "不正解"}
        </div>

        {/* ジャンル名・ステージ数・問題番号（縦並び） */}
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
            {game.currentQuestion}問 / {game.totalQuestion || game.quizzes?.length}問
          </div>
        </div>

        {/* HP (動的に最大HPを表示) */}
        <div className={styles.quiz_HP} style={{ color: game.hp <= 1 ? "#ff4757" : "#000" }}>
          HP {game.hp} / {maxHp}
        </div>

        {/* 経過時間 / 制限時間 */}
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

      {/*============================*/}
      {/* 問題文 */}
      {/*============================*/}
      <div className={styles.quiz_text}>
        {currentQuiz.question}
      </div>

      {/*============================*/}
      {/* 選択肢一覧（テーブル） */}
      {/*============================*/}
      <div className={styles.answerArea}>
        {currentQuiz.choices?.map((choiceText, index) => {
          const isUserSelected = game.selectedAnswer === choiceText;
          const isRealAnswer = currentQuiz.answer === choiceText;
          
          // 背景色の指定
          let rowBgColor = "#fff";
          if (isRealAnswer) {
            rowBgColor = "#e8f5e9"; // 正解行（緑）
          } else if (isUserSelected) {
            rowBgColor = "#ffebee"; // 間違えて選んだ行（赤）
          }

          // この選択肢に対応する解説テキストを抽出
          const expObj = currentQuiz.explanations?.find((e) => e.choice === choiceText);
          const explanationText = expObj ? expObj.explanation : "";

          return (
            <div key={index} className={styles.answerRow}>
              <div className={styles.choiceNo} style={{ backgroundColor: rowBgColor }}>
                {index + 1}
              </div>
              <div className={styles.quiz_choices} style={{ backgroundColor: rowBgColor }}>
                {choiceText}
              </div>
              <div className={styles.quiz_explanation} style={{ backgroundColor: rowBgColor }}>
                {explanationText}
              </div>
            </div>
          );
        })}
      </div>

      {/*============================*/}
      {/* 下部ボタンエリア */}
      {/*============================*/}
      <div className={styles.bottom}>
        <button className={styles.quiz_move_nextbutton} onClick={handleNext}>
          {isLastOrDead ? "結果へ" : "次の問題"}
        </button>
      </div>
    </main>
  );
}
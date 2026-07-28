"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "../context/GameContext";
import styles from "./page.module.css";

export default function QuizAnswer() {
  const router = useRouter();
  const { game, toggleMarking, decreaseHp, addResultQuiz, nextQuestion } = useGame();

  // ステート管理
  const [genres, setGenres] = useState([]);
  const [stageInfo, setStageInfo] = useState(null); // ステージ情報保持用

  const currentQuiz = game.currentQuiz;
  
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
    if (!currentQuiz?.genreId || !currentQuiz?.stageId) return;

    async function loadStageInfo() {
      try {
        const res = await fetch(`/api/stages?genreId=${currentQuiz.genreId}&stageId=${currentQuiz.stageId}`);
        if (res.ok) {
          const data = await res.json();
          const stagesList = data.stages || [];
          const currentStage = stagesList.find(s => s.stageId === Number(currentQuiz.stageId));
          if (currentStage) {
            setStageInfo(currentStage);
          }
        }
      } catch (e) {
        console.error("Stageデータの取得に失敗しました:", e);
      }
    }
    loadStageInfo();
  }, [currentQuiz?.genreId, currentQuiz?.stageId]);

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

  // 制限時間 mm:ss フォーマット
  const formattedSpeedLimit = useMemo(() => {
    const limitSec = stageInfo?.normalSpeedLimit;
    if (!limitSec) return null;
    const minute = String(Math.floor(limitSec / 60)).padStart(2, "0");
    const second = String(limitSec % 60).padStart(2, "0");
    return `${minute}:${second}`;
  }, [stageInfo]);

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

  // 最大HPの決定（Stage情報から取得、無ければデフォルト5）
  const maxHp = stageInfo?.normalHp || 5;

  // ジャンル名・ステージ情報
  const targetGenreId = currentQuiz?.genreId;
  const allGenres = genres.length > 0 ? genres : (game.genres || []);
  
  const foundGenreObj = allGenres.find(
    (g) => Number(g.genreId ?? g.id) === Number(targetGenreId)
  );

  const genreName = foundGenreObj?.genreName || foundGenreObj?.name || "";
  const stageNum = currentQuiz?.stageId;

  // 下部ボタン（次の問題 / 結果へ）クリック処理
  const handleNext = () => {
    if (isLastOrDead) {
      //router.push("/quiz_result");
      router.push("/quiz_review");
    } else {
      nextQuestion();
      router.push("/quiz_question");
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
          {stageNum && (
            <div style={{ fontSize: "0.8rem", opacity: 0.85, marginBottom: "2px" }}>
              {stageInfo?.isBoss ? "ボスステージ" : `ステージ ${stageNum}`}
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
        {currentQuiz.choices.map((choiceText, index) => {
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
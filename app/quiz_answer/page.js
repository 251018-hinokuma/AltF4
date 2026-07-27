"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "../context/GameContext";
import styles from "./page.module.css";

export default function QuizAnswer() {
  const router = useRouter();
  const { game, toggleMarking, decreaseHp, addResultQuiz, nextQuestion } = useGame();

  const currentQuiz = game.currentQuiz;
  
  // 正誤判定とマーキング状態の取得
  const isCorrect = currentQuiz ? game.selectedAnswer === currentQuiz.answer : false;
  const isMarked = currentQuiz ? game.user.markingQuizIds.includes(currentQuiz.quizId) : false;

  //=========================================
  // 【★超重要】二重実行防止用のフラグ（useRef）
  //=========================================
  const processedRef = useRef(null);

  // HP減少と結果（履歴）追加を1回だけ安全に行う
  useEffect(() => {
    if (!currentQuiz) return;
    
    const quizId = currentQuiz.quizId;

    // すでにこの問題の判定処理が終わっている場合は、絶対に処理を通さない
    if (processedRef.current === quizId) {
      return;
    }

    // 処理開始時にフラグを立てる（StrictModeの二重実行を瞬時にブロックします）
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

  // 最終問題、もしくはHPが0かどうかの判定
  const isLastOrDead = useMemo(() => {
    const isLast = game.currentQuestion >= (game.totalQuestion || game.quizzes?.length || 10);
    const isDead = game.hp <= 0;
    
    return isLast || isDead;
  }, [game.currentQuestion, game.totalQuestion, game.quizzes, game.hp]);

  // データ未ロード時のフォールバック表示
  if (!currentQuiz) {
    return (
      <main className={styles.container}style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px" }}>
        <h2>データを読み込み中...</h2>
      </main>
    );
  }

  // 下部ボタン（次の問題 / 結果へ）クリック処理
  const handleNext = () => {
    if (isLastOrDead) {
      // 元々の処理（result画面へ遷移）
      // router.push("/quiz_result");

      // 一時的な確認用処理（review画面へ遷移）
      router.push("/quiz_result");
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

        {/* 【No.2】判定結果 */}
        <div className={styles.quiz_result} style={{ backgroundColor: isCorrect ? "#e8f5e9" : "#ffebee" }}>
          {isCorrect ? "正解" : "不正解"}
        </div>

        {/* 【No.3】問題番号 */}
        <div className={styles.quiz_now}>
          {game.currentQuestion}問 / {game.totalQuestion || game.quizzes?.length}問
        </div>

        {/* 【No.4】HP */}
        <div className={styles.quiz_HP} style={{ color: game.hp <= 1 ? "#ff4757" : "#000" }}>
          HP {game.hp}/5
        </div>

        {/* 【No.5】経過時間 */}
        <div className={styles.quiz_Time}>
          <div className={styles.timerTitle}>経過時間</div>
          <div className={styles.timer}>{formattedTime}</div>
        </div>
      </div>

      {/*============================*/}
      {/* 【No.6】問題文 */}
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
          const expObj = currentQuiz.explanations.find((e) => e.choice === choiceText);
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
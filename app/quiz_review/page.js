
"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "../context/GameContext";
import styles from "./page.module.css";

export default function QuizReview() {
  const router = useRouter();
  const { game, toggleMarking } = useGame();

  // ジャンル一覧保持用ステート
  const [genres, setGenres] = useState([]);

  // 復習画面で何問目を表示しているかのインデックス（0始まり）
  const [reviewIndex, setReviewIndex] = useState(0);

  // 出題された問題リスト
  const quizzes = game.quizzes || [];
  const currentQuiz = quizzes[reviewIndex] || null;

  //=========================================
  // 【Genreモデルからジャンル一覧を取得】
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

  // 問題IDの柔軟な取得（quizId または id）
  const quizId = currentQuiz ? (currentQuiz.quizId || currentQuiz.id) : null;

  // ジャンルIDおよびステージ数の取得
  const genreId = currentQuiz?.genreId || game.genreId || 1;
  const stageNum = currentQuiz?.stageId || game.stageId;

  // Genreモデルの genreName からジャンル名を取得
  const allGenres = genres.length > 0 ? genres : (game.genres || []);
  const foundGenreObj = allGenres.find(
    (g) => Number(g.genreId) === Number(genreId)
  );
  const genreName = foundGenreObj?.genreName || "";

  // マーキング状態の取得
  const isMarked = quizId ? game.user.markingQuizIds.includes(quizId) : false;

  // ユーザーが選択した回答の取得
  const userAnswer = quizId ? game.userAnswers?.[quizId] : undefined;

  //=========================================
  // 正誤判定ヘルパー関数（型・インデックス変換対応）
  //=========================================
  const checkIsCorrect = (quiz, userAns) => {
    if (!quiz || userAns === undefined || userAns === null || userAns === "") {
      return false;
    }

    const realAns = quiz.answer;

    // 1. 完全一致（文字列同士、数値同士）
    if (userAns === realAns) return true;

    // 2. 文字列と数値の型の違いを吸収（"0" と 0 など）
    if (String(userAns).trim() === String(realAns).trim()) return true;

    // 3. answer がインデックス（数値）で userAns が選択肢テキスト（文字列）の場合の相互変換
    if (Array.isArray(quiz.choices)) {
      // realAns がインデックスの場合
      const ansIndex = Number(realAns);
      if (!isNaN(ansIndex) && quiz.choices[ansIndex] !== undefined) {
        if (quiz.choices[ansIndex] === userAns) return true;
      }

      // userAns がインデックスの場合
      const userIndex = Number(userAns);
      if (!isNaN(userIndex) && quiz.choices[userIndex] !== undefined) {
        if (quiz.choices[userIndex] === realAns) return true;
      }
    }

    return false;
  };

  //=========================================
  // 回答ステータスの判定 ('correct' | 'incorrect' | 'unanswered')
  //=========================================
  const answerStatus = useMemo(() => {
    if (!currentQuiz || !quizId) return "unanswered";

    // 解答履歴（resultQuizIds）に含まれているかチェック
    const isAnswered = game.user?.resultQuizIds?.includes(quizId);

    // 回答していない（HP0による終了など）場合は未回答
    if (!isAnswered) {
      return "unanswered";
    }

    // 正解判定
    const isCorrect = checkIsCorrect(currentQuiz, userAnswer);

    return isCorrect ? "correct" : "incorrect";
  }, [currentQuiz, quizId, game.user?.resultQuizIds, userAnswer]);

  // ステージ選択画面への遷移
  const handleGoToStageSelection = () => {
    router.push(`/quiz_stageSelection?genreId=${genreId}`);
  };

  if (!currentQuiz || quizzes.length === 0) {
    return (
      <main className={styles.container} style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px" }}>
        <h2>復習する問題がありません</h2>
      </main>
    );
  }

  // ステータスに応じたスタイルの決定
  const statusStyle = {
    correct: { text: "正解", bg: "#e8f5e9", color: "#2e7d32" },
    incorrect: { text: "不正解", bg: "#ffebee", color: "#c62828" },
    unanswered: { text: "未回答", bg: "#f5f5f5", color: "#757575" },
  }[answerStatus];

  return (
    <main className={styles.container}>
      {/*============================*/}
      {/* ヘッダー */}
      {/*============================*/}
      <div className={styles.header}>
        {/* マーキングボタン */}
        <div className={styles.markArea}>
          <span className={styles.markText}>マーキング</span>
          <button 
            className={styles.markingbutton} 
            onClick={() => quizId && toggleMarking(quizId)}
          >
            {isMarked ? "★" : "☆"}
          </button>
        </div>

        {/* 判定結果（正解 / 不正解 / 未回答） */}
        <div 
          className={styles.quiz_result} 
          style={{ 
            backgroundColor: statusStyle.bg,
            color: statusStyle.color
          }}
        >
          {statusStyle.text}
        </div>

        {/* 【No.3】ジャンル名・ステージ数・問題番号（縦並び） */}
        <div className={styles.quiz_now} style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
          {genreName && (
            <div style={{ fontSize: "0.8rem", opacity: 0.85 }}>
              {genreName}
            </div>
          )}
          {stageNum && (
            <div style={{ fontSize: "0.8rem", opacity: 0.85, marginBottom: "2px" }}>
              ステージ {stageNum}
            </div>
          )}
          <div>
            {reviewIndex + 1}問 / {quizzes.length}問
          </div>
        </div>
      </div>

      {/*============================*/}
      {/* 問題文 */}
      {/*============================*/}
      <div className={styles.quiz_text}>
        {currentQuiz.quizText || currentQuiz.question}
      </div>

      {/*============================*/}
      {/* 選択肢一覧 */}
      {/*============================*/}
      <div className={styles.answerArea}>
        {currentQuiz.choices.map((choiceText, index) => {
          // 正解の選択肢かどうかを判定
          const isRealAnswer = 
            currentQuiz.answer === choiceText ||
            String(currentQuiz.answer) === String(index) ||
            currentQuiz.choices[Number(currentQuiz.answer)] === choiceText;

          // ユーザーが選択した選択肢かどうかを判定
          const isUserSelected = 
            userAnswer === choiceText ||
            String(userAnswer) === String(index) ||
            currentQuiz.choices[Number(userAnswer)] === choiceText;

          // 解説テキストの取得
          const explanationText = Array.isArray(currentQuiz.explanation)
            ? currentQuiz.explanation[index]
            : (currentQuiz.explanations?.find(e => e.choice === choiceText)?.explanation || "");

          // 背景色の指定
          let rowBgColor = "#fff";
          if (isRealAnswer) {
            rowBgColor = "#e8f5e9"; // 正解行（薄い緑）
          } else if (isUserSelected) {
            rowBgColor = "#ffebee"; // 間違えて選択した行（薄い赤）
          }

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
      {/* 下部ボタン */}
      {/*============================*/}
      <div className={styles.review_bottom}>
        <button 
          className={styles.review_nav_button} 
          onClick={() => setReviewIndex((prev) => Math.max(0, prev - 1))}
          disabled={reviewIndex === 0}
        >
          前の問題
        </button>

        <button className={styles.quiz_move_nextbutton} onClick={handleGoToStageSelection}>
          ステージ選択へ
        </button>

        <button 
          className={styles.review_nav_button} 
          onClick={() => setReviewIndex((prev) => Math.min(quizzes.length - 1, prev + 1))}
          disabled={reviewIndex === quizzes.length - 1}
        >
          次の問題
        </button>
      </div>
    </main>
  );
}
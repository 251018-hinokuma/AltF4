"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGame } from "../context/GameContext";
import styles from "./page.module.css";

export default function QuizReview() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { game, toggleMarking } = useGame();

  // ステート管理
  const [genres, setGenres] = useState([]);
  const [stageInfo, setStageInfo] = useState(null); // ステージ情報保持用
  const [reviewIndex, setReviewIndex] = useState(0); // 復習画面のインデックス

  // URLパラメータの取得
  const queryGenreId = searchParams.get("genreId");
  const queryStageId = searchParams.get("stageId");

  // 出題された問題リスト
  const quizzes = game.quizzes || [];
  const currentQuiz = quizzes[reviewIndex] || null;

  // 問題個別のstageIdではなく、現在プレイ中・選択中のステージIDを優先取得
  const currentGenreId = Number(queryGenreId || game.genreId || currentQuiz?.genreId || 1);
  const currentStageNum = Number(queryStageId || game.stageId || 1);

  // ボスステージ判定（stageId = 6 または APIからの isBoss フラグ）
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

  // 問題IDの取得（数値に統一できるように準備）
  const rawQuizId = currentQuiz ? (currentQuiz.quizId ?? currentQuiz.id) : null;
  const quizId = rawQuizId !== null ? Number(rawQuizId) : null;

  //=========================================
  // 【2. Stage情報を取得（ボスステージ判定用）】
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

  // ジャンル名の参照
  const allGenres = genres.length > 0 ? genres : (game.genres || []);
  const foundGenreObj = allGenres.find(
    (g) => Number(g.genreId ?? g.id) === Number(currentGenreId)
  );
  const genreName = foundGenreObj?.genreName || foundGenreObj?.name || "";

  // マーキング状態の取得（数値キャストで安全に比較）
  const isMarked = quizId !== null 
    ? (game.user?.markingQuizIds || []).some((id) => Number(id) === quizId)
    : false;

  // ユーザーが選択した回答の取得
  const userAnswer = quizId !== null ? game.userAnswers?.[quizId] : undefined;

  //=========================================
  // 正誤判定ヘルパー関数
  //=========================================
  const checkIsCorrect = (quiz, userAns) => {
    if (!quiz || userAns === undefined || userAns === null || userAns === "") {
      return false;
    }

    const realAns = quiz.answer;

    // 1. 完全一致
    if (userAns === realAns) return true;
    if (String(userAns).trim() === String(realAns).trim()) return true;

    // 2. DBの answer がインデックス（数値）で、userAns が選択肢テキストの場合
    if (Array.isArray(quiz.choices)) {
      const ansIndex = Number(realAns);
      if (!isNaN(ansIndex) && quiz.choices[ansIndex] !== undefined) {
        if (quiz.choices[ansIndex] === userAns) return true;
      }

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
    if (!currentQuiz || quizId === null) return "unanswered";

    // 数値として結果ID一覧に含まれるか検索
    const isAnswered = (game.user?.resultQuizIds || []).some((id) => Number(id) === quizId);

    if (!isAnswered) {
      return "unanswered";
    }

    return checkIsCorrect(currentQuiz, userAnswer) ? "correct" : "incorrect";
  }, [currentQuiz, quizId, game.user?.resultQuizIds, userAnswer]);

  // ステージ選択画面への遷移
  const handleGoToStageSelection = () => {
    router.push(`/quiz_stageSelection?genreId=${currentGenreId}`);
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
      {/* ヘッダー */}
      <div className={styles.header}>
        {/* マーキングボタン */}
        <div className={styles.markArea}>
          <span className={styles.markText}>マーキング</span>
          <button 
            className={styles.markingbutton} 
            onClick={() => quizId !== null && toggleMarking(quizId)}
          >
            {isMarked ? "★" : "☆"}
          </button>
        </div>

        {/* 判定結果 */}
        <div 
          className={styles.quiz_result} 
          style={{ 
            backgroundColor: statusStyle.bg,
            color: statusStyle.color
          }}
        >
          {statusStyle.text}
        </div>

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
            {reviewIndex + 1}問 / {quizzes.length}問
          </div>
        </div>
      </div>

      {/* 問題文 */}
      <div className={styles.quiz_text}>
        {currentQuiz.quizText || currentQuiz.question}
      </div>

      {/* 選択肢一覧 */}
      <div className={styles.answerArea}>
        {(currentQuiz.choices || []).map((choiceText, index) => {
          // 正解の選択肢かどうか
          const isRealAnswer = 
            currentQuiz.answer === choiceText ||
            String(currentQuiz.answer) === String(index) ||
            currentQuiz.choices?.[Number(currentQuiz.answer)] === choiceText;

          // ユーザーが選択した選択肢かどうか
          const isUserSelected = 
            userAnswer === choiceText ||
            String(userAnswer) === String(index) ||
            currentQuiz.choices?.[Number(userAnswer)] === choiceText;

          // 解説テキストの取得
          const explanationText = Array.isArray(currentQuiz.explanation)
            ? (currentQuiz.explanation[index] || "")
            : (currentQuiz.explanations?.find((e) => e.choice === choiceText)?.explanation || "");

          // 背景色の指定
          let rowBgColor = "#fff";
          if (isRealAnswer) {
            rowBgColor = "#e8f5e9"; // 正解行（緑）
          } else if (isUserSelected) {
            rowBgColor = "#ffebee"; // 間違えて選択した行（赤）
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

      {/* 下部ボタン */}
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
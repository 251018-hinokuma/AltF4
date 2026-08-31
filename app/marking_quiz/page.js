"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGame } from "../context/GameContext";
import styles from "./page.module.css";

function MarkingQuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { game, toggleMarking } = useGame();

  // URLパラメーター取得 (?genreId=1&quizId=3)
  const targetGenreId = Number(searchParams.get("genreId")) || 1;
  const targetQuizId = searchParams.get("quizId") ? Number(searchParams.get("quizId")) : null;

  // ジャンル一覧保持用ステート
  const [genres, setGenres] = useState([]);

  const [markedQuizzes, setMarkedQuizzes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

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

  //=========================================
  // 【問題データの多角的自動取得 ＆ フィルタリング】
  //=========================================
  useEffect(() => {
    async function processMarkedQuizzes() {
      setIsLoading(true);

      try {
        // --- 1: markingQuizIds の取得 ---
        let localIds = [];
        try {
          const saved = localStorage.getItem("markingQuizIds");
          if (saved) {
            localIds = JSON.parse(saved).map((id) => Number(id));
          }
        } catch (e) {
          console.error(e);
        }

        const contextIds = (game.user?.markingQuizIds || []).map((id) => Number(id));
        let activeMarkedIds = Array.from(new Set([...localIds, ...contextIds]));

        // --- 2: APIからの問題データ取得 ---
        let rawQuizzes = [];

        if (game.quizzes && game.quizzes.length > 0) {
          rawQuizzes = game.quizzes;
        } else {
          try {
            const res = await fetch(`/api/quizzes?genreId=${targetGenreId}`);
            const data = await res.json();
            const list = Array.isArray(data) ? data : (data.quizzes || data.data || []);
            if (list.length > 0) rawQuizzes = list;
          } catch (e) {
            console.error("ジャンル単体取得失敗:", e);
          }

          if (rawQuizzes.length === 0) {
            const stageNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            const fetchPromises = stageNumbers.map((stageId) =>
              fetch(`/api/quizzes?genreId=${targetGenreId}&stageId=${stageId}`)
                .then((res) => res.json())
                .then((data) => (Array.isArray(data) ? data : (data.quizzes || data.data || [])))
                .catch(() => [])
            );

            const results = await Promise.all(fetchPromises);
            const combined = results.flat();

            const uniqueMap = new Map();
            combined.forEach((q) => {
              const qId = Number(q.quizId ?? q.quiz_id ?? q.id);
              if (qId && !uniqueMap.has(qId)) {
                uniqueMap.set(qId, q);
              }
            });

            rawQuizzes = Array.from(uniqueMap.values());
          }
        }

        if (activeMarkedIds.length === 0 || rawQuizzes.length === 0) {
          setMarkedQuizzes([]);
          setIsLoading(false);
          return;
        }

        // --- 3: フィルタリング処理 ---
        const filtered = rawQuizzes.filter((q) => {
          const qId = Number(q.quizId ?? q.quiz_id ?? q.id);
          const qGenre = Number(q.genreId ?? q.genre_id ?? targetGenreId);

          const isMarked = activeMarkedIds.includes(qId);
          const isCorrectGenre = qGenre === targetGenreId;

          return isMarked && isCorrectGenre;
        });

        // --- 4: quizId 昇順ソート ---
        filtered.sort((a, b) => {
          const idA = Number(a.quizId ?? a.quiz_id ?? a.id);
          const idB = Number(b.quizId ?? b.quiz_id ?? b.id);
          return idA - idB;
        });

        setMarkedQuizzes(filtered);

        // --- 5: 初期表示位置の設定 ---
        if (targetQuizId !== null) {
          const targetIndex = filtered.findIndex((q) => {
            const qId = Number(q.quizId ?? q.quiz_id ?? q.id);
            return qId === targetQuizId;
          });

          if (targetIndex !== -1) {
            setCurrentIndex(targetIndex);
          }
        }

      } catch (error) {
        console.error("マーキング問題の処理中にエラーが発生しました:", error);
      } finally {
        setIsLoading(false);
      }
    }

    processMarkedQuizzes();
  }, [targetGenreId, targetQuizId, game.quizzes, game.user?.markingQuizIds]);

  // 現在表示中の問題
  const currentQuiz = markedQuizzes[currentIndex] || null;
  const currentQuizId = currentQuiz ? Number(currentQuiz.quizId ?? currentQuiz.quiz_id ?? currentQuiz.id) : null;

  // ジャンル名の取得
  const allGenres = genres.length > 0 ? genres : (game.genres || []);
  const foundGenreObj = allGenres.find((g) => Number(g.genreId ?? g.id) === targetGenreId);
  const genreDisplayName =
    foundGenreObj?.genreName ||
    foundGenreObj?.name ||
    currentQuiz?.genreName ||
    currentQuiz?.genre_name ||
    `ジャンル ${targetGenreId}`;

  // マーキング判定
  const isMarked =
    currentQuizId !== null &&
    (game.user?.markingQuizIds || []).map((id) => Number(id)).includes(currentQuizId);

  // ハンドラー
  const handleBefore = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentIndex < markedQuizzes.length - 1) setCurrentIndex((prev) => prev + 1);
  };

  const handleToggleMarking = () => {
    if (currentQuizId !== null) toggleMarking(currentQuizId);
  };

  const handleGoHome = () => router.push("/");

  if (isLoading) {
    return (
      <div className={styles.loadingWrapper}>
        <h2>問題を読み込み中...</h2>
      </div>
    );
  }

  if (!currentQuiz || markedQuizzes.length === 0) {
    return (
      <div className={styles.mainCard}>
        <div className={styles.markingHeader}>
          <div className={`${styles.headerCell} ${styles.markTextCell}`}>
            マーキング
          </div>
          <div className={`${styles.headerCell} ${styles.markBtnCell}`}>☆</div>
          <div className={`${styles.headerCell} ${styles.headerSpacer}`}></div>
          <div className={`${styles.headerCell} ${styles.genreCell}`}>
            {genreDisplayName}
          </div>
        </div>
        <div className={styles.emptyArea}>
          <h2>{genreDisplayName} のマーキングされた問題はありません</h2>
          <button className={styles.homebutton} onClick={handleGoHome}>
            ホームへ戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.mainCard}>
      {/* ヘッダー（枠線区切り） */}
      <div className={styles.markingHeader}>
        <div className={`${styles.headerCell} ${styles.markTextCell}`}>
          マーキング
        </div>
        <button
          className={`${styles.headerCell} ${styles.markBtnCell}`}
          onClick={handleToggleMarking}
          title="マーキング切替"
        >
          {isMarked ? "★" : "☆"}
        </button>
        <div className={`${styles.headerCell} ${styles.headerSpacer}`}></div>
        <div className={`${styles.headerCell} ${styles.genreCell}`}>
          {genreDisplayName}
        </div>
      </div>

      {/* 問題文 */}
      <div className={styles.quiz_text}>
        {currentQuiz.quizText || currentQuiz.question || currentQuiz.quiz_text}
      </div>

      {/* 選択肢一覧 */}
      <div className={styles.answerArea}>
        {(currentQuiz.choices || []).map((choiceText, index) => {
          const isRealAnswer =
            currentQuiz.answer === choiceText ||
            String(currentQuiz.answer) === String(index) ||
            currentQuiz.choices?.[Number(currentQuiz.answer)] === choiceText;

          const explanationText = Array.isArray(currentQuiz.explanation)
            ? currentQuiz.explanation[index]
            : (currentQuiz.explanations?.find((e) => e.choice === choiceText)?.explanation || "");

          const rowClass = isRealAnswer ? styles.rowCorrect : styles.rowDefault;

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

      {/* 下部ボタン */}
      <div className={styles.bottomNav}>
        <button
          className={styles.quiz_move_beforebutton}   
          onClick={handleBefore}
          disabled={currentIndex === 0}
        >
          前の問題
        </button>

        <button className={styles.homebutton} onClick={handleGoHome}>
          ホームへ
        </button>

        <button
          className={styles.quiz_move_nextbutton}
          onClick={handleNext}
          disabled={currentIndex === markedQuizzes.length - 1}
        >
          次の問題
        </button>
      </div>
    </div>
  );
}

export default function MarkingQuiz() {
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
          <h2>読み込み中...</h2>
        </div>
      }>
        <MarkingQuizContent />
      </Suspense>
    </main>
  );
}
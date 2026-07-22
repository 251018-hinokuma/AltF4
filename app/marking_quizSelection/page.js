"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGame } from "../context/GameContext";
import "./page.css";

function MarkingQuizSelectionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { game } = useGame();

  // URLパラメーターより genreId を取得 (デフォルト: 1)
  const targetGenreId = Number(searchParams.get("genreId")) || 1;

  const [markedQuizzes, setMarkedQuizzes] = useState([]);
  const [genres, setGenres] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // =========================================
  // 1. ジャンル一覧データの取得（Context ＋ API補完）
  // =========================================
  useEffect(() => {
    async function fetchGenres() {
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
          console.error("ジャンル一覧の取得に失敗しました:", e);
        }
      }
    }
    fetchGenres();
  }, [game.genres]);

  // =========================================
  // 2. 選ばれたジャンルのマーキング問題抽出
  // =========================================
  useEffect(() => {
    async function fetchAndFilterQuizzes() {
      setIsLoading(true);

      try {
        // --- マーキング済みIDの取得 (localStorage ＋ Context) ---
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
        const activeMarkedIds = Array.from(new Set([...localIds, ...contextIds]));

        // --- API / Context から問題データを取得 ---
        let rawQuizzes = [];
        if (game.quizzes && game.quizzes.length > 0) {
          rawQuizzes = game.quizzes;
        } else {
          try {
            const res = await fetch(`/api/quizzes?genreId=${targetGenreId}`);
            if (res.ok) {
              const data = await res.json();
              rawQuizzes = Array.isArray(data) ? data : (data.quizzes || data.data || []);
            }
          } catch (e) {
            console.error("問題データ取得失敗:", e);
          }

          // フォールバック（ステージ別取得）
          if (rawQuizzes.length === 0) {
            const stages = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            const fetchPromises = stages.map((stageId) =>
              fetch(`/api/quizzes?genreId=${targetGenreId}&stageId=${stageId}`)
                .then((res) => (res.ok ? res.json() : []))
                .then((data) => (Array.isArray(data) ? data : (data.quizzes || data.data || [])))
                .catch(() => [])
            );

            const results = await Promise.all(fetchPromises);
            const combined = results.flat();

            const uniqueMap = new Map();
            combined.forEach((q) => {
              const qId = Number(q.quizId ?? q.quiz_id ?? q.id);
              if (qId && !uniqueMap.has(qId)) uniqueMap.set(qId, q);
            });
            rawQuizzes = Array.from(uniqueMap.values());
          }
        }

        // --- 選ばれたジャンル かつ マーキング済みの問題を抽出 ---
        const filtered = rawQuizzes.filter((q) => {
          const qId = Number(q.quizId ?? q.quiz_id ?? q.id);
          const qGenre = Number(q.genreId ?? q.genre_id ?? targetGenreId);
          return activeMarkedIds.includes(qId) && qGenre === targetGenreId;
        });

        // quizId 昇順でソート
        filtered.sort((a, b) => {
          const idA = Number(a.quizId ?? a.quiz_id ?? a.id);
          const idB = Number(b.quizId ?? b.quiz_id ?? b.id);
          return idA - idB;
        });

        setMarkedQuizzes(filtered);
      } catch (error) {
        console.error("マーキング問題の取得・処理中にエラーが発生しました:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAndFilterQuizzes();
  }, [targetGenreId, game.quizzes, game.user?.markingQuizIds]);

  // =========================================
  // 多角的なジャンル表示名の特定ロジック
  // =========================================
  const allGenres = genres.length > 0 ? genres : (game.genres || []);
  const foundGenreObj = allGenres.find(
    (g) => Number(g.genreId ?? g.genre_id ?? g.id) === targetGenreId
  );

  const genreDisplayName =
    foundGenreObj?.genreName ||
    foundGenreObj?.genre_name ||
    foundGenreObj?.name ||
    markedQuizzes[0]?.genreName ||
    markedQuizzes[0]?.genre_name ||
    `ジャンル ${targetGenreId}`;

  // 戻るボタンクリック：マーキングジャンル選択画面へ遷移
  const handleBack = () => {
    router.push("/marking_genreSelection");
  };

  // 問題選択ボタンクリック：選んだ問題のクイズ画面へ遷移
  const handleQuizSelect = (quizId) => {
    router.push(`/marking_quiz?genreId=${targetGenreId}&quizId=${quizId}`);
  };

  return (
    <main className="container">
      <div className="mainCard">
        {/* 左上ヘッダー */}
        <div className="headerArea">
          <button className="headerCell backButton" onClick={handleBack}>
            戻る
          </button>
          <div className="headerCell headerTitle">マーキング</div>
          <div className="headerCell genreTitle">{genreDisplayName}</div>
          <div className="headerCell headerSubTitle">問題選択</div>
        </div>

        {/* メインコンテンツ */}
        <div className="contentArea">
          <div className="quizListContainer">
            {isLoading ? (
              <div className="loadingText">読み込み中...</div>
            ) : markedQuizzes.length === 0 ? (
              <div className="emptyText">マーキングされた問題はありません</div>
            ) : (
              markedQuizzes.map((quiz, index) => {
                const quizId = Number(quiz.quizId ?? quiz.quiz_id ?? quiz.id);
                const quizText = quiz.quizText || quiz.question || quiz.quiz_text || `問題 ${index + 1}`;

                return (
                  <button
                    key={quizId}
                    className="quizSelectButton"
                    onClick={() => handleQuizSelect(quizId)}
                    title={quizText}
                  >
                    {quizText}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function MarkingQuizSelection() {
  return (
    <Suspense fallback={<div className="container">読み込み中...</div>}>
      <MarkingQuizSelectionContent />
    </Suspense>
  );
}
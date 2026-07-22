"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "../context/GameContext"; // パスは環境に合わせて調整してください
import "./page.css";

export default function MarkingGenreSelection() {
  const router = useRouter();
  const { game } = useGame();
  const [genres, setGenres] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // =========================================
  // 初期表示処理：全てのジャンルを取得
  // =========================================
  useEffect(() => {
    async function fetchGenres() {
      setIsLoading(true);
      try {
        // 1. Context にジャンル情報がある場合
        if (game?.genres && game.genres.length > 0) {
          setGenres(game.genres);
        } else {
          // 2. API から取得する場合
          const res = await fetch("/api/genres");
          if (res.ok) {
            const data = await res.json();
            const list = Array.isArray(data) ? data : (data.genres || []);
            setGenres(list);
          }
        }
      } catch (error) {
        console.error("ジャンル一覧の取得に失敗しました:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchGenres();
  }, [game?.genres]);

  // 戻るボタン処理：ホーム画面へ遷移
  const handleBack = () => {
    router.push("/");
  };

  // ジャンル選択ボタン処理：選択したジャンルのマーキング問題画面へ遷移
  const handleGenreSelect = (genreId) => {
    router.push(`/marking_quizSelection?genreId=${genreId}`);
  };

  return (
    <main className="container">
      <div className="mainCard">
        {/* 左上ヘッダーエリア */}
        <div className="headerArea">
          <button 
            className="headerCell backButton" 
            onClick={handleBack}
          >
            戻る
          </button>
          <div className="headerCell headerTitle">
            マーキング
          </div>
          <div className="headerCell headerSubTitle">
            ジャンル選択
          </div>
        </div>

        {/* メインコンテンツ（ジャンル一覧選択エリア） */}
        <div className="contentArea">
          <div className="genreListContainer">
            {isLoading ? (
              <div className="loadingText">読み込み中...</div>
            ) : genres.length === 0 ? (
              <div className="emptyText">ジャンルが見つかりません</div>
            ) : (
              genres.map((genre) => {
                const genreId = genre.genreId ?? genre.genre_id ?? genre.id;
                const genreName = genre.genreName ?? genre.genre_name ?? genre.name ?? `ジャンル ${genreId}`;

                return (
                  <button
                    key={genreId}
                    className="genreSelectButton"
                    onClick={() => handleGenreSelect(genreId)}
                  >
                    {genreName}
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
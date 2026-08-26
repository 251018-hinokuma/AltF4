"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useGame } from "../context/GameContext"; // パスは環境に合わせて調整してください
import styles from "./style.module.css";

export default function QuizStageSelection() {
  const searchParams = useSearchParams();
  const { game, fetchGenres } = useGame();

  const genreId = searchParams.get("genreId");
  const queryGenreName = searchParams.get("genreName");

  const [stages, setStages] = useState([]);
  const [displayGenreName, setDisplayGenreName] = useState(queryGenreName || "");

  // ラストステージ（ジャンルID: 6）判定
  const isLastStage = Number(genreId) === 6;

  // ==============================
  // ジャンル名の自動取得処理（URLパラメータにない場合に補完）
  // ==============================
  useEffect(() => {
    if (queryGenreName) {
      setDisplayGenreName(queryGenreName);
      return;
    }
    if (!genreId) return;

    async function loadGenreName() {
      try {
        let genresList = game?.genres || [];
        
        // ContextにデータがなければContextのfetchGenresまたはAPIから取得
        if (genresList.length === 0 && fetchGenres) {
          genresList = await fetchGenres();
        }
        if (genresList.length === 0) {
          const res = await fetch("/api/genres");
          if (res.ok) {
            const data = await res.json();
            genresList = Array.isArray(data) ? data : (data.genres || []);
          }
        }

        const found = genresList.find(
          (g) => Number(g.genreId ?? g.genre_id ?? g.id) === Number(genreId)
        );

        if (found) {
          setDisplayGenreName(found.genreName ?? found.genre_name ?? found.name ?? "");
        }
      } catch (error) {
        console.error("ジャンル名の取得に失敗しました:", error);
      }
    }

    loadGenreName();
  }, [genreId, queryGenreName, game?.genres, fetchGenres]);

  // DBから最新のスター情報を取得
  useEffect(() => {
    if (!genreId) return;

    const userId = 1;
    fetch(`/api/user/stages?userId=${userId}&genreId=${genreId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("取得したスター情報:", data);
        setStages(data.stages || []);
      })
      .catch((error) => {
        console.error("スター情報の取得に失敗しました:", error);
      });
  }, [genreId]);

  // ==============================
  // ダミー用：クリア状況を変更
  // ==============================
  const clearStage = (stageId) => {
    setStages((prev) => {
      const prevArray = Array.isArray(prev) ? prev : [];
      const newStages = [...prevArray];

      while (newStages.length < stageId) {
        newStages.push({
          clear: false,
          perfect: false,
          speed: false,
        });
      }

      newStages[stageId - 1] = {
        ...newStages[stageId - 1],
        clear: true,
        perfect: true,
        speed: true,
      };

      return newStages;
    });
  };

  // ==============================
  // ダミーデータをリセット
  // ==============================
  const resetStages = () => {
    if (!genreId) return;
    localStorage.removeItem(`dummyStages_${genreId}`);
    window.location.reload(); // キャッシュを破棄して再読み込み
  };

  // ステージ情報取得
  const getStage = (stageId) => {
    const stageList = Array.isArray(stages) ? stages : [];
    return (
      stageList[stageId - 1] || {
        clear: false,
        perfect: false,
        speed: false,
      }
    );
  };

  const stage1 = getStage(1);
  const stage2 = getStage(2);
  const stage3 = getStage(3);
  const stage4 = getStage(4);
  const stage5 = getStage(5);
  const stage6 = getStage(6);

  // ステージ開放条件（通常ジャンル用）
  const stage1Open = true;
  const stage2Open = stage1.clear;
  const stage3Open = stage2.clear;
  const stage4Open = stage3.clear;
  const stage5Open = stage4.clear;
  const bossOpen = stage5.clear;

  // ステージ表示コンポーネント
  const StageBox = ({ stageId, stage, isBoss = false, isLast = false }) => {
    let titleText = `ステージ${stageId}`;
    if (isLast) {
      titleText = "🔥 ラストステージ";
    } else if (isBoss) {
      titleText = "ボスステージ";
    }

    return (
      <div className={styles.stageBox}>
        <div className={styles.stage}>{titleText}</div>

        <Link
          href={`/quiz_question?genreId=${genreId}&stageId=${stageId}&difficulty=1`}
          className={styles.mode}
        >
          ノーマル
        </Link>

        <Link
          href={`/quiz_question?genreId=${genreId}&stageId=${stageId}&difficulty=2`}
          className={styles.mode}
        >
          ハード
        </Link>

        <div className={styles.result}>
          <div className={styles.starArea}>
            <span>{stage.clear ? "★" : "☆"}</span>
            <span>{stage.perfect ? "★" : "☆"}</span>
            <span>{stage.speed ? "★" : "☆"}</span>
          </div>

          <div className={styles.labelArea}>
            <span>クリア</span>
            <span>全問正解</span>
            <span>スピード</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.page}>
      {/* ヘッダー */}
      <div className={styles.top}>
        <Link href="/quiz_genreSelection" className={styles.menu}>
          戻る
        </Link>
        <div className={styles.title}>クイズ</div>
        <div className={styles.title}>{displayGenreName}</div>
        <div className={styles.title}>ステージ選択</div>
      </div>

      {/* テスト用ボタン */}
      <div style={{ padding: "20px" }}>
        <h3>【テスト用】ステージクリア操作</h3>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {isLastStage ? (
            <button onClick={() => clearStage(1)}>
              ラストステージをクリア
            </button>
          ) : (
            <>
              <button onClick={() => clearStage(1)}>ステージ1をクリア</button>
              <button onClick={() => clearStage(2)}>ステージ2をクリア</button>
              <button onClick={() => clearStage(3)}>ステージ3をクリア</button>
              <button onClick={() => clearStage(4)}>ステージ4をクリア</button>
              <button onClick={() => clearStage(5)}>ステージ5をクリア</button>
            </>
          )}
          <button onClick={resetStages}>キャッシュクリア＆再読み込み</button>
        </div>
      </div>

      {/* ステージ表示エリア */}
      <div className={styles.content}>
        {isLastStage ? (
          // ラストステージ（genreId === 6）の表示：1個のみ
          <StageBox stageId={1} stage={stage1} isLast={true} />
        ) : (
          // 通常ジャンルの表示：順次開放
          <>
            {stage1Open && <StageBox stageId={1} stage={stage1} />}
            {stage2Open && <StageBox stageId={2} stage={stage2} />}
            {stage3Open && <StageBox stageId={3} stage={stage3} />}
            {stage4Open && <StageBox stageId={4} stage={stage4} />}
            {stage5Open && <StageBox stageId={5} stage={stage5} />}
            {bossOpen && <StageBox stageId={6} stage={stage6} isBoss={true} />}
          </>
        )}
      </div>
    </div>
  );
}
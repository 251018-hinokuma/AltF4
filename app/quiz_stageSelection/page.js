"use client";

import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useGame } from "../context/GameContext";
import styles from "./style.module.css";

function StageSelectionContent() {
  const searchParams = useSearchParams();
  const { game, fetchGenres } = useGame();

  const genreId = searchParams.get("genreId");
  const queryGenreName = searchParams.get("genreName");

  const [stages, setStages] = useState([]);
  const [displayGenreName, setDisplayGenreName] = useState(queryGenreName || "");

  const isLastStage = Number(genreId) === 6;

  // ジャンル名の自動取得
  useEffect(() => {
    if (queryGenreName) {
      setDisplayGenreName(queryGenreName);
      return;
    }
    if (!genreId) return;

    async function loadGenreName() {
      try {
        let genresList = game?.genres || [];
        
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

  // スター情報の取得
  useEffect(() => {
    if (!genreId) return;

    const userId = 1;
    fetch(`/api/user/stages?userId=${userId}&genreId=${genreId}`)
      .then((res) => {
        if (!res.ok) throw new Error("取得失敗");
        return res.json();
      })
      .then((data) => {
        setStages(data.stages || []);
      })
      .catch((error) => {
        console.error("スター情報の取得に失敗しました:", error);
      });
  }, [genreId]);

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

  const stage1Open = true;
  const stage2Open = stage1.clear;
  const stage3Open = stage2.clear;
  const stage4Open = stage3.clear;
  const stage5Open = stage4.clear;
  const bossOpen = stage5.clear;

  const StageBox = ({ stageId, stage, isBoss = false, isLast = false }) => {
    let titleText = `ステージ ${stageId}`;
    if (isLast) {
      titleText = "🔥 ラストステージ";
    } else if (isBoss) {
      titleText = "👑 ボスステージ";
    }

    return (
      <div className={`${styles.stageCard} ${isBoss ? styles.bossCard : ""} ${isLast ? styles.lastCard : ""}`}>
        <div className={styles.stageTitle}>{titleText}</div>

        <div className={styles.modeArea}>
          <Link
            href={`/quiz_question?genreId=${genreId}&stageId=${stageId}&difficulty=1`}
            className={styles.modeButtonNormal}
          >
            ノーマル
          </Link>
          <Link
            href={`/quiz_question?genreId=${genreId}&stageId=${stageId}&difficulty=2`}
            className={styles.modeButtonHard}
          >
            ハード
          </Link>
        </div>

        <div className={styles.resultArea}>
          <div className={styles.starRow}>
            <div className={styles.starItem}>
              <span className={styles.starIcon}>{stage.clear ? "★" : "☆"}</span>
              <span className={styles.starLabel}>クリア</span>
            </div>
            <div className={styles.starItem}>
              <span className={styles.starIcon}>{stage.perfect ? "★" : "☆"}</span>
              <span className={styles.starLabel}>全問正解</span>
            </div>
            <div className={styles.starItem}>
              <span className={styles.starIcon}>{stage.speed ? "★" : "☆"}</span>
              <span className={styles.starLabel}>スピード</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.mainCard}>
      <div className={styles.headerArea}>
        <Link href="/quiz_genreSelection" className={styles.headerBranchButton}>
          <span className={styles.buttonText}>戻る</span>
        </Link>
        <div className={styles.headerLeafCell}>
          <span className={styles.buttonText}>クイズ</span>
        </div>
        {displayGenreName && (
          <div className={styles.headerLeafCell}>
            <span className={styles.buttonText}>{displayGenreName}</span>
          </div>
        )}
        <div className={styles.headerLeafCell}>
          <span className={styles.buttonText}>ステージ選択</span>
        </div>
      </div>

      <div className={styles.contentArea}>
        <div className={styles.stumpContainer}>
          <div className={styles.stumpInner}>
            <div className={styles.leafDecoration}>🍃</div>
            <p className={styles.stumpText}>
              <span className={styles.highlightText}>ステージを選んでね</span>
            </p>
          </div>
        </div>

        <div className={styles.stageListWrapper}>
          <div className={styles.treeTrunk}></div>

          <div className={styles.stageListContainer}>
            {isLastStage ? (
              <StageBox stageId={1} stage={stage1} isLast={true} />
            ) : (
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
      </div>
    </div>
  );
}

export default function QuizStageSelection() {
  return (
    <main className={styles.container}>
      <div className={styles.sky}></div>
      <div className={styles.cloud1}></div>
      <div className={styles.cloud2}></div>
      <div className={styles.cloud3}></div>
      <div className={styles.mountain}></div>
      <div className={styles.forest}></div>
      <div className={styles.ground}></div>

      <Suspense fallback={<div className={styles.loading}>読み込み中...</div>}>
        <StageSelectionContent />
      </Suspense>
    </main>
  );
}
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./style.module.css";

export default function QuizStageSelection() {
  const searchParams = useSearchParams();

  const genreId = searchParams.get("genreId");
  const genreName = searchParams.get("genreName");

  const [stages, setStages] = useState([]);

  // DBからスター情報を取得
  useEffect(() => {
    const userId = 1;

    if (!genreId) return;

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
      const newStages = [...prev];

      // 指定ステージまで配列を作る
      while (newStages.length < stageId) {
        newStages.push({
          clear: false,
          perfect: false,
          speed: false,
        });
      }

      // そのステージをクリア
      newStages[stageId - 1] = {
        ...newStages[stageId - 1],
        clear: true,
      };

      // localStorageにも保存
      localStorage.setItem(
        `dummyStages_${genreId}`,
        JSON.stringify(newStages)
      );

      return newStages;
    });
  };

  // ==============================
  // ダミーデータを全部リセット
  // ==============================
  const resetStages = () => {
    const emptyStages = [];

    for (let i = 0; i < 6; i++) {
      emptyStages.push({
        clear: false,
        perfect: false,
        speed: false,
      });
    }

    setStages(emptyStages);

    localStorage.setItem(
      `dummyStages_${genreId}`,
      JSON.stringify(emptyStages)
    );
  };

  // ==============================
  // localStorageのダミーデータを読み込む
  // ==============================
  useEffect(() => {
    if (!genreId) return;

    const saved = localStorage.getItem(
      `dummyStages_${genreId}`
    );

    if (saved) {
      try {
        setStages(JSON.parse(saved));
      } catch (error) {
        console.error("ダミーデータの読み込みに失敗:", error);
      }
    }
  }, [genreId]);

  // ステージ情報
  const getStage = (stageId) => {
    return (
      stages[stageId - 1] || {
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

  // ステージ開放条件
  const stage1Open = true;
  const stage2Open = stage1.clear;
  const stage3Open = stage2.clear;
  const stage4Open = stage3.clear;
  const stage5Open = stage4.clear;
  const bossOpen = stage5.clear;

  // ステージ表示
  const StageBox = ({ stageId, stage, isBoss = false }) => {
    return (
      <div className={styles.stageBox}>
        <div className={styles.stage}>
          {isBoss ? "ボスステージ" : `ステージ${stageId}`}
        </div>

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
        <Link
          href="/quiz_genreSelection"
          className={styles.menu}
        >
          戻る
        </Link>

        <div className={styles.title}>クイズ</div>

        <div className={styles.title}>
          {genreName}
        </div>

        <div className={styles.title}>
          ステージ選択
        </div>
      </div>

      {/* ==============================
          ダミーデータ操作ボタン
      ============================== */}
      <div style={{ padding: "20px" }}>
        <h3>【テスト用】ステージクリア操作</h3>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <button onClick={() => clearStage(1)}>
            ステージ1をクリア
          </button>

          <button onClick={() => clearStage(2)}>
            ステージ2をクリア
          </button>

          <button onClick={() => clearStage(3)}>
            ステージ3をクリア
          </button>

          <button onClick={() => clearStage(4)}>
            ステージ4をクリア
          </button>

          <button onClick={() => clearStage(5)}>
            ステージ5をクリア
          </button>

          <button onClick={resetStages}>
            リセット
          </button>
        </div>
      </div>

      {/* ステージ */}
      <div className={styles.content}>

        {stage1Open && (
          <StageBox
            stageId={1}
            stage={stage1}
          />
        )}

        {stage2Open && (
          <StageBox
            stageId={2}
            stage={stage2}
          />
        )}

        {stage3Open && (
          <StageBox
            stageId={3}
            stage={stage3}
          />
        )}

        {stage4Open && (
          <StageBox
            stageId={4}
            stage={stage4}
          />
        )}

        {stage5Open && (
          <StageBox
            stageId={5}
            stage={stage5}
          />
        )}

        {bossOpen && (
          <StageBox
            stageId={6}
            stage={stage6}
            isBoss={true}
          />
        )}

      </div>
    </div>
  );
}
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGame } from "../context/GameContext";
import styles from "./page.module.css";

export default function QuizQuestion() {
  const router = useRouter();
  const searchParams = useSearchParams();

  //=========================================
  // URLクエリパラメータから genreId と stageId の取得
  //=========================================
  const queryGenreId = searchParams.get("genreId");
  const queryStageId = searchParams.get("stageId");

  //=========================================
  // GameContext
  //=========================================
  const { 
    game, 
    fetchQuizzes,
    updateElapsedTime, 
    setCurrentQuiz, 
    setSelectedAnswer 
  } = useGame();

  // ジャンル一覧保持用ステート
  const [genres, setGenres] = useState([]);

  // currentQuestion は 1 から始まるため、配列のインデックス（0〜9）に合わせる
  const quizIndex = game.currentQuestion > 0 ? game.currentQuestion - 1 : 0;
  
  // コンテキストのクイズ配列から現在の問題データを取得
  const currentQuizData = game.quizzes && game.quizzes.length > 0 ? game.quizzes[quizIndex] : null;

  const [choices, setChoices] = useState([]);

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
  // クイズの取得 ＆ タイマー開始
  //=========================================
  useEffect(() => {
    // 1. URLパラメータが明示的に指定されている場合はそのステージを取得
    if (queryGenreId && queryStageId) {
      fetchQuizzes(Number(queryGenreId), Number(queryStageId));
    } 
    // 2. パラメータがなく、かつ現在クイズがロードされていない場合のみデフォルト(1, 1)で取得
    else if (!game.quizzes || game.quizzes.length === 0) {
      const defaultGenre = game.genreId || 1;
      const defaultStage = game.stageId || 1;
      fetchQuizzes(Number(defaultGenre), Number(defaultStage));
    }
    // ※ 既に game.quizzes が存在し、quiz_answer から遷移してきた場合は fetchQuizzes を呼ばない

    const timer = setInterval(() => {
      updateElapsedTime();
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryGenreId, queryStageId]);

  //=========================================
  // mm:ssへ変換
  //=========================================
  const formattedTime = useMemo(() => {
    const minute = String(
      Math.floor(game.elapsedTime / 60)
    ).padStart(2, "0");

    const second = String(
      game.elapsedTime % 60
    ).padStart(2, "0");

    return `${minute}:${second}`;
  }, [game.elapsedTime]);

  //=========================================
  // シャッフル（DBから取得したデータをセット）
  //=========================================
  useEffect(() => {
    if (currentQuizData) {
      // 選択肢と元のインデックス（正解判定用・解説紐付け用）をペアにしてシャッフル
      const copy = currentQuizData.choices.map((text, index) => ({ text, originalIndex: index }));
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      setChoices(copy);
    }
  }, [currentQuizData]);

  //=========================================
  // シャッフル後説明（解答画面へ渡す用）
  //=========================================
  const explanations = useMemo(() => {
    if (!currentQuizData || choices.length === 0) return [];
    
    return choices.map((choice) => ({
      choice: choice.text,
      // DB of explanation 配列から、シャッフル前の元のインデックスを使って解説を取得
      explanation: currentQuizData.explanation[choice.originalIndex]
    }));
  }, [choices, currentQuizData]);

  //=========================================
  // 回答ボタンクリック処理
  //=========================================
  const choiceClick = (choice) => {
    if (!currentQuizData) return;

    // 1. 現在の問題データとシャッフル後の情報を Context に保存
    setCurrentQuiz({
      quizId: currentQuizData.quizId,
      genreId: currentQuizData.genreId,
      stageId: currentQuizData.stageId,
      question: currentQuizData.quizText,
      // DBの answer（インデックス番号）を元に、正解のテキスト文字列をセット
      answer: currentQuizData.choices[currentQuizData.answer], 
      explanations 
    }, choices.map(c => c.text));

    // 2. 選択した回答を Context に保存
    setSelectedAnswer(choice.text);

    // 3. 解答画面へ遷移
    router.push("/quiz_answer");
  };

  //=========================================
  // データ取得待ちのローディング表示
  //=========================================
  if (!currentQuizData) {
    return (
      <main className={styles.container} style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px" }}>
        <h2>問題を読み込み中...</h2>
      </main>
    );
  }

  // 最大HPの決定（Contextから取得、無ければ初期値5）
  const maxHp = game.maxHp || game.maxHP || 5;

  // =========================================
  // 現在の問題データ(currentQuizData)からジャンル名・ステージ数を取得
  // =========================================
  const currentGenreId = currentQuizData.genreId;
  const stageNum = currentQuizData.stageId;

  const allGenres = genres.length > 0 ? genres : (game.genres || []);
  const foundGenreObj = allGenres.find(
    (g) => Number(g.genreId) === Number(currentGenreId)
  );

  const genreName = foundGenreObj?.genreName || "";

  return (
    <main className={styles.container}>

      {/*============================*/}
      {/* ヘッダー */}
      {/*============================*/}
      <div className={styles.header}>

        {/* マーキングボタンの代わりの空白エリア（レイアウト調整用） */}
        <div className={styles.blankArea} style={{ width: "180px", borderRight: "2px solid black", height: "100%" }}></div>

        {/* 判定結果の代わりの空白エリア（レイアウト調整用） */}
        <div className={styles.blankArea} style={{ flex: 1, borderRight: "2px solid black", height: "100%" }}></div>

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
            {game.currentQuestion}問 / {game.totalQuestion || game.quizzes.length}問
          </div>
        </div>

        {/* 【No.4】HP */}
        <div className={styles.quiz_HP} style={{ color: game.hp <= 1 ? "#ff4757" : "#000" }}>
          HP {game.hp} / {maxHp}
        </div>

        {/* 【No.5】経過時間 */}
        <div className={styles.quiz_Time}>
          <div className={styles.timerTitle}>
            経過時間
          </div>
          <div className={styles.timer}>
            {formattedTime}
          </div>
        </div>

      </div>

      {/*============================*/}
      {/* 【No.6】問題文 */}
      {/*============================*/}
      <div className={styles.quiz_text}>
        {currentQuizData.quizText}
      </div>

      {/*============================*/}
      {/* 選択肢 */}
      {/*============================*/}
      <div className={styles.choiceArea}>
        {choices.map((choice, index) => (
          <button
            key={index}
            className={styles.choiceButton}
            onClick={() => choiceClick(choice)}
          >
            <div className={styles.choiceNumber}>
              {index + 1}
            </div>
            
            {/* 【No.7】選択肢 */}
            <div className={styles.quiz_choices}>
              {choice.text}
            </div>
          </button>
        ))}
      </div>

    </main>
  );
}
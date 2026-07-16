"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "../context/GameContext";
import "./page.css";

export default function QuizQuestion() {
  const router = useRouter();

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

  // currentQuestion は 1 から始まるため、配列のインデックス（0〜9）に合わせる
  const quizIndex = game.currentQuestion > 0 ? game.currentQuestion - 1 : 0;
  
  // コンテキストのクイズ配列から現在の問題データを取得
  const currentQuizData = game.quizzes && game.quizzes.length > 0 ? game.quizzes[quizIndex] : null;

  const [choices, setChoices] = useState([]);

  //=========================================
  // 【★修正箇所】クイズの取得条件を調整 ＆ タイマー開始
  //=========================================
  useEffect(() => {
    // すでにクイズデータ（quizzes）が取得されている場合は再取得しない（1問目にリセットされるのを防ぐ）
    if (!game.quizzes || game.quizzes.length === 0) {
      fetchQuizzes(1, 1);
    }

    const timer = setInterval(() => {
      updateElapsedTime();
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 最初のマウント時のみ実行

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
      <main className="container" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px" }}>
        <h2>問題を読み込み中...</h2>
      </main>
    );
  }

  return (
    <main className="container">

      {/*============================*/}
      {/* ヘッダー */}
      {/*============================*/}
      <div className="header">

        {/* マーキングボタンの代わりの空白エリア（レイアウト調整用） */}
        <div className="blankArea" style={{ width: "180px", borderRight: "2px solid black", height: "100%" }}></div>

        {/* 判定結果の代わりの空白エリア（レイアウト調整用） */}
        <div className="blankArea" style={{ flex: 1, borderRight: "2px solid black", height: "100%" }}></div>

        {/* 【No.3】問題番号 */}
        <div className="quiz_now">
          {game.currentQuestion}問 / {game.totalQuestion || game.quizzes.length}問
        </div>

        {/* 【No.4】HP */}
        <div className="quiz_HP">
          HP {game.hp}
        </div>

        {/* 【No.5】経過時間 */}
        <div className="quiz_Time">
          <div className="timerTitle">
            経過時間
          </div>
          <div className="timer">
            {formattedTime}
          </div>
        </div>

      </div>

      {/*============================*/}
      {/* 【No.6】問題文 */}
      {/*============================*/}
      <div className="quiz_text">
        {currentQuizData.quizText}
      </div>

      {/*============================*/}
      {/* 選択肢 */}
      {/*============================*/}
      <div className="choiceArea">
        {choices.map((choice, index) => (
          <button
            key={index}
            className="choiceButton"
            onClick={() => choiceClick(choice)}
          >
            <div className="choiceNumber">
              {index + 1}
            </div>
            
            {/* 【No.7】選択肢 */}
            <div className="quiz_choices">
              {choice.text}
            </div>
          </button>
        ))}
      </div>

    </main>
  );
}
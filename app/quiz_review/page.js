"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "../context/GameContext";
import "./page.css";

export default function QuizReview() {
  const router = useRouter();
  const { game, toggleMarking } = useGame();

  // 復習画面で現在表示している問題のインデックス（0からスタート）
  const [currentIndex, setCurrentIndex] = useState(0);

  // 本来は resultQuizIds を元にDB等から履歴データを取得しますが、
  // 今回はUIを確認するためのモックデータを用意しています。
  const resultQuizIds = game.user.resultQuizIds || [1, 2, 3]; 
  const currentQuizId = resultQuizIds[currentIndex];

  // モック用のクイズデータ（currentQuizId に応じて変化する想定）
  const mockReviewData = {
    quizId: currentQuizId,
    question: `問題ID: ${currentQuizId} の問題文です。JavaScriptで配列を表す記号は？`,
    isCorrect: currentIndex % 2 !== 0, // モック用（偶数インデックスは不正解、奇数は正解とする）
    explanations: [
      { choice: "[]", explanation: "配列は [] を使用します。" },
      { choice: "{}", explanation: "{} はオブジェクトです。" },
      { choice: "()", explanation: "() は関数呼び出しなどで使用します。" },
      { choice: "<>", explanation: "<> は配列ではありません。" }
    ]
  };

  //=========================================
  // 【No.1】マーキングボタン処理
  //=========================================
  const toggleMark = () => {
    toggleMarking(mockReviewData.quizId);
  };

  //=========================================
  // 【No.6】前の問題ボタン処理
  //=========================================
  const handleBefore = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  //=========================================
  // 【No.7】次の問題ボタン処理
  //=========================================
  const handleNext = () => {
    if (currentIndex < resultQuizIds.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  //=========================================
  // ホームへ戻る処理（画像レイアウト再現用）
  //=========================================
  const handleHome = () => {
    router.push("/"); // ホーム画面のパスに合わせて変更してください
  };

  // マーキングされているかの判定
  const isMarked = game.user.markingQuizIds?.includes(mockReviewData.quizId);

  return (
    <main className="container">
      {/*===========================*/}
      {/* ヘッダー */}
      {/*===========================*/}
      <div className="header">
        {/* マーキング */}
        <div className="markArea">
          <span className="markText">マーキング</span>
          <button
            className="markingbutton"
            onClick={toggleMark}
          >
            {isMarked ? "★" : "☆"}
          </button>
        </div>

        {/* 【No.2】判定結果 */}
        <div className="quiz_result">
          {mockReviewData.isCorrect ? "正解" : "不正解"}
        </div>

        {/* 右側の余白（画像に合わせたレイアウト） */}
        <div className="headerBlank"></div>
      </div>

      {/*===========================*/}
      {/* 【No.3】問題文 */}
      {/*===========================*/}
      <div className="quiz_text">
        {mockReviewData.question}
      </div>

      {/*===========================*/}
      {/* 選択肢エリア */}
      {/*===========================*/}
      <div className="answerArea">
        {mockReviewData.explanations.map((item, index) => (
          <div className="answerRow" key={index}>
            <div className="choiceNo">{index + 1}</div>
            
            {/* 【No.4】選択肢 */}
            <div className="quiz_choices">{item.choice}</div>
            
            {/* 【No.5】選択肢説明 */}
            <div className="quiz_explanation">{item.explanation}</div>
          </div>
        ))}
      </div>

      {/*===========================*/}
      {/* 下部ボタンエリア */}
      {/*===========================*/}
      <div className="bottom">
        {/* 【No.6】前の問題 */}
        <button
          className="quiz_move_beforebutton"
          onClick={handleBefore}
          disabled={currentIndex === 0} // 最初の問題の時は無効化
        >
          前の問題
        </button>

        {/* ホームへ */}
        <button 
          className="homeButton"
          onClick={handleHome}
        >
          ホームへ
        </button>

        {/* 【No.7】次の問題 */}
        <button
          className="quiz_move_nextbutton"
          onClick={handleNext}
          disabled={currentIndex === resultQuizIds.length - 1} // 最後の問題の時は無効化
        >
          次の問題
        </button>
      </div>
    </main>
  );
}
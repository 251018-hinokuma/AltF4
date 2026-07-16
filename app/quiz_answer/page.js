"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "../context/GameContext";
import "./page.css";

export default function QuizAnswer() {
  const router = useRouter();
  const { game, toggleMarking, decreaseHp, addResultQuiz, nextQuestion } = useGame();

  const currentQuiz = game.currentQuiz;
  
  // 正誤判定とマーキング状態の取得
  const isCorrect = currentQuiz ? game.selectedAnswer === currentQuiz.answer : false;
  const isMarked = currentQuiz ? game.user.markingQuizIds.includes(currentQuiz.quizId) : false;

  // HP減少と結果（履歴）追加を1回だけ安全に行う
  useEffect(() => {
    if (!currentQuiz) return;
    
    const quizId = currentQuiz.quizId;
    // 重複実行を防止
    if (!game.user.resultQuizIds.includes(quizId)) {
      addResultQuiz(quizId);
      if (game.selectedAnswer !== currentQuiz.answer) {
        decreaseHp();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuiz]);

  // mm:ss 経過時間フォーマット
  const formattedTime = useMemo(() => {
    const minute = String(Math.floor(game.elapsedTime / 60)).padStart(2, "0");
    const second = String(game.elapsedTime % 60).padStart(2, "0");
    return `${minute}:${second}`;
  }, [game.elapsedTime]);

  //=========================================
  // 【★新規追加】最終問題、もしくはHPが0かどうかの判定
  //=========================================
  const isLastOrDead = useMemo(() => {
    // 最終問題かどうか
    const isLast = game.currentQuestion >= (game.totalQuestion || game.quizzes?.length || 10);
    // HPが0以下（戦闘不能）かどうか
    const isDead = game.hp <= 0;
    
    return isLast || isDead;
  }, [game.currentQuestion, game.totalQuestion, game.quizzes, game.hp]);

  // データ未ロード時のフォールバック表示
  if (!currentQuiz) {
    return (
      <main className="container" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px" }}>
        <h2>データを読み込み中...</h2>
      </main>
    );
  }

  //=========================================
  // 下部ボタン（次の問題 / 結果へ）クリック処理
  //=========================================
  const handleNext = () => {
    if (isLastOrDead) {
      // 最終問題 or HPが0ならリザルト画面へ
      router.push("/quiz_result");
    } else {
      // 次の問題に進んでQuestion画面へ戻る
      nextQuestion();
      router.push("/quiz_question");
    }
  };

  return (
    <main className="container">
      {/*============================*/}
      {/* ヘッダー */}
      {/*============================*/}
      <div className="header">
        {/* マーキングボタンと星 */}
        <div className="markArea">
          <span className="markText">マーキング</span>
          <button 
            className="markingbutton" 
            onClick={() => toggleMarking(currentQuiz.quizId)}
          >
            {isMarked ? "★" : "☆"}
          </button>
        </div>

        {/* 【No.2】判定結果 */}
        <div className="quiz_result" style={{ backgroundColor: isCorrect ? "#e8f5e9" : "#ffebee" }}>
          {isCorrect ? "正解" : "不正解"}
        </div>

        {/* 【No.3】問題番号 */}
        <div className="quiz_now">
          {game.currentQuestion}問 / {game.totalQuestion || game.quizzes?.length}問
        </div>

        {/* 【No.4】HP */}
        <div className="quiz_HP" style={{ color: game.hp <= 1 ? "#ff4757" : "#000" }}>
          HP {game.hp}/5
        </div>

        {/* 【No.5】経過時間 */}
        <div className="quiz_Time">
          <div className="timerTitle">経過時間</div>
          <div className="timer">{formattedTime}</div>
        </div>
      </div>

      {/*============================*/}
      {/* 【No.6】問題文 */}
      {/*============================*/}
      <div className="quiz_text">
        {currentQuiz.question}
      </div>

      {/*============================*/}
      {/* 選択肢一覧（テーブル） */}
      {/*============================*/}
      <div className="answerArea">
        {currentQuiz.choices.map((choiceText, index) => {
          const isUserSelected = game.selectedAnswer === choiceText;
          const isRealAnswer = currentQuiz.answer === choiceText;
          
          // 背景色の指定
          let rowBgColor = "#fff";
          if (isRealAnswer) {
            rowBgColor = "#e8f5e9"; // 正解行（緑）
          } else if (isUserSelected) {
            rowBgColor = "#ffebee"; // 間違えて選んだ行（赤）
          }

          // この選択肢に対応する解説テキストを抽出
          const expObj = currentQuiz.explanations.find((e) => e.choice === choiceText);
          const explanationText = expObj ? expObj.explanation : "";

          return (
            <div key={index} className="answerRow">
              <div className="choiceNo" style={{ backgroundColor: rowBgColor }}>
                {index + 1}
              </div>
              <div className="quiz_choices" style={{ backgroundColor: rowBgColor }}>
                {choiceText}
              </div>
              <div className="quiz_explanation" style={{ backgroundColor: rowBgColor }}>
                {explanationText}
              </div>
            </div>
          );
        })}
      </div>

      {/*============================*/}
      {/* 【★修正】下部ボタンエリア */}
      {/*============================*/}
      <div className="bottom">
        <button className="quiz_move_nextbutton" onClick={handleNext}>
          {isLastOrDead ? "結果へ" : "次の問題"}
        </button>
      </div>
    </main>
  );
}
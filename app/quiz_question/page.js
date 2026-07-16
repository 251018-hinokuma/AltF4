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
  const { game, setGame } = useGame();

  //=========================================
  // クイズ情報（後でDBから取得）
  //=========================================
  const quiz = {
    quizId: 1,
    genreId: 1,
    stageId: 1,

    questionNo: game.questionNo,
    totalQuestion: game.totalQuestion,

    question: "JavaScriptで配列を表す記号は？",

    choices: ["[]", "{}", "()", "<>"],

    answer: "[]",

    explanations: {
      "[]": "配列は [] を使用します。",
      "{}": "{} はオブジェクトです。",
      "()": "() は関数呼び出しなどで使用します。",
      "<>": "<> は配列ではありません。"
    }
  };

  //=========================================
  //ここを変更する
  // タイマー開始
  //=========================================
  useEffect(() => {
    const timer = setInterval(() => {
      setGame((prev) => ({
        ...prev,
        elapsedTime: prev.elapsedTime + 1
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  //=========================================
  //ここを変更する
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
  // シャッフル
  //=========================================
  const shuffleArray = (array) => {
    const copy = [...array];

    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [copy[i], copy[j]] = [copy[j], copy[i]];
    }

    return copy;
  };

  const [choices, setChoices] = useState([]);

  useEffect(() => {
    setChoices(shuffleArray(quiz.choices));
  }, []);

  //=========================================
  // シャッフル後説明
  //=========================================
  const explanations = useMemo(() => {
    return choices.map((choice) => ({
      choice,
      explanation: quiz.explanations[choice]
    }));
  }, [choices]);

  //=========================================
  //ここを変更する
  // 回答
  //=========================================
  const choiceClick = (choice) => {

    setGame((prev) => ({
      ...prev,

      currentQuiz: {
        quizId: quiz.quizId,

        genreId: quiz.genreId,

        stageId: quiz.stageId,

        question: quiz.question,

        choices,

        explanations,

        answer: quiz.answer,

        select: choice
      }
    }));

    router.push("/quiz_answer");
  };

  return (
    <main className="container">

      {/*============================*/}
      {/* ヘッダー */}
      {/*============================*/}

      <div className="header">

        <div className="blank"></div>

        <div className="questionCount">
          {game.questionNo}問 / {game.totalQuestion}問
        </div>

        <div className="hp">
          HP {game.hp}
        </div>

        <div className="timerArea">

          <div className="timerTitle">
            経過時間
          </div>

          <div className="timer">
            {formattedTime}
          </div>

        </div>

      </div>

      {/*============================*/}
      {/* 問題文 */}
      {/*============================*/}

      <div className="question">
        {quiz.question}
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

            <div className="choiceText">
              {choice}
            </div>

          </button>

        ))}

      </div>

    </main>
  );
}
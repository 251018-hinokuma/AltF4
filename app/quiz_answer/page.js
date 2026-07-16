"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "../context/GameContext";
import "./page.css";

export default function QuizAnswer() {

  const router = useRouter();

  //=========================================
  // GameContext
  //=========================================
  const { game, setGame } = useGame();

  const quiz = game.currentQuiz;

  if (!quiz) {
    return <div>クイズ情報がありません。</div>;
  }

  //=========================================
  //ここを変更する
  // 正解判定
  //=========================================
  const isCorrect = quiz.select === quiz.answer;

  //=========================================
  //ここを変更する
  // 表示用時間
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
  //ここを変更する
  // マーキング
  //=========================================
  const toggleMark = () => {

    setGame(prev => {

      const exist = prev.user.markingQuizIds.includes(quiz.quizId);

      return {

        ...prev,

        user: {

          ...prev.user,

          markingQuizIds: exist
            ? prev.user.markingQuizIds.filter(id => id !== quiz.quizId)
            : [...prev.user.markingQuizIds, quiz.quizId]

        }

      };

    });

  };

  //=========================================
  //ここを変更する
  // 次の問題
  //=========================================
  const nextQuestion = () => {

    setGame(prev => {

      let hp = prev.hp;

      if (!isCorrect) {
        hp--;
      }

      return {

        ...prev,

        hp,

        questionNo: prev.questionNo + 1,

        user: {

          ...prev.user,

          resultQuizIds: [
            ...prev.user.resultQuizIds,
            quiz.quizId
          ]

        }

      };

    });

    if (!isCorrect && game.hp - 1 <= 0) {

      router.push("/quiz_result");
      return;

    }

    if (game.questionNo >= game.totalQuestion) {

      router.push("/quiz_result");
      return;

    }

    router.push("/quiz_question");

  };

  return (

    <main className="container">

      {/*===========================*/}
      {/* ヘッダー */}
      {/*===========================*/}

      <div className="header">

  {/* マーキング */}
  <div className="markArea">

    <span className="markText">
      マーキング
    </span>

    <button
      className="starButton"
      onClick={toggleMark}
    >
      {game.user.markingQuizIds.includes(quiz.quizId)
        ? "★"
        : "☆"}
    </button>

  </div>

  {/* 判定 */}
  <div className="result">

    {isCorrect
      ? "正解"
      : "不正解"}

  </div>

  {/* HP */}
  <div className="hp">
    HP {game.hp}
  </div>

  {/* 時間 */}
  <div className="timerArea">

    <div className="timerTitle">
      経過時間
    </div>

    <div className="timer">
      {formattedTime}
    </div>

  </div>

</div>

      {/*===========================*/}
      {/* 問題文 */}
      {/*===========================*/}

      <div className="question">

        {quiz.question}

      </div>

      {/*===========================*/}
      {/* 選択肢 */}
      {/*===========================*/}

      <div className="answerArea">

        {quiz.explanations.map((item, index) => (

          <div
            className="answerRow"
            key={index}
          >

            <div className="choiceNo">

              {index + 1}

            </div>

            <div className="choiceText">

              {item.choice}

            </div>

            <div className="explanation">

              {item.explanation}

            </div>

          </div>

        ))}

      </div>

      {/*===========================*/}
      {/* 次へ */}
      {/*===========================*/}

      <div className="bottom">

        <button
          className="nextButton"
          onClick={nextQuestion}
        >

          次の問題

        </button>

      </div>

    </main>

  );

}
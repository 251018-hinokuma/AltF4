"use client";

import { useRouter } from "next/navigation";
import styles from "./page.css";

export default function QuizQuestion() {
  const router = useRouter();

  const quiz = {
    questionNo: 1,
    totalQuestion: 10,
    hp: 5,
    time: "00:00",
    question: "JavaScriptで配列を表す記号は？",
    choices: ["[]", "{}", "()", "<>"],
  };

  const choiceClick = (index) => {
    router.push(`/answer?answer=${index}`);
  };

  return (
    <main className={styles.container}>
      {/* ヘッダー */}
      <div className={styles.header}>
        <div className={styles.blank}></div>

        <div className={styles.questionCount}>
          {quiz.questionNo}問 / {quiz.totalQuestion}問
        </div>

        <div className={styles.hp}>
          HP {quiz.hp}
        </div>

        <div className={styles.timerArea}>
          <div className={styles.timerTitle}>経過時間</div>
          <div className={styles.timer}>{quiz.time}</div>
        </div>
      </div>

      {/* 問題文 */}
      <div className={styles.question}>
        {quiz.question}
      </div>

      {/* 選択肢 */}
      <div className={styles.choiceArea}>
        {quiz.choices.map((choice, index) => (
          <button
            key={index}
            className={styles.choiceButton}
            onClick={() => choiceClick(index)}
          >
            <div className={styles.choiceNumber}>
              {index + 1}
            </div>

            <div className={styles.choiceText}>
              {choice}
            </div>
          </button>
        ))}
      </div>
    </main>
  );
}
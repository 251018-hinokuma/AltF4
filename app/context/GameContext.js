"use client";

import { createContext, useContext, useState } from "react";

const GameContext = createContext();

export function GameProvider({ children }) {

  // -------------------------------
  //ここを変更する
  // ゲーム情報
  // -------------------------------
  const [game, setGame] = useState({

    // プレイ中のジャンル
    genreId: 1,

    // プレイ中のステージ
    stageId: 1,

    // 現在の問題番号
    currentQuestion: 1,

    // 問題数
    totalQuestion: 10,

    // HP
    hp: 5,

    // 正答数
    correctCount: 0,

    // 経過時間（秒）
    elapsedTime: 0,

    // 現在表示している問題
    currentQuiz: null,

    // シャッフル後の選択肢
    shuffledChoices: [],

    // 押した答え
    selectedAnswer: "",

    //ここを変更する
    // UserModel
    user: {

      userId: 1,

      userName: "プレイヤー",

      stages: [],

      markingQuizIds: [],

      resultQuizIds: [],

      achievements: []

    }

  });

  // -------------------------------
  // 経過時間更新
  // -------------------------------
  const updateElapsedTime = () => {

    setGame((prev) => ({

      ...prev,

      elapsedTime: prev.elapsedTime + 1

    }));

  };

  // -------------------------------
  // HP減少
  // -------------------------------
  const decreaseHp = () => {

    setGame((prev) => ({

      ...prev,

      hp: prev.hp - 1

    }));

  };

  // -------------------------------
  // HP設定
  // -------------------------------
  const setHp = (hp) => {

    setGame((prev) => ({

      ...prev,

      hp

    }));

  };

  // -------------------------------
  // 正答数追加
  // -------------------------------
  const addCorrect = () => {

    setGame((prev) => ({

      ...prev,

      correctCount: prev.correctCount + 1

    }));

  };

  // -------------------------------
  // 次の問題へ
  // -------------------------------
  const nextQuestion = () => {

    setGame((prev) => ({

      ...prev,

      currentQuestion: prev.currentQuestion + 1

    }));

  };

  // -------------------------------
  // 現在の問題保存
  // -------------------------------
  const setCurrentQuiz = (quiz, shuffledChoices) => {

    setGame((prev) => ({

      ...prev,

      currentQuiz: quiz,

      shuffledChoices

    }));

  };

  // -------------------------------
  // 回答保存
  // -------------------------------
  const setSelectedAnswer = (answer) => {

    setGame((prev) => ({

      ...prev,

      selectedAnswer: answer

    }));

  };

  // -------------------------------
  //ここを変更する
  // マーキング追加・削除
  // -------------------------------
  const toggleMarking = (quizId) => {

    setGame((prev) => {

      const exists =
        prev.user.markingQuizIds.includes(quizId);

      return {

        ...prev,

        user: {

          ...prev.user,

          markingQuizIds: exists
            ? prev.user.markingQuizIds.filter(
                (id) => id !== quizId
              )
            : [
                ...prev.user.markingQuizIds,
                quizId
              ]

        }

      };

    });

  };

  // -------------------------------
  //ここを変更する
  // 結果問題追加
  // -------------------------------
  const addResultQuiz = (quizId) => {

    setGame((prev) => ({

      ...prev,

      user: {

        ...prev.user,

        resultQuizIds: [

          ...prev.user.resultQuizIds,

          quizId

        ]

      }

    }));

  };

  // -------------------------------
  //ここを変更する
  // ユーザー名変更
  // -------------------------------
  const setUserName = (name) => {

    setGame((prev) => ({

      ...prev,

      user: {

        ...prev.user,

        userName: name

      }

    }));

  };

  // -------------------------------
  // ゲームリセット
  // -------------------------------
  const resetGame = () => {

    setGame({

      genreId: 1,

      stageId: 1,

      currentQuestion: 1,

      totalQuestion: 10,

      hp: 5,

      correctCount: 0,

      elapsedTime: 0,

      currentQuiz: null,

      shuffledChoices: [],

      selectedAnswer: "",

      //ここを変更する
      user: {

        userId: 1,

        userName: "プレイヤー",

        stages: [],

        markingQuizIds: [],

        resultQuizIds: [],

        achievements: []

      }

    });

  };

  return (

    <GameContext.Provider
      value={{

        game,

        setGame,

        updateElapsedTime,

        decreaseHp,

        setHp,

        addCorrect,

        nextQuestion,

        setCurrentQuiz,

        setSelectedAnswer,

        toggleMarking,

        addResultQuiz,

        setUserName,

        resetGame

      }}
    >

      {children}

    </GameContext.Provider>

  );

}

export function useGame() {

  return useContext(GameContext);

}
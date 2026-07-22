"use client";

import { createContext, useContext, useState } from "react";

// コンテキストの作成
const GameContext = createContext();

export const GameProvider = ({ children }) => {
  //=========================================
  // アプリケーション全体で共有する状態（State）
  //=========================================
  const [game, setGame] = useState({
    user: {
      markingQuizIds: [], // マーキングした問題のIDリスト
      resultQuizIds: [],  // 今回解いた問題のIDリスト（復習画面用）
    },
    quizzes: [],          // DBから取得しシャッフルされた問題リスト
    currentQuestion: 1,   // 現在の問題番号（1問目からスタート）
    totalQuestion: 0,     // 全問題数（DB取得時に自動設定）
    hp: 5,                // 現在のHP（デフォルト5）
    elapsedTime: 0,       // 経過時間（秒）
    currentQuiz: null,    // 解答画面へ渡すための現在のクイズ情報（シャッフル後の選択肢など）
    selectedAnswer: "",   // プレイヤーが選択した回答
  });

  //=========================================
  // 配列をシャッフルする汎用関数
  //=========================================
  const shuffleQuizzes = (array) => {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  //=========================================
  // 1. 問題をAPIから取得してシャッフルする処理
  //=========================================
  const fetchQuizzes = async (genreId, stageId) => {
    try {
      const response = await fetch(`/api/quizzes?genreId=${genreId}&stageId=${stageId}`);
      const data = await response.json();
      
      // 取得した問題をシャッフル
      const randomizedQuizzes = shuffleQuizzes(data.quizzes || []);
      
      setGame((prev) => ({ 
        ...prev, 
        quizzes: randomizedQuizzes,
        totalQuestion: randomizedQuizzes.length, // 取得した問題数をセット
        currentQuestion: 1, // 1問目にリセット
        elapsedTime: 0,     // タイムをリセット
        hp: 5,              // HPを初期値にリセット（※必要に応じてStageModelから設定）
        user: {
          ...prev.user,
          resultQuizIds: [], // 新しいゲームを始める時に過去の履歴をクリア
        }
      }));
    } catch (error) {
      console.error("問題の取得に失敗しました:", error);
    }
  };

  //=========================================
  // 2. タイマーの更新処理
  //=========================================
  const updateElapsedTime = () => {
    setGame((prev) => ({
      ...prev,
      elapsedTime: prev.elapsedTime + 1,
    }));
  };

  //=========================================
  // 3. 解答画面へ情報を渡す処理
  //=========================================
  const setCurrentQuiz = (quizData, choices) => {
    setGame((prev) => ({
      ...prev,
      currentQuiz: { ...quizData, choices },
    }));
  };

  const setSelectedAnswer = (answer) => {
    setGame((prev) => ({
      ...prev,
      selectedAnswer: answer,
    }));
  };

  //=========================================
  // 4. マーキングの切り替え処理
  //=========================================
  const toggleMarking = (quizId) => {
    setGame((prev) => {
      const isMarked = prev.user.markingQuizIds.includes(quizId);
      const newMarkingIds = isMarked
        ? prev.user.markingQuizIds.filter((id) => id !== quizId) // あれば削除
        : [...prev.user.markingQuizIds, quizId]; // なければ追加

      return {
        ...prev,
        user: {
          ...prev.user,
          markingQuizIds: newMarkingIds,
        },
      };
    });
  };

  //=========================================
  // 5. HP減少・次の問題へ・結果保存処理
  //=========================================
  const decreaseHp = () => {
    setGame((prev) => ({
      ...prev,
      hp: Math.max(0, prev.hp - 1), // 0未満にはしない
    }));
  };

  const nextQuestion = () => {
    setGame((prev) => ({
      ...prev,
      currentQuestion: prev.currentQuestion + 1,
    }));
  };

  const addResultQuiz = (quizId) => {
    setGame((prev) => {
      // 既に登録されている場合は追加しない（重複防止）
      if (prev.user.resultQuizIds.includes(quizId)) return prev;
      
      return {
        ...prev,
        user: {
          ...prev.user,
          resultQuizIds: [...prev.user.resultQuizIds, quizId],
        },
      };
    });
  };

  return (
    <GameContext.Provider
      value={{
        game,
        fetchQuizzes,
        updateElapsedTime,
        setCurrentQuiz,
        setSelectedAnswer,
        toggleMarking,
        decreaseHp,
        nextQuestion,
        addResultQuiz,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

// コンポーネントから簡単にContextを呼び出すためのカスタムフック
export const useGame = () => {
  return useContext(GameContext);
};
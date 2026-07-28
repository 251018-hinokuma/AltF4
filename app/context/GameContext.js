"use client";

import { createContext, useContext, useState, useEffect } from "react";

// コンテキストの作成
const GameContext = createContext();

export const GameProvider = ({ children }) => {
  //=========================================
  // アプリケーション全体で共有する状態（State）
  //=========================================
  const [game, setGame] = useState({
    user: {
      markingQuizIds: [], // マーキングした問題のIDリスト（数値で統一）
      resultQuizIds: [],  // 今回解いた問題のIDリスト（復習画面用）
    },
    genres: [],           // ジャンル一覧データ
    quizzes: [],          // DBから取得しシャッフルされた問題リスト
    currentQuestion: 1,   // 現在の問題番号
    totalQuestion: 0,     // 全問題数
    hp: 5,                // 現在のHP
    elapsedTime: 0,       // 経過時間（秒）
    currentQuiz: null,    // 解答画面へ渡すクイズ情報
    selectedAnswer: "",   // プレイヤーが選択した回答
    userAnswers: {},      // 問題ごとの解答選択肢リスト
  });

  //=========================================
  // 初回読み込み時に localStorage からマーキング情報を取得
  //=========================================
  useEffect(() => {
    try {
      const savedMarkings = localStorage.getItem("markingQuizIds");
      if (savedMarkings) {
        const parsed = JSON.parse(savedMarkings);
        if (Array.isArray(parsed)) {
          const normalized = parsed
            .map((id) => Number(id))
            .filter((id) => !isNaN(id));

          setGame((prev) => ({
            ...prev,
            user: {
              ...prev.user,
              markingQuizIds: normalized,
            },
          }));
        }
      }
    } catch (error) {
      console.error("マーキング情報の読み込みに失敗しました:", error);
    }
  }, []);

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
  // ジャンル一覧をAPIから取得する処理
  //=========================================
  const fetchGenres = async () => {
    try {
      const response = await fetch("/api/genres");
      const data = await response.json();
      const list = Array.isArray(data) ? data : (data.genres || []);
      
      setGame((prev) => ({
        ...prev,
        genres: list,
      }));
      return list;
    } catch (error) {
      console.error("ジャンル一覧の取得に失敗しました:", error);
      return [];
    }
  };

  //=========================================
  // 1. 問題をAPIから取得してシャッフルする処理（ゲーム用）
  //=========================================
  const fetchQuizzes = async (genreId, stageId, initialHp = 5, isBoss = false) => {
    try {
      // ★ stageId が 6 の場合、または isBoss が true の場合はボスステージとして扱う
      const isBossStage = isBoss || Number(stageId) === 6;

      let endpoint = "";

      if (isBossStage) {
        // ★ ボスステージの場合: stageIdを指定せず、該当ジャンルの全問題を取得
        endpoint = `/api/quizzes?genreId=${genreId}`;
      } else {
        // ★ 通常ステージの場合: 指定されたステージの問題のみ取得
        endpoint = `/api/quizzes?genreId=${genreId}&stageId=${stageId}`;
      }

      const response = await fetch(endpoint);
      const data = await response.json();
      
      const rawList = Array.isArray(data) ? data : (data.quizzes || data.data || []);
      
      // 全体をシャッフル
      let randomizedQuizzes = shuffleQuizzes(rawList);
      
      // ★ ボスステージの場合はシャッフル後のリストから先頭25問をランダム抽出
      if (isBossStage) {
        randomizedQuizzes = randomizedQuizzes.slice(0, 25);
      }

      setGame((prev) => ({ 
        ...prev, 
        quizzes: randomizedQuizzes,
        totalQuestion: randomizedQuizzes.length, // ボスステージなら最大25問
        currentQuestion: 1,
        elapsedTime: 0,
        hp: initialHp, // 指定された初期HP
        userAnswers: {},
        user: {
          ...prev.user,
          resultQuizIds: [],
        }
      }));
    } catch (error) {
      console.error("問題の取得に失敗しました:", error);
    }
  };

  //=========================================
  // ジャンル全体の全問題をAPIから取得する処理（マーキング画面用）
  //=========================================
  const fetchQuizzesByGenre = async (genreId) => {
    try {
      const response = await fetch(`/api/quizzes?genreId=${genreId}`);
      const data = await response.json();
      const list = Array.isArray(data) ? data : (data.quizzes || data.data || []);

      setGame((prev) => ({
        ...prev,
        quizzes: list,
      }));
      return list;
    } catch (error) {
      console.error("ジャンル別問題の取得に失敗しました:", error);
      return [];
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
  // 4. マーキングの切り替え
  //=========================================
  const toggleMarking = (quizId) => {
    const targetId = Number(quizId);
    if (isNaN(targetId)) return;

    setGame((prev) => {
      const currentMarked = prev.user?.markingQuizIds || [];
      const isMarked = currentMarked.some((id) => Number(id) === targetId);
      
      const newMarkingIds = isMarked
        ? currentMarked.filter((id) => Number(id) !== targetId)
        : [...currentMarked, targetId];

      try {
        localStorage.setItem("markingQuizIds", JSON.stringify(newMarkingIds));
      } catch (error) {
        console.error("マーキング情報の保存に失敗しました:", error);
      }

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
      hp: Math.max(0, prev.hp - 1),
    }));
  };

  const nextQuestion = () => {
    setGame((prev) => ({
      ...prev,
      currentQuestion: prev.currentQuestion + 1,
    }));
  };

  const addResultQuiz = (quizId, selectedAnswer) => {
    const targetId = Number(quizId);
    if (isNaN(targetId)) return;

    setGame((prev) => {
      const answerToSave = selectedAnswer !== undefined ? selectedAnswer : prev.selectedAnswer;

      return {
        ...prev,
        userAnswers: {
          ...prev.userAnswers,
          [targetId]: answerToSave,
        },
        user: {
          ...prev.user,
          resultQuizIds: prev.user.resultQuizIds.includes(targetId)
            ? prev.user.resultQuizIds
            : [...prev.user.resultQuizIds, targetId],
        },
      };
    });
  };

  // ゲーム状態のリセット処理
  const resetGame = () => {
    setGame((prev) => ({
      ...prev,
      currentQuestion: 1,
      totalQuestion: 0,
      hp: 5,
      elapsedTime: 0,
      currentQuiz: null,
      selectedAnswer: "",
      userAnswers: {},
      user: {
        ...prev.user,
        resultQuizIds: [],
      },
    }));
  };

  return (
    <GameContext.Provider
      value={{
        game,
        fetchGenres,
        fetchQuizzes,
        fetchQuizzesByGenre,
        updateElapsedTime,
        setCurrentQuiz,
        setSelectedAnswer,
        toggleMarking,
        decreaseHp,
        nextQuestion,
        addResultQuiz,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  return useContext(GameContext);
};
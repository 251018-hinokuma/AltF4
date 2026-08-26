"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

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
    genreId: null,        // 現在のジャンルID
    stageId: null,        // 現在のステージID
    currentQuestion: 1,   // 現在の問題番号
    totalQuestion: 0,     // 全問題数
    hp: 5,                // 現在のHP
    elapsedTime: 0,       // 経過時間（秒）
    currentQuiz: null,    // 解答画面へ渡すクイズ情報
    selectedAnswer: "",   // プレイヤーが選択した回答
    userAnswers: {},      // 問題ごとの解答選択肢リスト
    isFinished: false,    // ゲーム終了フラグ
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
  const fetchGenres = useCallback(async () => {
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
  }, []);

  //=========================================
  // 1. 問題をAPIから取得してシャッフルする処理（ゲーム開始・リセット時）
  //=========================================
  const fetchQuizzes = useCallback(async (genreId, stageId, initialHp = 5, isBoss = false) => {
    try {
      // ラストステージ（stageId が 7、または genreId が 6 / 0）の判定
      const isLastStage = Number(stageId) === 7 || Number(genreId) === 6 || Number(genreId) === 0;
      const isBossStage = isBoss || Number(stageId) === 6;

      // エンドポイントの切り替え
      let endpoint;
      if (isLastStage) {
        endpoint = "/api/quizzes"; // パラメータなしで全ジャンルの全問題を取得
      } else if (isBossStage) {
        endpoint = `/api/quizzes?genreId=${genreId}`;
      } else {
        endpoint = `/api/quizzes?genreId=${genreId}&stageId=${stageId}`;
      }

      const response = await fetch(endpoint);
      const data = await response.json();
      
      const rawList = Array.isArray(data) ? data : (data.quizzes || data.data || []);
      let randomizedQuizzes = shuffleQuizzes(rawList);
      
      // 出題数の制御
      if (isLastStage) {
        randomizedQuizzes = randomizedQuizzes.slice(0, 50); // 全ジャンルの問題からランダムで50問抽出
      } else if (isBossStage) {
        randomizedQuizzes = randomizedQuizzes.slice(0, 25); // ボスステージは25問抽出
      }

      setGame((prev) => ({ 
        ...prev, 
        genreId: Number(genreId),
        stageId: Number(stageId),
        quizzes: randomizedQuizzes,
        totalQuestion: randomizedQuizzes.length,
        currentQuestion: 1,  // ★ 必ず1問目にリセット
        elapsedTime: 0,      // ★ タイムリセット
        hp: initialHp,       // ★ HPリセット
        userAnswers: {},
        isFinished: false,   // ★ ゲーム進行中に設定
        user: {
          ...prev.user,
          resultQuizIds: [],
        }
      }));
    } catch (error) {
      console.error("問題の取得に失敗しました:", error);
    }
  }, []);

  //=========================================
  // ジャンル全体の全問題をAPIから取得する処理（マーキング画面用）
  //=========================================
  const fetchQuizzesByGenre = useCallback(async (genreId) => {
    try {
      const isLastStage = Number(genreId) === 6 || Number(genreId) === 0;
      const endpoint = isLastStage ? "/api/quizzes" : `/api/quizzes?genreId=${genreId}`;

      const response = await fetch(endpoint);
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
  }, []);

  //=========================================
  // 2. タイマーの更新処理
  //=========================================
  const updateElapsedTime = useCallback(() => {
    setGame((prev) => ({
      ...prev,
      elapsedTime: prev.elapsedTime + 1,
    }));
  }, []);

  //=========================================
  // 3. 解答画面へ情報を渡す処理
  //=========================================
  const setCurrentQuiz = useCallback((quizData, choices) => {
    setGame((prev) => ({
      ...prev,
      currentQuiz: { ...quizData, choices },
    }));
  }, []);

  const setSelectedAnswer = useCallback((answer) => {
    setGame((prev) => ({
      ...prev,
      selectedAnswer: answer,
    }));
  }, []);

  //=========================================
  // 4. マーキングの切り替え
  //=========================================
  const toggleMarking = useCallback((quizId) => {
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
  }, []);

  //=========================================
  // 5. HP操作 & ゲーム終了制御
  //=========================================
  const setHp = useCallback((newHp) => {
    setGame((prev) => {
      const targetHp = Math.max(0, newHp);
      if (prev.hp === targetHp) return prev;
      return {
        ...prev,
        hp: targetHp,
      };
    });
  }, []);

  const decreaseHp = useCallback(() => {
    setGame((prev) => ({
      ...prev,
      hp: Math.max(0, prev.hp - 1),
    }));
  }, []);

  const nextQuestion = useCallback(() => {
    setGame((prev) => ({
      ...prev,
      currentQuestion: prev.currentQuestion + 1,
    }));
  }, []);

  const addResultQuiz = useCallback((quizId, selectedAnswer) => {
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
  }, []);

  // ゲーム終了（ゲームオーバー・全クリア）フラグの設定
  const finishGame = useCallback(() => {
    setGame((prev) => ({
      ...prev,
      isFinished: true,
    }));
  }, []);

  // ゲーム状態の全リセット処理
  const resetGame = useCallback((defaultHp = 5) => {
    setGame((prev) => ({
      ...prev,
      quizzes: [],
      genreId: null,
      stageId: null,
      currentQuestion: 1,
      totalQuestion: 0,
      hp: defaultHp,
      elapsedTime: 0,
      currentQuiz: null,
      selectedAnswer: "",
      userAnswers: {},
      isFinished: true,
      user: {
        ...prev.user,
        resultQuizIds: [],
      },
    }));
  }, []);

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
        setHp,
        decreaseHp,
        nextQuestion,
        addResultQuiz,
        finishGame,
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
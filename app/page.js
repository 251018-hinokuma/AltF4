"use client";

import Link from "next/link";
import "./home/page.css";
import { useEffect, useState } from "react";

export default function Home() {

  // ユーザー名
  const [userName, setUserName] = useState("");

  // 読み込み中かどうか
  const [isLoading, setIsLoading] = useState(true);

  // エラー
  const [error, setError] = useState("");


  // ユーザー情報を取得
  useEffect(() => {

    const getUser = async () => {

      try {

        setError("");

        // APIからユーザー情報を取得
        const response = await fetch(
          "/api/userpage",
          {
            cache: "no-store"
          }
        );

        // JSONを取得
        const data = await response.json();


        // APIエラー
        if (!response.ok) {

          throw new Error(
            data.message ||
            `ユーザー情報の取得に失敗しました。ステータス: ${response.status}`
          );

        }


        // singleItemが存在するか確認
        if (!data.singleItem) {

          throw new Error(
            "APIからユーザー情報が取得できませんでした"
          );

        }


        // ユーザー名を設定
        setUserName(
          data.singleItem.userName || ""
        );


      } catch (error) {

        console.error(
          "ユーザー情報取得エラー:",
          error
        );

        setError(
          error.message ||
          "ユーザー情報の取得に失敗しました"
        );


      } finally {

        setIsLoading(false);

      }

    };


    getUser();

  }, []);


  return (
    <main className="containerMain">

      {/* 背景 */}
      <div className="sky"></div>
      <div className="cloud1"></div>
      <div className="cloud2"></div>
      <div className="mountain"></div>
      <div className="forest"></div>
      <div className="ground"></div>


      {/* ユーザー */}
      <div className="userBox">

        {isLoading
          ? "読み込み中..."
          : error
            ? "ユーザー情報取得エラー"
            : userName || "ユーザー名"
        }

      </div>


      {/* メニュー */}
      <section className="menupage">

        <h1 className="title">
          AltF4 RPG
        </h1>

        <p className="subTitle">
          ～ 社会人スキル育成 E-learning ～
        </p>


        <Link
          href="/quiz_genreSelection"
          className="button"
        >
          ▶ クイズ開始
        </Link>


        <Link
          href="/marking_genreSelection"
          className="button"
        >
          📖 マーキングクイズ一覧
        </Link>


        <Link
          href="/userpage"
          className="button"
        >
          👤 ユーザー情報
        </Link>

      </section>

    </main>
  );
}
"use client";

import Link from "next/link";
import "./page.css";
import { useEffect, useState } from "react";

export default function UserPage() {

    // ========================================
    // ユーザー情報
    // ========================================
    const [user, setUser] = useState(null);

    // ========================================
    // ユーザー名編集状態
    // ========================================
    const [isEditing, setIsEditing] = useState(false);

    const [editName, setEditName] = useState("");

    // ========================================
    // 読み込み状態
    // ========================================
    const [isLoading, setIsLoading] = useState(true);

    // ========================================
    // エラー
    // ========================================
    const [error, setError] = useState("");

    // ========================================
    // ユーザー情報取得
    // ========================================
    useEffect(() => {
        const getUser = async () => {
            try {
                setError("");
                const response = await fetch(
                    "/api/userpage",
                    {
                        method: "GET",
                        cache: "no-store"
                    }
                );

                // JSONか確認
                const contentType =
                    response.headers.get(
                        "content-type"
                    );
                if (
                    !contentType ||
                    !contentType.includes(
                        "application/json"
                    )
                ) {
                    throw new Error(
                        `APIがJSONを返していません。ステータス: ${response.status}`
                    );
                }
                const data =
                    await response.json();

                // APIエラー
                if (!response.ok) {
                    throw new Error(
                        data.message ||
                        `ユーザー情報の取得に失敗しました。ステータス: ${response.status}`
                    );
                }

                // ユーザー情報がない
                if (!data.singleItem) {
                    throw new Error(
                        "APIからユーザー情報(singleItem)が返されませんでした"
                    );

                }

                // ユーザー情報を保存
                setUser(
                    data.singleItem
                );

                // 編集用の名前を設定
                setEditName(
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

    // ========================================
    // ユーザー名保存
    // ========================================
    const saveUserName = async () => {

    if (!editName.trim()) {

        setError(
            "ユーザー名を入力してください"
        );

        return;

    }


    try {

        setError("");


        console.log(
            "変更するユーザー名:",
            editName.trim()
        );


        const response = await fetch(
            "/api/userpage",
            {
                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    userName:
                        editName.trim()
                })
            }
        );


        const data =
            await response.json();


        console.log(
            "PUT APIレスポンス:",
            data
        );


        if (!response.ok) {

            throw new Error(

                data.error ||

                data.message ||

                `ユーザー名の変更に失敗しました。
                ステータス: ${response.status}`

            );

        }


        if (!data.singleItem) {

            throw new Error(
                "更新後のユーザー情報がAPIから返されませんでした"
            );

        }


        // 画面のユーザー情報を更新
        setUser(
            data.singleItem
        );


        // 編集欄も更新
        setEditName(
            data.singleItem.userName || ""
        );


        // 編集終了
        setIsEditing(false);


        console.log(
            "ユーザー名変更成功:",
            data.singleItem.userName
        );


    } catch (error) {

        console.error(
            "ユーザー名更新エラー:",
            error
        );


        setError(
            error.message ||
            "ユーザー名の変更に失敗しました"
        );

    }
    };

    // ========================================
    // キーボード操作
    // ========================================
    const handleKeyDown = (e) => {
        // Enter
        if (e.key === "Enter") {
            saveUserName();
        }
        // Escape
        if (e.key === "Escape") {
            if (user) {
                setEditName(
                    user.userName || ""
                );
            }
            setIsEditing(false);
            setError("");
        }
    };
    return (
        <main className="container">
            {/* 背景 */}
            <div className="sky"></div>
            <div className="mountain"></div>
            <div className="forest"></div>
            <div className="ground"></div>
            {/* メニュー画面 */}
            <div className="window">
                {/* 戻る */}
                <Link href="/" className="back">
                    戻る
                </Link>
                {/* エラー表示 */}
                {error && (
                    <div className="errorMessage">
                        ⚠ {error}
                    </div>
                )}
                {/*ユーザー情報*/}
                <section className="profile">
                    {/* ユーザーアイコン */}
                    <svg
                        width="120"
                        height="120"
                    >
                        <circle
                            cx="60"
                            cy="30"
                            r="25"
                            stroke="white"
                            strokeWidth="3"
                            fill="none"
                        />
                        <path
                            d="
                                M15 100
                                C15 60,105 60,105 100
                            "
                            stroke="white"
                            strokeWidth="3"
                            fill="none"
                        />
                    </svg>
                    {/* ユーザー情報 */}
                    <div className="info">
                        <h2>ユーザー情報</h2>
                        {/* ユーザー名 */}
                        <div>
                            {isLoading ? (
                                <h3 className="userNameField">
                                    読み込み中...
                                </h3>
                            ) : isEditing ? (
                            <input className="userNameField" type="text" value={editName}
                                onChange={(e) =>
                                    setEditName(e.target.value)
                                } onKeyDown={handleKeyDown} autoFocus/>
                            ) : (
                                <div className="userNameArea">
                                    <h3 className="userNameField" onClick={() => setIsEditing(true)}>
                                        {user?.userName || "ユーザー名"}
                                    </h3>
                                    <button type="button" className="editNameButton"
                                        onClick={() => {
                                            setEditName(user?.userName || "");
                                            setIsEditing(true);
                                        }} 
                                        aria-label="ユーザー名を編集">
                                        ✎
                                    </button>
                                </div>
                                
                            )}
                        </div>
                        {/* 体力 */}
                        <p>体力</p>
                        <div className="hpBar">
                            <div className="hp"></div>
                        </div>
                    </div>
                </section>
                {/*メニュー*/}
                <div className="menuBox">
                    <nav className="menu">
                        <Link href="/genre_percentage" className="menuItem">
                            ▶ ジャンル別正答率
                        </Link>
                        <Link href="/star_correct" className="menuItem">
                            ▶ スター獲得状況
                        </Link>
                        <Link href="/achievement" className="menuItem">
                            ▶ 実績
                        </Link>
                    </nav>
                </div>
            </div>
        </main>
    );
}
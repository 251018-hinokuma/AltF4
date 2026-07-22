"use client";

import Link from "next/link";
import "./page.css";
import { useEffect, useState } from "react";

export default function UserPage() {
    const [isEditing, setIsEditing] = useState(false);

    const [user, setUser] = useState(null);

    const [editName, setEditName] = useState("");

    const [isLoading, setIsLoading] = useState(true);
    
    const [error, setError] = useState("");

    useEffect(() => {
        const getUser = async () => {
            try {
                setError("");
                const response = await fetch("/api/userpage", {cache: "no-store"});
                const contentType =
                    response.headers.get("content-type");
                if (!contentType ||
                    !contentType.includes("application/json")) {
                    throw new Error(
                        `APIがJSONを返していません。ステータス: ${response.status}`
                    );
                }
                const data = await response.json();

                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        `ユーザー情報の取得に失敗しました。ステータス: ${response.status}`
                    );

                }
                if (!data.singleItem) {
                    throw new Error(
                        "APIからユーザー情報(singleItem)が返されませんでした"
                    );
                }
                setUser(data.singleItem);
                setEditName(
                    data.singleItem.name || ""
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

    const saveUserName = async () => {
        // 空白だけの場合は保存しない
        if (!editName.trim()) {
            setError("ユーザー名を入力してください");
            return;
        }

        try {
            setError("");
            const response = await fetch( "/api/userpage",
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        userName: editName.trim()
                    })
                }
            );
            const contentType =
                response.headers.get("content-type");
            if (!contentType ||
                !contentType.includes("application/json")) {
                throw new Error(
                    `APIがJSONを返していません。ステータス: ${response.status}`
                );
            }
            const data = await response.json();
            if (!response.ok) {
                throw new Error(
                    data.message ||
                    `ユーザー名の変更に失敗しました。ステータス: ${response.status}`
                );
            }
            if (data.singleItem) {
                setUser(data.singleItem);
                setEditName(
                    data.singleItem.name || ""
                );
            } else {
                setUser((prevUser) => {
                    if (!prevUser) {
                        return prevUser;
                    }
                    return {
                        ...prevUser,
                        name: editName.trim()
                    };
                });
            }
            setIsEditing(false);
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

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            saveUserName();
        }
        // Escを押したら編集をキャンセル
        if (e.key === "Escape") {
            if (user) {
                setEditName(
                    user.name || ""
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

                <Link href="/" className="back">
                    戻る
                </Link>

                {/* エラー表示 */}
                {error && (
                    <div className="errorMessage">
                        ⚠ {error}
                    </div>
                )}

                <section className="profile">
                    <svg width="120" height="120">
                        <circle
                            cx="60"
                            cy="30"
                            r="25"
                            stroke="white"
                            strokeWidth="3"
                            fill="none"
                        />
                        <path
                            d="M15 100
                                C15 60,105 60,105 100"
                            stroke="white"
                            strokeWidth="3"
                            fill="none"
                        />
                    </svg>
                    <div className="info">
                        <h2>ユーザー情報</h2>
                        <div>
                            {isLoading ? (
                                <h3>
                                    読み込み中...
                                </h3>
                            ) : isEditing ? (
                                <input type="text" value={editName}
                                    onChange={(e) =>
                                        setEditName(e.target.value)
                                    }
                                    onKeyDown={handleKeyDown}
                                    autoFocus
                                />
                            ) : (
                                <h3 onClick={() => setIsEditing(true)}>
                                    {user?.name || "ユーザー名"}
                                </h3>
                            )}
                        </div>

                        <p>体力</p>
                        <div className="hpBar">
                            <div className="hp"></div>
                        </div>
                    </div>
                </section>
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
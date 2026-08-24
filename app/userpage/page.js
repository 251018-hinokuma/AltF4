"use client";

import Link from "next/link";
import styles from "./page.module.css";
import { useEffect, useState } from "react";

export default function UserPage() {

    const [user, setUser] = useState(null);

    const [isEditing, setIsEditing] = useState(false);

    const [editName, setEditName] = useState("");

    const [isLoading, setIsLoading] = useState(true);

    const [error, setError] = useState("");

    // ユーザー情報取得
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
                const contentType = response.headers.get("content-type");

                if (!contentType || !contentType.includes("application/json")) {
                    throw new Error(`APIがJSONを返していません。ステータス: ${response.status}`);
                }

                const data = await response.json();

                // APIエラー
                if (!response.ok) {
                    throw new Error(data.message || `ユーザー情報の取得に失敗しました。ステータス: ${response.status}`);
                }

                // ユーザー情報がない
                if (!data.singleItem) {
                    throw new Error("APIからユーザー情報(singleItem)が返されませんでした");
                }

                // ユーザー情報を保存
                setUser(data.singleItem);

                // 編集用の名前を設定
                setEditName(data.singleItem.userName || "");

            } catch (error) {
                console.error("ユーザー情報取得エラー:", error);
                setError(error.message || "ユーザー情報の取得に失敗しました");
            } finally {
                setIsLoading(false);
            }
        };
        getUser();
    }, []);

    // ユーザー名保存
    const saveUserName = async () => {
        if (!editName.trim()) {
            setError("ユーザー名を入力してください");
            return;
        }

        try {
            setError("");
            console.log("変更するユーザー名:", editName.trim());

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

            const data = await response.json();
            console.log("PUT APIレスポンス:", data);

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    data.message ||
                    `ユーザー名の変更に失敗しました。
                    ステータス: ${response.status}`
                );
            }

            if (!data.singleItem) {
                throw new Error("更新後のユーザー情報がAPIから返されませんでした");
            }

            // 画面のユーザー情報を更新
            setUser(data.singleItem);

            // 編集欄も更新
            setEditName(data.singleItem.userName || "");

            // 編集終了
            setIsEditing(false);

            console.log("ユーザー名変更成功:", data.singleItem.userName);

        } catch (error) {

            console.error("ユーザー名更新エラー:", error);

            setError(error.message || "ユーザー名の変更に失敗しました");
        }
    };

    // キーボード操作
    const handleKeyDown = (e) => {
        // Enter
        if (e.key === "Enter") {
            saveUserName();
        }
        // Escape
        if (e.key === "Escape") {
            if (user) {
                setEditName(user.userName || "");
            }
            setIsEditing(false);
            setError("");
        }
    };
    return (
        <main className={styles.container}>
            
            {/* 背景 */}
            <div className={styles.sky}></div>
            <div className={styles.mountain}></div>
            <div className={styles.forest}></div>
            <div className={styles.ground}></div>

            {/* メニュー画面 */}
            <div className={styles.window}>
                
                {/* 戻る */}
                <Link href="/" className={styles.back}>
                    戻る
                </Link>

                {/* エラー表示 */}
                {error && (
                    <div className={styles.errorMessage}>
                        ⚠ {error}
                    </div>
                )}

                {/*ユーザー情報*/}
                <section className={styles.profile}>
                    
                    {/* ユーザーアカウントアイコン */}
                <div className={styles.userIcon}>
                    <svg
                        className={styles.userIconSvg}
                        viewBox="0 0 120 120"
                        aria-label="ユーザーアカウント"
                    >
                    {/* 外側の円 */}
                    <circle
                        cx="60"
                        cy="60"
                        r="55"
                        className={styles.userIconFrame}
                    />

                    {/* 頭 */}
                    <circle
                        cx="60"
                        cy="42"
                        r="20"
                        className={styles.userIconHead}
                    />

                    {/* 肩 */}
                    <path
                        d="
                            M25 100
                            C28 78, 42 68, 60 68
                            C78 68, 92 78, 95 100
                        "
                        className={styles.userIconBody}
                    />
                    </svg>
                </div>

                    {/* ユーザー情報 */}
                    <div className={styles.info}>
                        <h2>ユーザー情報</h2>

                        {/* ユーザー名 */}
                        <div>
                            {isLoading ? (
                                <h3 className={styles.userNameField}>
                                    読み込み中...
                                </h3>
                            ) : isEditing ? (
                                <div className={styles.userNameArea}>
                                    {/* ユーザー名入力 */}
                                    <input className={styles.userNameField} type="text" value={editName}
                                        onChange={(e) =>
                                            setEditName(e.target.value)
                                        } onKeyDown={handleKeyDown} autoFocus/>
                                    {/* 編集完了ボタン */}
                                    <button type="button" className={styles.editNameButton} onClick={saveUserName}>
                                        ✓
                                    </button>
                                </div>
                            ) : (
                                <div className={styles.userNameArea}>
                                    <h3 className={styles.userNameField} onClick={() => setIsEditing(true)}>
                                        {user?.userName || "ユーザー名"}
                                    </h3>
                                    <button type="button" className={styles.editNameButton}
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
                        <div className={styles.hpBar}>
                            <div className={styles.hp}></div>
                        </div>
                    </div>
                </section>

                {/*メニュー*/}
                <div className={styles.menuBox}>
                    <nav className={styles.menu}>
                        <Link href="/genre_percentage" className={styles.menuItem}>
                            ▶ ジャンル別正答率
                        </Link>
                        <Link href="/star_correct" className={styles.menuItem}>
                            ▶ スター獲得状況
                        </Link>
                        <Link href="/achievement" className={styles.menuItem}>
                            ▶ 実績
                        </Link>
                    </nav>
                </div>
            </div>
        </main>
    );
}
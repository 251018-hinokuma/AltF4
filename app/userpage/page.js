"use client";

import Link from "next/link";
import "./page.css";

export default function UserPage() {

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
                        <h3>ユーザー名</h3>
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
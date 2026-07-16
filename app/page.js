import Link from "next/link";
import "./home/page.css";

export default function Home() {
  return (
    <main className="container">

      {/* 背景 */}
      <div className="sky"></div>
      <div className="cloud1"></div>
      <div className="cloud2"></div>
      <div className="mountain"></div>
      <div className="forest"></div>
      <div className="ground"></div>

      {/* ユーザー */}
      <div className="userBox">
        User Name
      </div>

      {/* メニュー */}
      <section className="menupage">

        <h1 className="title">
          AltF4 RPG
        </h1>

        <p className="subTitle">
          ～ 社会人スキル育成 E-learning ～
        </p>

        <Link href="/quiz_genreSelection" className="button">
          ▶ クイズ開始
        </Link>

        <Link href="/marking_genreSelection" className="button">
          📖 マーキングクイズ一覧
        </Link>

        <Link href="/userpage" className="button">
          👤 ユーザー情報
        </Link>

      </section>

    </main>
  );
}
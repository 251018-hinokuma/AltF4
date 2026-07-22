import Link from "next/link";
import "./style.css";

export default function QuizGenre() {
  return (
    <div className="page">
      <div className="top">
        <Link href="/" className="menu">
          戻る
        </Link>

        <div className="title">クイズ</div>
        <div className="title">ジャンル選択</div>
      </div>

      <div className="content">
        <Link href="/quiz_stageSelection?genreId=1" className="genreBox">
          <div className="genreName">ジャンル1</div>
          <div className="starArea">
            <div>☆</div>
            <div>0個/0個</div>
          </div>
        </Link>

        <Link href="/quiz_stageSelection?genreId=2" className="genreBox">
          <div className="genreName">ジャンル2</div>
          <div className="starArea">
            <div>☆</div>
            <div>0個/0個</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
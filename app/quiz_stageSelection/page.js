import Link from "next/link";
import "./style.css";

export default function QuizStage() {
  return (
    <div className="page">
      <div className="top">
        <Link href="/quiz_genreSelection">
          <button className="menu">戻る</button>
        </Link>

        <div className="title">クイズ</div>
        <div className="title">ジャンル名</div>
        <div className="title">ステージ選択</div>
      </div>

      <div className="content">

        <Link href="/quiz_question" className="link">
          <div className="stageBox">
            <div className="stage">ステージ1</div>

            <div className="mode">ノーマル</div>

            <div className="mode">ハード</div>

            <div className="result">
              <div className="star">☆☆☆</div>
              <div>クリア / 全問正解 / スピード</div>
            </div>
          </div>
        </Link>

        <Link href="/quiz_question" className="link">
          <div className="stageBox">
            <div className="stage">ステージ2</div>

            <div className="mode">ノーマル</div>

            <div className="mode">ハード</div>

            <div className="result">
              <div className="star">☆☆☆</div>
              <div>クリア / 全問正解 / スピード</div>
            </div>
          </div>
        </Link>

      </div>
    </div>
  );
}
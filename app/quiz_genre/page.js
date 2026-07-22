import "./style.css";

export default function QuizGenre() {
  return (
    <div className="page">

      <div className="top">
        <button className="menu">戻る</button>
        <div className="title">クイズ</div>
        <div className="title">ジャンル選択</div>
      </div>

      <div className="content">

        <div className="genreBox">
          <div className="genreName">
            ジャンル１
          </div>

          <div className="starArea">
            ☆
            <br />
            ○個/○個
          </div>
        </div>

        <div className="genreBox">
          <div className="genreName">
            ジャンル２
          </div>

          <div className="starArea">
            ☆
            <br />
            ○個/○個
          </div>
        </div>

      </div>

    </div>
  );
}
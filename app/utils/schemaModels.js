import mongoose from "mongoose";

const Schema = mongoose.Schema;

// =========================================
// 1. UserModel
// =========================================

// ステージ詳細情報のサブスキーマ
const stageDetailSchema = new Schema({
  clear: { type: Boolean, default: false },
  perfect: { type: Boolean, default: false },
  speed: { type: Boolean, default: false },
  correct: { type: Number, default: 0 },
  total: { type: Number, default: 0 }
}, { _id: false });

// ユーザー保持用の実績達成状況サブスキーマ
const userAchievementSchema = new Schema({
  achievementId: { type: Number, required: true },
  isAchieved: { type: Boolean, default: false },
  achievedAt: { type: Date }
}, { _id: false });

const userSchema = new Schema({
  userId: { type: Number, required: true, unique: true },
  userName: { type: String, required: true },
  
  // ジャンルごとにステージ詳細情報の配列を持つ構造
  stages: {
    type: Map,
    of: [stageDetailSchema],
    default: {}
  },
  
  // マーキングしたQuizIdの値が入る
  markingQuizIds: { type: [Number], default: [] },
  
  // 今回のクイズの結果のQuizIdの値が入る
  resultQuizIds: { type: [Number], default: [] },
  
  // ユーザーごとの実績達成リスト
  achievements: {
    type: [userAchievementSchema],
    default: []
  }
}, { timestamps: true });


// =========================================
// 2. QuizModel
// =========================================
const quizSchema = new Schema({
  quizId: { type: Number, required: true, unique: true },
  genreId: { type: Number, required: true },
  stageId: { type: Number, required: true },
  quizText: { type: String, required: true },
  choices: { type: [String], required: true },
  answer: { type: Number, required: true }, // 正解のインデックス
  explanation: { type: [String], required: true }
}, { timestamps: true });


// =========================================
// 3. StageModel
// =========================================
const stageSchema = new Schema({
  stageId: { type: Number, required: true },
  genreId: { type: Number, required: true },
  normalSpeedLimit: { type: Number, required: true }, // 秒数 (通常: 200, ボス: 500)
  hardSpeedLimit: { type: Number, required: true },   // 秒数 (通常: 100, ボス: 250)
  normalHp: { type: Number, required: true },          // HP (通常: 5, ボス: 10)
  hardHp: { type: Number, required: true },            // HP (通常: 3, ボス: 7)
  total: { type: Number, required: true },             // 問題数 (通常: 10, ボス: 25)
  isBoss: { type: Boolean, default: false }            // ボスステージフラグ
}, { timestamps: true });

stageSchema.index({ genreId: 1, stageId: 1 }, { unique: true });


// =========================================
// 4. GenreModel
// =========================================
const GenreSchema = new Schema(
  {
    genreId: {
      type: Number,
      required: true,
      unique: true,
    },
    genreName: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);


// =========================================
// 5. AchievementModel (追加)
// =========================================
const achievementSchema = new Schema(
  {
    achievementId: {
      type: Number,
      required: true,
      unique: true, // 実績ID（1: 銅, 2: 銀, 3: 金, 4: 虹 など）
    },
    name: {
      type: String,
      required: true, // 実績名（例: "銅トロフィー"）
    },
    className: {
      type: String,
      required: true, // スタイル定義用（"bronze", "silver", "gold", "rainbow"）
    },
    description: {
      type: String,
      required: true, // 達成条件の説明テキスト
    },
  },
  {
    timestamps: true,
  }
);


// =========================================
// モデルのエクスポート
// =========================================
export const User = mongoose.models.User || mongoose.model("User", userSchema);
export const Quiz = mongoose.models.Quiz || mongoose.model("Quiz", quizSchema);
export const Stage = mongoose.models.Stage || mongoose.model("Stage", stageSchema);
export const Genre = mongoose.models.Genre || mongoose.model("Genre", GenreSchema);
export const Achievement = mongoose.models.Achievement || mongoose.model("Achievement", achievementSchema);
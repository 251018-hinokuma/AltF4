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
}, { _id: false }); // サブドキュメント自体のID生成を防ぐ

// 実績詳細情報のサブスキーマ
const achievementSchema = new Schema({
  name: { type: String, required: true }, // 実績名（例: "初めてのクリア"）
  isAchieved: { type: Boolean, default: false }, // 達成しているかどうか
  condition: { type: String, required: true } // 達成方法（例: "ステージを1回クリアする"）
}, { _id: false });

const userSchema = new Schema({
  userId: { type: Number, required: true, unique: true },
  userName: { type: String, required: true },
  
  // ジャンルごとにステージ詳細情報の配列を持つ構造
  // 例: { "genre1": [{ clear: true, ... }], "genre2": [] }
  stages: {
    type: Map,
    of: [stageDetailSchema],
    default: {}
  },
  
  // マーキングしたQuizIdの値が入る
  markingQuizIds: { type: [Number], default: [] },
  
  // 今回のクイズの結果のQuizIdの値が入る
  resultQuizIds: { type: [Number], default: [] },
  
  // 実績リスト（実績名、達成フラグ、達成方法を持つオブジェクトの配列）
  achievements: {
    type: [achievementSchema],
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
  answer: { type: Number, required: true }, // 正解のインデックスとして保存
  explanation: { type: [String], required: true }
}, { timestamps: true });


// =========================================
// 3. StageModel
// =========================================
const stageSchema = new Schema({
  stageId: { type: Number, required: true },
  genreId: { type: Number, required: true },
  // timeは秒数（int）として管理すると扱いやすいためNumber型にしています
  normalSpeedLimit: { type: Number, required: true }, 
  hardSpeedLimit: { type: Number, required: true },
  normalHp: { type: Number, required: true },
  hardHp: { type: Number, required: true }
}, { timestamps: true });


// =========================================
// モデルのエクスポート
// (Next.js開発時におけるモデルの再コンパイルエラーを防ぐ記述)
// =========================================
export const User = mongoose.models.User || mongoose.model("User", userSchema);
export const Quiz = mongoose.models.Quiz || mongoose.model("Quiz", quizSchema);
export const Stage = mongoose.models.Stage || mongoose.model("Stage", stageSchema);
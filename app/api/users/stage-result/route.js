import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbConnect";
import { User } from "../../../utils/schemaModels";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const { userId, genreId, stageId, clear, perfect, speed, correct, total } = body;

    if (!userId || !genreId || !stageId) {
      return NextResponse.json({ error: "必要なパラメータが不足しています。" }, { status: 400 });
    }

    // ユーザーの取得（存在しない場合はデフォルト作成）
    let user = await User.findOne({ userId });
    if (!user) {
      user = new User({
        userId,
        userName: "Guest",
        stages: new Map(),
      });
    }

    const genreKey = `genre${genreId}`;
    const stageIndex = Number(stageId) - 1; // 0ベースインデックスに変換

    // 該当ジャンルのステージ配列を取得・初期化
    let genreStages = user.stages.get(genreKey) || [];

    // 配列サイズが足りない場合は空要素を補完
    while (genreStages.length <= stageIndex) {
      genreStages.push({
        clear: false,
        perfect: false,
        speed: false,
        correct: 0,
        total: 0,
      });
    }

    // 既存情報と新規情報のマージ（過去に獲得したスターは true を維持）
    const currentDetail = genreStages[stageIndex] || {};
    genreStages[stageIndex] = {
      clear: currentDetail.clear || !!clear,
      perfect: currentDetail.perfect || !!perfect,
      speed: currentDetail.speed || !!speed,
      correct: Math.max(currentDetail.correct || 0, correct || 0),
      total: total || currentDetail.total || 10,
    };

    // Mapに設定して保存
    user.stages.set(genreKey, genreStages);
    await user.save();

    return NextResponse.json({
      message: "ステージ結果およびスターの保存に成功しました。",
      stages: user.stages,
    });
  } catch (error) {
    console.error("User stage-result POST エラー:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました。" }, { status: 500 });
  }
}
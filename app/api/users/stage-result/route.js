import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbConnect";
import { User } from "../../../utils/schemaModels";

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();

    const { userId, genreId, stageId, clear, perfect, speed, correct, total } = body;

    if (userId === undefined || genreId === undefined || stageId === undefined) {
      return NextResponse.json({ error: "必要なパラメータが不足しています。" }, { status: 400 });
    }

    const genreKey = `genre${genreId}`;
    const stageIndex = Number(stageId) - 1; // 0ベースインデックスに変換

    // ユーザーの取得（存在しない場合はデフォルト作成）
    let user = await User.findOne({ userId });
    if (!user) {
      user = new User({
        userId,
        userName: "Guest",
        stages: new Map(),
      });
      await user.save();
    }

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

    // user.save() ではなく updateOne を使用して VersionError (楽観的ロック競合) を回避
    await User.updateOne(
      { _id: user._id },
      { 
        $set: { 
          [`stages.${genreKey}`]: genreStages,
          updatedAt: new Date(),
        } 
      }
    );

    // 返却用にローカルの Map 構造を更新
    user.stages.set(genreKey, genreStages);

    return NextResponse.json({
      message: "ステージ結果およびスターの保存に成功しました。",
      stages: user.stages,
    });
  } catch (error) {
    console.error("User stage-result POST エラー:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました。" }, { status: 500 });
  }
}
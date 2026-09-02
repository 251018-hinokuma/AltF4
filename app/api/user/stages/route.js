import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbConnect";
import { User } from "../../../utils/schemaModels";

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);

    const userId = searchParams.get("userId");
    const genreId = searchParams.get("genreId");

    if (!userId || !genreId) {
      return NextResponse.json(
        { error: "userIdとgenreIdが必要です" },
        { status: 400 }
      );
    }

    const user = await User.findOne({
      userId: Number(userId)
    });

    if (!user) {
      return NextResponse.json(
        { error: "ユーザーが見つかりません" },
        { status: 404 }
      );
    }

    // "1"（数字のみ）と "genre1"（文字列プレフィックス付き）の両方のキー形式に対応
    const keyNumber = String(genreId);       // 例: "1"
    const keyGenre = `genre${genreId}`;      // 例: "genre1"

    let stages = [];

    if (user.stages?.get) {
      // Map構造の場合
      stages = user.stages.get(keyNumber) || user.stages.get(keyGenre) || [];
    } else if (user.stages) {
      // プレーンオブジェクトの場合
      stages = user.stages[keyNumber] || user.stages[keyGenre] || [];
    }

    // フロント側のスター判定に必要なプロパティを補完・整形
    const formattedStages = stages.map((st, idx) => ({
      stageId: Number(st.stageId) || idx + 1,
      clear: Boolean(st.clear),
      perfect: Boolean(st.perfect),
      speed: Boolean(st.speed),
      correct: Number(st.correct) || 0,
      total: Number(st.total) || (idx === 5 ? 25 : 10),
    }));

    return NextResponse.json({
      success: true,
      stages: formattedStages
    });

  } catch (error) {
    console.error("GET stages エラー:", error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
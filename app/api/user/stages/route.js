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

    // 保存時と同じ形式 "genre1", "genre2" にキーを合わせる
    const genreKey = `genre${genreId}`;

    // Map構造およびプレーンオブジェクトのどちらにも対応できる安全な取得
    const stages = user.stages?.get 
      ? (user.stages.get(genreKey) || []) 
      : (user.stages?.[genreKey] || []);

    return NextResponse.json({
      stages
    });

  } catch (error) {
    console.error("GET stages エラー:", error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
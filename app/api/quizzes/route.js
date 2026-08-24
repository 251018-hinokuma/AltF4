import { NextResponse } from "next/server";
import dbConnect from "../../../lib/dbConnect";
import { Quiz } from "../../utils/schemaModels";

export async function GET(request) {
  await dbConnect();

  // URLのパラメータから genreId と stageId を取得
  const { searchParams } = new URL(request.url);
  const genreId = searchParams.get("genreId");
  const stageId = searchParams.get("stageId");

  // ★ genreId のみを必須チェックに変更（stageId は任意にする）
  if (!genreId) {
    return NextResponse.json(
      { error: "genreIdが必要です。" },
      { status: 400 }
    );
  }

  try {
    // 検索条件オブジェクトを作成
    const query = { genreId: Number(genreId) };

    // ★ stageId がパラメータにある場合のみ検索条件に追加する
    if (stageId) {
      query.stageId = Number(stageId);
    }

    // データベースから一致する問題を検索
    const quizzes = await Quiz.find(query);

    return NextResponse.json({ quizzes }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
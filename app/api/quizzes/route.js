import { NextResponse } from "next/server";
import dbConnect from "../../../lib/dbConnect";
import { Quiz } from "../../utils/schemaModels";

export async function GET(request) {
  await dbConnect();

  // URLのパラメータから genreId と stageId を取得
  const { searchParams } = new URL(request.url);
  const genreId = searchParams.get("genreId");
  const stageId = searchParams.get("stageId");

  try {
    // 検索条件オブジェクトを動的に作成
    const query = {};

    // genreId が存在する場合のみ検索条件に追加
    if (genreId) {
      query.genreId = Number(genreId);
    }

    // stageId が存在する場合のみ検索条件に追加
    if (stageId) {
      query.stageId = Number(stageId);
    }

    // データベースから一致する問題を検索（queryが空なら全件取得）
    const quizzes = await Quiz.find(query);

    return NextResponse.json({ quizzes }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
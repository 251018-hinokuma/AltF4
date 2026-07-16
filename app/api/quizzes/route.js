import { NextResponse } from "next/server";
import dbConnect from "../../../lib/dbConnect";
import { Quiz } from "../../utils/schemaModels"; // utilsフォルダへのパスに修正

export async function GET(request) {
  await dbConnect();

  // URLのパラメータから genreId と stageId を取得
  const { searchParams } = new URL(request.url);
  const genreId = searchParams.get("genreId");
  const stageId = searchParams.get("stageId");

  if (!genreId || !stageId) {
    return NextResponse.json(
      { error: "genreIdとstageIdが必要です。" },
      { status: 400 }
    );
  }

  try {
    // データベースから一致する問題をすべて検索
    const quizzes = await Quiz.find({ 
      genreId: Number(genreId), 
      stageId: Number(stageId) 
    });

    return NextResponse.json({ quizzes }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
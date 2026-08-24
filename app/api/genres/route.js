import { NextResponse } from "next/server";
import dbConnect from "../../../lib/dbConnect";
import { Genre } from "../../utils/schemaModels"; // schemaModelsからGenreをインポート

export async function GET(request) {
  await dbConnect();

  // URLのパラメータから genreId を取得（オプション）
  const { searchParams } = new URL(request.url);
  const genreId = searchParams.get("genreId");

  try {
    // genreIdが指定されている場合はそのジャンル、指定がない場合は全件取得
    const query = genreId ? { genreId: Number(genreId) } : {};
    const genres = await Genre.find(query).sort({ genreId: 1 });

    return NextResponse.json({ genres }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
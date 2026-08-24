import { NextResponse } from "next/server";
import dbConnect from "../../../lib/dbConnect";
import { Stage } from "../../utils/schemaModels";

// =========================================
// GET: ステージ情報の取得
// パラメータなし: 全ステージ取得
// ?genreId=1 : 特定ジャンルの全ステージ取得
// ?genreId=1&stageId=2 : 特定の1ステージ取得
// =========================================
export async function GET(request) {
  await dbConnect();

  // URLのパラメータから genreId と stageId を取得
  const { searchParams } = new URL(request.url);
  const genreId = searchParams.get("genreId");
  const stageId = searchParams.get("stageId");

  try {
    const query = {};
    if (genreId) query.genreId = Number(genreId);
    if (stageId) query.stageId = Number(stageId);

    // データベースから一致するステージ情報を検索（昇順でソート）
    const stages = await Stage.find(query).sort({ genreId: 1, stageId: 1 });

    return NextResponse.json({ stages }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// =========================================
// POST: ステージデータの新規登録
// (単一オブジェクトまたは配列での一括登録に対応)
// =========================================
export async function POST(request) {
  await dbConnect();

  try {
    const body = await request.json();

    // 配列の場合は一括登録
    if (Array.isArray(body)) {
      const stages = await Stage.insertMany(body);
      return NextResponse.json({ stages }, { status: 201 });
    }

    // 単一登録
    const stage = await Stage.create(body);
    return NextResponse.json({ stage }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
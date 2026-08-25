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

    const stages = user.stages.get(String(genreId)) || [];

    return NextResponse.json({
      stages
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
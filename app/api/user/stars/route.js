import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbConnect";
import { User } from "../../../utils/schemaModels";

export async function GET(request) {
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

  try {
    const user = await User.findOne({
      userId: Number(userId),
    });

    if (!user) {
      return NextResponse.json(
        { error: "ユーザーが見つかりません" },
        { status: 404 }
      );
    }

    // UserModelの
    // stages: { "genre1": [...], "genre2": [...] }
    // から対象ジャンルを取得
    const genreStages =
      user.stages.get(`genre${genreId}`) || [];

    // 獲得したスター数
    let starCount = 0;

    genreStages.forEach((stage) => {
      if (stage.clear) {
        starCount++;
      }

      if (stage.perfect) {
        starCount++;
      }

      if (stage.speed) {
        starCount++;
      }
    });

    return NextResponse.json({
      starCount,
      totalStars: 30,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
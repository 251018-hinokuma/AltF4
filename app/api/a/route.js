import { NextResponse } from "next/server";
import dbConnect from "../../../lib/dbConnect";
import { Achievement } from "../../utils/schemaModels";

export async function GET() {
  await dbConnect();

  // --- 【実績（Achievement）の初期データ：ジャンル別分類】 ---
  const initialAchievements = [
    // --- 【ジャンル1：プログラミング】 ---
    {
      achievementId: 1,
      name: "プログラミング 銅トロフィー",
      className: "bronze",
      description: "プログラミングのボスステージをクリアする"
    },
    {
      achievementId: 2,
      name: "プログラミング 銀トロフィー",
      className: "silver",
      description: "プログラミングのスターをすべて取得する"
    },

    // --- 【ジャンル2：ビジネスマナー】 ---
    {
      achievementId: 3,
      name: "ビジネスマナー 銅トロフィー",
      className: "bronze",
      description: "ビジネスマナーのボスステージをクリアする"
    },
    {
      achievementId: 4,
      name: "ビジネスマナー 銀トロフィー",
      className: "silver",
      description: "ビジネスマナーのスターをすべて取得する"
    },

    // --- 【ジャンル3：情報セキュリティ・モラル】 ---
    {
      achievementId: 5,
      name: "情報セキュリティ・モラル 銅トロフィー",
      className: "bronze",
      description: "情報セキュリティ・モラルのボスステージをクリアする"
    },
    {
      achievementId: 6,
      name: "情報セキュリティ・モラル 銀トロフィー",
      className: "silver",
      description: "情報セキュリティ・モラルのスターをすべて取得する"
    },

    // --- 【ジャンル4：ITリテラシー・オフィス】 ---
    {
      achievementId: 7,
      name: "ITリテラシー・オフィス 銅トロフィー",
      className: "bronze",
      description: "ITリテラシー・オフィスのボスステージをクリアする"
    },
    {
      achievementId: 8,
      name: "ITリテラシー・オフィス 銀トロフィー",
      className: "silver",
      description: "ITリテラシー・オフィスのスターをすべて取得する"
    },

    // --- 【ジャンル5：コミュニケーション・仕事術】 ---
    {
      achievementId: 9,
      name: "コミュニケーション・仕事術 銅トロフィー",
      className: "bronze",
      description: "コミュニケーション・仕事術のボスステージをクリアする"
    },
    {
      achievementId: 10,
      name: "コミュニケーション・仕事術 銀トロフィー",
      className: "silver",
      description: "コミュニケーション・仕事術のスターをすべて取得する"
    },

    // --- 【全体・達成報酬】 ---
    {
      achievementId: 11,
      name: "金トロフィー",
      className: "gold",
      description: "ラストステージをクリアする"
    },
    {
      achievementId: 12,
      name: "虹トロフィー",
      className: "rainbow",
      description: "全てのスターを取得する"
    }
  ];

  try {
    // 既存の実績データを削除して初期データを投入
    await Achievement.deleteMany({});
    await Achievement.insertMany(initialAchievements);

    return NextResponse.json(
      { message: "Achievements seeded successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to seed achievements" },
      { status: 500 }
    );
  }
}
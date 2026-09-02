import { NextResponse } from "next/server";
import dbConnect from "../../../lib/dbConnect";
import { User } from "../../utils/schemaModels"; // 使用しているUserモデル

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const userId = Number(searchParams.get("userId")) || 1;

    let user = await User.findOne({ userId });
    
    if (!user) {
      user = await User.create({
        userId,
        userName: `TestUser_${userId}`,
        stages: {}
      });
    }

    const rawStages = user.stages instanceof Map 
      ? Object.fromEntries(user.stages) 
      : user.stages || {};

    // 各ステージに stageId を補完して返却
    const formattedStages = {};
    Object.keys(rawStages).forEach((genreId) => {
      const list = Array.isArray(rawStages[genreId]) ? rawStages[genreId] : [];
      formattedStages[genreId] = list.map((st, idx) => ({
        stageId: st.stageId || idx + 1,
        clear: Boolean(st.clear),
        perfect: Boolean(st.perfect),
        speed: Boolean(st.speed),
        correct: Number(st.correct) || 0,
        total: Number(st.total) || (idx === 5 ? 25 : 10),
      }));
    });

    return NextResponse.json({ success: true, userId: user.userId, stages: formattedStages });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const { userId, stages } = await req.json();
    const targetUserId = Number(userId) || 1;

    let user = await User.findOne({ userId: targetUserId });
    if (!user) {
      user = new User({ userId: targetUserId, userName: `TestUser_${targetUserId}` });
    }

    // 保存時に stageId (1〜6) を確実に埋め込んで保存
    const stagesToSave = {};
    Object.keys(stages || {}).forEach((genreId) => {
      const list = Array.isArray(stages[genreId]) ? stages[genreId] : [];
      stagesToSave[genreId] = list.map((st, idx) => ({
        stageId: Number(st.stageId) || idx + 1,
        clear: Boolean(st.clear),
        perfect: Boolean(st.perfect),
        speed: Boolean(st.speed),
        correct: Number(st.correct) || 0,
        total: Number(st.total) || (idx === 5 ? 25 : 10),
      }));
    });

    user.stages = stagesToSave;
    user.markModified("stages");
    await user.save();

    return NextResponse.json({ success: true, message: "更新に成功しました" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
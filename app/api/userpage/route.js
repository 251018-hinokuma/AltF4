import { NextResponse } from "next/server";
import connectDB from "../../utils/database";
import { User } from "../../utils/schemaModels";

export async function GET(request, context){
    try{
        await connectDB()
        const resolvedParams = await context.params
        const singleItem = await User.findById("69eec97279fbb03b15318344")
        return NextResponse.json({message: "アイテム読み取り成功（シングル）",singleItem: singleItem})
    }catch{
        return NextResponse.json({message: "アイテム読み取り失敗（シングル）"})
    }
}
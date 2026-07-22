import { NextResponse } from "next/server";
import connectDB from "../../utils/database";
import { User } from "../../utils/schemaModels";


// ログイン中と仮定するユーザーID
const LOGIN_USER_ID = "6a6041999f6dbe7a6a24db3e";


// ========================================
// GET
// ユーザー情報を取得
// ========================================

export async function GET() {

    try {

        console.log("===== GET /api/userpage =====");

        // MongoDB接続
        await connectDB();

        console.log("MongoDB接続成功");


        // ユーザー取得
        const singleItem = await User.findById(
            LOGIN_USER_ID
        );

        console.log(
            "取得したユーザー:",
            singleItem
        );


        // ユーザーが存在しない
        if (!singleItem) {

            return NextResponse.json(
                {
                    success: false,
                    message: "ユーザーが見つかりません",
                    userId: LOGIN_USER_ID
                },
                {
                    status: 404
                }
            );

        }


        return NextResponse.json(
            {
                success: true,
                message: "ユーザー読み取り成功",
                singleItem: singleItem
            },
            {
                status: 200
            }
        );


    } catch (error) {

        console.error(
            "GETエラー:",
            error
        );


        return NextResponse.json(
            {
                success: false,
                message: "ユーザー情報取得中にエラーが発生しました",
                error: error.message
            },
            {
                status: 500
            }
        );

    }

}


// ========================================
// PUT
// ユーザー名を変更
// ========================================

export async function PUT(request) {

    try {

        await connectDB();

        // リクエストデータ取得
        const reqBody =
            await request.json();

        console.log(
            "PUTで受け取ったデータ:",
            reqBody
        );


        // 新しいユーザー名
        const userName =
            reqBody.userName;


        // 入力チェック
        if (
            !userName ||
            !userName.trim()
        ) {

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "ユーザー名を入力してください"
                },
                {
                    status: 400
                }
            );

        }


        // ユーザー検索
        const user =
            await User.findById(
                LOGIN_USER_ID
            );


        console.log(
            "更新対象ユーザー:",
            user
        );


        // ユーザーが存在しない
        if (!user) {

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "更新対象のユーザーが見つかりません",
                    userId:
                        LOGIN_USER_ID
                },
                {
                    status: 404
                }
            );

        }


        // ユーザー名変更
        user.userName =
            userName.trim();


        // MongoDBへ保存
        const updatedUser =
            await user.save();


        console.log(
            "更新後のユーザー:",
            updatedUser
        );


        return NextResponse.json(
            {
                success: true,
                message:
                    "ユーザー名変更成功",
                singleItem:
                    updatedUser
            },
            {
                status: 200
            }
        );


    } catch (error) {

        console.error(
            "PUTユーザー名変更エラー:",
            error
        );


        return NextResponse.json(
            {
                success: false,
                message:
                    "ユーザー名変更中にエラーが発生しました",
                error:
                    error.message,
                stack:
                    process.env.NODE_ENV === "development"
                        ? error.stack
                        : undefined
            },
            {
                status: 500
            }
        );

    }

}
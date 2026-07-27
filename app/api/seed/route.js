import { NextResponse } from "next/server";
import dbConnect from "../../../lib/dbConnect";
import { Quiz, Genre } from "../../utils/schemaModels"; // インポートをまとめました

export async function GET() {
  await dbConnect();

  const initialQuizzes = [
    // --- stageId: 1 (quizId: 1 〜 10) ---
    { quizId: 1, genreId: 1, stageId: 1, quizText: "JavaScriptで配列を表す記号は？", choices: ["[]", "{}", "()", "<>"], answer: 0, explanation: ["配列は [] を使用します。", "{} はオブジェクトです。", "() は関数呼び出し等で使用します。", "<> は配列ではありません。"] },
    { quizId: 2, genreId: 1, stageId: 1, quizText: "変数を宣言するキーワードではないものは？", choices: ["var", "let", "const", "def"], answer: 3, explanation: ["varは古い変数宣言です。", "letは再代入可能な変数です。", "constは定数です。", "defはPython等で使われますがJSでは使いません。"] },
    { quizId: 3, genreId: 1, stageId: 1, quizText: "コンソールにログを出力するメソッドは？", choices: ["console.print()", "console.log()", "console.write()", "print()"], answer: 1, explanation: ["JSにはありません。", "console.log()が正解です。", "DOMへの書き込みはdocument.write()等です。", "Python等の書き方です。"] },
    { quizId: 4, genreId: 1, stageId: 1, quizText: "厳密等価演算子（型も比較する）はどれ？", choices: ["=", "==", "===", "=>"], answer: 2, explanation: ["= は代入です。", "== は型変換を伴う等価演算子です。", "=== が厳密等価演算子です。", "=> はアロー関数です。"] },
    { quizId: 5, genreId: 1, stageId: 1, quizText: "配列の末尾に要素を追加するメソッドは？", choices: ["push()", "pop()", "shift()", "unshift()"], answer: 0, explanation: ["push()が末尾追加です。", "pop()は末尾削除です。", "shift()は先頭削除です。", "unshift()は先頭追加です。"] },
    { quizId: 6, genreId: 1, stageId: 1, quizText: "文字列を数値に変換する関数は？", choices: ["toString()", "parseInt()", "Math.floor()", "String()"], answer: 1, explanation: ["数値を文字列にします。", "parseInt()が文字列を整数に変換します。", "切り捨てを行います。", "文字列に変換します。"] },
    { quizId: 7, genreId: 1, stageId: 1, quizText: "非同期処理を待機するためのキーワードは？", choices: ["async", "await", "defer", "promise"], answer: 1, explanation: ["関数を非同期にするキーワードです。", "awaitが非同期処理の完了を待機します。", "scriptタグの属性等で使われます。", "非同期処理のオブジェクトですが待機キーワードではありません。"] },
    { quizId: 8, genreId: 1, stageId: 1, quizText: "オブジェクトのキーと値のペアを配列で返すのは？", choices: ["Object.keys()", "Object.values()", "Object.entries()", "Object.assign()"], answer: 2, explanation: ["キーのみを配列で返します。", "値のみを配列で返します。", "Object.entries()がキーと値のペアを返します。", "オブジェクトをマージします。"] },
    { quizId: 9, genreId: 1, stageId: 1, quizText: "DOMでIDを指定して要素を取得するメソッドは？", choices: ["getElementById()", "querySelector()", "getElementsByClassName()", "querySelectorAll()"], answer: 0, explanation: ["IDで取得する専用メソッドです。", "CSSセレクタで取得します。", "クラス名で取得します。", "CSSセレクタで全て取得します。"] },
    { quizId: 10, genreId: 1, stageId: 1, quizText: "JSのデータ型で「値がない」ことを明示的に示すのは？", choices: ["undefined", "NaN", "null", "false"], answer: 2, explanation: ["未定義（代入されていない）状態です。", "Not a Number（数値ではない）です。", "nullは「値がない」ことを明示的に代入するものです。", "真偽値の「偽」です。"] },
  // --- stageId: 2 (quizId: 11 〜 20) ---
    { quizId: 11, genreId: 1, stageId: 2, quizText: "JavaScriptで x が10より大きい場合に処理を実行したい時の適切な条件式はどれですか？", choices: ["if x > 10", "if (x > 10)", "if [x > 10]", "if {x > 10}"], answer: 1, explanation: ["if 文の条件式は丸かっこ () で囲む必要があります。", "if 文の条件式は丸かっこ () で囲むのが正しい書き方です。", "角かっこ [] は配列の定義や要素へのアクセスに使用します。", "波かっこ {} は処理ブロックの指定に使用します。"] },
    { quizId: 12, genreId: 1, stageId: 2, quizText: "値だけでなく「データ型も一致しているか」を判定する比較演算子はどれですか？", choices: ["==", "===", "=", "!="], answer: 1, explanation: ["値のみを比較し、自動で型変換を行ないます。", "=== は厳密等価演算子と呼ばれ、値と型が両方一致している場合に true を返します。", "= は代入演算子です。", "!= は値が不一致かを判定する演算子です。"] },
    { quizId: 13, genreId: 1, stageId: 2, quizText: "「条件A と 条件B の両方が正しい（true）」場合に true を返す論理演算子はどれですか？", choices: ["||", "&&", "!", "&"], answer: 1, explanation: ["|| はOR（論理和）演算子です。", "&&（AND演算子）は左右両方の条件が true の時のみ true を返します。", "! はNOT（論理否定）演算子です。", "& はビット論理積演算子です。"] },
    { quizId: 14, genreId: 1, stageId: 2, quizText: "for (let i = 0; i < 3; i++) { console.log(i); } のコードでコンソールが出力される回数は何回ですか？", choices: ["2回", "3回", "4回", "1回"], answer: 1, explanation: ["i は 0, 1, 2 と評価されるため2回ではありません。", "i の値が 0, 1, 2 と変化し、3 回ループ処理が実行されます。", "i が 3 になった時点で条件を満たさなくなります。", "条件を満たす間は繰り返し実行されます。"] },
    { quizId: 15, genreId: 1, stageId: 2, quizText: "const colors = [\"赤\", \"青\", \"緑\"]; から「赤」を取得するためのコードはどれですか？", choices: ["colors[1]", "colors[0]", "colors.first", "colors[赤]"], answer: 1, explanation: ["colors[1] は2番目の「青」を取得します。", "JavaScriptの配列インデックスは 0 から始まるため、先頭要素は colors[0] です。", "colors.first プロパティは存在しません。", "インデックスには数値（0など）を指定する必要があります。"] },
    { quizId: 16, genreId: 1, stageId: 2, quizText: "配列に含まれる要素の数を取得するプロパティはどれですか？", choices: [".length", ".size", ".count", ".number"], answer: 0, explanation: ["配列の要素数を取得するには .length プロパティを使用します。", ".size は Set や Map で使用します。", ".count プロパティは配列に存在しません。", ".number プロパティは配列に存在しません。"] },
    { quizId: 17, genreId: 1, stageId: 2, quizText: "関数から値を呼び出し元に返すために使用するキーワードはどれですか？", choices: ["send", "output", "return", "give"], answer: 2, explanation: ["send キーワードは存在しません。", "output キーワードは存在しません。", "関数の処理結果を返すには return を使用します。", "give キーワードは存在しません。"] },
    { quizId: 18, genreId: 1, stageId: 2, quizText: "繰り返し処理（forやwhile）を途中で強制終了させるキーワードはどれですか？", choices: ["stop", "exit", "break", "continue"], answer: 2, explanation: ["stop キーワードは存在しません。", "exit はプロセス終了等に使われます。", "break文を実行すると、進行中のループ処理を中断して抜け出します。", "continue は次のループ処理に進むキーワードです。"] },
    { quizId: 19, genreId: 1, stageId: 2, quizText: "let name = \"太郎\"; のとき、「こんにちは、太郎さん」と出力するテンプレートリテラルの正しい書き方はどれですか？", choices: ["\"こんにちは、${name}さん\"", "'こんにちは、{name}さん'", "こんにちは、\" + name + \"さん", "`こんにちは、${name}さん`"], answer: 3, explanation: ["ダブルクォートでは変数は展開されません。", "シングルクォートでは変数は展開されません。", "クォートの囲みが不正でエラーになります。", "テンプレートリテラルはバッククォート `` で囲み、変数を埋め込む際には ${} を使用します。"] },
    { quizId: 20, genreId: 1, stageId: 2, quizText: "変数 num の値を1増やす省略記法（インクリメント）として正しいものはどれですか？", choices: ["num++", "num+1", "num +=", "num === 1"], answer: 0, explanation: ["num++ は num = num + 1 と同じ働きをし、変数の値を1加算します。", "1を足した計算値を返しますが、num 自体は更新されません。", "加算する値（num += 1 など）が不足しています。", "1と等しいか判定する比較演算子です。"] },
];

  const initialGenres = [
    { genreId: 1, genreName: "プログラミング" },
    { genreId: 2, genreName: "ビジネスマナー" },
    { genreId: 3, genreName: "情報セキュリティ・モラル" },
    { genreId: 4, genreName: "ITリテラシー・オフィス" },
    { genreId: 5, genreName: "コミュニケーション・仕事術" },
  ];

  try {
    // ジャンルデータの登録（upsert）
    for (const genre of initialGenres) {
      await Genre.updateOne(
        { genreId: genre.genreId },
        { $set: genre },
        { upsert: true }
      );
    }

    // 対象のステージ（1と2）の既存データを削除して入れ替え
    await Quiz.deleteMany({ genreId: 1, stageId: { $in: [1, 2] } });
    await Quiz.insertMany(initialQuizzes);

    return NextResponse.json({ message: "20問のクイズデータとジャンルデータを正常に保存しました！" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
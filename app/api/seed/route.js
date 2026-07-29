import { NextResponse } from "next/server";
import dbConnect from "../../../lib/dbConnect";
import { Quiz, Genre, Stage } from "../../utils/schemaModels";

export async function GET() {
  await dbConnect();

  const initialQuizzes = [
    // --- 【ジャンル1】stageId: 1 (quizId: 1 〜 10) ---
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

    // --- 【ジャンル1】stageId: 2 (quizId: 11 〜 20) ---
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

    // --- 【ジャンル1】stageId: 3 (quizId: 21 〜 30) ---
    { quizId: 21, genreId: 1, stageId: 3, quizText: "配列の各要素に処理を行い、新しい配列を生成する配列操作メソッドはどれですか？", choices: ["forEach()", "map()", "filter()", "reduce()"], answer: 1, explanation: ["forEach() は返り値を返しません。", "map() は各要素を加工した新しい配列を生成して返します。", "filter() は条件に合う要素を抽出するメソッドです。", "reduce() は単一の値に集約するメソッドです。"] },
    { quizId: 22, genreId: 1, stageId: 3, quizText: "配列の中から指定した条件を満たす要素だけを抽出して新しい配列を作るメソッドはどれですか？", choices: ["find()", "slice()", "filter()", "some()"], answer: 2, explanation: ["find() は最初に見つかった 1 つの要素のみを返します。", "slice() はインデックス範囲を指定して切り抜きます。", "filter() は条件を満たす全要素を含む新しい配列を返します。", "some() は条件を満たす要素があるかの真偽値を返します。"] },
    { quizId: 23, genreId: 1, stageId: 3, quizText: "配列の全要素を走査して単一の値（合計値など）に集約するメソッドはどれですか？", choices: ["reduce()", "concat()", "join()", "every()"], answer: 0, explanation: ["reduce() はアキュムレータ（累積値）を使って配列を1つの値にまとめます。", "concat() は配列同士を結合します。", "join() は配列要素を結合して文字列にします。", "every() はすべての要素が条件を満たすか判定します。"] },
    { quizId: 24, genreId: 1, stageId: 3, quizText: "アロー関数構文で、引数 x を受け取って 2 倍の値を返す正しい書き方はどれですか？", choices: ["x => x * 2", "function(x) => x * 2", "x -> x * 2", "(x) => { x * 2 }"], answer: 0, explanation: ["引数が1つの場合はかっこを省略でき、単一式の場合は return も省略可能です。", "function キーワードとアロー（=>）を同時に書くことはできません。", "JavaScriptでは -> 記法は使用しません。", "波かっこ {} を使う場合は明示的に return を書く必要があります。"] },
    { quizId: 25, genreId: 1, stageId: 3, quizText: "const user = { name: \"Alice\", age: 20 }; から name を取得する分割代入の正しい書き方はどれですか？", choices: ["const { name } = user;", "const [ name ] = user;", "const name = user.get(\"name\");", "const { name: user };"], answer: 0, explanation: ["オブジェクトの分割代入は波かっこ {} を使用します。", "角かっこ [] は配列の分割代入に使用します。", "JavaScriptオブジェクトに .get() メソッドはありません。", "構文が不適切です。"] },
    { quizId: 26, genreId: 1, stageId: 3, quizText: "配列やオブジェクトの要素を展開・結合する際に使用する `...` 記法の名称はどれですか？", choices: ["レストパラメータ", "スプレッド構文", "ドット演算子", "アロケーション"], answer: 1, explanation: ["関数の引数で受け取る場合はレストパラメータと呼ばれます。", "配列やオブジェクトを展開してコピーや結合をするのは「スプレッド構文」です。", "ドット演算子（.）とは異なります。", "アロケーションという名称ではありません。"] },
    { quizId: 27, genreId: 1, stageId: 3, quizText: "配列内に特定の値が含まれているかどうか判定し、真偽値（true/false）を返すメソッドはどれですか？", choices: ["indexOf()", "includes()", "has()", "search()"], answer: 1, explanation: ["indexOf() は見つかったインデックス（数値）または -1 を返します。", "includes() は値が含まれるかどうかを true / false で返します。", "has() は Set や Map オブジェクトのメソッドです。", "search() は文字列で正規表現検索を行うメソッドです。"] },
    { quizId: 28, genreId: 1, stageId: 3, quizText: "配列の「先頭」の要素を取り出して削除するメソッドはどれですか？", choices: ["pop()", "shift()", "unshift()", "splice()"], answer: 1, explanation: ["pop() は末尾の要素を削除します。", "shift() は先頭の要素を削除し、取り出します。", "unshift() は先頭に要素を追加します。", "splice() は指定位置の要素を変更・削除します。"] },
    { quizId: 29, genreId: 1, stageId: 3, quizText: "オブジェクトに指定したプロパティ（キー）が存在するか確認する演算子はどれですか？", choices: ["has", "in", "of", "exist"], answer: 1, explanation: ["has キーワードは演算子として存在しません。", "「\"key\" in object」の形式でプロパティの存在確認ができます。", "of は for...of ループ等で使用します。", "exist キーワードは存在しません。"] },
    { quizId: 30, genreId: 1, stageId: 3, quizText: "文字列を指定した区切り文字で分割し、配列として返すメソッドはどれですか？", choices: ["split()", "slice()", "substring()", "replace()"], answer: 0, explanation: ["split() は文字列を区切り文字で分割して配列にします。", "slice() は文字列の部分切り出しを行います。", "substring() は指定位置の文字列を取得します。", "replace() は文字列の置換を行います。"] },

    // --- 【ジャンル1】stageId: 4 (quizId: 31 〜 40) ---
    { quizId: 31, genreId: 1, stageId: 4, quizText: "Promise オブジェクトが成功（履行）した際に呼び出される後続処理メソッドはどれですか？", choices: ["catch()", "then()", "finally()", "resolve()"], answer: 1, explanation: ["catch() はエラー処理（拒絶時）に使います。", "then() は Promise が成功した時の処理を指定します。", "finally() は成功・失敗に関わらず実行されます。", "resolve は Promise を成功状態にする関数です。"] },
    { quizId: 32, genreId: 1, stageId: 4, quizText: "Promise や async/await で発生した例外・エラーを捕捉するメソッドはどれですか？", choices: ["reject()", "then()", "catch()", "error()"], answer: 2, explanation: ["reject は Promise を失敗状態にする関数です。", "then() の第1引数は成功処理です。", "catch() メソッド（または try...catch 文）でエラーを捉えます。", "error() というPromiseメソッドはありません。"] },
    { quizId: 33, genreId: 1, stageId: 4, quizText: "async を付けて定義された関数が常に返すオブジェクトの型はどれですか？", choices: ["Object", "Promise", "Function", "Response"], answer: 1, explanation: ["普通のオブジェクトではありません。", "async 関数は戻り値を自動的に Promise でラップして返します。", "関数そのものではなく実行結果の型です。", "Response は fetch などが返すオブジェクトです。"] },
    { quizId: 34, genreId: 1, stageId: 4, quizText: "Web API 等へ HTTP リクエストを送信するための標準非同期関数はどれですか？", choices: ["fetch()", "http.get()", "ajax()", "request()"], answer: 0, explanation: ["fetch() API がブラウザ組み込みの標準的なリクエスト送信手段です。", "Node.js の http モジュール等で使われる形式です。", "jQuery 等で使われていた旧来の関数です。", "標準の組み込み関数ではありません。"] },
    { quizId: 35, genreId: 1, stageId: 4, quizText: "JSON 文字列を JavaScript のオブジェクトや配列に変換するメソッドはどれですか？", choices: ["JSON.stringify()", "JSON.parse()", "JSON.toObject()", "JSON.convert()"], answer: 1, explanation: ["JSON.stringify() はオブジェクトを JSON 文字列に変換します。", "JSON.parse() は JSON 文字列を JS オブジェクトに復元します。", "toObject というメソッドはありません。", "convert というメソッドはありません。"] },
    { quizId: 36, genreId: 1, stageId: 4, quizText: "JavaScript のオブジェクトを JSON 形式の文字列に変換するメソッドはどれですか？", choices: ["JSON.parse()", "JSON.stringify()", "JSON.encode()", "Object.toJSON()"], answer: 1, explanation: ["JSON.parse() は文字列からオブジェクトへの変換です。", "JSON.stringify() がオブジェクトを JSON 文字列へシリアライズします。", "encode というメソッドはありません。", "Object.toJSON という標準メソッドはありません。"] },
    { quizId: 37, genreId: 1, stageId: 4, quizText: "DOM イベントの伝播（バブリング）を途中で停止させるイベントオブジェクトのメソッドはどれですか？", choices: ["preventDefault()", "stopPropagation()", "stopImmediate()", "cancelBubble()"], answer: 1, explanation: ["preventDefault() は要素の既定動作（リンク遷移等）を打ち消します。", "stopPropagation() はイベントが親要素へ伝播（バブリング）するのを止めます。", "他の同一イベントリスナーの実行も止めるメソッドです。", "非推奨の旧プロパティです。"] },
    { quizId: 38, genreId: 1, stageId: 4, quizText: "フォーム送信時のページ再読み込みなど、ブラウザのデフォルト動作を無効化するメソッドはどれですか？", choices: ["stopPropagation()", "preventDefault()", "return false", "stop()"], answer: 1, explanation: ["イベントバブリングを止めるメソッドです。", "preventDefault() はブラウザの既定動作をキャンセルします。", "インラインイベント等でのみ機能する古い手法です。", "stop() というイベントメソッドはありません。"] },
    { quizId: 39, genreId: 1, stageId: 4, quizText: "DOM 要素に対してクリック等のイベントが発生した時の処理を登録するメソッドはどれですか？", choices: ["attachEvent()", "addEventListener()", "on()", "setEventListener()"], answer: 1, explanation: ["古い Internet Explorer 向けの独自メソッドです。", "addEventListener() が標準のイベント登録メソッドです。", "jQuery や Node.js イベント等で使われる記法です。", "存在しないメソッドです。"] },
    { quizId: 40, genreId: 1, stageId: 4, quizText: "指定したミリ秒の経過後に、関数を 1 回だけ実行するタイマー関数はどれですか？", choices: ["setInterval()", "setTimeout()", "requestAnimationFrame()", "setImmediate()"], answer: 1, explanation: ["setInterval() は一定時間ごとに繰り返し実行します。", "setTimeout() が指定時間後に 1 回だけ処理を実行します。", "描画フレームに合わせたタイマー関数です。", "Node.js 固有のタイマー関数です。"] },

    // --- 【ジャンル1】stageId: 5 (quizId: 41 〜 50) ---
    { quizId: 41, genreId: 1, stageId: 5, quizText: "`let` や `const` で宣言された変数が持つスコープ（有効範囲）の単位はどれですか？", choices: ["グローバルスコープ", "関数スコープ", "ブロックスコープ", "モジュールスコープ"], answer: 2, explanation: ["コード全体から参照できるスコープです。", "var などが持つ関数単位のスコープです。", "let / const は `{}`（ブロック）内に限定されるブロックスコープを持ちます。", "ファイル単位のスコープです。"] },
    { quizId: 42, genreId: 1, stageId: 5, quizText: "関数とその外側のレキシカル環境の組み合わせで、エンクロージング（囲い込み）変数を保持し続ける仕組みはどれですか？", choices: ["クロージャ", "プロトタイプチェーン", "コールバック", "ホイスティング"], answer: 0, explanation: ["クロージャ（Closure）は関数が作成された環境のスコープを記憶し続ける仕組みです。", "オブジェクトの継承関係を辿る仕組みです。", "引数として渡される関数です。", "変数宣言の巻き上げ現象です。"] },
    { quizId: 43, genreId: 1, stageId: 5, quizText: "JavaScript がシングルスレッドでありながら非同期処理をノンブロッキングで実行できる仕組みの中心となる構造はどれですか？", choices: ["コールスタック", "イベントループ", "タスクキュー", "スレッドプール"], answer: 1, explanation: ["実行中関数の積載場所です。", "イベントループがスタックとキューを監視し、非同期処理を制御しています。", "非同期タスクが待機する場所です。", "マルチスレッド管理の仕組みです。"] },
    { quizId: 44, genreId: 1, stageId: 5, quizText: "ES6 で導入された、他と絶対に重複しない固有（一意）の識別子を生成する基本データ型はどれですか？", choices: ["Unique", "Symbol", "BigInt", "UUID"], answer: 1, explanation: ["データ型として存在しません。", "Symbol() は一意で不変な値を作成するプリミティブ型です。", "任意精度の大きな整数を扱う型です。", "ライブラリ等で生成される一意文字列です。"] },
    { quizId: 45, genreId: 1, stageId: 5, quizText: "左辺が `null` または `undefined` の場合のみ右辺の値を返す演算子（Null合体演算子）はどれですか？", choices: ["||", "&&", "??", "?."], answer: 2, explanation: ["|| は 0 や空文字などの Falsy 値全般で右辺を返します。", "&& は論理積演算子です。", "??（Nullish Coalescing）は null と undefined にのみ反応します。", "?. はオプショナルチェイニングです。"] },
    { quizId: 46, genreId: 1, stageId: 5, quizText: "プロパティが存在しない可能性があるオブジェクトのネストアクセスで、エラーを防ぐ記法はどれですか？", choices: ["??", "?. ", "!!", "::"], answer: 1, explanation: ["Null合体演算子です。", "?.（オプショナルチェイニング）を使えば、途中で null/undefined があってもエラーにならず undefined を返します。", "二重否定（Boolean型変換）です。", "バインド演算子（提案段階）です。"] },
    { quizId: 47, genreId: 1, stageId: 5, quizText: "オブジェクトのプロパティの追加・削除・値の変更をすべて不可にし、完全不変化（フリーズ）するメソッドはどれですか？", choices: ["Object.seal()", "Object.freeze()", "Object.preventExtensions()", "Object.lock()"], answer: 1, explanation: ["seal() は追加・削除を禁じますが既存値の変更は許可します。", "Object.freeze() がオブジェクトを完全に変更不可にします。", "preventExtensions() は新しいプロパティの追加のみを禁止します。", "lock() というメソッドは存在しません。"] },
    { quizId: 48, genreId: 1, stageId: 5, quizText: "関数の `this` のコンテキストを明示的に固定した「新しい関数」を生成して返すメソッドはどれですか？", choices: ["call()", "apply()", "bind()", "connect()"], answer: 2, explanation: ["call() は this を指定して即時実行します。", "apply() は引数を配列で渡して即時実行します。", "bind() は this が束縛された新しい関数を作成して返します。", "connect() という標準メソッドはありません。"] },
    { quizId: 49, genreId: 1, stageId: 5, quizText: "重複する値を保持せず、常にユニークな値のコレクションを管理する組み込みオブジェクトはどれですか？", choices: ["Map", "Set", "WeakMap", "Array"], answer: 1, explanation: ["キーと値のペアを扱うコレクションです。", "Set オブジェクトは重複する値を一切保持しません。", "弱い参照を持つ Map です。", "通常の配列は値の重複を許容します。"] },
    { quizId: 50, genreId: 1, stageId: 5, quizText: "キーにオブジェクトを含む任意のデータ型を使用できる、キー・値ペアの組み込みコレクションはどれですか？", choices: ["Object", "Map", "Set", "Dictionary"], answer: 1, explanation: ["オブジェクトのキーは文字列または Symbol に限定されます。", "Map は任意の型（オブジェクト含む）をキーとして扱うことができます。", "単一の値の集合です。", "JavaScript の組み込み型ではありません。"] },

    // --- 【ジャンル2：ビジネスマナー】stageId: 1 (quizId: 51 〜 60) ---
    { quizId: 51, genreId: 2, stageId: 1, quizText: "ビジネスメールの件名として最も適切な書き方はどれですか？", choices: ["「お世話になっております」", "「【ご相談】新プロジェクトのスケジュールについて（営業部・山田）」", "「緊急」", "件名を空欄にする"], answer: 1, explanation: ["挨拶のみではメールの用件が伝わりません。", "用件と差出人が一目で伝わる件名にするのがマナーです。", "単に「緊急」と書くだけでは不親切です。", "件名なしのメールはスパム判定や見落としの原因になります。"] },
    { quizId: 52, genreId: 2, stageId: 1, quizText: "社内で電話を受ける際、何コール以内に出るのが基本マナーとされているか？", choices: ["1コール以内", "3コール以内", "5コール以内", "10コール以内"], answer: 1, explanation: ["1コール目で慌てて出ると準備が整わない場合があります。", "原則として3コール以内に出るのがビジネスマナーです（3コールを超えた場合は「お待たせいたしました」とお詫びします）。", "5コール以上待たせるのは遅すぎます。", "10コールは相手に切られてしまう可能性が高いです。"] },
    { quizId: 53, genreId: 2, stageId: 1, quizText: "退社する際、残業している上司や同僚に対する適切な挨拶はどれですか？", choices: ["ご苦労様でした", "お疲れ様でした。お先に失礼します", "バイバイ", "お世話になりました"], answer: 1, explanation: ["「ご苦労様」は目上の人が目下の人に対して使う言葉です。", "「お疲れ様でした。お先に失礼します」が最も適切な退社時の挨拶です。", "ビジネスシーンに不適切な砕けた表現です。", "「お世話になりました」は退職やプロジェクト終了時などに使う言葉です。"] },
    { quizId: 54, genreId: 2, stageId: 1, quizText: "名刺交換を行う際の正しいマナーとして適切なものはどれですか？", choices: ["立って互いに胸の高さで両手で渡す（目下の人から先に差し出す）", "座ったままテーブル越しに渡す", "片手でひょいと差し出す", "相手の名刺のロゴや名前の上に指を重ねて持つ"], answer: 0, explanation: ["名刺交換は必ず立ち上がり、胸の高さで両手で扱うのが基本です。また立場が下の人から差し出します。", "テーブル越しに名刺を渡すのはマナー違反です。", "名刺は両手で扱うのが原則です。", "相手の名前や企業ロゴに指をかけて持つのは失礼とされます。"] },
    { quizId: 55, genreId: 2, stageId: 1, quizText: "応接室や会議室における「上座（かみざ）」の位置は基本的にどこですか？", choices: ["出入り口に一番近い席", "出入り口から一番遠い奥の席", "部屋の真ん中の席", "窓がない壁側の席"], answer: 1, explanation: ["出入り口に一番近い席は「下座（しもざ）」です。", "出入り口から最も遠い奥の席が「上座」となります。", "真ん中の席は原則として上座ではありません。", "窓の有無よりも「出入り口からの距離」が基本基準となります。"] },
    { quizId: 56, genreId: 2, stageId: 1, quizText: "社外の取引先に対して、自社の上司（部長の山田）について話す際の正しい表現はどれですか？", choices: ["山田部長がおっしゃっていました", "部長の山田が申しておりました", "山田様が伝えてくれました", "うちの山田部長が言っていました"], answer: 1, explanation: ["社外の人に対して自社の人間に敬称や役職をそのまま付けるのは誤りです。", "社外の人に対しては、上司であっても役職を付けず「山田」と呼び、謙譲語（申す）を使います。", "自社の人間に「様」を付けるのは誤りです。", "「うちの〜」「言っていた」などの口語表現はビジネスに不適切です。"] },
    { quizId: 57, genreId: 2, stageId: 1, quizText: "エレベーターに乗る際、社外のお客様を案内する側の正しい行動はどれですか？", choices: ["先に乗り込んで「開」ボタンを押して乗車を促す", "お客様を先に乗せて自分は後から乗り、操作盤の前に立つ", "どちらが先に乗っても問題ない", "エレベーターを使わず階段を案内する"], answer: 0, explanation: ["無人のエレベーターの場合、案内者が先に乗り「開」ボタンを押して扉を押さえるのがマナーです。", "扉が閉まる危険があるため、案内者が先に乗ってボタンを押すのが安全で丁寧です。", "順番は明確に決められています。", "エレベーターがある場合は利用するのが一般的です。"] },
    { quizId: 58, genreId: 2, stageId: 1, quizText: "ビジネスにおける「報・連・相（ほうれんそう）」の「相」が表す言葉はどれですか？", choices: ["相談", "相槌", "相互", "相手"], answer: 0, explanation: ["「報・連・相」は「報告」「連絡」「相談」の略です。", "相槌ではありません。", "相互ではありません。", "相手ではありません。"] },
    { quizId: 59, genreId: 2, stageId: 1, quizText: "「お力添え」という言葉の正しい使い方はどれですか？", choices: ["自分が相手を助けるときに「私がお力添えします」と言う", "相手からの助力を依頼・感謝するときに「お力添えをいただく」と言う", "自分の作業成果に対して使う", "謝罪の言葉として使う"], answer: 1, explanation: ["「お力添え」は相手からの援助・協力に対して使う言葉なので、自分の行動には使いません。", "相手からの手助けをお願いするときや感謝するときに使う適切な表現です。", "自分の成果に対して使う言葉ではありません。", "謝罪を意味する言葉ではありません。"] },
    { quizId: 60, genreId: 2, stageId: 1, quizText: "お礼状やビジネスメールで「取り急ぎお礼まで」という表現を使う際の注意点はどれですか？", choices: ["目上の人や重要な取引先に対して使うのは避ける", "どのような相手に使っても失礼にならない完璧な言葉である", "メールの冒頭に書くのがマナーである", "電話をかけた後でなければ使えない"], answer: 0, explanation: ["「取り急ぎ〜まで」は「簡略ですが」という意味を含むため、目上の人や取引先には「略儀ながらメールにてお礼申し上げます」など丁寧な言葉に言い換えます。", "目上の人には舌足らずで失礼な印象を与える場合があります。", "結びの言葉として使われるのが一般的です。", "電話の有無とは関係ありません。"] },
  ];

  const initialGenres = [
    { genreId: 1, genreName: "プログラミング" },
    { genreId: 2, genreName: "ビジネスマナー" },
    { genreId: 3, genreName: "情報セキュリティ・モラル" },
    { genreId: 4, genreName: "ITリテラシー・オフィス" },
    { genreId: 5, genreName: "コミュニケーション・仕事術" },
  ];

  const initialStages = [
    // ジャンル 1
    { genreId: 1, stageId: 1, isBoss: false, normalHp: 5, hardHp: 3, normalSpeedLimit: 200, hardSpeedLimit: 100, total: 10 },
    { genreId: 1, stageId: 2, isBoss: false, normalHp: 5, hardHp: 3, normalSpeedLimit: 200, hardSpeedLimit: 100, total: 10 },
    { genreId: 1, stageId: 3, isBoss: false, normalHp: 5, hardHp: 3, normalSpeedLimit: 200, hardSpeedLimit: 100, total: 10 },
    { genreId: 1, stageId: 4, isBoss: false, normalHp: 5, hardHp: 3, normalSpeedLimit: 200, hardSpeedLimit: 100, total: 10 },
    { genreId: 1, stageId: 5, isBoss: false, normalHp: 5, hardHp: 3, normalSpeedLimit: 200, hardSpeedLimit: 100, total: 10 },
    { genreId: 1, stageId: 6, isBoss: true,  normalHp: 10, hardHp: 7, normalSpeedLimit: 500, hardSpeedLimit: 250, total: 25 },

    // ジャンル 2
    { genreId: 2, stageId: 1, isBoss: false, normalHp: 5, hardHp: 3, normalSpeedLimit: 200, hardSpeedLimit: 100, total: 10 },
    { genreId: 2, stageId: 2, isBoss: false, normalHp: 5, hardHp: 3, normalSpeedLimit: 200, hardSpeedLimit: 100, total: 10 },
    { genreId: 2, stageId: 3, isBoss: false, normalHp: 5, hardHp: 3, normalSpeedLimit: 200, hardSpeedLimit: 100, total: 10 },
    { genreId: 2, stageId: 4, isBoss: false, normalHp: 5, hardHp: 3, normalSpeedLimit: 200, hardSpeedLimit: 100, total: 10 },
    { genreId: 2, stageId: 5, isBoss: false, normalHp: 5, hardHp: 3, normalSpeedLimit: 200, hardSpeedLimit: 100, total: 10 },
    { genreId: 2, stageId: 6, isBoss: true,  normalHp: 10, hardHp: 7, normalSpeedLimit: 500, hardSpeedLimit: 250, total: 25 },

    // ジャンル 3
    { genreId: 3, stageId: 1, isBoss: false, normalHp: 5, hardHp: 3, normalSpeedLimit: 200, hardSpeedLimit: 100, total: 10 },
    { genreId: 3, stageId: 2, isBoss: false, normalHp: 5, hardHp: 3, normalSpeedLimit: 200, hardSpeedLimit: 100, total: 10 },
    { genreId: 3, stageId: 3, isBoss: false, normalHp: 5, hardHp: 3, normalSpeedLimit: 200, hardSpeedLimit: 100, total: 10 },
    { genreId: 3, stageId: 4, isBoss: false, normalHp: 5, hardHp: 3, normalSpeedLimit: 200, hardSpeedLimit: 100, total: 10 },
    { genreId: 3, stageId: 5, isBoss: false, normalHp: 5, hardHp: 3, normalSpeedLimit: 200, hardSpeedLimit: 100, total: 10 },
    { genreId: 3, stageId: 6, isBoss: true,  normalHp: 10, hardHp: 7, normalSpeedLimit: 500, hardSpeedLimit: 250, total: 25 },

    // ジャンル 4
    { genreId: 4, stageId: 1, isBoss: false, normalHp: 5, hardHp: 3, normalSpeedLimit: 200, hardSpeedLimit: 100, total: 10 },
    { genreId: 4, stageId: 2, isBoss: false, normalHp: 5, hardHp: 3, normalSpeedLimit: 200, hardSpeedLimit: 100, total: 10 },
    { genreId: 4, stageId: 3, isBoss: false, normalHp: 5, hardHp: 3, normalSpeedLimit: 200, hardSpeedLimit: 100, total: 10 },
    { genreId: 4, stageId: 4, isBoss: false, normalHp: 5, hardHp: 3, normalSpeedLimit: 200, hardSpeedLimit: 100, total: 10 },
    { genreId: 4, stageId: 5, isBoss: false, normalHp: 5, hardHp: 3, normalSpeedLimit: 200, hardSpeedLimit: 100, total: 10 },
    { genreId: 4, stageId: 6, isBoss: true,  normalHp: 10, hardHp: 7, normalSpeedLimit: 500, hardSpeedLimit: 250, total: 25 },

    // ジャンル 5
    { genreId: 5, stageId: 1, isBoss: false, normalHp: 5, hardHp: 3, normalSpeedLimit: 200, hardSpeedLimit: 100, total: 10 },
    { genreId: 5, stageId: 2, isBoss: false, normalHp: 5, hardHp: 3, normalSpeedLimit: 200, hardSpeedLimit: 100, total: 10 },
    { genreId: 5, stageId: 3, isBoss: false, normalHp: 5, hardHp: 3, normalSpeedLimit: 200, hardSpeedLimit: 100, total: 10 },
    { genreId: 5, stageId: 4, isBoss: false, normalHp: 5, hardHp: 3, normalSpeedLimit: 200, hardSpeedLimit: 100, total: 10 },
    { genreId: 5, stageId: 5, isBoss: false, normalHp: 5, hardHp: 3, normalSpeedLimit: 200, hardSpeedLimit: 100, total: 10 },
    { genreId: 5, stageId: 6, isBoss: true,  normalHp: 10, hardHp: 7, normalSpeedLimit: 500, hardSpeedLimit: 250, total: 25 },
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

    // ステージデータの登録（upsert）
    for (const stage of initialStages) {
      await Stage.updateOne(
        { genreId: stage.genreId, stageId: stage.stageId },
        { $set: stage },
        { upsert: true }
      );
    }

    // 対象ステージ（ジャンル1のステージ1〜5、およびジャンル2のステージ1）の既存クイズを削除して一括挿入
    await Quiz.deleteMany({
      $or: [
        { genreId: 1, stageId: { $in: [1, 2, 3, 4, 5] } },
        { genreId: 2, stageId: 1 }
      ]
    });
    await Quiz.insertMany(initialQuizzes);

    return NextResponse.json(
      { message: "60問のクイズデータ（ジャンル1: 1〜50 / ジャンル2: 51〜60）、ジャンルデータ、およびステージデータ（Hard難易度設定含む）を正常に保存しました！" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
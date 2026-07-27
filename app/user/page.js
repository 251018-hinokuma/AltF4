import Link from "next/link";

export default function UserPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-[800px] h-[500px] bg-white border border-black p-6 relative">

        {/* Back Button */}
        <Link href="/">
          <button className="border border-black px-4 py-2">
            Back
          </button>
        </Link>

        {/* Title */}
        <h1 className="text-center text-2xl font-bold mt-4">
          User Page
        </h1>

        {/* Profile */}
        <div className="flex mt-8 gap-8">

          <div className="w-24 h-24 rounded-full border border-black flex items-center justify-center">
            👤
          </div>

          <div className="flex-1 border border-black rounded-lg p-4">
            <p className="font-bold">User Name</p>

            <p className="mt-6">HP</p>

            <div className="w-full h-4 bg-gray-300 rounded">
              <div className="w-3/4 h-4 bg-red-500 rounded"></div>
            </div>
          </div>

        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-4 mt-10">

          <button className="border border-black rounded-lg px-6 py-2 w-56">
            Genre Accuracy
          </button>

          <button className="border border-black rounded-lg px-6 py-2 w-56">
            Star Status
          </button>

          <button className="border border-black rounded-lg px-6 py-2 w-56">
            Achievements
          </button>

        </div>

      </div>
    </main>
  );
}
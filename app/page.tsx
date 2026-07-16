import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-[800px] h-[500px] bg-white border border-black p-6 relative">

        {/* User Name */}
        <div className="absolute top-6 left-6 border border-black px-4 py-2">
          User Name
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-center mt-12">
          Quiz App
        </h1>

        {/* Buttons */}
        <div className="flex flex-col items-center gap-6 mt-16">

          <button className="border border-black rounded-lg px-8 py-3">
            Quiz
          </button>

          <button className="border border-black rounded-lg px-8 py-3">
            Marking Questions
          </button>

          <Link href="/user">
            <button className="border border-black rounded-lg px-8 py-3">
              User Page
            </button>
          </Link>

        </div>

      </div>
    </main>
  );
}
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GameProvider } from "./context/GameContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "e-learning",
  description: "e-learning",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <GameProvider>
          {children}
        </GameProvider>
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import { Sora, Nunito_Sans } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const display = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const body = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-body",
  display: "swap",
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: "Mind.AI || Preserving Happiness",
  description:
    "Mind.AI is a mental wellness platform offering expert diagnosis, personalized therapy and holistic support for depression, anxiety, ADHD and more.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="flex min-h-screen flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

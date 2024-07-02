import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ReduxWrapper from "./ReduxWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Summarizer",
  description: "Summarize article and documents using the power of AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReduxWrapper>{children}</ReduxWrapper>
      </body>
    </html>
  );
}

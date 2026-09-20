import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/ui/Header";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Civix — AI Civic Grievance Router",
  description:
    "Report civic issues in minutes. Civix uses AI to categorize, prioritize, and route reports to the right municipal department.",
  keywords: ["civic", "grievance", "municipal", "AI", "report", "pothole", "sanitation"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-surface font-sans antialiased">
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}

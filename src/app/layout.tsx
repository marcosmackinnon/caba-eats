import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import MobileBottomNav from "@/components/MobileBottomNav";
import Toast from "@/components/Toast";
import { FavoritesProvider } from "@/components/FavoritesProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dondy — Encontrá dónde comer en CABA",
  description: "Encontrá el restaurante ideal según tu plan, presupuesto y zona en Buenos Aires.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <FavoritesProvider>
          {children}
          <MobileBottomNav />
          <Toast />
        </FavoritesProvider>
      </body>
    </html>
  );
}

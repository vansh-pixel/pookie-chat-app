import type { Metadata } from "next";
import { Fredoka, Pacifico } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ["latin"],
  variable: "--font-fredoka",
  display: 'swap',
});

const pacifico = Pacifico({
  weight: ['400'],
  subsets: ["latin"],
  variable: "--font-pacifico",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Pookie Chat 🎀",
  description: "The cutest chat app ever!",
};

import { ThemeProvider } from "../context/ThemeContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fredoka.variable} ${pacifico.variable} antialiased font-cute bg-hk-pink/10`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

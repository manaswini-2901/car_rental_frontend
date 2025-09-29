// src/app/layout.tsx

import type { Metadata } from "next";
import "./globals.css";
import NavBar from "./components/NavBar";
import { SessionProvider } from "./components/SessionProvider";


export const metadata: Metadata = {
  title: "Car Rental",
  description: "Simple car rental web app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <NavBar />
          <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import {Providers} from "../components/heroUI/providers";
import { Toaster } from 'react-hot-toast';
import { decrypt } from "@/lib/jose_auth";
import Script from 'next/script'
import Sidebar from "@/components/ui/Sidebar";
import ClientLayoutWrapper from "@/components/ui/ClientLayoutWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DSA Saga",
  description: "Gamified DSA for better understanding",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const payload = token ? await decrypt(token) : null;
  const initialUser =
    payload && typeof payload === "object" && "userId" in payload && payload.userId
      ? { userId: String(payload.userId) }
      : null;

  return (
    <html lang="en">
       <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
    <Providers>
      <div className="flex min-h-screen bg-[#F8F9FA]">
        <Sidebar initialUser={initialUser} />
        <ClientLayoutWrapper>
          <Navbar initialUser={initialUser} />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </ClientLayoutWrapper>
      </div>
      <Toaster position="top-center" reverseOrder={false} />
    </Providers>
         <Script 
          src="https://accounts.google.com/gsi/client"
          strategy="beforeInteractive"
        />
</body>
    </html>
  );
}

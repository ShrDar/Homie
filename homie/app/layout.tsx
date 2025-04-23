import type { Metadata } from "next";
import { Geist, Geist_Mono, Jim_Nightshade, Pixelify_Sans, Sulphur_Point, Tiny5 } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { Toaster } from "sonner";
import SlideBar from "@/components/SlideBar/SlideBar";
import PageTitle from "@/components/PageTitle/PageTitle";
import SlideBarHorizental from "@/components/SlideBar/SlideBarHorizental";
import Onboarding from "@/components/Onboarding/Onboarding";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sulphur = Sulphur_Point({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-sulphur"
})

const jimNightShade = Jim_Nightshade({
  subsets: ['latin'],
  weight: ["400"],
  variable: "--font-jim"
})

const pixelify = Pixelify_Sans({
  subsets: ['latin'],
  weight: ["400", "500", "600", "700"],
  variable: "--font-pixelify"
})

const tiny = Tiny5({
  subsets: ['latin'],
  weight: ["400"],
  variable: "--font-tiny"
})

export const metadata: Metadata = {
  title: "Homie",
  description: "",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <SessionProvider session={session}>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${sulphur.variable} ${jimNightShade.variable} ${pixelify.variable} ${tiny.variable} selection:bg-bgPrimary bg-bgPrimary antialiased min-h-screen w-full relative flex justify-center items-center`}
        >
          {session && <SlideBarHorizental />}
          {session && <SlideBar session={session} />} 
          {children}
          <Toaster richColors />
          <PageTitle />
          {session && <Onboarding session={session} />}
          <div id="modal"></div>
        </body>
      </html>
    </SessionProvider>
  );
}

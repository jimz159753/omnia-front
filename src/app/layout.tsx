import { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/app/(root)/Footer";

export const metadata: Metadata = {
  title: "Espacio Omnia",
  description: "Centro holístico para tu bienestar.",
  openGraph: {
    title: "Espacio Omnia",
    description: "Centro holístico para tu bienestar.",
    url: "https://espacioomnia.com",
    type: "website",
    images: [
      {
        url: "https://espacioomnia.com/omnia_logo.png",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}

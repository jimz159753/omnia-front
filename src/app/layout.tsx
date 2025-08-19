import { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";

const bigilla = localFont({
  src: "../../public/fonts/Bigilla.otf",
  variable: "--font-bigilla",
});

const cabinetGrotesk = localFont({
  src: "../../public/fonts/CabinetGrotesk-Light.otf",
  variable: "--font-cabinet-grotesk",
});

export const metadata: Metadata = {
  title: "Omnia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={`${bigilla.className} ${cabinetGrotesk.className}`}>
      <body>{children}</body>
    </html>
  );
}

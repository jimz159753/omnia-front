import { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";

const cabinetGrotesk = localFont({
  src: "../../public/fonts/CabinetGrotesk-Light.otf",
  variable: "--font-cabinet-grotesk",
});

const loraItalic = localFont({
  src: "../../public/fonts/Lora-Italic.ttf",
  variable: "--font-lora-italic",
});

const loraRegular = localFont({
  src: "../../public/fonts/Lora-Regular.ttf",
  variable: "--font-lora-regular",
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
    <html
      className={`${cabinetGrotesk.variable} ${loraItalic.variable} ${loraRegular.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}

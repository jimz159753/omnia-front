import { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Espacio Omnia",
  description: "Omnia",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>{children}</body>
    </html>
  );
}
